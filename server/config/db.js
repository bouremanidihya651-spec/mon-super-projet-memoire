const { Sequelize } = require('sequelize');
const path = require('path'); // Ajoute cette ligne

const sequelize = new Sequelize({
  dialect: 'sqlite',
  // Cela force le fichier à être dans le même dossier que ce fichier de config
  storage: path.join(__dirname, '../database.sqlite'), 
  logging: console.log 
});

module.exports = sequelize;