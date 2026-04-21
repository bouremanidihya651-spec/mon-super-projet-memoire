const express = require('express');
const multer = require('multer');
const path = require('path');
const { body } = require('express-validator');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');
const { Destination } = require('../models');

const router = express.Router();

// Configuration de l'upload d'image
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Middleware pour gérer l'upload d'image
const handleImageUpload = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (req.file) {
      req.body.image_url = `http://localhost:3000/uploads/${req.file.filename}`;
    }
    next();
  });
};

// Validation rules for destination creation/update
const validateDestination = [
  body('name').isLength({ min: 1, max: 200 }).withMessage('Name is required and must be less than 200 characters'),
  body('description').optional().isLength({ max: 2000 }),
  body('location').optional().isString(),
  body('country').optional().isString(),
  body('city').optional().isString(),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('rating').optional().isFloat({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5'),
  body('luxury_score').optional().isFloat({ min: 0, max: 1 }).withMessage('Luxury score must be between 0 and 1'),
  body('nature_score').optional().isFloat({ min: 0, max: 1 }).withMessage('Nature score must be between 0 and 1'),
  body('adventure_score').optional().isFloat({ min: 0, max: 1 }).withMessage('Adventure score must be between 0 and 1'),
  body('culture_score').optional().isFloat({ min: 0, max: 1 }).withMessage('Culture score must be between 0 and 1'),
  body('beach_score').optional().isFloat({ min: 0, max: 1 }).withMessage('Beach score must be between 0 and 1'),
  body('food_score').optional().isFloat({ min: 0, max: 1 }).withMessage('Food score must be between 0 and 1'),
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

// Get all destinations
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, sortBy = 'id', sortOrder = 'ASC' } = req.query;
    
    const offset = (page - 1) * limit;
    
    const whereClause = {};
    if (search) {
      whereClause.name = { [require('sequelize').Op.iLike]: `%${search}%` };
    }
    
    const destinations = await Destination.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder.toUpperCase()]]
    });

    res.status(200).json({
      total: destinations.count,
      pages: Math.ceil(destinations.count / limit),
      currentPage: parseInt(page),
      destinations: destinations.rows
    });
  } catch (error) {
    console.error('Get destinations error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Get a single destination
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const destination = await Destination.findByPk(id);
    
    if (!destination) {
      return res.status(404).json({ message: 'Destination not found' });
    }
    
    res.status(200).json(destination);
  } catch (error) {
    console.error('Get destination error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Create a new destination (admin only)
router.post('/', authenticateToken, authorizeAdmin, handleImageUpload, validateDestination, convertTagsToString, async (req, res) => {
  try {
    const destination = await Destination.create(req.body);

    res.status(201).json({
      message: 'Destination created successfully',
      destination
    });
  } catch (error) {
    console.error('Create destination error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Update a destination (admin only)
router.put('/:id', authenticateToken, authorizeAdmin, validateDestination, convertTagsToString, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [updatedRowsCount] = await Destination.update(req.body, {
      where: { id }
    });
    
    if (updatedRowsCount === 0) {
      return res.status(404).json({ message: 'Destination not found' });
    }
    
    const updatedDestination = await Destination.findByPk(id);
    
    res.status(200).json({
      message: 'Destination updated successfully',
      destination: updatedDestination
    });
  } catch (error) {
    console.error('Update destination error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Delete a destination (admin only)
router.delete('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedRows = await Destination.destroy({
      where: { id }
    });
    
    if (deletedRows === 0) {
      return res.status(404).json({ message: 'Destination not found' });
    }
    
    res.status(200).json({ message: 'Destination deleted successfully' });
  } catch (error) {
    console.error('Delete destination error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

module.exports = router;