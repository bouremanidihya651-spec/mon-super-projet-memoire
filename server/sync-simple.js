const { Sequelize } = require('sequelize');
const config = require('./config/config.js');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: console.log
  }
);

// Synchroniser toutes les tables
sequelize.sync({ force: false })
  .then(() => {
    console.log('✅ Tables créées !');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Erreur :', err);
    process.exit(1);
  });