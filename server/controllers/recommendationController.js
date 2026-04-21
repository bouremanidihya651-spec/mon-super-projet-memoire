const { User, UserPreference, Destination, Review } = require('../models');
const {
  getHybridRecommendations,
  getContentBasedRecommendations,
  getCollaborativeRecommendations,
  getColdStartRecommendations,
  runKMeansClustering,
  getPopularDestinations,
  findSimilarUsers
} = require('../utils/hybridRecommendationEngine');

/**
 * GET /api/recommendations/hybrid
 * Recommandations hybrides pour l'utilisateur connecté
 */
const getHybridRecs = async (req, res) => {
  try {
    const userId = req.user.id; // From JWT middleware
    const { limit = 10, contentWeight = 0.5, collabWeight = 0.3, coldStartWeight = 0.2 } = req.query;

    // Récupérer le profil utilisateur
    const user = await User.findByPk(userId, {
      include: [{ model: UserPreference, as: 'preference' }]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userProfile = {
      travelerType: user.travelerType,
      age: user.age,
      gender: user.gender,
      maxBudget: user.preference?.maxBudget || user.budget
    };

    const recommendations = await getHybridRecommendations(userId, userProfile, {
      limit: parseInt(limit),
      weights: {
        content: parseFloat(contentWeight),
        collaborative: parseFloat(collabWeight),
        coldStart: parseFloat(coldStartWeight)
      }
    });

    res.json({
      success: true,
      count: recommendations.length,
      recommendations
    });

  } catch (error) {
    console.error('Hybrid recommendations error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * GET /api/recommendations/content-based
 * Recommandations basées uniquement sur le content-based filtering
 */
const getContentBasedRecs = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10, minScore = 0 } = req.query;

    const recommendations = await getContentBasedRecommendations(userId, {
      limit: parseInt(limit),
      minScore: parseFloat(minScore)
    });

    res.json({
      success: true,
      count: recommendations.length,
      recommendations,
      algorithm: 'content-based'
    });

  } catch (error) {
    console.error('Content-based recommendations error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * GET /api/recommendations/collaborative
 * Recommandations basées uniquement sur le collaborative filtering
 */
const getCollaborativeRecs = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    const recommendations = await getCollaborativeRecommendations(userId, {
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      count: recommendations.length,
      recommendations,
      algorithm: 'collaborative'
    });

  } catch (error) {
    console.error('Collaborative recommendations error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * GET /api/recommendations/cold-start
 * Recommandations pour nouvel utilisateur (cold start)
 */
const getColdStartRecs = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    // Récupérer le profil utilisateur
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userProfile = {
      travelerType: user.travelerType,
      age: user.age,
      gender: user.gender
    };

    const recommendations = await getColdStartRecommendations(userProfile, parseInt(limit));

    res.json({
      success: true,
      count: recommendations.length,
      recommendations,
      algorithm: 'cold-start'
    });

  } catch (error) {
    console.error('Cold start recommendations error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * GET /api/recommendations/popular
 * Destinations populaires (fallback)
 */
const getPopularRecs = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const recommendations = await getPopularDestinations(parseInt(limit));

    res.json({
      success: true,
      count: recommendations.length,
      recommendations,
      algorithm: 'popular'
    });

  } catch (error) {
    console.error('Popular destinations error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * POST /api/recommendations/clustering/run
 * Exécuter manuellement le clustering K-means (admin only)
 */
const runClustering = async (req, res) => {
  try {
    const { k = 5 } = req.body;

    const result = await runKMeansClustering(parseInt(k));

    res.json({
      success: true,
      message: `Clustering completed with ${k} clusters`,
      clusters: result.clusters,
      userClusters: result.userClusters,
      clusterPopularDestinations: result.clusterPopularDestinations
    });

  } catch (error) {
    console.error('Clustering error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * GET /api/recommendations/similar-users/:userId
 * Trouver les utilisateurs similaires
 */
const getSimilarUsers = async (req, res) => {
  try {
    const { userId } = req.params;
    const { k = 5 } = req.query;

    const similarUsers = await findSimilarUsers(parseInt(userId), parseInt(k));

    res.json({
      success: true,
      count: similarUsers.length,
      similarUsers
    });

  } catch (error) {
    console.error('Similar users error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * POST /api/recommendations/rate
 * Ajouter un rating pour améliorer les recommandations
 */
const addRating = async (req, res) => {
  try {
    const userId = req.user.id;
    const { destinationId, rating, comment = '' } = req.body;

    if (!destinationId || !rating) {
      return res.status(400).json({
        message: 'destinationId and rating are required'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        message: 'Rating must be between 1 and 5'
      });
    }

    // Vérifier si la destination existe
    const destination = await Destination.findByPk(destinationId);
    if (!destination) {
      return res.status(404).json({ message: 'Destination not found' });
    }

    // Créer ou mettre à jour la review
    const [review, created] = await Review.findOrCreate({
      where: {
        userId,
        targetType: 'destination',
        targetId: destinationId
      },
      defaults: {
        rating,
        comment,
        targetType: 'destination',
        targetId: destinationId,
        userId
      }
    });

    if (!created) {
      // Mettre à jour la review existante
      await review.update({ rating, comment });
    }

    res.json({
      success: true,
      message: created ? 'Rating added successfully' : 'Rating updated successfully',
      review: {
        id: review.id,
        rating: review.rating,
        comment: review.comment
      }
    });

  } catch (error) {
    console.error('Add rating error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * GET /api/recommendations/explain/:destinationId
 * Expliquer pourquoi une destination est recommandée
 */
const explainRecommendation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { destinationId } = req.params;

    const userPreference = await UserPreference.findOne({ where: { userId } });
    const destination = await Destination.findByPk(destinationId);

    if (!userPreference || !destination) {
      return res.status(404).json({ message: 'User preferences or destination not found' });
    }

    const userVector = [
      userPreference.luxury_score,
      userPreference.nature_score,
      userPreference.adventure_score,
      userPreference.culture_score,
      userPreference.beach_score,
      userPreference.food_score
    ];

    const destVector = [
      destination.luxury_score,
      destination.nature_score,
      destination.adventure_score,
      destination.culture_score,
      destination.beach_score,
      destination.food_score
    ];

    const featureNames = ['Luxe', 'Nature', 'Aventure', 'Culture', 'Plage', 'Gastronomie'];

    // Trouver les features les plus pertinentes
    const featureMatch = userVector.map((val, i) => ({
      name: featureNames[i],
      userValue: val,
      destValue: destVector[i],
      match: 1 - Math.abs(val - destVector[i]) // Plus c'est proche, plus c'est matché
    }));

    featureMatch.sort((a, b) => b.match - a.match);

    res.json({
      success: true,
      destination: destination.name,
      explanation: {
        topMatches: featureMatch.slice(0, 3),
        userPreferences: userVector,
        destinationFeatures: destVector
      }
    });

  } catch (error) {
    console.error('Explain recommendation error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  getHybridRecs,
  getContentBasedRecs,
  getCollaborativeRecs,
  getColdStartRecs,
  getPopularRecs,
  runClustering,
  getSimilarUsers,
  addRating,
  explainRecommendation
};
