const { Favorite, Destination, Hotel, Activity } = require('../models');
const { Op } = require('sequelize');

/**
 * GET /api/favorites
 * Get all favorites for the authenticated user
 */
const getUserFavorites = async (req, res) => {
  try {
    const userId = req.user.id;

    const favorites = await Favorite.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });

    // Enrichir avec les détails des destinations/hôtels/activités
    const enrichedFavorites = await Promise.all(
      favorites.map(async (fav) => {
        let item;
        if (fav.targetType === 'destination') {
          item = await Destination.findByPk(fav.targetId);
        } else if (fav.targetType === 'hotel') {
          item = await Hotel.findByPk(fav.targetId);
        } else if (fav.targetType === 'activity') {
          item = await Activity.findByPk(fav.targetId);
        }

        return {
          ...fav.toJSON(),
          item
        };
      })
    );

    res.status(200).json({
      success: true,
      count: enrichedFavorites.length,
      favorites: enrichedFavorites
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * POST /api/favorites
 * Add item to favorites
 */
const addToFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const { targetType, targetId } = req.body;

    if (!targetType || !targetId) {
      return res.status(400).json({
        message: 'targetType and targetId are required'
      });
    }

    if (!['destination', 'hotel', 'activity'].includes(targetType)) {
      return res.status(400).json({
        message: 'Invalid targetType. Must be destination, hotel, or activity'
      });
    }

    // Vérifier si déjà en favoris
    const existing = await Favorite.findOne({
      where: { userId, targetType, targetId }
    });

    if (existing) {
      return res.status(409).json({
        message: 'Item already in favorites'
      });
    }

    const favorite = await Favorite.create({
      userId,
      targetType,
      targetId
    });

    res.status(201).json({
      success: true,
      message: 'Added to favorites',
      favorite
    });
  } catch (error) {
    console.error('Add to favorites error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * DELETE /api/favorites/:id
 * Remove item from favorites
 */
const removeFromFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const favorite = await Favorite.findOne({
      where: { id, userId }
    });

    if (!favorite) {
      return res.status(404).json({
        message: 'Favorite not found'
      });
    }

    await favorite.destroy();

    res.status(200).json({
      success: true,
      message: 'Removed from favorites'
    });
  } catch (error) {
    console.error('Remove from favorites error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * DELETE /api/favorites/target/:targetType/:targetId
 * Remove item from favorites by target
 */
const removeFavoriteByTarget = async (req, res) => {
  try {
    const userId = req.user.id;
    const { targetType, targetId } = req.params;

    const deleted = await Favorite.destroy({
      where: { userId, targetType, targetId: parseInt(targetId) }
    });

    if (deleted === 0) {
      return res.status(404).json({
        message: 'Favorite not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Removed from favorites'
    });
  } catch (error) {
    console.error('Remove favorite by target error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * GET /api/favorites/check/:targetType/:targetId
 * Check if item is in favorites
 */
const checkFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { targetType, targetId } = req.params;

    const favorite = await Favorite.findOne({
      where: { userId, targetType, targetId: parseInt(targetId) }
    });

    res.status(200).json({
      success: true,
      isFavorite: !!favorite
    });
  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  getUserFavorites,
  addToFavorites,
  removeFromFavorites,
  removeFavoriteByTarget,
  checkFavorite
};
