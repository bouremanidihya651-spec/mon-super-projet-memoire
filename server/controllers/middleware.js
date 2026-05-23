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

module.exports = { authenticateToken };