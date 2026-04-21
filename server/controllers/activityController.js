const { body } = require('express-validator');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');
const { Activity } = require('../models');

// Validation rules for activity creation/update
const validateActivity = [
  body('name').isLength({ min: 1, max: 200 }).withMessage('Name is required and must be less than 200 characters'),
  body('description').optional().isLength({ max: 2000 }),
  body('location').optional().isString(),
  body('country').optional().isString(),
  body('city').optional().isString(),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('rating').optional().isFloat({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5'),
  body('duration').optional().isString(),
  body('adventure_score').optional().isFloat({ min: 0, max: 1 }).withMessage('Adventure score must be between 0 and 1'),
  body('nature_score').optional().isFloat({ min: 0, max: 1 }).withMessage('Nature score must be between 0 and 1'),
  body('culture_score').optional().isFloat({ min: 0, max: 1 }).withMessage('Culture score must be between 0 and 1'),
  body('excitement_score').optional().isFloat({ min: 0, max: 1 }).withMessage('Excitement score must be between 0 and 1'),
  body('relaxation_score').optional().isFloat({ min: 0, max: 1 }).withMessage('Relaxation score must be between 0 and 1'),
  body('image_url').optional().isURL().withMessage('Image URL must be a valid URL')
];

// Middleware to convert tags array or comma-separated string to JSON string
const convertTagsToString = (req, res, next) => {
  if (req.body.tags) {
    let tagsArray = [];
    if (Array.isArray(req.body.tags)) {
      // Already an array
      tagsArray = req.body.tags;
    } else if (typeof req.body.tags === 'string') {
      // Comma-separated string - split and trim
      tagsArray = req.body.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    }
    req.body.tags = JSON.stringify(tagsArray);
  }
  next();
};

// Get all activities
const getActivities = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, sortBy = 'id', sortOrder = 'ASC' } = req.query;

    const offset = (page - 1) * limit;

    const whereClause = {};
    if (search) {
      whereClause.name = { [require('sequelize').Op.iLike]: `%${search}%` };
    }

    const activities = await Activity.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder.toUpperCase()]]
    });

    res.status(200).json({
      total: activities.count,
      pages: Math.ceil(activities.count / limit),
      currentPage: parseInt(page),
      activities: activities.rows
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get a single activity
const getActivity = async (req, res) => {
  try {
    const { id } = req.params;

    const activity = await Activity.findByPk(id);

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    res.status(200).json(activity);
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get activities by destination
const getActivitiesByDestination = async (req, res) => {
  try {
    const { destinationId } = req.params;

    const activities = await Activity.findAll({
      where: { destination_id: destinationId }
    });

    res.status(200).json({
      success: true,
      count: activities.length,
      activities
    });
  } catch (error) {
    console.error('Get activities by destination error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Create a new activity (admin only)
const createActivity = async (req, res) => {
  try {
    const activity = await Activity.create(req.body);

    res.status(201).json({
      message: 'Activity created successfully',
      activity
    });
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Update a activity (admin only)
const updateActivity = async (req, res) => {
  try {
    const { id } = req.params;

    const [updatedRowsCount] = await Activity.update(req.body, {
      where: { id }
    });

    if (updatedRowsCount === 0) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    const updatedActivity = await Activity.findByPk(id);

    res.status(200).json({
      message: 'Activity updated successfully',
      activity: updatedActivity
    });
  } catch (error) {
    console.error('Update activity error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Delete a activity (admin only)
const deleteActivity = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedRows = await Activity.destroy({
      where: { id }
    });

    if (deletedRows === 0) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    res.status(200).json({ message: 'Activity deleted successfully' });
  } catch (error) {
    console.error('Delete activity error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

module.exports = {
  validateActivity,
  convertTagsToString,
  getActivities,
  getActivity,
  getActivitiesByDestination,
  createActivity,
  updateActivity,
  deleteActivity
};
