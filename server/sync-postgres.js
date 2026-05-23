const db = require('./models');

db.sequelize.sync({ force: false })
  .then(() => {
    console.log('✅ Tables créées dans PostgreSQL !');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Erreur :', err);
    process.exit(1);
  });