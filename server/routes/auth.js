const express = require('express');
const { body } = require('express-validator');
const { googleAuth, register, login, logout } = require('../controllers/authController');
const router = express.Router();

// Validation rules for registration
const validateRegister = [
  body('username')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('firstName').optional().trim(),
  body('lastName').optional().trim(),
  body('age').optional().isInt({ min: 1, max: 120 }).withMessage('Age must be between 1 and 120'),
  body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Gender must be male, female, or other'),
  body('budget').optional().isFloat({ min: 0 }).withMessage('Budget must be a positive number'),
  // Nouveaux champs pour le système de recommandation
  body('travelerType').optional().isIn(['solo', 'couple', 'family', 'group', 'business']).withMessage('Invalid traveler type'),
  body('minBudget').optional().isFloat({ min: 0 }).withMessage('Min budget must be positive'),
  body('maxBudget').optional().isFloat({ min: 0 }).withMessage('Max budget must be positive'),
  body('luxury_score').optional().isFloat({ min: 0, max: 1 }).withMessage('Score must be between 0 and 1'),
  body('nature_score').optional().isFloat({ min: 0, max: 1 }).withMessage('Score must be between 0 and 1'),
  body('adventure_score').optional().isFloat({ min: 0, max: 1 }).withMessage('Score must be between 0 and 1'),
  body('culture_score').optional().isFloat({ min: 0, max: 1 }).withMessage('Score must be between 0 and 1'),
  body('beach_score').optional().isFloat({ min: 0, max: 1 }).withMessage('Score must be between 0 and 1'),
  body('food_score').optional().isFloat({ min: 0, max: 1 }).withMessage('Score must be between 0 and 1'),
  body('preferredTags').optional().isArray()
];

// Validation rules for login
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Validation rules for Google auth
const validateGoogleAuth = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('firstName').optional().trim(),
  body('lastName').optional().trim(),
  body('travelerType').optional().isIn(['solo', 'couple', 'family', 'group', 'business']).withMessage('Invalid traveler type'),
  body('minBudget').optional().isFloat({ min: 0 }).withMessage('Min budget must be positive'),
  body('maxBudget').optional().isFloat({ min: 0 }).withMessage('Max budget must be positive'),
  body('luxury_score').optional().isFloat({ min: 0, max: 1 }).withMessage('Score must be between 0 and 1'),
  body('nature_score').optional().isFloat({ min: 0, max: 1 }).withMessage('Score must be between 0 and 1'),
  body('adventure_score').optional().isFloat({ min: 0, max: 1 }).withMessage('Score must be between 0 and 1'),
  body('culture_score').optional().isFloat({ min: 0, max: 1 }).withMessage('Score must be between 0 and 1'),
  body('beach_score').optional().isFloat({ min: 0, max: 1 }).withMessage('Score must be between 0 and 1'),
  body('food_score').optional().isFloat({ min: 0, max: 1 }).withMessage('Score must be between 0 and 1'),
  body('preferredTags').optional().isArray()
];

// Google Auth route (login or register)
router.post('/google', validateGoogleAuth, googleAuth);

// Register route
router.post('/register', validateRegister, register);

// Login route
router.post('/login', validateLogin, login);

// Logout route
router.post('/logout', logout);

module.exports = router;