const { Destination, Transport } = require('./models');
const sequelize = require('./config/db');

async function seedTransports() {
  try {
    await sequelize.sync();
    console.log('Database synced');

    // Récupérer toutes les destinations
    const destinations = await Destination.findAll();
    
    if (destinations.length === 0) {
      console.log('❌ Aucune destination trouvée. Exécutez d\'abord seed.js');
      return;
    }

    console.log(`✅ ${destinations.length} destinations trouvées`);

    const transports = [];

    // Créer des transports pour chaque destination
    for (const dest of destinations) {
      // Vol
      transports.push({
        name: `Vol vers ${dest.name}`,
        description: `Vol direct vers ${dest.name}`,
        category: 'flight',
        type: 'Avion',
        price: Math.floor(Math.random() * 500) + 200,
        price_unit: 'per_person',
        destination_id: dest.id,
        company: ['Air France', 'Emirates', 'Qatar Airways', 'Lufthansa'][Math.floor(Math.random() * 4)],
        flight_number: `AF${Math.floor(Math.random() * 9000) + 1000}`,
        departure_airport: 'Paris CDG',
        arrival_airport: `${dest.city} Airport`,
        duration: `${Math.floor(Math.random() * 10) + 2}h${Math.floor(Math.random() * 60)}m`,
        rating: (Math.random() * 2 + 3).toFixed(1),
        comfort_score: 0.8,
        convenience_score: 0.9,
        is_available: true,
        booking_link: 'https://www.skyscanner.fr'
      });

      // Transport terrestre
      transports.push({
        name: `Navette ${dest.city}`,
        description: `Transport depuis l'aéroport vers ${dest.name}`,
        category: 'ground',
        type: 'Navette',
        price: Math.floor(Math.random() * 50) + 20,
        price_unit: 'per_person',
        destination_id: dest.id,
        departure_city: 'Aéroport',
        arrival_city: dest.city,
        schedule: 'Toutes les 30 minutes',
        rating: (Math.random() * 2 + 3).toFixed(1),
        comfort_score: 0.6,
        convenience_score: 0.8,
        is_available: true
      });

      // Location voiture
      transports.push({
        name: `Location Voiture - ${dest.name}`,
        description: `Voiture disponible pour explorer ${dest.name}`,
        category: 'car_rental',
        type: 'SUV',
        price: Math.floor(Math.random() * 80) + 40,
        price_unit: 'per_day',
        destination_id: dest.id,
        car_model: ['Toyota RAV4', 'Peugeot 3008', 'Renault Kadjar', 'Volkswagen Tiguan'][Math.floor(Math.random() * 4)],
        rental_agency: ['Europcar', 'Hertz', 'Avis', 'Sixt'][Math.floor(Math.random() * 4)],
        pickup_location: `${dest.city} Centre`,
        deposit: Math.floor(Math.random() * 500) + 300,
        rating: (Math.random() * 2 + 3).toFixed(1),
        comfort_score: 0.7,
        convenience_score: 0.9,
        is_available: true,
        booking_link: 'https://www.rentalcars.com'
      });
    }

    await Transport.bulkCreate(transports);
    console.log(`✅ ${transports.length} transports créés avec succès !`);
    console.log(`   - ${transports.filter(t => t.category === 'flight').length} vols`);
    console.log(`   - ${transports.filter(t => t.category === 'ground').length} transports terrestres`);
    console.log(`   - ${transports.filter(t => t.category === 'car_rental').length} locations de voiture`);

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

seedTransports();
