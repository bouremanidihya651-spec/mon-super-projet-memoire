const { Transport, Destination } = require('./models');
const sequelize = require('./config/db');

(async () => {
  await sequelize.sync();
  
  const transports = await Transport.findAll({
    include: [{ model: Destination, as: 'destination' }]
  });
  
  console.log('\n=== TRANSPORTS DANS LA BDD ===\n');
  console.log(`Total: ${transports.length} transports\n`);
  
  transports.forEach(t => {
    console.log(`- ID: ${t.id}`);
    console.log(`  Nom: ${t.name}`);
    console.log(`  Catégorie: ${t.category}`);
    console.log(`  Destination ID: ${t.destination_id}`);
    console.log(`  Destination: ${t.destination?.name || 'N/A'}`);
    console.log(`  Prix: ${t.price}€`);
    console.log('');
  });
})();
