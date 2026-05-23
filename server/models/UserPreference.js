const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

/**
 * Modèle pour stocker les préférences de voyage de l'utilisateur
 * Utilisé pour le cold start et le filtrage basé sur le contenu
 */
const UserPreference = sequelize.define('UserPreference', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    },
    unique: true
  },
  // Type de voyageur (pour K-means clustering) - OBLIGATOIRE
  travelerType: {
    type: DataTypes.ENUM('solo', 'couple', 'family', 'group', 'business'),
    allowNull: false
  },
  // Préférences de destination (vecteur pour similarité cosinus) - OBLIGATOIRE
  luxury_score: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0.5,
    validate: {
      min: 0,
      max: 1,
      notNull: { msg: 'luxury_score est requis' },
      notEmpty: { msg: 'luxury_score est requis' }
    }
  },
  nature_score: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0.5,
    validate: {
      min: 0,
      max: 1,
      notNull: { msg: 'nature_score est requis' },
      notEmpty: { msg: 'nature_score est requis' }
    }
  },
  adventure_score: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0.5,
    validate: {
      min: 0,
      max: 1,
      notNull: { msg: 'adventure_score est requis' },
      notEmpty: { msg: 'adventure_score est requis' }
    }
  },
  culture_score: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0.5,
    validate: {
      min: 0,
      max: 1,
      notNull: { msg: 'culture_score est requis' },
      notEmpty: { msg: 'culture_score est requis' }
    }
  },
  beach_score: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0.5,
    validate: {
      min: 0,
      max: 1,
      notNull: { msg: 'beach_score est requis' },
      notEmpty: { msg: 'beach_score est requis' }
    }
  },
  food_score: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0.5,
    validate: {
      min: 0,
      max: 1,
      notNull: { msg: 'food_score est requis' },
      notEmpty: { msg: 'food_score est requis' }
    }
  },
  // Préférences de budget
  minBudget: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  maxBudget: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 10000
  },
  // Tags préférés (pour content-based filtering textuel)
  preferredTags: {
    type: DataTypes.STRING,
    defaultValue: '[]', // JSON string array
    get() {
      const rawValue = this.getDataValue('preferredTags');
      try {
        return rawValue ? JSON.parse(rawValue) : [];
      } catch (e) {
        return [];
      }
    },
    set(value) {
      if (Array.isArray(value)) {
        this.setDataValue('preferredTags', JSON.stringify(value));
      } else if (typeof value === 'string') {
        this.setDataValue('preferredTags', value);
      }
    }
  },
  // Cluster K-means (groupe d'utilisateurs similaires)
  clusterId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  // Date de dernière mise à jour du clustering
  lastClusterUpdate: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true
});

module.exports = UserPreference;
