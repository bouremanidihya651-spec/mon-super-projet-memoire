const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const { comparePassword } = require('../utils/passwordUtils');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user'
  },
  preferences: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  firstName: {
    type: DataTypes.STRING
  },
  lastName: {
    type: DataTypes.STRING
  },
  age: {
    type: DataTypes.INTEGER
  },
  gender: {
    type: DataTypes.STRING
  },
  budget: {
    type: DataTypes.DECIMAL(10, 2)
  },
  isBlocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  // Type de voyageur pour le clustering K-means
  travelerType: {
    type: DataTypes.ENUM('solo', 'couple', 'family', 'group', 'business'),
    allowNull: true
  },
  // Profile photo
  profilePhoto: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true,
  // Add instance method for comparing passwords
  instanceMethods: {
    comparePassword: async function(plainPassword) {
      return await comparePassword(plainPassword, this.password);
    }
  }
});

// Alternative way to add instance method since instanceMethods is deprecated
User.prototype.comparePassword = async function(plainPassword) {
  return await comparePassword(plainPassword, this.password);
};

module.exports = User;