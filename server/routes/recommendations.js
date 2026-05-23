const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { Destination, Review } = require('../models');
const {
  getHybridRecs,
  getContentBasedRecs,
  getCollaborativeRecs,
  getColdStartRecs,
  getPopularRecs,
  getSimilarUsers,
  addRating,
  explainRecommendation,
  checkCompatibility,
  getProfileStatus
} = require('../controllers/recommendationController');

const router = express.Router();

// ============================================================================
// ROUTES PUBLIQUES
// ============================================================================

router.get('/popular', (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authenticateToken(req, res, next);
  }
  next();
}, getPopularRecs);

router.get('/all-destinations', async (req, res) => {
  try {
    const destinations = await Destination.findAll({ order: [['rating', 'DESC']] });
    res.json({
      success:      true,
      count:        destinations.length,
      destinations: destinations.map(d => ({
        ...d.toJSON(),
        algorithmUsed: 'popular',
        algorithmLabel: 'Destination populaire',
        algorithmColor: '#f59e0b',
        displayCause: {
          mainCause: 'Destination populaire',
          causeDetails: [`Note : ${d.rating || 'N/A'}/5`],
          algorithm: 'popular',
          algorithmLabel: 'Destination populaire',
          algorithmColor: '#f59e0b'
        }
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// ============================================================================
// ROUTE DEBUG COLLABORATIVE
// ============================================================================

router.get('/debug-collab/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      getCollaborativeScores,
      findSimilarUsers,
      buildBehavioralProfile,
      isNewUser
    } = require('../utils/hybridRecommendationEngine');

    const myReviews  = await Review.findAll({
      where: { userId: parseInt(userId), targetType: 'destination' }
    });
    const allReviews = await Review.findAll({ where: { targetType: 'destination' } });

    const userMatrix = {};
    allReviews.forEach(r => {
      if (!userMatrix[r.userId]) userMatrix[r.userId] = {};
      userMatrix[r.userId][r.targetId] = r.rating;
    });

    const collabData      = await getCollaborativeScores(parseInt(userId));
    const similarUsers      = await findSimilarUsers(parseInt(userId), 10);
    const newUser           = await isNewUser(parseInt(userId));
    const behavioralProfile = !newUser ? await buildBehavioralProfile(parseInt(userId)) : null;

    res.json({
      userId:           parseInt(userId),
      isNewUser:        newUser,
      myRatings:        myReviews.map(r => ({ destId: r.targetId, rating: r.rating })),
      nbMyRatings:      myReviews.length,
      behavioralProfile,
      allUsersInMatrix: Object.keys(userMatrix).map(uid => ({
        userId:       uid,
        nbRatings:    Object.keys(userMatrix[uid]).length,
        destinations: Object.keys(userMatrix[uid])
      })),
      similarUsers,
      collabScores: Object.fromEntries(
        Object.entries(collabData).map(([id, data]) => [id, data.score])
      ),
      nbRecommended: Object.keys(collabData).length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// ROUTES PRIVÉES
// ============================================================================

router.use(authenticateToken);

router.get('/hybrid',         getHybridRecs);
router.get('/content-based',  getContentBasedRecs);
router.get('/collaborative',  getCollaborativeRecs);
router.get('/cold-start',     getColdStartRecs);
router.get('/profile-status', getProfileStatus);
router.post('/rate', addRating);
router.get('/explain/:destinationId',  explainRecommendation);
router.get('/check/:destinationId',    checkCompatibility);
router.get('/similar-users/:userId', getSimilarUsers);

module.exports = router;