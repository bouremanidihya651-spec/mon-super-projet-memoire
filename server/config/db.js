// config/db.js
const { Sequelize } = require('sequelize');

// Ancienne connexion SQLite (commentée)
// const sequelize = new Sequelize({
//   dialect: 'sqlite',
//   storage: './database.sqlite'
// });

// Nouvelle connexion PostgreSQL
const sequelize = new Sequelize('afalou', 'afalou_user', 'afalou123', {
  host: 'localhost',
  port: 5432,
  dialect: 'postgres',
  logging: false
});

module.exports = sequelize;