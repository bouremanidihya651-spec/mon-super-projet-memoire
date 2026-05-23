const express = require('express');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');
const {
  getAllUsers,
  getUser,
  deleteUser,
  blockUser,
  unblockUser
} = require('../controllers/userManagementController');

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateToken, authorizeAdmin, getAllUsers);

// Get a single user (admin only)
router.get('/:id', authenticateToken, authorizeAdmin, getUser);

// Delete a user (admin only)
router.delete('/:id', authenticateToken, authorizeAdmin, deleteUser);

// Block a user (admin only)
router.put('/:id/block', authenticateToken, authorizeAdmin, blockUser);

// Unblock a user (admin only)
router.put('/:id/unblock', authenticateToken, authorizeAdmin, unblockUser);

module.exports = router;
