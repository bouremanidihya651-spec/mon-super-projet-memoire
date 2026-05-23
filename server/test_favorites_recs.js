/**
 * Script de test pour les recommandations avec favoris
 * Usage: node test_favorites_recs.js
 */

const sequelize = require('./config/db');
const { User, Destination, UserPreference, Review, Favorite } = require('./models');
const { getContentBasedRecommendations, getHybridRecommendations } = require('./utils/hybridRecommendationEngine');

async function testFavoritesRecs() {
  console.log('🧪 Test des recommandations avec favoris\n');

  try {
    // 1. Vérifier la connexion DB
    await sequelize.authenticate();
    console.log('✅ Connexion DB réussie\n');

    // 2. Lister les utilisateurs
    const users = await User.findAll();
    console.log(`👥 Utilisateurs trouvés: ${users.length}`);
    users.forEach(u => console.log(`   - ${u.email} (ID: ${u.id})`));
    console.log('');

    // 3. Pour chaque utilisateur, tester les recommandations
    for (const user of users) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📊 TEST POUR: ${user.email} (ID: ${user.id})`);
      console.log('='.repeat(60));

      // Vérifier les favoris
      const favorites = await Favorite.findAll({
        where: { userId: user.id, targetType: 'destination' }
      });
      console.log(`\n📁 Favoris: ${favorites.length}`);
      
      if (favorites.length > 0) {
        for (const fav of favorites) {
          const dest = await Destination.findByPk(fav.targetId);
          if (dest) {
            let tags = [];
            try {
              tags = typeof dest.tags === 'string' ? JSON.parse(dest.tags) : dest.tags;
            } catch (e) {
              tags = [];
            }
            console.log(`   → ${dest.name}: [${tags.join(', ')}]`);
          }
        }
      }

      // Vérifier les préférences
      const preference = await UserPreference.findOne({ where: { userId: user.id } });
      console.log(`\n⚙️ Préférences: ${preference ? 'OUI' : 'NON'}`);

      // Tester les recommandations
      console.log('\n🎯 Calcul des recommandations...');
      const recs = await getContentBasedRecommendations(user.id, { limit: 5 });

      console.log(`\n✅ Top 5 recommandations:`);
      recs.forEach((rec, i) => {
        console.log(`\n   ${i + 1}. ${rec.name}`);
        console.log(`      Content Score: ${rec.contentScore?.toFixed(3) || 'N/A'}`);
        console.log(`      Favorite Tag Score: ${rec.favoriteTagScore?.toFixed(3) || 'N/A'}`);
        console.log(`      Explanation: ${rec.explanation}`);
      });

      // Vérifier si les destinations avec tags communs sont bien classées
      console.log('\n🔍 Analyse:');
      if (favorites.length > 0) {
        // Récupérer les tags des favoris
        const favoriteTags = [];
        for (const fav of favorites) {
          const dest = await Destination.findByPk(fav.targetId);
          if (dest) {
            try {
              const tags = typeof dest.tags === 'string' ? JSON.parse(dest.tags) : dest.tags;
              tags.forEach(tag => {
                if (!favoriteTags.includes(tag)) favoriteTags.push(tag);
              });
            } catch (e) {}
          }
        }
        console.log(`   Tags des favoris: [${favoriteTags.join(', ')}]`);

        // Vérifier le score des destinations avec tags communs
        const destsWithCommonTags = recs.filter(rec => {
          try {
            const destTags = typeof rec.tags === 'string' ? JSON.parse(rec.tags) : rec.tags;
            return destTags.some(tag => favoriteTags.includes(tag));
          } catch (e) {
            return false;
          }
        });

        console.log(`   Destinations avec tags communs: ${destsWithCommonTags.length}`);
        destsWithCommonTags.forEach((rec, i) => {
          console.log(`      ${i + 1}. ${rec.name} (score: ${rec.contentScore?.toFixed(3)})`);
        });
      }
    }

    console.log(`\n\n✅ Test terminé!\n`);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error.stack);
  } finally {
    process.exit(0);
  }
}

testFavoritesRecs();
