const express = require('express');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');
const {
  validateReview,
  getReviewsForTarget,
  createReview,
  updateReview,
  deleteReview,
  getUserReviews,
  getAllReviews
} = require('../controllers/reviewController');

const router = express.Router();

// Get all reviews (admin only)
router.get('/all', authorizeAdmin, getAllReviews);

// Get all reviews for a specific target (destination, hotel, or activity)
// GET /api/reviews/:targetType/:targetId
router.get('/:targetType/:targetId', getReviewsForTarget);

// Create a new review (authenticated users only)
// POST /api/reviews
router.post('/', authenticateToken, validateReview, createReview);

// Update a review (only by the author)
// PUT /api/reviews/:id
router.put('/:id', authenticateToken, updateReview);

// Delete a review (only by the author or admin)
// DELETE /api/reviews/:id
router.delete('/:id', authenticateToken, deleteReview);

// Get user's own reviews
// GET /api/reviews/my
router.get('/my', authenticateToken, getUserReviews);

module.exports = router;
