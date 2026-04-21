const { Transport, Destination } = require('../models');

// Middleware to validate and sanitize transport data from FormData
const validateTransport = (req, res, next) => {
  const errors = [];

  // Name validation
  if (!req.body.name || req.body.name.trim().length === 0) {
    errors.push('Name is required');
  } else if (req.body.name.length > 200) {
    errors.push('Name must be less than 200 characters');
  }

  // Description validation
  if (req.body.description && req.body.description.length > 2000) {
    errors.push('Description must be less than 2000 characters');
  }

  // Category validation
  const validCategories = ['flight', 'ground', 'car_rental'];
  if (!req.body.category || !validCategories.includes(req.body.category)) {
    errors.push('Invalid category. Must be flight, ground, or car_rental');
  }

  // Destination ID validation
  const destId = parseInt(req.body.destination_id);
  if (!destId || destId < 1) {
    errors.push('Valid destination_id is required');
  }

  // Price validation
  if (req.body.price && (isNaN(parseFloat(req.body.price)) || parseFloat(req.body.price) < 0)) {
    errors.push('Price must be a positive number');
  }

  // Deposit validation
  if (req.body.deposit && (isNaN(parseFloat(req.body.deposit)) || parseFloat(req.body.deposit) < 0)) {
    errors.push('Deposit must be a positive number');
  }

  // Rating validation
  if (req.body.rating && (isNaN(parseFloat(req.body.rating)) || parseFloat(req.body.rating) < 0 || parseFloat(req.body.rating) > 5)) {
    errors.push('Rating must be between 0 and 5');
  }

  // Comfort score validation
  if (req.body.comfort_score && (isNaN(parseFloat(req.body.comfort_score)) || parseFloat(req.body.comfort_score) < 0 || parseFloat(req.body.comfort_score) > 1)) {
    errors.push('Comfort score must be between 0 and 1');
  }

  // Convenience score validation
  if (req.body.convenience_score && (isNaN(parseFloat(req.body.convenience_score)) || parseFloat(req.body.convenience_score) < 0 || parseFloat(req.body.convenience_score) > 1)) {
    errors.push('Convenience score must be between 0 and 1');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  next();
};

// Middleware to convert and sanitize FormData values
const convertFormData = (req, res, next) => {
  // Convert numeric fields
  if (req.body.price) req.body.price = parseFloat(req.body.price);
  if (req.body.deposit) req.body.deposit = parseFloat(req.body.deposit);
  if (req.body.rating) req.body.rating = parseFloat(req.body.rating);
  if (req.body.comfort_score) req.body.comfort_score = parseFloat(req.body.comfort_score);
  if (req.body.convenience_score) req.body.convenience_score = parseFloat(req.body.convenience_score);
  if (req.body.destination_id) req.body.destination_id = parseInt(req.body.destination_id);

  // Convert boolean fields
  if (req.body.is_api) req.body.is_api = req.body.is_api === 'true';
  if (req.body.is_available) req.body.is_available = req.body.is_available === 'true';

  // Convert tags array or comma-separated string to JSON string
  if (req.body.tags) {
    let tagsArray = [];
    if (Array.isArray(req.body.tags)) {
      tagsArray = req.body.tags;
    } else if (typeof req.body.tags === 'string') {
      tagsArray = req.body.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    }
    req.body.tags = JSON.stringify(tagsArray);
  }

  next();
};

// Get all transports
const getTransports = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, destination_id, sortBy = 'id', sortOrder = 'ASC' } = req.query;

    const offset = (page - 1) * limit;

    const whereClause = {};
    if (search) {
      whereClause.name = { [require('sequelize').Op.iLike]: `%${search}%` };
    }
    if (category) {
      whereClause.category = category;
    }
    if (destination_id) {
      whereClause.destination_id = parseInt(destination_id);
    }

    const transports = await Transport.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder.toUpperCase()]],
      include: [{
        model: Destination,
        as: 'destination',
        attributes: ['id', 'name', 'location', 'country']
      }]
    });

    res.status(200).json({
      total: transports.count,
      pages: Math.ceil(transports.count / limit),
      currentPage: parseInt(page),
      transports: transports.rows
    });
  } catch (error) {
    console.error('Get transports error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get a single transport
const getTransport = async (req, res) => {
  try {
    const { id } = req.params;

    const transport = await Transport.findByPk(id, {
      include: [{
        model: Destination,
        as: 'destination',
        attributes: ['id', 'name', 'location', 'country']
      }]
    });

    if (!transport) {
      return res.status(404).json({ message: 'Transport not found' });
    }

    res.status(200).json(transport);
  } catch (error) {
    console.error('Get transport error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get transports by destination
const getTransportsByDestination = async (req, res) => {
  try {
    const { destinationId } = req.params;

    const transports = await Transport.findAll({
      where: { destination_id: destinationId },
      include: [{
        model: Destination,
        as: 'destination',
        attributes: ['id', 'name', 'location', 'country']
      }]
    });

    res.status(200).json({
      success: true,
      count: transports.length,
      transports
    });
  } catch (error) {
    console.error('Get transports by destination error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Create a new transport (admin only)
const createTransport = async (req, res) => {
  try {
    const transport = await Transport.create(req.body);

    res.status(201).json({
      message: 'Transport created successfully',
      transport
    });
  } catch (error) {
    console.error('Create transport error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Update a transport (admin only)
const updateTransport = async (req, res) => {
  try {
    const { id } = req.params;

    const [updatedRowsCount] = await Transport.update(req.body, {
      where: { id }
    });

    if (updatedRowsCount === 0) {
      return res.status(404).json({ message: 'Transport not found' });
    }

    const updatedTransport = await Transport.findByPk(id);

    res.status(200).json({
      message: 'Transport updated successfully',
      transport: updatedTransport
    });
  } catch (error) {
    console.error('Update transport error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Delete a transport (admin only)
const deleteTransport = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedRows = await Transport.destroy({
      where: { id }
    });

    if (deletedRows === 0) {
      return res.status(404).json({ message: 'Transport not found' });
    }

    res.status(200).json({ message: 'Transport deleted successfully' });
  } catch (error) {
    console.error('Delete transport error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

module.exports = {
  validateTransport,
  convertFormData,
  getTransports,
  getTransport,
  getTransportsByDestination,
  createTransport,
  updateTransport,
  deleteTransport
};
