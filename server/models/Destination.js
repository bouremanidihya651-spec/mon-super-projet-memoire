const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Destination = sequelize.define('Destination', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  location: {
    type: DataTypes.STRING
  },
  country: {
    type: DataTypes.STRING
  },
  city: {
    type: DataTypes.STRING
  },
  price: {
    type: DataTypes.DECIMAL(10, 2)
  },
  rating: {
    type: DataTypes.FLOAT,
    validate: {
      min: 0,
      max: 5
    }
  },
  luxury_score: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  nature_score: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  adventure_score: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  culture_score: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  beach_score: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  food_score: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  image_url: {
    type: DataTypes.STRING
  },
  tags: {
    type: DataTypes.STRING,
    defaultValue: '[]' // Store as JSON string
  }
}, {
  timestamps: true
});

module.exports = Destination;