const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const HotelBackup = sequelize.define('Hotels_backup', {
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
  stars: {
    type: DataTypes.INTEGER,
    validate: {
      min: 1,
      max: 5
    }
  },
  luxury_score: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  comfort_score: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  service_score: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  location_score: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  amenities_score: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  image_url: {
    type: DataTypes.STRING
  },
  tags: {
    type: DataTypes.STRING,
    defaultValue: '[]'
  }
}, {
  timestamps: true,
  tableName: 'Hotels_backup'
});

module.exports = HotelBackup;
