const { Sequelize } = require('sequelize');

const sqlite = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false
});

const postgres = new Sequelize('afalou', 'afalou_user', 'afalou123', {
  host: 'localhost',
  port: 5432,
  dialect: 'postgres',
  logging: false
});

module.exports = { sqlite, postgres };