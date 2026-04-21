const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Reservation = sequelize.define('Reservation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  // User who made the reservation
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },

  // Transport being reserved (nullable for hotel/activity reservations)
  transport_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Transports',
      key: 'id'
    }
  },

  // Hotel being reserved (nullable for transport/car_rental reservations)
  hotel_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Hotels',
      key: 'id'
    }
  },

  // Activity being reserved (nullable for transport/hotel reservations)
  activity_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Activities',
      key: 'id'
    }
  },

  // Trip type: supports all reservation types
  trip_type: {
    type: DataTypes.STRING,
    allowNull: true
  },

  // Travel dates
  departure_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  return_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },

  // Pickup/Return times (for car rentals and activities)
  pickup_time: {
    type: DataTypes.STRING,
    allowNull: true
  },
  return_time: {
    type: DataTypes.STRING,
    allowNull: true
  },

  // Travelers count
  adults: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 1
  },
  children: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  infants: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },

  // Traveler details (stored as JSON)
  travelers_details: {
    type: DataTypes.JSON,
    allowNull: true
  },

  // Pricing
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  total_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },

  // Payment info - using STRING instead of ENUM for flexibility
  payment_method: {
    type: DataTypes.STRING,
    allowNull: true
  },
  payment_status: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'pending'
  },

  // Card details (encrypted/tokenized in production)
  card_last_four: {
    type: DataTypes.STRING(4),
    allowNull: true
  },

  // Reservation status - using STRING instead of ENUM for flexibility
  status: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'pending'
  },

  // Confirmation number
  confirmation_number: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },

  // Notes
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'Reservations',
  timestamps: true,
  underscored: true
});

module.exports = Reservation;
