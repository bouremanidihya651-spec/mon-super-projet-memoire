const express = require('express');
const multer = require('multer');
const path = require('path');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');
const {
  validateTransport,
  convertFormData,
  getTransports,
  getTransport,
  getTransportsByDestination,
  createTransport,
  updateTransport,
  deleteTransport
} = require('../controllers/transportController');

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

// Get all transports
router.get('/', getTransports);

// Get a single transport
router.get('/:id', getTransport);

// Get transports by destination
router.get('/destination/:destinationId', getTransportsByDestination);

// Create a new transport (admin only)
router.post('/', authenticateToken, authorizeAdmin, handleImageUpload, validateTransport, convertFormData, createTransport);

// Update a transport (admin only)
router.put('/:id', authenticateToken, authorizeAdmin, handleImageUpload, validateTransport, convertFormData, updateTransport);

// Delete a transport (admin only)
router.delete('/:id', authenticateToken, authorizeAdmin, deleteTransport);

module.exports = router;
