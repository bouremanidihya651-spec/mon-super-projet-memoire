const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Activity = sequelize.define('Activity', {
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
  destination_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Destinations',
      key: 'id'
    }
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
  duration: {
    type: DataTypes.STRING
  },
  adventure_score: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  nature_score: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  culture_score: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  excitement_score: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  relaxation_score: {
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

module.exports = Activity;
