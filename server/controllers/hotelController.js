const { body } = require('express-validator');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');
const { Hotel } = require('../models');

// Validation rules for hotel creation/update
const validateHotel = [
  body('name').isLength({ min: 1, max: 200 }).withMessage('Name is required and must be less than 200 characters'),
  body('description').optional().isLength({ max: 2000 }),
  body('location').optional().isString(),
  body('country').optional().isString(),
  body('city').optional().isString(),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('rating').optional().isFloat({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5'),
  body('stars').optional().isInt({ min: 1, max: 5 }).withMessage('Stars must be between 1 and 5'),
  body('luxury_score').optional().isFloat({ min: 0, max: 1 }).withMessage('Luxury score must be between 0 and 1'),
  body('comfort_score').optional().isFloat({ min: 0, max: 1 }).withMessage('Comfort score must be between 0 and 1'),
  body('service_score').optional().isFloat({ min: 0, max: 1 }).withMessage('Service score must be between 0 and 1'),
  body('location_score').optional().isFloat({ min: 0, max: 1 }).withMessage('Location score must be between 0 and 1'),
  body('amenities_score').optional().isFloat({ min: 0, max: 1 }).withMessage('Amenities score must be between 0 and 1'),
  body('image_url').optional().isURL().withMessage('Image URL must be a valid URL')
];

// Middleware to convert tags array or comma-separated string to JSON string
const convertTagsToString = (req, res, next) => {
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

// Get all hotels - VERSION CORRIGÉE
const getHotels = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, sortBy = 'id', sortOrder = 'ASC' } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (search) {
      whereClause.name = { [require('sequelize').Op.iLike]: `%${search}%` };
    }

    const hotels = await Hotel.findAndCountAll({ 
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder.toUpperCase()]]
    });

    res.status(200).json({
      total: hotels.count,
      pages: Math.ceil(hotels.count / limit),
      currentPage: parseInt(page),
      hotels: hotels.rows
    });
  } catch (error) {
    console.error('Get hotels error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get a single hotel
const getHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const hotel = await Hotel.findByPk(id);

    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }
    res.status(200).json(hotel);
  } catch (error) {
    console.error('Get hotel error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get hotels by destination
const getHotelsByDestination = async (req, res) => {
  try {
    const { destinationId } = req.params;
    const hotels = await Hotel.findAll({
      where: { destination_id: destinationId }
    });
    res.status(200).json({ success: true, count: hotels.length, hotels });
  } catch (error) {
    console.error('Get hotels by destination error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Create a new hotel (admin only)
const createHotel = async (req, res) => {
  try {
    const hotel = await Hotel.create(req.body);
    res.status(201).json({ message: 'Hotel created successfully', hotel });
  } catch (error) {
    console.error('Create hotel error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Update a hotel (admin only)
const updateHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const [updatedRowsCount] = await Hotel.update(req.body, { where: { id } });
    if (updatedRowsCount === 0) {
      return res.status(404).json({ message: 'Hotel not found' });
    }
    const updatedHotel = await Hotel.findByPk(id);
    res.status(200).json({ message: 'Hotel updated successfully', hotel: updatedHotel });
  } catch (error) {
    console.error('Update hotel error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Delete a hotel (admin only)
const deleteHotel = async (req, res) => {
  try {
    const { id } = req.params;
    // ATTENTION : Vérifie si tu veux vraiment utiliser "HotelBackup" ici
    // Il est probable que tu doives utiliser "Hotel" à la place.
    const deletedRows = await Hotel.destroy({ where: { id } }); 

    if (deletedRows === 0) {
      return res.status(404).json({ message: 'Hotel not found' });
    }
    res.status(200).json({ message: 'Hotel deleted successfully' });
  } catch (error) {
    console.error('Delete hotel error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

module.exports = {
  validateHotel,
  convertTagsToString,
  getHotels,
  getHotel,
  getHotelsByDestination,
  createHotel,
  updateHotel,
  deleteHotel
};