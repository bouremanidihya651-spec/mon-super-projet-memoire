const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Transport = sequelize.define('Transport', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // Basic info
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  // Transport category: 'flight', 'ground', 'car_rental'
  category: {
    type: DataTypes.ENUM('flight', 'ground', 'car_rental'),
    allowNull: false
  },
  
  // Type within category (e.g., 'Bus', 'Taxi', 'Navette' for ground)
  type: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  // Pricing
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  price_unit: {
    type: DataTypes.STRING,
    defaultValue: 'per_person', // per_person, per_day, total
    allowNull: true
  },
  
  // Link to destination
  destination_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Destinations',
      key: 'id'
    }
  },
  
  // Flight-specific fields
  company: {
    type: DataTypes.STRING,
    allowNull: true
  },
  flight_number: {
    type: DataTypes.STRING,
    allowNull: true
  },
  departure_airport: {
    type: DataTypes.STRING,
    allowNull: true
  },
  arrival_airport: {
    type: DataTypes.STRING,
    allowNull: true
  },
  departure_time: {
    type: DataTypes.STRING,
    allowNull: true
  },
  arrival_time: {
    type: DataTypes.STRING,
    allowNull: true
  },
  duration: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  // Ground transport-specific fields
  departure_city: {
    type: DataTypes.STRING,
    allowNull: true
  },
  arrival_city: {
    type: DataTypes.STRING,
    allowNull: true
  },
  schedule: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  // Car rental-specific fields
  car_model: {
    type: DataTypes.STRING,
    allowNull: true
  },
  rental_agency: {
    type: DataTypes.STRING,
    allowNull: true
  },
  pickup_location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  deposit: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },

  // Booking info
  is_api: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  // Rating and scores
  rating: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0
  },
  comfort_score: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0
  },
  convenience_score: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0
  },
  
  // Tags for filtering
  tags: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  // Status
  is_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'Transports',
  timestamps: true,
  underscored: true
});

module.exports = Transport;
