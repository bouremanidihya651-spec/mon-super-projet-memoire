const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const {
  getUserFavorites,
  addToFavorites,
  removeFromFavorites,
  removeFavoriteByTarget,
  checkFavorite
} = require('../controllers/favoriteController');

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// GET /api/favorites - Get all favorites
router.get('/', getUserFavorites);

// POST /api/favorites - Add to favorites
router.post('/', addToFavorites);

// DELETE /api/favorites/:id - Remove by favorite ID
router.delete('/:id', removeFromFavorites);

// DELETE /api/favorites/target/:targetType/:targetId - Remove by target
router.delete('/target/:targetType/:targetId', removeFavoriteByTarget);

// GET /api/favorites/check/:targetType/:targetId - Check if favorite
router.get('/check/:targetType/:targetId', checkFavorite);

module.exports = router;
