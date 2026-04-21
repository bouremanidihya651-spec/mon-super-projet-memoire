const { verifyToken } = require('../utils/jwtUtils');
require('dotenv').config();

/**
 * Middleware to authenticate user using JWT token
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  const decoded = verifyToken(token, process.env.JWT_SECRET || 'fallback_secret_key');

  if (!decoded) {
    return res.status(403).json({ message: 'Invalid or expired token' });
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