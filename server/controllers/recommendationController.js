const { User, UserPreference, Destination, Review } = require('../models');
const {
  getHybridRecommendations,
  getContentBasedRecommendations,
  getCollaborativeRecommendations,
  getColdStartRecommendations,
  getPopularDestinations,
  findSimilarUsers,
  passesHardFilter,
  computeCompatibilityScore,
  computeMatchPercentage,
  buildBehavioralProfile,
  isNewUser,
  FEATURES,
  FEATURE_LABELS,
  NEW_USER_REVIEW_THRESHOLD,
  ALGORITHM_LABELS,
  ALGORITHM_COLORS
} = require('../utils/hybridRecommendationEngine');

// ============================================================================
// HELPERS
// ============================================================================

const getStrongPreferences = (prefData) => {
  return FEATURES
    .map(f => ({
      feature: f,
      label:   FEATURE_LABELS[f],
      score:   parseFloat(prefData[`${f}_score`]) || 0
    }))
    .filter(f => f.score >= 0.7)
    .sort((a, b) => b.score - a.score);
};

// ============================================================================
// GET /api/recommendations/hybrid
// ============================================================================

const getHybridRecs = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      limit = 10,
      contentWeight,
      collabWeight,
      popularWeight
    } = req.query;

    const user = await User.findByPk(userId, {
      include: [{ model: UserPreference, as: 'preference' }]
    });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const userProfile = {
      travelerType: user.travelerType,
      age:          user.age,
      gender:       user.gender
    };

    const weights = (contentWeight || collabWeight || popularWeight)
      ? {
          content:       parseFloat(contentWeight)  || undefined,
          collaborative: parseFloat(collabWeight)   || undefined,
          popular:       parseFloat(popularWeight)  || undefined
        }
      : undefined;

    const recommendations = await getHybridRecommendations(userId, userProfile, {
      limit: parseInt(limit),
      weights
    });

    const newUser           = await isNewUser(userId);
    const totalDestinations = await Destination.count();
    const reviewCount       = await Review.count({ where: { userId, targetType: 'destination' } });

    let activeProfile = null;
    let strongPreferences = [];
    if (newUser && user.preference) {
      const prefData = user.preference.toJSON ? user.preference.toJSON() : user.preference;
      activeProfile     = 'registration';
      strongPreferences = getStrongPreferences(prefData);
    } else if (!newUser) {
      const behavioralProfile = await buildBehavioralProfile(userId);
      if (behavioralProfile) {
        activeProfile     = 'behavioral';
        strongPreferences = getStrongPreferences(behavioralProfile);
      }
    }

    res.json({
      success: true,
      count:   recommendations.length,
      recommendations,
      meta: {
        totalDestinations,
        userId,
        isNewUser:            newUser,
        reviewCount,
        reviewThreshold:      NEW_USER_REVIEW_THRESHOLD,
        activeProfile,
        strongPreferences,
        algorithm: newUser
          ? 'cold-start (registration preferences)'
          : 'hybrid-behavioral (collaborative + content-based on reviews)'
      }
    });

  } catch (error) {
    console.error('Hybrid recommendations error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// ============================================================================
// GET /api/recommendations/content-based
// ============================================================================

const getContentBasedRecs = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10, minScore = 0 } = req.query;

    const newUser = await isNewUser(userId);
    let prefData  = null;

    if (newUser) {
      const userPreference = await UserPreference.findOne({ where: { userId } });
      if (userPreference) {
        const raw = userPreference.toJSON ? userPreference.toJSON() : userPreference;
        prefData  = {};
        FEATURES.forEach(f => { prefData[`${f}_score`] = parseFloat(raw[`${f}_score`]) || 0.5; });
      }
    } else {
      prefData = await buildBehavioralProfile(userId);
    }

    const recommendations = await getContentBasedRecommendations(userId, prefData, {
      limit:    parseInt(limit),
      minScore: parseFloat(minScore)
    });

    res.json({
      success:       true,
      count:         recommendations.length,
      recommendations,
      algorithm:     'content-based',
      profileSource: newUser ? 'registration' : 'behavioral'
    });

  } catch (error) {
    console.error('Content-based recommendations error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// ============================================================================
// GET /api/recommendations/collaborative
// ============================================================================

const getCollaborativeRecs = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    const recommendations = await getCollaborativeRecommendations(userId, {
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      count:   recommendations.length,
      recommendations,
      algorithm: 'collaborative'
    });

  } catch (error) {
    console.error('Collaborative recommendations error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// ============================================================================
// GET /api/recommendations/cold-start
// ============================================================================

const getColdStartRecs = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    const user = await User.findByPk(userId, {
      include: [{ model: UserPreference, as: 'preference' }]
    });
    if (!user) return res.status(404).json({ message: 'User not found' });

    let registrationPreferences = null;
    if (user.preference) {
      const raw = user.preference.toJSON ? user.preference.toJSON() : user.preference;
      registrationPreferences = {};
      FEATURES.forEach(f => {
        registrationPreferences[`${f}_score`] = parseFloat(raw[`${f}_score`]) || 0.5;
      });
    }

    const userProfile = {
      travelerType:           user.travelerType,
      age:                    user.age,
      registrationPreferences
    };

    const recommendations = await getColdStartRecommendations(userProfile, parseInt(limit));

    res.json({
      success: true,
      count:   recommendations.length,
      recommendations,
      algorithm: 'cold-start',
      profile: {
        travelerType:           user.travelerType || 'default',
        age:                    user.age || null,
        hasRegistrationScores:  !!registrationPreferences
      }
    });

  } catch (error) {
    console.error('Cold start recommendations error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// ============================================================================
// GET /api/recommendations/popular
// ============================================================================

const getPopularRecs = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { limit = 10 } = req.query;

    const recommendations = await getPopularDestinations(parseInt(limit));

    res.json({
      success: true,
      count:   recommendations.length,
      recommendations,
      algorithm: 'popular'
    });

  } catch (error) {
    console.error('Popular destinations error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// ============================================================================
// GET /api/recommendations/similar-users/:userId
// ============================================================================

const getSimilarUsers = async (req, res) => {
  try {
    const { userId } = req.params;
    const { k = 5 }  = req.query;

    const similarUsers = await findSimilarUsers(parseInt(userId), parseInt(k));

    res.json({
      success: true,
      count:   similarUsers.length,
      similarUsers
    });

  } catch (error) {
    console.error('Similar users error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// ============================================================================
// POST /api/recommendations/rate
// ============================================================================

const addRating = async (req, res) => {
  try {
    const userId = req.user.id;
    const { destinationId, rating, comment = '' } = req.body;

    if (!destinationId || rating === undefined) {
      return res.status(400).json({ message: 'destinationId and rating are required' });
    }

    const numRating = parseFloat(rating);
    if (numRating < 1 || numRating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const destination = await Destination.findByPk(destinationId);
    if (!destination) return res.status(404).json({ message: 'Destination not found' });

    const [review, created] = await Review.findOrCreate({
      where: {
        userId,
        targetType: 'destination',
        targetId:   destinationId
      },
      defaults: {
        rating:     numRating,
        comment,
        targetType: 'destination',
        targetId:   destinationId,
        userId
      }
    });

    if (!created) await review.update({ rating: numRating, comment });

    const reviewCount = await Review.count({ where: { userId, targetType: 'destination' } });
    const justGraduated = reviewCount === NEW_USER_REVIEW_THRESHOLD;

    res.json({
      success: true,
      message: created ? 'Rating added successfully' : 'Rating updated successfully',
      review:  { id: review.id, rating: review.rating, comment: review.comment },
      meta: {
        reviewCount,
        threshold:      NEW_USER_REVIEW_THRESHOLD,
        justGraduated,
        algorithmSwitch: justGraduated
          ? 'Votre profil est maintenant basé sur votre comportement réel'
          : null
      }
    });

  } catch (error) {
    console.error('Add rating error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// ============================================================================
// GET /api/recommendations/explain/:destinationId
// ============================================================================

const explainRecommendation = async (req, res) => {
  try {
    const userId        = req.user.id;
    const { destinationId } = req.params;

    const destination = await Destination.findByPk(destinationId);
    if (!destination) {
      return res.status(404).json({ message: 'Destination not found' });
    }

    const newUser = await isNewUser(userId);
    const destData = destination.toJSON();

    let prefData = null;
    let profileSource = null;

    if (newUser) {
      const userPreference = await UserPreference.findOne({ where: { userId } });
      if (userPreference) {
        const raw = userPreference.toJSON ? userPreference.toJSON() : userPreference;
        prefData = {};
        FEATURES.forEach(f => { prefData[`${f}_score`] = parseFloat(raw[`${f}_score`]) || 0.5; });
        profileSource = 'registration';
      }
    } else {
      prefData      = await buildBehavioralProfile(userId);
      profileSource = 'behavioral';
    }

    const matchPercentage = computeMatchPercentage(destData, prefData);
    const { score: compatScore, details } = prefData
      ? computeCompatibilityScore(destData, prefData)
      : { score: 0.5, details: {} };

    const matches    = [];
    const mismatches = [];

    if (prefData) {
      for (const feature of FEATURES) {
        const userScore = prefData[`${feature}_score`] || 0;
        const destScore = parseFloat(destData[`${feature}_score`]) || 0;

        if (userScore >= 0.6 && destScore >= 0.6) {
          matches.push({
            feature: FEATURE_LABELS[feature],
            score:   Math.round(destScore * 100)
          });
        }
        if (userScore >= 0.6 && destScore < userScore * 0.35) {
          mismatches.push({
            feature:            FEATURE_LABELS[feature],
            yourInterest:       `${Math.round(userScore * 100)}%`,
            destinationOffers:  `${Math.round(destScore * 100)}%`,
            reason:             `Vous aimez le ${FEATURE_LABELS[feature].toLowerCase()} mais cette destination en offre peu`
          });
        }
      }
    }

    res.json({
      success:          true,
      destination:      destination.name,
      matchPercentage,
      profileSource,
      compatibility: { score: compatScore, details },
      matches,
      mismatches,
      explanation: `Cette destination correspond à ${matchPercentage}% de ${
        profileSource === 'behavioral' ? 'vos goûts réels' : 'vos préférences'
      }`
    });

  } catch (error) {
    console.error('Explain recommendation error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// ============================================================================
// GET /api/recommendations/check/:destinationId
// ============================================================================

const checkCompatibility = async (req, res) => {
  try {
    const userId            = req.user.id;
    const { destinationId } = req.params;

    const destination = await Destination.findByPk(destinationId);
    if (!destination) return res.status(404).json({ message: 'Destination not found' });

    const newUser = await isNewUser(userId);
    let prefData  = null;

    if (newUser) {
      const userPreference = await UserPreference.findOne({ where: { userId } });
      if (userPreference) {
        const raw = userPreference.toJSON ? userPreference.toJSON() : userPreference;
        prefData  = {};
        FEATURES.forEach(f => { prefData[`${f}_score`] = parseFloat(raw[`${f}_score`]) || 0.5; });
      }
    } else {
      prefData = await buildBehavioralProfile(userId);
    }

    const matchPct = computeMatchPercentage(destination.toJSON(), prefData);

    res.json({
      success:           true,
      destinationId:     parseInt(destinationId),
      matchPercentage:   matchPct,
      profileSource:     newUser ? 'registration' : 'behavioral'
    });

  } catch (error) {
    console.error('Check compatibility error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// ============================================================================
// GET /api/recommendations/profile-status
// ============================================================================

const getProfileStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const reviewCount       = await Review.count({ where: { userId, targetType: 'destination' } });
    const newUser           = reviewCount < NEW_USER_REVIEW_THRESHOLD;
    const behavioralProfile = !newUser ? await buildBehavioralProfile(userId) : null;
    const userPreference    = newUser
      ? await UserPreference.findOne({ where: { userId } })
      : null;

    res.json({
      success: true,
      isNewUser:        newUser,
      reviewCount,
      reviewThreshold:  NEW_USER_REVIEW_THRESHOLD,
      reviewsUntilGraduation: Math.max(0, NEW_USER_REVIEW_THRESHOLD - reviewCount),
      activeProfile:    newUser ? 'cold-start (inscription)' : 'behavioral (reviews)',
      hasBehavioralProfile:   !!behavioralProfile,
      hasRegistrationScores:  !!userPreference
    });

  } catch (error) {
    console.error('Profile status error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
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
};