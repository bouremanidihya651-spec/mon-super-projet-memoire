/**
 * Algorithme de Recommandation - Travellux
 * Content-Based Filtering: Calcule un score d'affinité basé sur les tags communs
 */

/**
 * Extrait les tags préférés d'un utilisateur basés sur ses favoris
 * @param {Array} favorites - Liste des favoris de l'utilisateur
 * @returns {Object} - Objet avec les tags et leur fréquence
 */
export const getUserPreferredTags = (favorites) => {
  const tagCounts = {};
  const likedItems = [];

  favorites.forEach(fav => {
    if (fav.tags) {
      let tags = [];
      try {
        tags = typeof fav.tags === 'string' ? JSON.parse(fav.tags) : fav.tags;
      } catch (e) {
        tags = [];
      }

      likedItems.push({ name: fav.name, tags });

      tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    }
  });

  // Retourne les tags triés par fréquence
  const sortedTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([tag, count]) => ({ tag, count }));

  return { sortedTags, likedItems };
};

/**
 * Calcule le score de similarité entre une destination et l'historique utilisateur
 * Formule: Score = (Nombre de tags communs / Total de tags destination)
 * 
 * @param {Object} destination - La destination à évaluer
 * @param {Array} userPreferredTags - Les tags préférés de l'utilisateur
 * @returns {Object} - Score d'affinité et explication
 */
export const calculateAffinityScore = (destination, userPreferredTags) => {
  let destTags = [];
  try {
    destTags = typeof destination.tags === 'string' ? JSON.parse(destination.tags) : destination.tags;
  } catch (e) {
    destTags = [];
  }

  if (destTags.length === 0) {
    return { score: 0, matchingTags: [], explanation: null, likedItem: null };
  }

  // Trouver les tags communs
  const matchingTags = destTags.filter(tag => 
    userPreferredTags.some(ut => ut.tag === tag)
  );

  // Score = (Nombre de tags communs / Total de tags destination)
  const rawScore = matchingTags.length / destTags.length;
  
  // Normaliser le score (multiplier par un facteur pour avoir des scores significatifs)
  const normalizedScore = parseFloat(rawScore.toFixed(2));

  // Trouver l'item liké qui correspond le mieux
  let bestMatchedItem = null;
  let maxCommonTags = 0;
  
  userPreferredTags.forEach(ut => {
    const commonCount = matchingTags.filter(t => t === ut.tag).length;
    if (commonCount > maxCommonTags) {
      maxCommonTags = commonCount;
      bestMatchedItem = ut.tag;
    }
  });

  // Générer l'explication
  let explanation = null;
  if (matchingTags.length > 0) {
    const mainTag = matchingTags[0];
    explanation = `Parce que vous avez aimé des destinations avec "${mainTag}"`;
  }

  return {
    score: normalizedScore,
    matchingTags,
    explanation,
    likedItem: bestMatchedItem
  };
};

/**
 * Calcule les scores d'affinité pour toutes les destinations
 * @param {Array} destinations - Liste de toutes les destinations
 * @param {Array} userPreferredTags - Les tags préférés de l'utilisateur
 * @returns {Array} - Destinations avec leur score d'affinité
 */
export const calculateAllScores = (destinations, userPreferredTags) => {
  return destinations.map(destination => ({
    ...destination,
    affinityScore: calculateAffinityScore(destination, userPreferredTags)
  }));
};

/**
 * Trie les destinations par score d'affinité décroissant
 * @param {Array} destinationsWithScores - Destinations avec leurs scores
 * @returns {Array} - Destinations triées
 */
export const sortDestinationsByScore = (destinationsWithScores) => {
  return [...destinationsWithScores].sort((a, b) => b.affinityScore - a.affinityScore);
};

/**
 * Fonction principale de recommandation
 * @param {Object} user - L'utilisateur connecté
 * @param {Array} favorites - Les favoris de l'utilisateur
 * @param {Array} allDestinations - Toutes les destinations disponibles
 * @returns {Array} - Destinations recommandées triées par score
 */
export const getRecommendations = (user, favorites, allDestinations) => {
  // 1. Analyser le profil utilisateur (tags des favoris)
  const userPreferredTags = getUserPreferredTags(favorites);
  
  // 2. Calculer les scores d'affinité pour chaque destination
  const destinationsWithScores = calculateAllScores(allDestinations, userPreferredTags);
  
  // 3. Trier par score décroissant
  const sortedDestinations = sortDestinationsByScore(destinationsWithScores);
  
  return sortedDestinations;
};

/**
 * Filtre les hôtels et activités par destination_id
 * @param {Array} items - Liste des hôtels ou activités
 * @param {number} destinationId - ID de la destination
 * @returns {Array} - Items filtrés
 */
export const filterByDestination = (items, destinationId) => {
  if (!destinationId) return [];
  return items.filter(item => item.destination_id === parseInt(destinationId));
};

export default {
  getUserPreferredTags,
  calculateAffinityScore,
  calculateAllScores,
  sortDestinationsByScore,
  getRecommendations,
  filterByDestination
};


