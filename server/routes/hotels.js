const express = require('express');
const multer = require('multer');
const path = require('path');
const { body } = require('express-validator');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');
const { Hotel } = require('../models');
const {
  validateHotel,
  convertTagsToString,
  getHotels,
  getHotel,
  getHotelsByDestination,
  createHotel,
  updateHotel,
  deleteHotel
} = require('../controllers/hotelController');

const router = express.Router();

// Configuration du stockage pour l'upload d'images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Middleware pour gérer l'upload d'image et ajouter image_url au body
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

// Get all hotels
router.get('/', getHotels);

// Get a single hotel
router.get('/:id', getHotel);

// Get hotels by destination
router.get('/destination/:destinationId', getHotelsByDestination);

// Create a new hotel (admin only)
router.post('/', authenticateToken, authorizeAdmin, handleImageUpload, validateHotel, convertTagsToString, createHotel);

// Update a hotel (admin only)
router.put('/:id', authenticateToken, authorizeAdmin, handleImageUpload, validateHotel, convertTagsToString, updateHotel);

// Delete a hotel (admin only)
router.delete('/:id', authenticateToken, authorizeAdmin, deleteHotel);

module.exports = router;
