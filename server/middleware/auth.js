const { verifyToken } = require('../utils/jwtUtils');
const { User } = require('../models');
require('dotenv').config();

/**
 * Middleware to authenticate user using JWT token
 * Also checks if the user account has been blocked since the token was issued.
 */
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  const secret = process.env.JWT_SECRET;
  const decoded = verifyToken(token, secret);

  if (!decoded) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }

  // Re-check blocking status on every authenticated request
  // (handles the case where an admin blocks a user mid-session)
  try {
    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'role', 'isBlocked']
    });
    if (user && user.isBlocked) {
      return res.status(403).json({
        message: 'Votre compte a été bloqué. Veuillez contacter l\'administrateur.',
        code: 'ACCOUNT_BLOCKED'
      });
    }
  } catch (err) {
    console.error('[auth] Block-check failed:', err.message);
  }

  req.user = decoded;
  next();
};

/**
 * Middleware to authorize admin users only
 */
const authorizeAdmin = (req, res, next) => {
  // First authenticate the token
  authenticateToken(req, res, () => {
    // Then check if the user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  });
};

module.exports = { authenticateToken, authorizeAdmin };