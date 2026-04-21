const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Invoice = sequelize.define('Invoice', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  // Invoice number (auto-incremented)
  invoice_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  
  // User who owns the invoice
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  
  // Related reservation
  reservation_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Reservations',
      key: 'id'
    }
  },
  
  // Invoice date
  invoice_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  
  // Amount
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'EUR',
    allowNull: false
  },
  
  // Payment details
  payment_method: {
    type: DataTypes.ENUM('card', 'chargily', 'stripe', 'on_arrival'),
    allowNull: false
  },
  
  payment_status: {
    type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
    allowNull: false,
    defaultValue: 'pending'
  },
  
  // Customer details (snapshot at time of booking)
  customer_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  
  customer_email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  
  customer_phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  // Invoice details (stored as JSON)
  invoice_details: {
    type: DataTypes.JSON,
    allowNull: false
  },
  
  // PDF path (if stored on server)
  pdf_path: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  // Notes
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'Invoices',
  timestamps: true,
  underscored: true
});

module.exports = Invoice;
