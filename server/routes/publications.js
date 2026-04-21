const express = require('express');
const { body } = require('express-validator');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');
const { 
  getAllPublications,
  getPublicationById,
  createPublication,
  updatePublication,
  deletePublication,
  getFeaturedPublications
} = require('../controllers/publicationController');

const router = express.Router();

// Validation rules for publication creation/update
const validatePublication = [
  body('title')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('content')
    .isLength({ min: 1 })
    .withMessage('Content is required'),
  body('category').optional().isString(),
  body('featured').optional().isBoolean(),
  body('imageUrl').optional().isURL(),
  body('status').optional().isIn(['draft', 'published', 'archived'])
];

// Public routes
router.get('/', getAllPublications);
router.get('/featured', getFeaturedPublications);
router.get('/:id', getPublicationById);

// Admin routes
router.post('/', authenticateToken, authorizeAdmin, validatePublication, createPublication);
router.put('/:id', authenticateToken, authorizeAdmin, validatePublication, updatePublication);
router.delete('/:id', authenticateToken, authorizeAdmin, deletePublication);

module.exports = router;