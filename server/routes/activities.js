const express = require('express');
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const { body } = require('express-validator');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');
const { Activity } = require('../models');
const {
  validateActivity,
  convertTagsToString,
  getActivities,
  getActivity,
  getActivitiesByDestination,
  createActivity,
  updateActivity,
  deleteActivity
} = require('../controllers/activityController');

const router = express.Router();

const upload = multer({ storage: storage });

// Middleware pour gérer l'upload d'image et ajouter image_url au body
const handleImageUpload = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (req.file) {
      req.body.image_url = req.file.path;
    }
    next();
  });
};

// Get all activities
router.get('/', getActivities);

// Get a single activity
router.get('/:id', getActivity);

// Get activities by destination
router.get('/destination/:destinationId', getActivitiesByDestination);

// Create a new activity (admin only)
router.post('/', authenticateToken, authorizeAdmin, handleImageUpload, validateActivity, convertTagsToString, createActivity);

// Update a activity (admin only)
router.put('/:id', authenticateToken, authorizeAdmin, handleImageUpload, validateActivity, convertTagsToString, updateActivity);

// Delete a activity (admin only)
router.delete('/:id', authenticateToken, authorizeAdmin, deleteActivity);

module.exports = router;
