/**
 * Script de test pour le système de recommandation
 * Usage: node test_recommendations.js
 */

const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3000/api';

// Credentials de test (à modifier selon votre DB)
const TEST_USER = {
  email: 'john@example.com',
  password: 'password123'
};

async function testRecommendations() {
  console.log('🧪 Test du système de recommandation\n');

  try {
    // 1. Login pour obtenir un token
    console.log('📝 Connexion...');
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(TEST_USER)
    });

    const loginData = await loginRes.json();

    if (!loginRes.ok) {
      console.error('❌ Échec connexion:', loginData.message);
      console.log('\n💡 Essayez de créer un utilisateur avec seed.js:');
      console.log('   npm run seed');
      return;
    }

    const token = loginData.token;
    console.log('✅ Connecté avec succès\n');
    console.log('📄 Token:', token.substring(0, 50) + '...\n');

    // 2. Tester les recommandations hybrides
    console.log('🎯 Test: Recommandations Hybrides');
    const hybridRes = await fetch(`${API_BASE}/recommendations/hybrid?limit=5`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const hybridData = await hybridRes.json();
    
    if (hybridRes.ok) {
      console.log('✅ Succès!');
      console.log(`   Nombre de recommandations: ${hybridData.count}`);
      if (hybridData.recommendations?.length > 0) {
        console.log('\n   Top 3 recommandations:');
        hybridData.recommendations.slice(0, 3).forEach((rec, i) => {
          console.log(`   ${i + 1}. ${rec.name} (score: ${rec.finalScore?.toFixed(2) || 'N/A'})`);
          if (rec.explanation) {
            console.log(`      → ${rec.explanation}`);
          }
        });
      }
    } else {
      console.error('❌ Échec:', hybridData.message);
    }

    console.log('\n---\n');

    // 3. Tester content-based
    console.log('🎯 Test: Content-Based Filtering');
    const contentRes = await fetch(`${API_BASE}/recommendations/content-based?limit=3`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const contentData = await contentRes.json();
    
    if (contentRes.ok) {
      console.log('✅ Succès!');
      console.log(`   Nombre: ${contentData.count}`);
      console.log(`   Algorithme: ${contentData.algorithm}`);
    } else {
      console.error('❌ Échec:', contentData.message);
    }

    console.log('\n---\n');

    // 4. Tester collaborative
    console.log('🎯 Test: Collaborative Filtering');
    const collabRes = await fetch(`${API_BASE}/recommendations/collaborative?limit=3`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const collabData = await collabRes.json();
    
    if (collabRes.ok) {
      console.log('✅ Succès!');
      console.log(`   Nombre: ${collabData.count}`);
      console.log(`   Algorithme: ${collabData.algorithm}`);
    } else {
      console.error('❌ Échec:', collabData.message);
    }

    console.log('\n---\n');

    // 5. Tester cold-start
    console.log('🎯 Test: Cold Start (nouveaux utilisateurs)');
    const coldRes = await fetch(`${API_BASE}/recommendations/cold-start?limit=3`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const coldData = await coldRes.json();
    
    if (coldRes.ok) {
      console.log('✅ Succès!');
      console.log(`   Nombre: ${coldData.count}`);
      console.log(`   Algorithme: ${coldData.algorithm}`);
    } else {
      console.error('❌ Échec:', coldData.message);
    }

    console.log('\n---\n');

    // 6. Tester destinations populaires
    console.log('🎯 Test: Destinations Populaires');
    const popularRes = await fetch(`${API_BASE}/recommendations/popular?limit=3`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const popularData = await popularRes.json();
    
    if (popularRes.ok) {
      console.log('✅ Succès!');
      console.log(`   Nombre: ${popularData.count}`);
      if (popularData.recommendations?.length > 0) {
        console.log('\n   Top destinations:');
        popularData.recommendations.slice(0, 3).forEach((rec, i) => {
          console.log(`   ${i + 1}. ${rec.name} (rating: ${rec.rating})`);
        });
      }
    } else {
      console.error('❌ Échec:', popularData.message);
    }

    console.log('\n✅ Tests terminés!\n');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.log('\n💡 Assurez-vous que le serveur est démarré:');
    console.log('   npm run dev\n');
  }
}

testRecommendations();
