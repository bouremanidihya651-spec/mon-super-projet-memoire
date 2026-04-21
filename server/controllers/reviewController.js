const { Review, User } = require('../models');
const { body, param } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { Op } = require('sequelize');

// Validation rules for review creation/update
const validateReview = [
  body('rating')
    .isFloat({ min: 0, max: 5 })
    .withMessage('Rating must be between 0 and 5'),
  body('comment')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters'),
  body('targetType')
    .isIn(['destination', 'hotel', 'activity'])
    .withMessage('Target type must be destination, hotel, or activity'),
  body('targetId')
    .isInt({ min: 1 })
    .withMessage('Target ID must be a positive integer')
];

// Get all reviews for a specific target (destination, hotel, or activity)
const getReviewsForTarget = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;

    const reviews = await Review.findAll({
      where: {
        targetType,
        targetId: parseInt(targetId)
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email', 'firstName', 'lastName']
      }],
      order: [['createdAt', 'DESC']]
    });

    // Calculate average rating
    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    res.status(200).json({
      reviews,
      averageRating: averageRating.toFixed(1),
      totalReviews: reviews.length
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Create a new review (authenticated users only)
const createReview = async (req, res) => {
  try {
    const { rating, comment, targetType, targetId } = req.body;
    const userId = req.user.id;

    // Check if user already reviewed this target
    const existingReview = await Review.findOne({
      where: {
        userId,
        targetType,
        targetId: parseInt(targetId)
      }
    });

    if (existingReview) {
      return res.status(400).json({ 
        message: 'You have already reviewed this item. Please update your existing review instead.' 
      });
    }

    const review = await Review.create({
      rating,
      comment,
      targetType,
      targetId: parseInt(targetId),
      userId
    });

    const reviewWithUser = await Review.findByPk(review.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email', 'firstName', 'lastName']
      }]
    });

    res.status(201).json({
      message: 'Review created successfully',
      review: reviewWithUser
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Update a review (only by the author)
const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { rating, comment } = req.body;

    const review = await Review.findByPk(id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.userId !== userId) {
      return res.status(403).json({ message: 'You can only update your own reviews' });
    }

    await review.update({
      rating: rating || review.rating,
      comment: comment || review.comment
    });

    const updatedReview = await Review.findByPk(review.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email', 'firstName', 'lastName']
      }]
    });

    res.status(200).json({
      message: 'Review updated successfully',
      review: updatedReview
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Delete a review (only by the author or admin)
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const review = await Review.findByPk(id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.userId !== userId && !isAdmin) {
      return res.status(403).json({ message: 'You can only delete your own reviews' });
    }

    await review.destroy();

    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get user's own reviews
const getUserReviews = async (req, res) => {
  try {
    const userId = req.user.id;

    const reviews = await Review.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({ reviews });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

module.exports = {
  validateReview,
  getReviewsForTarget,
  createReview,
  updateReview,
  deleteReview,
  getUserReviews
};
