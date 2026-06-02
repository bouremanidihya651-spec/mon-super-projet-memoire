const { verifyToken } = require('../utils/jwtUtils');
require('dotenv').config();

/**
 * Middleware to authenticate user using JWT token
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  console.log('Auth Header received:', authHeader);
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    console.log('Auth Failure: No token provided');
    return res.status(401).json({ message: 'Access token required' });
  }

  const secret = process.env.JWT_SECRET;
  console.log('Using JWT_SECRET for verification:', secret ? 'EXISTS' : 'MISSING');

  const decoded = verifyToken(token, secret);

  if (!decoded) {
    console.log('Auth Failure: Invalid or expired token. Token starts with:', token.substring(0, 10) + '...');
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