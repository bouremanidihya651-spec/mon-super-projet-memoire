const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token
 * @param {Object} payload - Data to include in the token
 * @param {string} secret - Secret key for signing
 * @param {string} expiresIn - Expiration time (e.g., '1h', '7d')
 * @returns {string} - Signed JWT token
 */
const generateToken = (payload, secret, expiresIn) => {
  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Verify a JWT token
 * @param {string} token - JWT token to verify
 * @param {string} secret - Secret key for verification
 * @returns {Object|null} - Decoded token payload or null if invalid
 */
const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken
};