const express = require('express');
const { body } = require('express-validator');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');
const {
  getProfile,
  uploadAvatar,
  updateProfile,
  updatePreferences,
  changePassword,
  deleteAccount
} = require('../controllers/userController');
const {
  getAllUsers,
  getUser,
  deleteUser,
  blockUser,
  unblockUser
} = require('../controllers/userManagementController');

const multer = require('multer');
const path = require('path');

// Configuration du stockage pour les avatars (sous-dossier avatars)
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/avatars/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtre pour accepter uniquement les images
const avatarFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Seules les images sont acceptées (jpeg, jpg, png, gif, webp)'));
  }
};

const uploadAvatarMiddleware = multer({
  storage: avatarStorage,
  fileFilter: avatarFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  }
});

// Configuration du stockage pour les autres fichiers (profil complet)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Seules les images sont acceptées (jpeg, jpg, png, gif, webp)'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  }
});

const router = express.Router();

// Validation rules for profile updates
const validateProfileUpdate = [
  body('firstName').optional().trim().isLength({ min: 1, max: 50 }),
  body('lastName').optional().trim().isLength({ min: 1, max: 50 }),
  body('email').optional().trim().isEmail().normalizeEmail(),
  body('age').optional().isInt({ min: 1, max: 120 }),
  body('gender').optional().isIn(['male', 'female', 'other']),
  body('budget').optional().isFloat({ min: 0 }),
  body('preferences').optional().isObject()
];

// Validation rules for password change
const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

// Validation rules for preferences update
const validatePreferencesUpdate = [
  body('luxury_score').optional().isFloat({ min: 0, max: 1 }),
  body('nature_score').optional().isFloat({ min: 0, max: 1 }),
  body('adventure_score').optional().isFloat({ min: 0, max: 1 }),
  body('culture_score').optional().isFloat({ min: 0, max: 1 }),
  body('beach_score').optional().isFloat({ min: 0, max: 1 }),
  body('food_score').optional().isFloat({ min: 0, max: 1 }),
  body('travelerType').optional().isIn(['solo', 'couple', 'family', 'group', 'business']),
  body('minBudget').optional().isFloat({ min: 0 }),
  body('maxBudget').optional().isFloat({ min: 0 })
];

// Admin routes - Get all users
router.get('/', authenticateToken, authorizeAdmin, getAllUsers);

// Get user profile
router.get('/profile', authenticateToken, getProfile);

// Upload avatar (dedicated endpoint)
router.post('/upload-avatar', authenticateToken, uploadAvatarMiddleware.single('avatar'), uploadAvatar);

// Update user profile (with optional file upload)
router.put('/profile', authenticateToken, upload.single('profilePhoto'), validateProfileUpdate, updateProfile);

// Update user preferences
router.put('/preferences', authenticateToken, validatePreferencesUpdate, updatePreferences);

// Change password
router.put('/change-password', authenticateToken, validatePasswordChange, changePassword);

// Delete account
router.delete('/account', authenticateToken, deleteAccount);

// Admin routes - User management
router.delete('/:id', authenticateToken, authorizeAdmin, deleteUser);
router.put('/:id/block', authenticateToken, authorizeAdmin, blockUser);
router.put('/:id/unblock', authenticateToken, authorizeAdmin, unblockUser);

module.exports = router;