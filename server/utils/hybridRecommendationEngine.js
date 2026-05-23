const { User, UserPreference, Destination, Review, Favorite } = require('../models');
const { Op } = require('sequelize');

// ============================================================================
// CONSTANTS
// ============================================================================

const DEST_MIN_SCORE_RATIO      = 0.35;
const HIGH_PREF_THRESHOLD       = 0.7;
const LOW_PREF_THRESHOLD        = 0.2;
const ZERO_PREF_THRESHOLD       = 0.05; // score utilisateur quasi-nul (0% ou 1%)
const ZERO_DEST_MAX_SCORE       = 0.4;  // si user=0, la destination ne doit pas dépasser 0.4
const NEW_USER_REVIEW_THRESHOLD = 3;

const FEATURES = ['luxury', 'nature', 'adventure', 'culture', 'beach', 'food'];

const FEATURE_LABELS = {
  luxury:    'Luxe',
  nature:    'Nature',
  adventure: 'Aventure',
  culture:   'Culture',
  beach:     'Plage',
  food:      'Gastronomie'
};

const TRAVELER_PROFILES = {
  adventure:  { adventure: 0.9, nature: 0.8, luxury: 0.2, culture: 0.5, beach: 0.4, food: 0.5 },
  luxury:     { luxury: 0.9, beach: 0.6, food: 0.7, culture: 0.5, adventure: 0.3, nature: 0.4 },
  culture:    { culture: 0.9, food: 0.7, luxury: 0.5, nature: 0.4, beach: 0.3, adventure: 0.4 },
  nature:     { nature: 0.9, adventure: 0.7, beach: 0.5, culture: 0.4, food: 0.4, luxury: 0.2 },
  beach:      { beach: 0.9, nature: 0.6, food: 0.6, luxury: 0.4, adventure: 0.3, culture: 0.3 },
  foodie:     { food: 0.9, culture: 0.8, luxury: 0.6, beach: 0.4, nature: 0.3, adventure: 0.3 },
  backpacker: { adventure: 0.8, nature: 0.7, culture: 0.7, food: 0.5, beach: 0.5, luxury: 0.1 },
  family:     { nature: 0.7, beach: 0.7, culture: 0.5, food: 0.6, adventure: 0.4, luxury: 0.4 },
  solo:       { adventure: 0.7, nature: 0.6, culture: 0.6, food: 0.5, beach: 0.4, luxury: 0.3 },
  couple:     { luxury: 0.6, beach: 0.6, culture: 0.5, food: 0.6, nature: 0.4, adventure: 0.3 },
  group:      { adventure: 0.6, beach: 0.6, food: 0.6, nature: 0.5, culture: 0.4, luxury: 0.3 },
  business:   { luxury: 0.8, culture: 0.6, food: 0.6, nature: 0.2, beach: 0.2, adventure: 0.1 },
  default:    { luxury: 0.5, nature: 0.5, adventure: 0.5, culture: 0.5, beach: 0.5, food: 0.5 }
};

const ALGORITHM_LABELS = {
  'cold-start':        'Basé sur vos préférences',
  'content':           'Correspond à vos goûts',
  'collaborative':     'Voyageurs similaires',
  'popular':           'Destination populaire',
  'hybrid-behavioral': 'Recommandation hybride'
};

const ALGORITHM_COLORS = {
  'cold-start':        '#3b82f6',
  'content':           '#10b981',
  'collaborative':     '#8b5cf6',
  'popular':           '#f59e0b',
  'hybrid-behavioral': '#2d7a5a'
};

const toPlain = (obj) => (obj && obj.toJSON ? obj.toJSON() : obj) || {};
const clamp   = (val, min = 0, max = 1) => Math.max(min, Math.min(max, val));

// ============================================================================
// DÉTECTION NOUVEAU UTILISATEUR
// ============================================================================

const isNewUser = async (userId) => {
  const reviewCount = await Review.count({
    where: { userId, targetType: 'destination' }
  });
  return reviewCount < NEW_USER_REVIEW_THRESHOLD;
};

// ============================================================================
// HARD FILTER STRICT (utilisé partout)
// ============================================================================

/**
 * Retourne false (= exclure) si la destination contredit une préférence forte ou nulle.
 *
 * Règles :
 *  1. user=0 (ZERO_PREF_THRESHOLD)  ET dest > ZERO_DEST_MAX_SCORE  → EXCLURE
 *     ex: Plage utilisateur = 0%  ET destination beach_score = 0.9  → EXCLURE
 *  2. user <= LOW_PREF_THRESHOLD    ET dest >= HIGH_PREF_THRESHOLD  → EXCLURE
 *  3. user >= 0.6                   ET dest < user * DEST_MIN_SCORE_RATIO → EXCLURE
 */
const passesStrictFilter = (destData, prefData) => {
  if (!prefData) return true;

  for (const feature of FEATURES) {
    const u = parseFloat(prefData[`${feature}_score`]) || 0;
    const d = parseFloat(destData[`${feature}_score`]) || 0;

    // Règle 1 : préférence NULLE → bloquer destinations fortes sur ce critère
    if (u <= ZERO_PREF_THRESHOLD && d > ZERO_DEST_MAX_SCORE) return false;

    // Règle 2 : préférence faible → bloquer destinations très fortes sur ce critère
    if (u <= LOW_PREF_THRESHOLD && d >= HIGH_PREF_THRESHOLD) return false;

    // Règle 3 : préférence forte → bloquer destinations très faibles sur ce critère
    if (u >= 0.6 && d < u * DEST_MIN_SCORE_RATIO) return false;
  }
  return true;
};

// Ancien alias (gardé pour compatibilité)
const passesHardFilter = (destination, userPreference) =>
  passesStrictFilter(toPlain(destination), toPlain(userPreference));

const applyHardFilter = (destinations, userPreference) => {
  if (!userPreference) return destinations;
  const prefData = toPlain(userPreference);
  return destinations.filter(d => passesStrictFilter(toPlain(d), prefData));
};

// ============================================================================
// CONSTRUCTION DU PROFIL COMPORTEMENTAL
// ============================================================================

const buildBehavioralProfile = async (userId) => {
  const reviews = await Review.findAll({
    where: { userId, targetType: 'destination', rating: { [Op.gte]: 3 } }
  });

  if (reviews.length === 0) return null;

  const destIds     = reviews.map(r => r.targetId);
  const destinations = await Destination.findAll({ where: { id: { [Op.in]: destIds } } });
  const destMap = {};
  destinations.forEach(d => { destMap[d.id] = toPlain(d); });

  const profile = {};
  const weights = {};
  FEATURES.forEach(f => { profile[f] = 0; weights[f] = 0; });

  reviews.forEach(review => {
    const dest   = destMap[review.targetId];
    if (!dest) return;
    const weight = Math.max(0, (review.rating - 2) / 3);
    FEATURES.forEach(f => {
      const destScore = parseFloat(dest[`${f}_score`]) || 0;
      profile[f] += destScore * weight;
      weights[f] += weight;
    });
  });

  const normalizedProfile = {};
  FEATURES.forEach(f => {
    normalizedProfile[`${f}_score`] = weights[f] > 0
      ? clamp(profile[f] / weights[f])
      : 0.5;
  });

  return normalizedProfile;
};

// ============================================================================
// SCORES DE COMPATIBILITÉ
// ============================================================================

const computeCompatibilityScore = (dest, pref) => {
  const destData = toPlain(dest);
  const prefData = toPlain(pref);
  let totalScore = 0;
  let totalWeight = 0;
  const details = {};

  for (const f of FEATURES) {
    const u = parseFloat(prefData[`${f}_score`]) || 0;
    const d = parseFloat(destData[`${f}_score`]) || 0;
    let score = 1 - Math.abs(u - d);
    if (u <= LOW_PREF_THRESHOLD && d >= HIGH_PREF_THRESHOLD) score -= 0.5;
    if (u >= HIGH_PREF_THRESHOLD && d >= HIGH_PREF_THRESHOLD) score = Math.min(1, score + 0.1);
    score = clamp(score);
    details[f] = { userScore: u, destScore: d, compatScore: score };
    totalScore  += score * u;
    totalWeight += u;
  }

  return {
    score: totalWeight > 0 ? totalScore / totalWeight : 0,
    details
  };
};

const computeMatchPercentage = (destination, prefData) => {
  if (!prefData) return 50;
  const dest = toPlain(destination);

  let score = 0;
  for (const f of FEATURES) {
    const u = parseFloat(prefData[`${f}_score`]) || 0;
    const d = parseFloat(dest[`${f}_score`])     || 0;

    // Pénalité forte si l'utilisateur ne veut pas ce critère mais la destination l'a
    if (u <= ZERO_PREF_THRESHOLD && d > ZERO_DEST_MAX_SCORE) {
      score -= 0.8;
    } else if (u <= LOW_PREF_THRESHOLD && d >= HIGH_PREF_THRESHOLD) {
      score -= 0.4;
    } else {
      score += (1 - Math.abs(u - d));
    }
  }

  return Math.max(0, Math.min(100, Math.round((score / FEATURES.length) * 100)));
};

// ============================================================================
// SIMILARITÉ COSINUS
// ============================================================================

const cosineSimilarity = (vecA, vecB) => {
  if (!vecA.length || vecA.length !== vecB.length) return 0;
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot  += vecA[i] * vecB[i];
    magA += vecA[i] ** 2;
    magB += vecB[i] ** 2;
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
};

const userSimilarity = (ratingsA, ratingsB) => {
  const commonItems = Object.keys(ratingsA).filter(id => ratingsB[id] !== undefined);
  if (commonItems.length < 2) return 0;
  const vecA = commonItems.map(id => ratingsA[id]);
  const vecB = commonItems.map(id => ratingsB[id]);
  return cosineSimilarity(vecA, vecB);
};

// ============================================================================
// DESTINATIONS POPULAIRES
// ============================================================================

const getPopularDestinations = async (limit = 10, prefData = null) => {
  const destinations = await Destination.findAll({
    order: [['rating', 'DESC']]
  });

  // Appliquer le filtre strict si on a des préférences
  const filtered = prefData
    ? destinations.filter(d => passesStrictFilter(toPlain(d), prefData))
    : destinations;

  return filtered.slice(0, limit).map(d => ({
    ...toPlain(d),
    popularityScore: (d.rating || 0) / 5,
    matchPercentage: prefData
      ? computeMatchPercentage(toPlain(d), prefData)
      : Math.round(((d.rating || 0) / 5) * 100),
    algorithmUsed:   'popular',
    algorithmLabel:  ALGORITHM_LABELS['popular'],
    algorithmColor:  ALGORITHM_COLORS['popular'],
    displayCause: {
      mainCause:    'Destination très appréciée globalement',
      causeDetails: [`Note moyenne : ${d.rating || 'N/A'}/5`, 'Basé sur les avis de tous les utilisateurs'],
      algorithm:      'popular',
      algorithmLabel: ALGORITHM_LABELS['popular'],
      algorithmColor: ALGORITHM_COLORS['popular']
    }
  }));
};

// ============================================================================
// CONTENT-BASED
// ============================================================================

const getContentBasedRecommendations = async (userId, prefData, options = {}) => {
  const { limit = 10, minScore = 0 } = options;

  if (!prefData) return getPopularDestinations(limit);

  const allDestinations = await Destination.findAll();

  return allDestinations
    .map(dest => {
      const destData = toPlain(dest);

      // Appliquer le filtre strict avant de calculer le score
      if (!passesStrictFilter(destData, prefData)) return null;

      const { score, details } = computeCompatibilityScore(destData, prefData);
      const matchPercentage    = computeMatchPercentage(destData, prefData);

      const topFeatures = FEATURES
        .filter(f => (prefData[`${f}_score`] || 0) >= 0.5)
        .sort((a, b) => (details[b]?.compatScore || 0) - (details[a]?.compatScore || 0));

      const topFeature       = topFeatures[0];
      const matchingFeatures = topFeatures
        .filter(f => (details[f]?.compatScore || 0) >= 0.7)
        .slice(0, 3);

      const causeDetails = matchingFeatures.map(f => {
        const d = details[f];
        return `${FEATURE_LABELS[f]} : ${Math.round(d.compatScore * 100)}% compatibilité`;
      });

      return {
        ...destData,
        contentScore:  score,
        matchPercentage,
        scoreDetails:  details,
        algorithmUsed:  'content',
        algorithmLabel: ALGORITHM_LABELS['content'],
        algorithmColor: ALGORITHM_COLORS['content'],
        explanation: topFeature
          ? `Idéal pour le ${FEATURE_LABELS[topFeature].toLowerCase()}`
          : null,
        displayCause: {
          mainCause: topFeature
            ? `Correspond à votre goût pour ${FEATURE_LABELS[topFeature].toLowerCase()}`
            : 'Correspond à vos préférences',
          causeDetails: causeDetails.length > 0 ? causeDetails : ['Analyse de vos avis précédents'],
          featureMatches: matchingFeatures.map(f => ({
            feature: f,
            label:   FEATURE_LABELS[f],
            compat:  Math.round((details[f]?.compatScore || 0) * 100)
          })),
          algorithm:      'content',
          algorithmLabel: ALGORITHM_LABELS['content'],
          algorithmColor: ALGORITHM_COLORS['content']
        }
      };
    })
    .filter(d => d !== null && d.contentScore >= minScore)
    .sort((a, b) => b.contentScore - a.contentScore)
    .slice(0, limit);
};

// ============================================================================
// COLLABORATIVE FILTERING
// ============================================================================

const getCollaborativeScores = async (userId, { includeRated = false } = {}) => {
  const reviews = await Review.findAll({ where: { targetType: 'destination' } });

  const userMatrix = {};
  reviews.forEach(r => {
    if (!userMatrix[r.userId]) userMatrix[r.userId] = {};
    userMatrix[r.userId][r.targetId] = r.rating;
  });

  const targetUserRatings = userMatrix[userId];
  if (!targetUserRatings || Object.keys(targetUserRatings).length === 0) return {};

  const scores          = {};
  const simWeights      = {};
  const similarUsersList = [];

  Object.keys(userMatrix).forEach(otherUserId => {
    if (parseInt(otherUserId) === userId) return;
    const sim = userSimilarity(targetUserRatings, userMatrix[otherUserId]);
    if (sim <= 0) return;

    similarUsersList.push({ userId: parseInt(otherUserId), similarity: sim });

    Object.keys(userMatrix[otherUserId]).forEach(destId => {
      if (!includeRated && targetUserRatings[destId] !== undefined) return;
      if (!scores[destId]) { scores[destId] = 0; simWeights[destId] = 0; }
      scores[destId]     += userMatrix[otherUserId][destId] * sim;
      simWeights[destId] += Math.abs(sim);
    });
  });

  const normalized = {};
  Object.keys(scores).forEach(id => {
    normalized[id] = {
      score:        simWeights[id] > 0 ? scores[id] / simWeights[id] : scores[id],
      similarUsers: similarUsersList.slice(0, 5)
    };
  });

  return normalized;
};

const getCollaborativeRecommendations = async (userId, options = {}) => {
  const { limit = 10 } = options;
  const collabData = await getCollaborativeScores(userId, { includeRated: false });

  if (Object.keys(collabData).length === 0) {
    return getPopularDestinations(limit);
  }

  const destIds      = Object.keys(collabData).map(Number);
  const destinations = await Destination.findAll({ where: { id: { [Op.in]: destIds } } });

  return destinations
    .map(dest => {
      const data         = collabData[dest.id] || {};
      const similarUsers = data.similarUsers || [];

      return {
        ...toPlain(dest),
        collabScore:    (data.score || 0) / 5,
        matchPercentage: 50,
        algorithmUsed:   'collaborative',
        algorithmLabel:  ALGORITHM_LABELS['collaborative'],
        algorithmColor:  ALGORITHM_COLORS['collaborative'],
        displayCause: {
          mainCause: `${similarUsers.length} voyageur${similarUsers.length > 1 ? 's' : ''} similaire${similarUsers.length > 1 ? 's' : ''} a${similarUsers.length > 1 ? 'ont' : ''} aimé`,
          causeDetails: [
            `Basé sur ${similarUsers.length} utilisateurs avec des goûts proches`,
            `Score de similarité moyen : ${similarUsers.length > 0
              ? (similarUsers.reduce((s, u) => s + u.similarity, 0) / similarUsers.length * 100).toFixed(0)
              : 0}%`
          ],
          similarUsers:   similarUsers.slice(0, 3).map(u => u.userId),
          algorithm:      'collaborative',
          algorithmLabel: ALGORITHM_LABELS['collaborative'],
          algorithmColor: ALGORITHM_COLORS['collaborative']
        }
      };
    })
    .sort((a, b) => b.collabScore - a.collabScore)
    .slice(0, limit);
};

const findSimilarUsers = async (userId, k = 5) => {
  const reviews = await Review.findAll({ where: { targetType: 'destination' } });

  const userMatrix = {};
  reviews.forEach(r => {
    if (!userMatrix[r.userId]) userMatrix[r.userId] = {};
    userMatrix[r.userId][r.targetId] = r.rating;
  });

  const targetRatings = userMatrix[userId];
  if (!targetRatings) return [];

  const similarities = [];
  Object.keys(userMatrix).forEach(otherUserId => {
    if (parseInt(otherUserId) === userId) return;
    const sim = userSimilarity(targetRatings, userMatrix[otherUserId]);
    if (sim > 0) similarities.push({ userId: parseInt(otherUserId), similarity: sim });
  });

  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, k);
};

// ============================================================================
// COLD START
// ============================================================================

const getColdStartRecommendations = async (userProfile = {}, limit = 10) => {
  const { travelerType, age, registrationPreferences } = userProfile;

  let syntheticPref;
  let profileSource = 'default';

  if (registrationPreferences) {
    syntheticPref  = { ...registrationPreferences };
    profileSource  = 'registration';
  } else {
    const baseProfile = TRAVELER_PROFILES[travelerType?.toLowerCase()] || TRAVELER_PROFILES.default;
    syntheticPref     = { ...baseProfile };
    profileSource     = travelerType ? 'traveler-type' : 'default';
  }

  if (age) {
    if (age < 25) {
      syntheticPref.adventure = Math.min(1, (syntheticPref.adventure || 0) + 0.1);
      syntheticPref.luxury    = Math.max(0, (syntheticPref.luxury    || 0) - 0.1);
    } else if (age > 50) {
      syntheticPref.luxury    = Math.min(1, (syntheticPref.luxury    || 0) + 0.1);
      syntheticPref.adventure = Math.max(0, (syntheticPref.adventure || 0) - 0.1);
    }
  }

  const prefData = {};
  FEATURES.forEach(f => {
    prefData[`${f}_score`] = syntheticPref[`${f}_score`] !== undefined
      ? syntheticPref[`${f}_score`]
      : (syntheticPref[f] || 0.5);
  });

  const allDestinations = await Destination.findAll();

  return allDestinations
    .map(dest => {
      const destData = toPlain(dest);

      // ── FILTRE STRICT APPLIQUÉ ICI ──
      if (!passesStrictFilter(destData, prefData)) return null;

      let score = 0, weight = 0;
      const featureMatches = [];

      for (const f of FEATURES) {
        const u      = prefData[`${f}_score`] || 0;
        const d      = parseFloat(destData[`${f}_score`]) || 0;
        const compat = 1 - Math.abs(u - d);
        score  += compat * u;
        weight += u;

        if (u >= 0.5 && d >= 0.5 && compat >= 0.7) {
          featureMatches.push({
            feature:       f,
            label:         FEATURE_LABELS[f],
            userScore:     Math.round(u * 100),
            destScore:     Math.round(d * 100),
            compatibility: Math.round(compat * 100)
          });
        }
      }

      const compatScore     = weight > 0 ? score / weight : 0;
      const finalScore      = compatScore * 0.6 + ((dest.rating || 0) / 5) * 0.4;
      const matchPercentage = computeMatchPercentage(destData, prefData);

      let mainCause, causeDetails;
      if (registrationPreferences) {
        const topMatches = featureMatches.slice(0, 3);
        mainCause = topMatches.length > 0
          ? `Match avec vos préférences : ${topMatches.map(m => m.label).join(', ')}`
          : "Sélectionné selon vos préférences d'inscription";
        causeDetails = topMatches.map(m =>
          `${m.label} : vous aimez à ${m.userScore}% ↔ destination à ${m.destScore}%`
        );
      } else if (travelerType) {
        mainCause    = `Profil voyageur "${travelerType}"`;
        causeDetails = featureMatches.slice(0, 3).map(m =>
          `${m.label} : ${m.compatibility}% compatibilité`
        );
      } else {
        mainCause    = 'Destination tendance';
        causeDetails = [`Note globale : ${dest.rating || 'N/A'}/5`];
      }

      return {
        ...destData,
        coldStartScore: finalScore,
        matchPercentage,
        algorithmUsed:  'cold-start',
        algorithmLabel: ALGORITHM_LABELS['cold-start'],
        algorithmColor: ALGORITHM_COLORS['cold-start'],
        explanation: registrationPreferences
          ? 'Sélectionné selon vos préférences'
          : (travelerType ? `Populaire pour les voyageurs ${travelerType}` : 'Destination tendance'),
        displayCause: {
          mainCause,
          causeDetails: causeDetails.length > 0 ? causeDetails : ['Analyse de votre profil'],
          profileSource,
          featureMatches: featureMatches.slice(0, 3),
          scoreBreakdown: {
            compatibility: Math.round(compatScore * 100),
            popularity:    Math.round(((dest.rating || 0) / 5) * 100),
            final:         Math.round(finalScore * 100)
          },
          algorithm:      'cold-start',
          algorithmLabel: ALGORITHM_LABELS['cold-start'],
          algorithmColor: ALGORITHM_COLORS['cold-start']
        }
      };
    })
    .filter(Boolean) // retire les null (destinations exclues par le filtre)
    .sort((a, b) => b.coldStartScore - a.coldStartScore)
    .slice(0, limit);
};

// ============================================================================
// RECOMMANDATIONS HYBRIDES FINALES
// ============================================================================

const getHybridRecommendations = async (userId, userProfile = {}, options = {}) => {
  const { limit = 10, weights } = options;

  const newUser  = await isNewUser(userId);
  const favorites = await Favorite.findAll({ where: { userId, targetType: 'destination' } });
  const favIds   = new Set(favorites.map(f => f.targetId));

  const POOL = 40;

  // ── CAS 1 : NOUVEL UTILISATEUR ────────────────────────────────────────────
  if (newUser) {
    const userPreference = await UserPreference.findOne({ where: { userId } });

    let registrationPreferences = null;
    if (userPreference) {
      const prefData = toPlain(userPreference);
      registrationPreferences = {};
      FEATURES.forEach(f => {
        registrationPreferences[`${f}_score`] = parseFloat(prefData[`${f}_score`]) || 0;
      });
    }

    const coldStartProfile = {
      travelerType: userProfile.travelerType,
      age:          userProfile.age,
      registrationPreferences
    };

    // getColdStartRecommendations applique déjà passesStrictFilter en interne
    const coldStartRecs = await getColdStartRecommendations(coldStartProfile, POOL);

    // Double vérification avec passesStrictFilter sur les préférences d'inscription
    let results = coldStartRecs;
    if (registrationPreferences) {
      results = results.filter(d => passesStrictFilter(d, registrationPreferences));
    }

    results = results.map(r => ({
      ...r,
      finalScore:  (r.coldStartScore || 0) + (favIds.has(r.id) ? 0.05 : 0),
      isFavorited: favIds.has(r.id)
    }));

    return results
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, limit);
  }

  // ── CAS 2 : UTILISATEUR EXISTANT ─────────────────────────────────────────
  const behavioralProfile = await buildBehavioralProfile(userId);

  let W;
  if (weights) {
    W = {
      content:       parseFloat(weights.content)       || 0.5,
      collaborative: parseFloat(weights.collaborative) || 0.4,
      popular:       parseFloat(weights.popular)       || 0.1,
    };
  } else if (behavioralProfile) {
    W = { content: 0.5, collaborative: 0.4, popular: 0.1 };
  } else {
    W = { content: 0.2, collaborative: 0.6, popular: 0.2 };
  }

  const wTotal = Object.values(W).reduce((s, v) => s + v, 0);
  if (wTotal > 0) Object.keys(W).forEach(k => W[k] /= wTotal);

  const [contentRecs, collabData, popularRecs] = await Promise.all([
    behavioralProfile && W.content > 0
      ? getContentBasedRecommendations(userId, behavioralProfile, { limit: POOL })
      : Promise.resolve([]),
    W.collaborative > 0
      ? getCollaborativeScores(userId, { includeRated: true })
      : Promise.resolve({}),
    W.popular > 0
      ? getPopularDestinations(POOL, behavioralProfile) // filtre strict intégré
      : Promise.resolve([])
  ]);

  const scoreMap = {};
  const addScore = (id, score, algorithm, causeInfo = {}) => {
    if (!scoreMap[id]) {
      scoreMap[id] = { id, scores: {}, finalScore: 0, algorithmCauses: {} };
    }
    scoreMap[id].scores[algorithm]         = (scoreMap[id].scores[algorithm] || 0) + score;
    scoreMap[id].finalScore               += score;
    scoreMap[id].algorithmCauses[algorithm] = causeInfo;
  };

  contentRecs.forEach(r => {
    const causeInfo = {
      type: 'content',
      topFeatures: Object.entries(r.scoreDetails || {})
        .filter(([, d]) => d.compatScore >= 0.7)
        .map(([f, d]) => ({
          feature: f,
          label:   FEATURE_LABELS[f],
          compat:  Math.round(d.compatScore * 100)
        }))
        .slice(0, 2),
      explanation: r.explanation
    };
    addScore(r.id, (r.contentScore || 0) * W.content, 'content', causeInfo);
  });

  Object.entries(collabData).forEach(([id, data]) => {
    const causeInfo = {
      type:              'collaborative',
      similarUsers:      (data.similarUsers || []).slice(0, 3).map(u => u.userId),
      similarUsersCount: (data.similarUsers || []).length
    };
    addScore(parseInt(id), (data.score || 0) / 5 * W.collaborative, 'collaborative', causeInfo);
  });

  popularRecs.forEach(r => {
    const causeInfo = {
      type:         'popular',
      globalRating: r.rating,
      totalReviews: r.reviewCount
    };
    addScore(r.id, (r.popularityScore || 0) * W.popular, 'popular', causeInfo);
  });

  Object.keys(scoreMap).forEach(id => {
    if (favIds.has(parseInt(id))) scoreMap[id].finalScore += 0.05;
  });

  const ids          = Object.keys(scoreMap).map(Number);
  const destinations = await Destination.findAll({ where: { id: { [Op.in]: ids } } });
  const destMap      = {};
  destinations.forEach(d => { destMap[d.id] = toPlain(d); });

  const explanations = {
    content:       'Correspond à vos goûts',
    collaborative: 'Apprécié par des voyageurs similaires',
    popular:       'Destination tendance'
  };

  const recommendations = Object.values(scoreMap)
    .map(entry => {
      const dest = destMap[entry.id];
      if (!dest) return null;

      // Filtre strict sur le profil comportemental pour l'utilisateur existant
      if (behavioralProfile && !passesStrictFilter(dest, behavioralProfile)) return null;

      const dominantAlgo = Object.entries(entry.scores)
        .sort(([, a], [, b]) => b - a)[0]?.[0];

      const algoCause = entry.algorithmCauses[dominantAlgo];
      const matchPct  = behavioralProfile
        ? computeMatchPercentage(dest, behavioralProfile)
        : 50;

      let displayCause = {};

      if (dominantAlgo === 'content') {
        const topFeature = algoCause.topFeatures?.[0];
        displayCause = {
          mainCause: topFeature
            ? `Match ${topFeature.label} (${topFeature.compat}%)`
            : 'Correspond à vos goûts analysés',
          causeDetails: algoCause.topFeatures?.map(f =>
            `${f.label} : ${f.compat}% compatibilité`
          ) || ['Analyse de vos avis précédents'],
          featureMatches: algoCause.topFeatures,
          algorithm:      'content',
          algorithmLabel: ALGORITHM_LABELS['content'],
          algorithmColor: ALGORITHM_COLORS['content']
        };
      } else if (dominantAlgo === 'collaborative') {
        displayCause = {
          mainCause: `${algoCause.similarUsersCount || 0} voyageur${(algoCause.similarUsersCount || 0) > 1 ? 's' : ''} similaire${(algoCause.similarUsersCount || 0) > 1 ? 's' : ''} a${(algoCause.similarUsersCount || 0) > 1 ? 'ont' : ''} aimé`,
          causeDetails: [
            `Basé sur ${algoCause.similarUsersCount || 0} utilisateurs avec des goûts proches`,
            `Note prédite : ${(entry.scores.collaborative / W.collaborative * 5).toFixed(1)}/5`
          ],
          similarUsers:   algoCause.similarUsers,
          algorithm:      'collaborative',
          algorithmLabel: ALGORITHM_LABELS['collaborative'],
          algorithmColor: ALGORITHM_COLORS['collaborative']
        };
      } else if (dominantAlgo === 'popular') {
        displayCause = {
          mainCause:    'Très appréciée par la communauté',
          causeDetails: [
            `Note globale : ${algoCause.globalRating || 'N/A'}/5`,
            'Recommandation basée sur la popularité'
          ],
          algorithm:      'popular',
          algorithmLabel: ALGORITHM_LABELS['popular'],
          algorithmColor: ALGORITHM_COLORS['popular']
        };
      }

      return {
        ...dest,
        finalScore:       entry.finalScore,
        matchPercentage:  matchPct,
        algorithmScores:  entry.scores,
        explanation:      explanations[dominantAlgo] || null,
        isFavorited:      favIds.has(entry.id),
        algorithmUsed:    'hybrid-behavioral',
        algorithmLabel:   ALGORITHM_LABELS['hybrid-behavioral'],
        algorithmColor:   ALGORITHM_COLORS['hybrid-behavioral'],
        dominantAlgorithm: dominantAlgo,
        displayCause
      };
    })
    .filter(Boolean);

  return recommendations
    .sort((a, b) => b.finalScore - a.finalScore)
    .slice(0, limit);
};

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  isNewUser,
  buildBehavioralProfile,
  passesHardFilter,
  passesStrictFilter,
  applyHardFilter,
  computeCompatibilityScore,
  computeMatchPercentage,
  cosineSimilarity,
  userSimilarity,
  FEATURES,
  FEATURE_LABELS,
  TRAVELER_PROFILES,
  NEW_USER_REVIEW_THRESHOLD,
  ALGORITHM_LABELS,
  ALGORITHM_COLORS,
  getContentBasedRecommendations,
  getCollaborativeScores,
  getCollaborativeRecommendations,
  findSimilarUsers,
  getPopularDestinations,
  getColdStartRecommendations,
  getHybridRecommendations
};