const express = require('express');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');
const {
  getHybridRecs,
  getContentBasedRecs,
  getCollaborativeRecs,
  getColdStartRecs,
  getPopularRecs,
  runClustering,
  getSimilarUsers,
  addRating,
  explainRecommendation
} = require('../controllers/recommendationController');

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

/**
 * @route   GET /api/recommendations/hybrid
 * @desc    Obtenir les recommandations hybrides pour l'utilisateur connecté
 * @access  Private
 */
router.get('/hybrid', getHybridRecs);

/**
 * @route   GET /api/recommendations/content-based
 * @desc    Recommandations basées sur le content-based filtering
 * @access  Private
 */
router.get('/content-based', getContentBasedRecs);

/**
 * @route   GET /api/recommendations/collaborative
 * @desc    Recommandations basées sur le collaborative filtering
 * @access  Private
 */
router.get('/collaborative', getCollaborativeRecs);

/**
 * @route   GET /api/recommendations/cold-start
 * @desc    Recommandations pour nouvel utilisateur (cold start)
 * @access  Private
 */
router.get('/cold-start', getColdStartRecs);

/**
 * @route   GET /api/recommendations/popular
 * @desc    Destinations populaires (fallback)
 * @access  Public (mais nécessite auth)
 */
router.get('/popular', getPopularRecs);

/**
 * @route   POST /api/recommendations/rate
 * @desc    Ajouter un rating pour une destination
 * @access  Private
 */
router.post('/rate', addRating);

/**
 * @route   GET /api/recommendations/explain/:destinationId
 * @desc    Expliquer pourquoi une destination est recommandée
 * @access  Private
 */
router.get('/explain/:destinationId', explainRecommendation);

/**
 * @route   GET /api/recommendations/similar-users/:userId
 * @desc    Trouver les utilisateurs similaires
 * @access  Private
 */
router.get('/similar-users/:userId', getSimilarUsers);

/**
 * @route   POST /api/recommendations/clustering/run
 * @desc    Exécuter manuellement le clustering K-means (admin only)
 * @access  Private (Admin)
 */
router.post('/clustering/run', authorizeAdmin, runClustering);

module.exports = router;
