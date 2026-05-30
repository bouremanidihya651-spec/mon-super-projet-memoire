const { User, Destination, UserPreference, Review, Transport } = require('./models');
const { hashPassword } = require('./utils/passwordUtils');
const sequelize = require('./config/db');

async function seedDatabase() {
  try {
    await sequelize.sync();
    console.log('Database synced successfully');

    // ========== UTILISATEURS ==========
    
    const adminEmail = 'admin@example.com';
    let adminUser = await User.findOne({ where: { email: adminEmail } });

    if (!adminUser) {
      const hashedPassword = await hashPassword('admin123');
      
      await User.create({
        username: 'admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        isBlocked: false
      });
      console.log('✅ Admin user created');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // User 1: Solo adventurer
    const user1 = await User.findOne({ where: { email: 'solo.adventurer@example.com' } });
    if (!user1) {
      const hashedPassword = await hashPassword('user123');
      const newUser = await User.create({
        username: 'solo_adventurer',
        email: 'solo.adventurer@example.com',
        password: hashedPassword,
        role: 'user',
        firstName: 'Alex',
        
        lastName: 'Martin',
        age: 28,
        gender: 'male',
        travelerType: 'solo',
        budget: 3000,
        isBlocked: false
      });
      await UserPreference.create({
        userId: newUser.id,
        travelerType: 'solo',
        luxury_score: 0.3,
        nature_score: 0.9,
        adventure_score: 0.95,
        culture_score: 0.6,
        beach_score: 0.4,
        food_score: 0.5,
        minBudget: 500,
        maxBudget: 3000,
        preferredTags: JSON.stringify(['aventure', 'randonnée', 'nature', 'solo'])
      });
      console.log('✅ Solo adventurer user created');
    }

    // User 2: Luxury couple
    const user2 = await User.findOne({ where: { email: 'luxury.couple@example.com' } });
    if (!user2) {
      const hashedPassword = await hashPassword('user123');
      const newUser = await User.create({
        username: 'luxury_couple',
        email: 'luxury.couple@example.com',
        password: hashedPassword,
        role: 'user',
        firstName: 'Sophie',
        lastName: 'Dubois',
        age: 35,
        gender: 'female',
        travelerType: 'couple',
        budget: 8000,
        isBlocked: false
      });
      await UserPreference.create({
        userId: newUser.id,
        travelerType: 'couple',
        luxury_score: 0.95,
        nature_score: 0.5,
        adventure_score: 0.2,
        culture_score: 0.7,
        beach_score: 0.9,
        food_score: 0.85,
        minBudget: 2000,
        maxBudget: 8000,
        preferredTags: JSON.stringify(['luxe', 'plage', 'gastronomie', 'détente'])
      });
      console.log('✅ Luxury couple user created');
    }

    // User 3: Family
    const user3 = await User.findOne({ where: { email: 'family@example.com' } });
    if (!user3) {
      const hashedPassword = await hashPassword('user123');
      const newUser = await User.create({
        username: 'family_traveler',
        email: 'family@example.com',
        password: hashedPassword,
        role: 'user',
        firstName: 'Pierre',
        lastName: 'Bernard',
        age: 42,
        gender: 'male',
        travelerType: 'family',
        budget: 5000,
        isBlocked: false
      });
      await UserPreference.create({
        userId: newUser.id,
        travelerType: 'family',
        luxury_score: 0.5,
        nature_score: 0.8,
        adventure_score: 0.4,
        culture_score: 0.85,
        beach_score: 0.6,
        food_score: 0.7,
        minBudget: 1000,
        maxBudget: 5000,
        preferredTags: JSON.stringify(['famille', 'culture', 'nature', 'éducation'])
      });
      console.log('✅ Family traveler user created');
    }

    // User 4: Business
    const user4 = await User.findOne({ where: { email: 'business@example.com' } });
    if (!user4) {
      const hashedPassword = await hashPassword('user123');
      const newUser = await User.create({
        username: 'business_traveler',
        email: 'business@example.com',
        password: hashedPassword,
        role: 'user',
        firstName: 'Marie',
        lastName: 'Leroy',
        age: 38,
        gender: 'female',
        travelerType: 'business',
        budget: 10000,
        isBlocked: false
      });
      await UserPreference.create({
        userId: newUser.id,
        travelerType: 'business',
        luxury_score: 0.9,
        nature_score: 0.2,
        adventure_score: 0.1,
        culture_score: 0.6,
        beach_score: 0.1,
        food_score: 0.9,
        minBudget: 3000,
        maxBudget: 10000,
        preferredTags: JSON.stringify(['business', 'luxe', 'gastronomie', 'ville'])
      });
      console.log('✅ Business traveler user created');
    }

    // ========== DESTINATIONS ==========
    
    await Review.destroy({ where: {} });
    await Destination.destroy({ where: {} });
    
    const destinations = await Destination.bulkCreate([
      {
        name: 'Chamonix Mont-Blanc',
        description: 'Station de ski prestigieuse au pied du Mont-Blanc',
        location: 'Haute-Savoie',
        country: 'France',
        city: 'Chamonix',
        price: 350.00,
        rating: 4.7,
        luxury_score: 0.7,
        nature_score: 0.95,
        adventure_score: 0.9,
        culture_score: 0.4,
        beach_score: 0.1,
        food_score: 0.7,
        tags: JSON.stringify(['montagne', 'ski', 'randonnée', 'aventure', 'nature'])
      },
      {
        name: 'Maldives - Resort Privé',
        description: 'Bungalows sur pilotis dans un lagon cristallin',
        location: 'Océan Indien',
        country: 'Maldives',
        city: 'Malé',
        price: 1200.00,
        rating: 4.9,
        luxury_score: 0.98,
        nature_score: 0.8,
        adventure_score: 0.3,
        culture_score: 0.4,
        beach_score: 0.98,
        food_score: 0.85,
        tags: JSON.stringify(['plage', 'luxe', 'tropical', 'détente', 'couple'])
      },
      {
        name: 'Rome Historique',
        description: 'Découverte du patrimoine historique de la Ville Éternelle',
        location: 'Latium',
        country: 'Italie',
        city: 'Rome',
        price: 250.00,
        rating: 4.6,
        luxury_score: 0.6,
        nature_score: 0.3,
        adventure_score: 0.2,
        culture_score: 0.98,
        beach_score: 0.1,
        food_score: 0.9,
        tags: JSON.stringify(['histoire', 'culture', 'gastronomie', 'ville', 'patrimoine'])
      },
      {
        name: 'Costa Rica - Aventure',
        description: 'Expérience d\'écotourisme au cœur de la jungle',
        location: 'Province de Guanacaste',
        country: 'Costa Rica',
        city: 'Liberia',
        price: 400.00,
        rating: 4.8,
        luxury_score: 0.4,
        nature_score: 0.98,
        adventure_score: 0.95,
        culture_score: 0.5,
        beach_score: 0.7,
        food_score: 0.6,
        tags: JSON.stringify(['aventure', 'nature', 'écotourisme', 'jungle', 'plage'])
      },
      {
        name: 'Paris - Séjour Gastronomique',
        description: 'Découverte culinaire dans la capitale française',
        location: 'Île-de-France',
        country: 'France',
        city: 'Paris',
        price: 450.00,
        rating: 4.5,
        luxury_score: 0.85,
        nature_score: 0.3,
        adventure_score: 0.2,
        culture_score: 0.9,
        beach_score: 0.0,
        food_score: 0.95,
        tags: JSON.stringify(['gastronomie', 'culture', 'luxe', 'ville', 'romantique'])
      },
      {
        name: 'Bali - Resort Familial',
        description: 'Vacances en famille dans un resort tout compris',
        location: 'Bali',
        country: 'Indonésie',
        city: 'Nusa Dua',
        price: 300.00,
        rating: 4.4,
        luxury_score: 0.6,
        nature_score: 0.7,
        adventure_score: 0.5,
        culture_score: 0.75,
        beach_score: 0.8,
        food_score: 0.7,
        tags: JSON.stringify(['famille', 'plage', 'culture', 'tropical', 'détente'])
      },
      {
        name: 'New York - City Break',
        description: 'Séjour urbain dans la ville qui ne dort jamais',
        location: 'New York',
        country: 'USA',
        city: 'Manhattan',
        price: 500.00,
        rating: 4.6,
        luxury_score: 0.8,
        nature_score: 0.2,
        adventure_score: 0.4,
        culture_score: 0.85,
        beach_score: 0.3,
        food_score: 0.85,
        tags: JSON.stringify(['ville', 'culture', 'shopping', 'gastronomie', 'business'])
      },
      {
        name: 'Safari Tanzanie',
        description: 'Safari de 7 jours dans les parcs nationaux',
        location: 'Serengeti',
        country: 'Tanzanie',
        city: 'Arusha',
        price: 2500.00,
        rating: 4.9,
        luxury_score: 0.7,
        nature_score: 0.98,
        adventure_score: 0.9,
        culture_score: 0.6,
        beach_score: 0.0,
        food_score: 0.5,
        tags: JSON.stringify(['safari', 'nature', 'aventure', 'animaux', 'photographie'])
      }
    ]);
    console.log('✅ Sample destinations added');

    // ========== REVIEWS ==========
    
    // Récupérer les vrais IDs des utilisateurs
    const u1 = await User.findOne({ where: { email: 'solo.adventurer@example.com' } });
    const u2 = await User.findOne({ where: { email: 'luxury.couple@example.com' } });
    const u3 = await User.findOne({ where: { email: 'family@example.com' } });
    const u4 = await User.findOne({ where: { email: 'business@example.com' } });
    
    if (u1 && u2 && u3 && u4) {
      await Review.bulkCreate([
        // User 2 (solo adventurer)
        { userId: u1.id, targetType: 'destination', targetId: 1, rating: 5, comment: 'Incroyable pour la randonnée!' },
        { userId: u1.id, targetType: 'destination', targetId: 4, rating: 5, comment: 'Meilleure expérience de ma vie' },
        { userId: u1.id, targetType: 'destination', targetId: 8, rating: 4, comment: 'Super mais très cher' },
        { userId: u1.id, targetType: 'destination', targetId: 6, rating: 3, comment: 'Bien pour la famille mais pas mon style' },
        // User 3 (luxury couple)
        { userId: u2.id, targetType: 'destination', targetId: 2, rating: 5, comment: 'Paradis sur terre!' },
        { userId: u2.id, targetType: 'destination', targetId: 5, rating: 5, comment: 'Gastronomie exceptionnelle' },
        { userId: u2.id, targetType: 'destination', targetId: 6, rating: 4, comment: 'Très beau resort' },
        // User 4 (family)
        { userId: u3.id, targetType: 'destination', targetId: 3, rating: 5, comment: 'Éducatif pour les enfants' },
        { userId: u3.id, targetType: 'destination', targetId: 6, rating: 5, comment: 'Parfait pour les familles' },
        { userId: u3.id, targetType: 'destination', targetId: 7, rating: 4, comment: 'Les enfants ont adoré' },
        // User 5 (business)
        { userId: u4.id, targetType: 'destination', targetId: 5, rating: 5, comment: 'Parfait pour un séjour business' },
        { userId: u4.id, targetType: 'destination', targetId: 7, rating: 5, comment: 'Excellent pour les voyages d\'affaires' },
        { userId: u4.id, targetType: 'destination', targetId: 2, rating: 4, comment: 'Luxe incroyable' }
      ]);
      console.log('✅ Sample reviews added');
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Résumé des données:');
    console.log('   - 4 utilisateurs avec profils différents');
    console.log('   - 8 destinations variées');
    console.log('   - 14 reviews pour le collaborative filtering');
    console.log('\n🧪 Pour tester le système:');
    console.log('   1. Connectez-vous avec un utilisateur (ex: solo.adventurer@example.com / user123)');
    console.log('   2. Appelez GET /api/recommendations/hybrid');
    console.log('   3. Testez les différents algorithmes:');
    console.log('      - GET /api/recommendations/content-based');
    console.log('      - GET /api/recommendations/collaborative');
    console.log('      - GET /api/recommendations/cold-start');
    
  } catch (error) {
    console.error('❌ Error during database seeding:', error);
    process.exit(1);
  }
}

seedDatabase();
