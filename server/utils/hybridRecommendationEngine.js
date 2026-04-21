const { distance } = require('ml-distance');
const { kMeans } = require('ml-kmeans');
const { User, Destination, UserPreference, Review, Favorite } = require('../models');
const { Op } = require('sequelize');

/**
 * Service de recommandation hybride
 * Combine: Content-Based (Cosine Similarity), Collaborative Filtering, et K-means Clustering
 */

// ============================================================================
// 1. CONTENT-BASED FILTERING (Similarité Cosinus)
// ============================================================================

/**
 * Crée un vecteur de features pour une destination
 * @param {Object} destination - Destination object
 * @returns {number[]} - Vecteur de features normalisées
 */
const createDestinationVector = (destination) => {
  const dest = destination.toJSON ? destination.toJSON() : destination;
  return [
    parseFloat(dest.luxury_score) || 0.5,
    parseFloat(dest.nature_score) || 0.5,
    parseFloat(dest.adventure_score) || 0.5,
    parseFloat(dest.culture_score) || 0.5,
    parseFloat(dest.beach_score) || 0.5,
    parseFloat(dest.food_score) || 0.5
  ];
};

/**
 * Crée un vecteur de préférences utilisateur
 * @param {Object} userPreference - UserPreference object
 * @returns {number[]} - Vecteur de préférences
 */
const createUserVector = (userPreference) => {
  const pref = userPreference.toJSON ? userPreference.toJSON() : userPreference;
  return [
    parseFloat(pref.luxury_score) || 0.5,
    parseFloat(pref.nature_score) || 0.5,
    parseFloat(pref.adventure_score) || 0.5,
    parseFloat(pref.culture_score) || 0.5,
    parseFloat(pref.beach_score) || 0.5,
    parseFloat(pref.food_score) || 0.5
  ];
};

/**
 * Calcule la similarité cosinus entre deux vecteurs
 * @param {number[]} vecA - Vecteur A
 * @param {number[]} vecB - Vecteur B
 * @returns {number} - Similarité cosinus (0 à 1)
 */
const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length) {
    return 0;
  }

  // Utiliser ml-distance pour la similarité cosinus
  try {
    const result = distance.cosine(vecA, vecB);
    // ml-distance retourne une distance (0 = identique, 2 = opposé)
    // On convertit en similarité (1 = identique, 0 = opposé)
    return (1 + result) / 2;
  } catch (e) {
    // Fallback: calcul manuel
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
};

/**
 * Calcule la similarité basée sur les tags (Jaccard similarity)
 * @param {string[]} tagsA - Tags A
 * @param {string[]} tagsB - Tags B
 * @returns {number} - Similarité Jaccard (0 à 1)
 */
const jaccardSimilarity = (tagsA, tagsB) => {
  if (!tagsA || !tagsB || tagsA.length === 0 || tagsB.length === 0) {
    return 0;
  }

  const setA = new Set(tagsA.map(t => t.toLowerCase()));
  const setB = new Set(tagsB.map(t => t.toLowerCase()));

  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);

  return intersection.size / union.size;
};

/**
 * Extrait les tags des favoris d'un utilisateur
 * @param {number} userId - ID de l'utilisateur
 * @returns {Object} - Tags préférés avec leur fréquence
 */
const getUserFavoriteTags = async (userId) => {
  const favorites = await Favorite.findAll({ where: { userId } });
  
  const tagCounts = {};
  const favoriteDestIds = [];

  for (const fav of favorites) {
    if (fav.targetType === 'destination') {
      favoriteDestIds.push(fav.targetId);
      const dest = await Destination.findByPk(fav.targetId);
      if (dest && dest.tags) {
        let tags = [];
        try {
          tags = typeof dest.tags === 'string' ? JSON.parse(dest.tags) : dest.tags;
        } catch (e) {
          tags = [];
        }
        tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    }
  }

  const sortedTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([tag, count]) => ({ tag, count }));

  return { sortedTags, favoriteDestIds };
};

/**
 * Calcule la similarité basée sur les tags favoris
 * @param {Object} dest - Destination
 * @param {Array} userFavoriteTags - Tags favoris de l'utilisateur
 * @returns {number} - Score de similarité (0-1)
 */
const getFavoriteTagScore = (dest, userFavoriteTags) => {
  if (!userFavoriteTags || userFavoriteTags.length === 0) return 0;

  let destTags = [];
  try {
    destTags = typeof dest.tags === 'string' ? JSON.parse(dest.tags) : dest.tags;
  } catch (e) {
    destTags = [];
  }

  if (destTags.length === 0) return 0;

  const matchingTags = destTags.filter(tag =>
    userFavoriteTags.some(ut => ut.tag === tag)
  );

  // Score pondéré : plus un tag est fréquent dans les favoris, plus il compte
  let weightedScore = 0;
  matchingTags.forEach(matchingTag => {
    const tagFreq = userFavoriteTags.find(ut => ut.tag === matchingTag);
    weightedScore += tagFreq ? tagFreq.count : 0;
  });

  // Normaliser le score
  return Math.min(weightedScore / destTags.length, 1);
};

/**
 * Content-Based Filtering: Recommandations basées sur les préférences utilisateur ET les favoris
 * @param {number} userId - ID de l'utilisateur
 * @param {Object} options - Options (limit, minScore, etc.)
 * @returns {Array} - Destinations avec scores
 */
const getContentBasedRecommendations = async (userId, options = {}) => {
  const { limit = 10, minScore = 0 } = options;

  // Récupérer les préférences de l'utilisateur
  const userPreference = await UserPreference.findOne({ where: { userId } });
  
  // Récupérer les tags des favoris
  const { sortedTags: favoriteTags, favoriteDestIds } = await getUserFavoriteTags(userId);

  // Si pas de préférences ET pas de favoris, retourner les destinations populaires
  if (!userPreference && favoriteTags.length === 0) {
    return getPopularDestinations(limit);
  }

  // Récupérer toutes les destinations
  const destinations = await Destination.findAll();

  // Calculer les scores pour chaque destination
  const scoredDestinations = destinations.map(dest => {
    const destData = dest.toJSON();
    
    // Exclure les destinations déjà dans les favoris (optionnel)
    // const isFavorite = favoriteDestIds.includes(dest.id);
    // if (isFavorite) return null;

    let contentScore = 0;
    let explanationParts = [];

    // 1. Score basé sur les préférences (si disponibles)
    if (userPreference) {
      const userVector = createUserVector(userPreference);
      const destVector = createDestinationVector(dest);
      const cosineScore = cosineSimilarity(userVector, destVector);
      contentScore += cosineScore * 0.6; // 60% du score total
      if (cosineScore > 0.5) {
        explanationParts.push(generateContentExplanation(cosineScore, destData));
      }
    }

    // 2. Score basé sur les favoris (tags)
    if (favoriteTags.length > 0) {
      const favTagScore = getFavoriteTagScore(dest, favoriteTags);
      contentScore += favTagScore * 0.4; // 40% du score total
      if (favTagScore > 0.3) {
        const topTags = favoriteTags.slice(0, 2).map(t => t.tag).join(', ');
        explanationParts.push(`Similaire à vos favoris (${topTags})`);
      }
    }

    return {
      ...destData,
      contentScore,
      favoriteTagScore: favoriteTags.length > 0 ? getFavoriteTagScore(dest, favoriteTags) : 0,
      explanation: explanationParts.join(' + ') || 'Correspond à votre profil'
    };
  }).filter(d => d !== null);

  // Filtrer et trier
  return scoredDestinations
    .filter(d => d.contentScore >= minScore)
    .sort((a, b) => b.contentScore - a.contentScore)
    .slice(0, limit);
};

/**
 * Génère une explication pour la recommandation
 */
const generateContentExplanation = (score, destination) => {
  if (score < 0.3) return null;
  
  const explanations = [];
  
  if (destination.luxury_score > 0.7) explanations.push('luxe');
  if (destination.nature_score > 0.7) explanations.push('nature');
  if (destination.adventure_score > 0.7) explanations.push('aventure');
  if (destination.culture_score > 0.7) explanations.push('culture');
  if (destination.beach_score > 0.7) explanations.push('plage');
  if (destination.food_score > 0.7) explanations.push('gastronomie');
  
  if (explanations.length > 0) {
    return `Recommandé pour: ${explanations.slice(0, 3).join(', ')}`;
  }
  
  return 'Correspond à vos préférences';
};

// ============================================================================
// 2. COLLABORATIVE FILTERING (Basé sur les reviews/utilisateurs similaires)
// ============================================================================

/**
 * Récupère la matrice utilisateur-destination avec les ratings
 * @returns {Object} - { userItemMatrix, users, items }
 */
const getUserItemMatrix = async () => {
  // Récupérer toutes les reviews pour les destinations
  const reviews = await Review.findAll({
    where: { targetType: 'destination' },
    attributes: ['userId', 'targetId', 'rating']
  });

  // Extraire les userId et destinationId uniques
  const userIds = [...new Set(reviews.map(r => r.userId))];
  const destinationIds = [...new Set(reviews.map(r => r.targetId))];

  // Créer la matrice (users × items)
  const matrix = [];
  const userIndex = {};
  const itemIndex = {};

  userIds.forEach((userId, i) => { userIndex[userId] = i; });
  destinationIds.forEach((destId, i) => { itemIndex[destId] = i; });

  // Initialiser la matrice avec des zéros
  for (let i = 0; i < userIds.length; i++) {
    matrix[i] = new Array(destinationIds.length).fill(0);
  }

  // Remplir la matrice avec les ratings
  reviews.forEach(review => {
    const userIdx = userIndex[review.userId];
    const itemIdx = itemIndex[review.targetId];
    if (userIdx !== undefined && itemIdx !== undefined) {
      matrix[userIdx][itemIdx] = review.rating;
    }
  });

  return { matrix, userIds, destinationIds, userIndex, itemIndex };
};

/**
 * Trouve les utilisateurs similaires à un utilisateur donné
 * @param {number} userId - ID de l'utilisateur cible
 * @param {number} k - Nombre d'utilisateurs similaires
 * @returns {Array} - Utilisateurs similaires avec leurs scores
 */
const findSimilarUsers = async (userId, k = 5) => {
  const { matrix, userIds } = await getUserItemMatrix();
  const targetIndex = userIds.indexOf(userId);

  if (targetIndex === -1) {
    return []; // Utilisateur n'a pas de reviews
  }

  const targetVector = matrix[targetIndex];
  const similarities = [];

  userIds.forEach((otherUserId, otherIndex) => {
    if (otherUserId !== userId) {
      const otherVector = matrix[otherIndex];
      const sim = cosineSimilarity(targetVector, otherVector);
      if (sim > 0) {
        similarities.push({ userId: otherUserId, similarity: sim });
      }
    }
  });

  // Trier par similarité et retourner les top k
  return similarities.sort((a, b) => b.similarity - a.similarity).slice(0, k);
};

/**
 * Collaborative Filtering: Prédit les ratings pour un utilisateur
 * @param {number} userId - ID de l'utilisateur
 * @param {Object} options - Options
 * @returns {Array} - Destinations recommandées
 */
const getCollaborativeRecommendations = async (userId, options = {}) => {
  const { limit = 10 } = options;

  // Trouver les utilisateurs similaires
  const similarUsers = await findSimilarUsers(userId, 5);
  if (similarUsers.length === 0) {
    // Fallback: retourner les destinations populaires
    return getPopularDestinations(limit);
  }

  // Récupérer les reviews des utilisateurs similaires
  const similarUserIds = similarUsers.map(u => u.userId);
  const similarReviews = await Review.findAll({
    where: {
      targetType: 'destination',
      userId: { [Op.in]: similarUserIds }
    }
  });

  // Calculer le score pondéré pour chaque destination
  const destinationScores = {};
  const destinationWeights = {};

  similarReviews.forEach(review => {
    const userSim = similarUsers.find(u => u.userId === review.userId);
    if (!userSim) return;

    const destId = review.targetId;
    const weight = userSim.similarity;

    if (!destinationScores[destId]) {
      destinationScores[destId] = 0;
      destinationWeights[destId] = 0;
    }

    destinationScores[destId] += review.rating * weight;
    destinationWeights[destId] += weight;
  });

  // Calculer la moyenne pondérée
  const scoredDestinations = Object.keys(destinationScores).map(destId => {
    const avgScore = destinationScores[destId] / destinationWeights[destId];
    return {
      destinationId: parseInt(destId),
      collaborativeScore: avgScore,
      numReviews: similarReviews.filter(r => r.targetId === parseInt(destId)).length
    };
  });

  // Trier et limiter
  const topDestinations = scoredDestinations
    .sort((a, b) => b.collaborativeScore - a.collaborativeScore)
    .slice(0, limit);

  // Récupérer les détails des destinations
  const destinationIds = topDestinations.map(d => d.destinationId);
  const destinations = await Destination.findAll({
    where: { id: { [Op.in]: destinationIds } }
  });

  // Fusionner les scores avec les détails
  return topDestinations.map(scored => {
    const dest = destinations.find(d => d.id === scored.destinationId);
    return {
      ...(dest ? dest.toJSON() : {}),
      collaborativeScore: scored.collaborativeScore,
      explanation: `Recommandé par des utilisateurs similaires (${scored.collaborativeScore.toFixed(1)}/5)`
    };
  });
};

// ============================================================================
// 3. K-MEANS CLUSTERING (Pour Cold Start)
// ============================================================================

/**
 * Exécute K-means sur les utilisateurs pour créer des clusters
 * @param {number} k - Nombre de clusters
 * @returns {Object} - Résultats du clustering
 */
const runKMeansClustering = async (k = 5) => {
  // Récupérer tous les utilisateurs avec leurs préférences
  const users = await User.findAll({
    include: [{ model: UserPreference, as: 'preference' }],
    where: { id: { [Op.ne]: null } } // Exclure les utilisateurs sans préférences
  });

  if (users.length < k) {
    console.log('Pas assez d\'utilisateurs pour le clustering');
    return { clusters: [], userClusters: {} };
  }

  // Créer les vecteurs de features pour chaque utilisateur
  const vectors = [];
  const userIds = [];

  users.forEach(user => {
    const pref = user.preference;
    if (pref) {
      vectors.push(createUserVector(pref));
      userIds.push(user.id);
    }
  });

  if (vectors.length < k) {
    return { clusters: [], userClusters: {} };
  }

  // Exécuter K-means
  try {
    const result = kMeans(vectors, k);
    const { clusters, assignments } = result;

    // Mettre à jour les utilisateurs avec leur cluster
    const userClusters = {};
    for (let i = 0; i < userIds.length; i++) {
      const clusterId = assignments[i];
      userClusters[userIds[i]] = clusterId;

      await UserPreference.update(
        { clusterId, lastClusterUpdate: new Date() },
        { where: { userId: userIds[i] } }
      );
    }

    // Calculer les destinations populaires par cluster
    const clusterPopularDestinations = await getPopularDestinationsByCluster(userClusters, k);

    return {
      clusters,
      userClusters,
      clusterPopularDestinations
    };
  } catch (error) {
    console.error('K-means error:', error);
    return { clusters: [], userClusters: {} };
  }
};

/**
 * Récupère les destinations populaires par cluster
 */
const getPopularDestinationsByCluster = async (userClusters, k) => {
  const result = {};

  for (let clusterId = 0; clusterId < k; clusterId++) {
    const clusterUserIds = Object.keys(userClusters)
      .filter(userId => userClusters[userId] === clusterId)
      .map(id => parseInt(id));

    if (clusterUserIds.length === 0) {
      result[clusterId] = [];
      continue;
    }

    // Trouver les destinations les plus reviewées par ce cluster
    const reviews = await Review.findAll({
      where: {
        targetType: 'destination',
        userId: { [Op.in]: clusterUserIds }
      },
      order: [['rating', 'DESC']],
      limit: 5
    });

    const destIds = [...new Set(reviews.map(r => r.targetId))];
    const destinations = await Destination.findAll({
      where: { id: { [Op.in]: destIds } }
    });

    result[clusterId] = destinations.map(d => d.toJSON());
  }

  return result;
};

/**
 * Cold Start: Recommandations pour nouvel utilisateur basées sur son cluster
 * @param {Object} userProfile - Profil utilisateur (age, travelerType, etc.)
 * @param {number} limit - Nombre de recommandations
 * @returns {Array} - Destinations recommandées
 */
const getColdStartRecommendations = async (userProfile, limit = 10) => {
  const { travelerType, age, gender } = userProfile;

  // Si l'utilisateur a un travelerType, trouver son cluster
  if (travelerType) {
    // Trouver les utilisateurs similaires par travelerType
    const similarUsers = await User.findAll({
      where: { travelerType },
      include: [{ model: UserPreference, as: 'preference' }]
    });

    if (similarUsers.length > 0) {
      const similarUserIds = similarUsers.map(u => u.id);

      // Trouver les destinations populaires parmi ces utilisateurs
      const reviews = await Review.findAll({
        where: {
          targetType: 'destination',
          userId: { [Op.in]: similarUserIds }
        },
        order: [['rating', 'DESC']],
        limit: limit * 2
      });

      const destIds = [...new Set(reviews.map(r => r.targetId))];
      const destinations = await Destination.findAll({
        where: { id: { [Op.in]: destIds } }
      });

      return destinations.slice(0, limit).map(dest => ({
        ...dest.toJSON(),
        coldStartScore: 0.5,
        explanation: `Populaire parmi les voyageurs ${travelerType}`
      }));
    }
  }

  // Fallback: retourner les destinations globalement populaires
  return getPopularDestinations(limit);
};

/**
 * Destinations populaires (fallback)
 */
const getPopularDestinations = async (limit = 10) => {
  const destinations = await Destination.findAll({
    where: {
      rating: { [Op.gte]: 4.0 }
    },
    order: [
      ['rating', 'DESC'],
      ['price', 'ASC']
    ],
    limit
  });

  return destinations.map(dest => ({
    ...dest.toJSON(),
    popularityScore: 1,
    explanation: 'Destination populaire'
  }));
};

// ============================================================================
// 4. ORCHESTRATEUR HYBRIDE
// ============================================================================

/**
 * Combine les scores de différentes approches
 * @param {number} userId - ID de l'utilisateur
 * @param {Object} userProfile - Profil utilisateur pour cold start
 * @param {Object} options - Options
 * @returns {Array} - Recommandations finales
 */
const getHybridRecommendations = async (userId, userProfile = {}, options = {}) => {
  const { limit = 10, weights = { content: 0.5, collaborative: 0.3, coldStart: 0.2 } } = options;

  // Vérifier si l'utilisateur a des préférences
  const userPreference = await UserPreference.findOne({ where: { userId } });
  const hasPreferences = userPreference !== null;

  // Vérifier si l'utilisateur a des reviews
  const userReviews = await Review.count({
    where: { userId, targetType: 'destination' }
  });
  const hasHistory = userReviews > 0;

  // Vérifier si l'utilisateur a des favoris
  const userFavorites = await Favorite.count({
    where: { userId, targetType: 'destination' }
  });
  const hasFavorites = userFavorites > 0;

  let recommendations = [];

  // Décider de la stratégie
  if (!hasPreferences && !hasHistory && !hasFavorites) {
    // Cold Start: utiliser le profil utilisateur
    console.log('🆕 Cold Start: utilisation du profil utilisateur');
    recommendations = await getColdStartRecommendations(userProfile, limit * 2);
  } else if (hasHistory || hasFavorites) {
    // Utilisateur avec historique ou favoris: combiner content-based et collaborative
    console.log('📊 Utilisateur avec historique/favoris: approche hybride');
    console.log(`   - Reviews: ${userReviews}`);
    console.log(`   - Favoris: ${userFavorites}`);

    const [contentRecs, collabRecs] = await Promise.all([
      getContentBasedRecommendations(userId, { limit: limit * 2 }),
      hasHistory ? getCollaborativeRecommendations(userId, { limit: limit * 2 }) : []
    ]);

    // Fusionner les résultats avec pondération
    const scoreMap = {};

    contentRecs.forEach(rec => {
      scoreMap[rec.id] = {
        ...rec,
        finalScore: (rec.contentScore || 0) * weights.content
      };
    });

    collabRecs.forEach(rec => {
      if (scoreMap[rec.id]) {
        scoreMap[rec.id].finalScore += (rec.collaborativeScore / 5) * weights.collaborative;
        scoreMap[rec.id].explanation += ` + ${rec.explanation}`;
      } else {
        scoreMap[rec.id] = {
          ...rec,
          finalScore: (rec.collaborativeScore / 5) * weights.collaborative
        };
      }
    });

    recommendations = Object.values(scoreMap)
      .sort((a, b) => b.finalScore - a.finalScore);
  } else {
    // Seulement des préférences: content-based uniquement
    console.log('🎯 Content-Based uniquement');
    recommendations = await getContentBasedRecommendations(userId, { limit: limit * 2 });
  }

  // Appliquer les filtres (budget, etc.)
  if (userProfile.maxBudget) {
    recommendations = recommendations.filter(r => r.price <= userProfile.maxBudget);
  }

  return recommendations.slice(0, limit);
};

module.exports = {
  // Content-Based
  createDestinationVector,
  createUserVector,
  cosineSimilarity,
  jaccardSimilarity,
  getContentBasedRecommendations,

  // Collaborative Filtering
  getUserItemMatrix,
  findSimilarUsers,
  getCollaborativeRecommendations,

  // K-means Clustering
  runKMeansClustering,
  getColdStartRecommendations,

  // Hybrid Orchestrator
  getHybridRecommendations,

  // Utilities
  getPopularDestinations
};
