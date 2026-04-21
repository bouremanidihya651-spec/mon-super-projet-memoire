const { User, UserPreference } = require('../models');
const { hashPassword, comparePassword } = require('../utils/passwordUtils');
const { generateToken } = require('../utils/jwtUtils');
const { Op } = require('sequelize');
require('dotenv').config();

/**
 * GOOGLE AUTH - Login or Register with Google
 * This endpoint handles both login and registration for Google users
 */
const googleAuth = async (req, res) => {
  try {
    const {
      email,
      firstName,
      lastName,
      travelerType = 'solo',
      minBudget = 0,
      maxBudget = 10000,
      luxury_score = 0.5,
      nature_score = 0.5,
      adventure_score = 0.5,
      culture_score = 0.5,
      beach_score = 0.5,
      food_score = 0.5,
      preferredTags = []
    } = req.body;

    console.log('🔐 Google Auth:', { email, firstName, lastName });

    // Chercher l'utilisateur par email
    let user = await User.findOne({
      where: { email },
      include: [{
        model: UserPreference,
        as: 'preference',
        attributes: ['luxury_score', 'nature_score', 'adventure_score', 'culture_score', 'beach_score', 'food_score', 'minBudget', 'maxBudget', 'travelerType', 'preferredTags']
      }]
    });

    if (user) {
      // Utilisateur existe - connexion
      console.log('✅ Utilisateur trouvé - connexion');
      
      // Générer token (ROLE INCLUS)
      const token = generateToken(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        '7d'
      );

      // Retirer password et inclure les préférences
      const { password: _, ...userData } = user.toJSON();

      // Aplatir les préférences dans l'objet user pour un accès facile
      if (user.preference) {
        userData.luxury_score = user.preference.luxury_score;
        userData.nature_score = user.preference.nature_score;
        userData.adventure_score = user.preference.adventure_score;
        userData.culture_score = user.preference.culture_score;
        userData.beach_score = user.preference.beach_score;
        userData.food_score = user.preference.food_score;
        userData.minBudget = user.preference.minBudget;
        userData.maxBudget = user.preference.maxBudget;
        userData.travelerType = user.preference.travelerType;
        userData.preferredTags = user.preference.preferredTags;
      }

      return res.status(200).json({
        message: 'Login successful with Google',
        token,
        user: userData,
        isNewUser: false
      });
    }

    // Nouvel utilisateur - inscription
    console.log('📝 Nouvel utilisateur - inscription');

    // Hash password (random password for Google users)
    const googlePassword = `google_${Date.now()}_${Math.random().toString(36).slice(-8)}`;
    const hashedPassword = await hashPassword(googlePassword);

    // Création utilisateur
    user = await User.create({
      username: email,
      email,
      password: hashedPassword,
      firstName: firstName || '',
      lastName: lastName || '',
      travelerType: travelerType || 'solo',
      preferences: {},
      role: 'user'
    });

    console.log('✅ Utilisateur créé:', user.id);

    // Créer les préférences utilisateur
    const userPreference = await UserPreference.create({
      userId: user.id,
      travelerType: travelerType || 'solo',
      luxury_score: parseFloat(luxury_score) || 0.5,
      nature_score: parseFloat(nature_score) || 0.5,
      adventure_score: parseFloat(adventure_score) || 0.5,
      culture_score: parseFloat(culture_score) || 0.5,
      beach_score: parseFloat(beach_score) || 0.5,
      food_score: parseFloat(food_score) || 0.5,
      minBudget: parseFloat(minBudget) || 0,
      maxBudget: parseFloat(maxBudget) || 10000,
      preferredTags: Array.isArray(preferredTags) ? preferredTags : []
    });

    console.log('✅ UserPreference créé:', userPreference.id);

    // Générer token
    const token = generateToken(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      '7d'
    );

    // Retirer password et inclure les préférences
    const { password: _, ...userData } = user.toJSON();

    // Aplatir les préférences dans l'objet user pour un accès facile
    userData.luxury_score = userPreference.luxury_score;
    userData.nature_score = userPreference.nature_score;
    userData.adventure_score = userPreference.adventure_score;
    userData.culture_score = userPreference.culture_score;
    userData.beach_score = userPreference.beach_score;
    userData.food_score = userPreference.food_score;
    userData.minBudget = userPreference.minBudget;
    userData.maxBudget = userPreference.maxBudget;
    userData.travelerType = userPreference.travelerType;
    userData.preferredTags = userPreference.preferredTags;

    return res.status(201).json({
      message: 'User registered successfully with Google',
      token,
      user: userData,
      isNewUser: true
    });

  } catch (error) {
    console.error('❌ Google Auth error:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * REGISTER
 */
const register = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      firstName,
      lastName,
      age,
      gender,
      budget,
      preferences,
      // Nouveaux champs pour le système de recommandation
      travelerType,
      minBudget,
      maxBudget,
      // Scores de préférences (0-1)
      luxury_score,
      nature_score,
      adventure_score,
      culture_score,
      beach_score,
      food_score,
      preferredTags
    } = req.body;

    console.log('📝 Inscription reçue:', {
      email,
      firstName,
      lastName,
      travelerType,
      luxury_score,
      nature_score,
      adventure_score,
      culture_score,
      beach_score,
      food_score,
      minBudget,
      maxBudget,
      preferredTags
    });

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }]
      }
    });

    if (existingUser) {
      return res.status(409).json({
        message: 'User with this email or username already exists'
      });
    }

    // === VALIDATION DES PRÉFÉRENCES (OBLIGATOIRE) ===
    // Pour éviter le cold start total, on rend les préférences obligatoires
    const missingPrefs = [];
    
    if (!travelerType || !['solo', 'couple', 'family', 'group', 'business'].includes(travelerType)) {
      missingPrefs.push('travelerType (doit être: solo, couple, family, group, business)');
    }
    
    if (luxury_score === undefined || isNaN(parseFloat(luxury_score))) {
      missingPrefs.push('luxury_score (0-1)');
    }
    if (nature_score === undefined || isNaN(parseFloat(nature_score))) {
      missingPrefs.push('nature_score (0-1)');
    }
    if (adventure_score === undefined || isNaN(parseFloat(adventure_score))) {
      missingPrefs.push('adventure_score (0-1)');
    }
    if (culture_score === undefined || isNaN(parseFloat(culture_score))) {
      missingPrefs.push('culture_score (0-1)');
    }
    if (beach_score === undefined || isNaN(parseFloat(beach_score))) {
      missingPrefs.push('beach_score (0-1)');
    }
    if (food_score === undefined || isNaN(parseFloat(food_score))) {
      missingPrefs.push('food_score (0-1)');
    }

    if (missingPrefs.length > 0) {
      return res.status(400).json({
        message: 'Préférences obligatoires manquantes',
        missingFields: missingPrefs,
        hint: 'Tous les scores de préférences (0-1) et le travelerType sont requis pour des recommandations personnalisées'
      });
    }
    // ===============================================

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Création utilisateur (role par défaut = user)
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      age,
      gender,
      budget,
      travelerType: travelerType || null,
      preferences: preferences || {},
      role: 'user'
    });

    console.log('✅ Utilisateur créé:', user.id);

    // Préparer preferredTags - s'assurer que c'est un tableau valide
    let validPreferredTags = [];
    if (Array.isArray(preferredTags)) {
      validPreferredTags = preferredTags;
    } else if (typeof preferredTags === 'string') {
      try {
        validPreferredTags = JSON.parse(preferredTags);
      } catch (e) {
        validPreferredTags = [];
      }
    }

    // Créer les préférences utilisateur pour le système de recommandation
    const userPreference = await UserPreference.create({
      userId: user.id,
      travelerType: travelerType || null,
      luxury_score: (luxury_score !== undefined && !isNaN(parseFloat(luxury_score))) ? parseFloat(luxury_score) : 0.5,
      nature_score: (nature_score !== undefined && !isNaN(parseFloat(nature_score))) ? parseFloat(nature_score) : 0.5,
      adventure_score: (adventure_score !== undefined && !isNaN(parseFloat(adventure_score))) ? parseFloat(adventure_score) : 0.5,
      culture_score: (culture_score !== undefined && !isNaN(parseFloat(culture_score))) ? parseFloat(culture_score) : 0.5,
      beach_score: (beach_score !== undefined && !isNaN(parseFloat(beach_score))) ? parseFloat(beach_score) : 0.5,
      food_score: (food_score !== undefined && !isNaN(parseFloat(food_score))) ? parseFloat(food_score) : 0.5,
      minBudget: (minBudget !== undefined && !isNaN(parseFloat(minBudget))) ? parseFloat(minBudget) : 0,
      maxBudget: (maxBudget !== undefined && !isNaN(parseFloat(maxBudget))) ? parseFloat(maxBudget) : 10000,
      preferredTags: validPreferredTags
    });

    console.log('✅ UserPreference créé:', userPreference.id);

    // Générer token
    const token = generateToken(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      '7d'
    );

    // Retirer password et inclure les préférences
    const { password: _, ...userData } = user.toJSON();

    // Aplatir les préférences dans l'objet user pour un accès facile
    userData.luxury_score = userPreference.luxury_score;
    userData.nature_score = userPreference.nature_score;
    userData.adventure_score = userPreference.adventure_score;
    userData.culture_score = userPreference.culture_score;
    userData.beach_score = userPreference.beach_score;
    userData.food_score = userPreference.food_score;
    userData.minBudget = userPreference.minBudget;
    userData.maxBudget = userPreference.maxBudget;
    userData.travelerType = userPreference.travelerType;
    userData.preferredTags = userPreference.preferredTags;

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: userData
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * LOGIN
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Trouver l'utilisateur avec ses préférences
    const user = await User.findOne({ 
      where: { email },
      include: [{ 
        model: UserPreference, 
        as: 'preference',
        attributes: ['luxury_score', 'nature_score', 'adventure_score', 'culture_score', 'beach_score', 'food_score', 'minBudget', 'maxBudget', 'travelerType', 'preferredTags']
      }]
    });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    // Vérifier mot de passe
    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    // Générer token (ROLE INCLUS)
    const token = generateToken(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      '7d'
    );

    // Retirer password et inclure les préférences
    const { password: _, ...userData } = user.toJSON();
    
    // Aplatir les préférences dans l'objet user pour un accès facile
    if (user.preference) {
      userData.luxury_score = user.preference.luxury_score;
      userData.nature_score = user.preference.nature_score;
      userData.adventure_score = user.preference.adventure_score;
      userData.culture_score = user.preference.culture_score;
      userData.beach_score = user.preference.beach_score;
      userData.food_score = user.preference.food_score;
      userData.minBudget = user.preference.minBudget;
      userData.maxBudget = user.preference.maxBudget;
      userData.travelerType = user.preference.travelerType;
      userData.preferredTags = user.preference.preferredTags;
    }

    res.status(200).json({
      message: 'Login successful',
      token,
      user: userData
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

/**
 * LOGOUT (client-side)
 */
const logout = (req, res) => {
  res.status(200).json({
    message: 'Logged out successfully'
  });
};

module.exports = {
  googleAuth,
  register,
  login,
  logout
};
