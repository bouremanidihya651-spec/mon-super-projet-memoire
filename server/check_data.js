const { sequelize, Reservation, Favorite, Destination } = require('./models');

async function checkDatabaseData() {
  try {
    console.log('Checking database data...\n');

    // Check reservations
    const reservationsCount = await Reservation.count();
    console.log(`Total reservations: ${reservationsCount}`);

    // Check reservations from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentReservations = await Reservation.count({
      where: {
        created_at: { [require('sequelize').Op.gte]: sevenDaysAgo }
      }
    });
    console.log(`Reservations in last 7 days: ${recentReservations}`);

    // Check favorites
    const favoritesCount = await Favorite.count();
    console.log(`\nTotal favorites: ${favoritesCount}`);

    // Check destination favorites
    const destFavorites = await Favorite.count({
      where: { targetType: 'destination' }
    });
    console.log(`Destination favorites: ${destFavorites}`);

    // Check destinations
    const destinationsCount = await Destination.count();
    console.log(`\nTotal destinations: ${destinationsCount}`);

    // Show some destinations
    const destinations = await Destination.findAll({
      attributes: ['id', 'name', 'city', 'country'],
      limit: 10
    });
    console.log('\nSample destinations:');
    destinations.forEach(d => {
      console.log(`  - ${d.name} (${d.city}, ${d.country}) [ID: ${d.id}]`);
    });

    console.log('\n✅ Database check complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkDatabaseData();
