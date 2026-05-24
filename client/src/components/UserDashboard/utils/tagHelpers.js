/**
 * Extract user preferred tags from favorites
 * @param {Array} favorites - Array of favorite items
 * @returns {{ sortedTags: Array<{tag: string, count: number}> }}
 */
export const getUserPreferredTags = (favorites) => {
  const tagCounts = {};

  favorites.forEach(fav => {
    if (fav.tags) {
      let tags = [];
      try {
        tags = typeof fav.tags === 'string' ? JSON.parse(fav.tags) : fav.tags;
      } catch (e) {
        tags = [];
      }

      tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    }
  });

  const sortedTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([tag, count]) => ({ tag, count }));

  return { sortedTags };
};

/**
 * Categorize tags by type
 * @param {string} tag - The tag to categorize
 * @returns {string} - The category description
 */
export const getTagType = (tag) => {
  const tagLower = tag.toLowerCase();
  if (['montagne', 'neige', 'ski', 'alpinisme'].some(t => tagLower.includes(t))) return 'la montagne';
  if (['plage', 'mer', 'océan', 'tropical', 'détente'].some(t => tagLower.includes(t))) return 'la plage';
  if (['ville', 'urbain', 'culture', 'musée', 'histoire'].some(t => tagLower.includes(t))) return 'la ville';
  if (['aventure', 'randonnée', 'sport', 'activité'].some(t => tagLower.includes(t))) return 'l\'aventure';
  if (['nature', 'forêt', 'parc', 'sauvage'].some(t => tagLower.includes(t))) return 'la nature';
  if (['luxe', 'premium', 'exclusive', 'haut de gamme'].some(t => tagLower.includes(t))) return 'le luxe';
  return 'ce style';
};


