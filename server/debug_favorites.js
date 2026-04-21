/**
 * Script de debug pour les favoris
 * Usage: node debug_favorites.js
 */

const sequelize = require('./config/db');
const { User, Destination, UserPreference, Review, Favorite } = require('./models');

async function debugFavorites() {
  console.log('🔍 Debug du système de favoris\n');

  try {
    // 1. Vérifier la connexion DB
    await sequelize.authenticate();
    console.log('✅ Connexion DB réussie\n');

    // 2. Compter les favoris
    const totalFavorites = await Favorite.count();
    console.log(`📊 Total favoris en DB: ${totalFavorites}`);

    // 3. Lister tous les favoris
    const allFavorites = await Favorite.findAll({
      include: [{ model: User, as: 'user', attributes: ['id', 'email', 'username'] }]
    });

    console.log(`\n📁 Liste des favoris (${allFavorites.length}):`);
    allFavorites.forEach((fav, i) => {
      console.log(`   ${i + 1}. User: ${fav.user?.email || fav.userId} | Type: ${fav.targetType} | ID: ${fav.targetId}`);
    });

    // 4. Vérifier les destinations et leurs tags
    console.log('\n🏝️ Destinations et leurs tags:');
    const destinations = await Destination.findAll();
    destinations.forEach((dest, i) => {
      let tags = [];
      try {
        tags = typeof dest.tags === 'string' ? JSON.parse(dest.tags) : dest.tags;
      } catch (e) {
        tags = ['ERROR parsing tags'];
      }
      console.log(`   ${i + 1}. ${dest.name}: [${tags.join(', ')}]`);
    });

    // 5. Tester getUserFavoriteTags pour un utilisateur spécifique
    if (allFavorites.length > 0) {
      const testUserId = allFavorites[0].userId;
      console.log(`\n🧪 Test pour l'utilisateur ${testUserId}:`);

      const userFavorites = await Favorite.findAll({
        where: { userId: testUserId, targetType: 'destination' }
      });

      console.log(`   Favoris destination: ${userFavorites.length}`);

      const tagCounts = {};
      for (const fav of userFavorites) {
        const dest = await Destination.findByPk(fav.targetId);
        if (dest && dest.tags) {
          let tags = [];
          try {
            tags = typeof dest.tags === 'string' ? JSON.parse(dest.tags) : dest.tags;
          } catch (e) {
            tags = [];
          }
          console.log(`   → ${dest.name}: tags = [${tags.join(', ')}]`);
          tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        }
      }

      const sortedTags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([tag, count]) => ({ tag, count }));

      console.log(`\n   Tags préférés: ${JSON.stringify(sortedTags, null, 2)}`);

      // 6. Tester getFavoriteTagScore
      console.log('\n🧪 Test de similarité pour chaque destination:');
      const { getFavoriteTagScore } = require('./utils/hybridRecommendationEngine');
      
      for (const dest of destinations) {
        const score = getFavoriteTagScore(dest, sortedTags);
        if (score > 0) {
          console.log(`   ✓ ${dest.name}: score = ${score.toFixed(2)}`);
        }
      }
    } else {
      console.log('\n⚠️ Aucun favori trouvé !');
      console.log('💡 Ajoutez un favori avec cette requête:');
      console.log(`
POST http://localhost:3000/api/favorites
Headers:
  Authorization: Bearer <VOTRE_TOKEN>
  Content-Type: application/json
Body:
{
  "targetType": "destination",
  "targetId": 1
}
      `);
    }

    console.log('\n✅ Debug terminé!\n');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error.stack);
  } finally {
    process.exit(0);
  }
}

debugFavorites();
