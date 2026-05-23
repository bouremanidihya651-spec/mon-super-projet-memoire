const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('afalou', 'afalou_user', 'afalou123', {
  host: 'localhost',
  port: 5432,
  dialect: 'postgres',
  logging: console.log
});

// Charger vos modèles existants
const db = {};

// Importez vos modèles ici (adaptez les chemins selon votre structure)
db.User = require('./models/User')(sequelize, Sequelize.DataTypes);
db.Destination = require('./models/Destination')(sequelize, Sequelize.DataTypes);
db.Activity = require('./models/Activity')(sequelize, Sequelize.DataTypes);
db.Hotel = require('./models/Hotel')(sequelize, Sequelize.DataTypes);
db.Review = require('./models/Review')(sequelize, Sequelize.DataTypes);
db.Favorite = require('./models/Favorite')(sequelize, Sequelize.DataTypes);
db.Reservation = require('./models/Reservation')(sequelize, Sequelize.DataTypes);
db.Invoice = require('./models/Invoice')(sequelize, Sequelize.DataTypes);
db.Transport = require('./models/Transport')(sequelize, Sequelize.DataTypes);
db.Publication = require('./models/Publication')(sequelize, Sequelize.DataTypes);
db.UserPreference = require('./models/UserPreference')(sequelize, Sequelize.DataTypes);

// Synchroniser les tables (créer si n'existent pas)
sequelize.sync({ force: false })
  .then(() => {
    console.log('✅ Tables créées dans PostgreSQL !');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Erreur :', err);
    process.exit(1);
  });