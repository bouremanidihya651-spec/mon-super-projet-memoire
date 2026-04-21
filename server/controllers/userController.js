const { User, UserPreference } = require('../models');
const { hashPassword } = require('../utils/passwordUtils');
const path = require('path');
const fs = require('fs');

/**
 * Get current user profile
 */
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [{
        model: UserPreference,
        as: 'preference',
        attributes: ['luxury_score', 'nature_score', 'adventure_score', 'culture_score', 'beach_score', 'food_score', 'travelerType', 'minBudget', 'maxBudget']
      }]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Merge user data with preferences
    const userData = user.toJSON();
    if (userData.preference) {
      userData.luxury_score = userData.preference.luxury_score;
      userData.nature_score = userData.preference.nature_score;
      userData.adventure_score = userData.preference.adventure_score;
      userData.culture_score = userData.preference.culture_score;
      userData.beach_score = userData.preference.beach_score;
      userData.food_score = userData.preference.food_score;
      userData.travelerType = userData.preference.travelerType;
      userData.minBudget = userData.preference.minBudget;
      userData.maxBudget = userData.preference.maxBudget;
      delete userData.preference;
    }

    res.status(200).json(userData);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

/**
 * Upload user avatar
 */
const uploadAvatar = async (req, res) => {
  try {
    console.log('=== UPLOAD AVATAR ===');
    console.log('req.user.id:', req.user.id);
    console.log('req.file:', req.file);
    
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier fourni' });
    }

    // Le fichier est stocké dans uploads/avatars/ grâce à la config multer dans routes/users.js
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    console.log('avatarUrl to save:', avatarUrl);

    // Get current user
    const user = await User.findByPk(req.user.id);
    console.log('Current user:', user ? user.firstName : 'not found');
    
    // Delete old avatar if exists
    if (user && user.profilePhoto) {
      const oldPhotoPath = path.join(__dirname, '..', user.profilePhoto);
      console.log('Old photo path:', oldPhotoPath);
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
        console.log('Old photo deleted');
      }
    }

    // Update user profile with new avatar
    console.log('Updating user', req.user.id, 'with profilePhoto:', avatarUrl);
    const [updatedRowsCount] = await User.update(
      { profilePhoto: avatarUrl },
      { where: { id: req.user.id } }
    );
    console.log('Updated rows count:', updatedRowsCount);

    const updatedUser = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    console.log('Updated user profilePhoto:', updatedUser?.profilePhoto);

    res.status(200).json({
      message: 'Avatar uploadé avec succès',
      avatarUrl: `http://localhost:3000${avatarUrl}`,
      user: updatedUser
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ message: 'Erreur lors de l\'upload de l\'avatar', error: error.message });
  }
};

/**
 * Update user profile
 */
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, age, gender, budget, preferences } = req.body;

    // Check if email is being changed and if it's already taken
    if (email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser && existingUser.id !== req.user.id) {
        return res.status(400).json({ message: 'This email is already in use' });
      }
    }

    const updateData = {
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      email: email || undefined,
      age: age || undefined,
      gender: gender || undefined,
      budget: budget || undefined,
      preferences: preferences || undefined
    };

    // Handle profile photo upload
    if (req.file) {
      const profilePhotoPath = `/uploads/${req.file.filename}`;
      updateData.profilePhoto = profilePhotoPath;

      // Delete old profile photo if exists
      const user = await User.findByPk(req.user.id);
      if (user && user.profilePhoto) {
        const oldPhotoPath = path.join(__dirname, '..', user.profilePhoto);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }
    }

    const [updatedRowsCount] = await User.update(
      updateData,
      {
        where: { id: req.user.id }
      }
    );

    if (updatedRowsCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedUser = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

/**
 * Change user password
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get the current user
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash the new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update the password
    await User.update(
      { password: hashedNewPassword },
      { where: { id: req.user.id } }
    );

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

/**
 * Delete user account
 */
const deleteAccount = async (req, res) => {
  try {
    const deletedRows = await User.destroy({
      where: { id: req.user.id }
    });

    if (deletedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

/**
 * Update user preferences
 */
const updatePreferences = async (req, res) => {
  try {
    const {
      luxury_score,
      nature_score,
      adventure_score,
      culture_score,
      beach_score,
      food_score,
      travelerType,
      minBudget,
      maxBudget
    } = req.body;

    console.log('=== UPDATE PREFERENCES ===');
    console.log('User ID:', req.user.id);
    console.log('Preferences:', req.body);

    // Find or create user preferences
    let preference = await UserPreference.findOne({ where: { userId: req.user.id } });

    if (preference) {
      // Update existing preferences
      await preference.update({
        luxury_score: luxury_score !== undefined ? luxury_score : preference.luxury_score,
        nature_score: nature_score !== undefined ? nature_score : preference.nature_score,
        adventure_score: adventure_score !== undefined ? adventure_score : preference.adventure_score,
        culture_score: culture_score !== undefined ? culture_score : preference.culture_score,
        beach_score: beach_score !== undefined ? beach_score : preference.beach_score,
        food_score: food_score !== undefined ? food_score : preference.food_score,
        travelerType: travelerType !== undefined ? travelerType : preference.travelerType,
        minBudget: minBudget !== undefined ? minBudget : preference.minBudget,
        maxBudget: maxBudget !== undefined ? maxBudget : preference.maxBudget
      });
      console.log('Preferences updated');
    } else {
      // Create new preferences
      preference = await UserPreference.create({
        userId: req.user.id,
        luxury_score: luxury_score !== undefined ? luxury_score : 0.5,
        nature_score: nature_score !== undefined ? nature_score : 0.5,
        adventure_score: adventure_score !== undefined ? adventure_score : 0.5,
        culture_score: culture_score !== undefined ? culture_score : 0.5,
        beach_score: beach_score !== undefined ? beach_score : 0.5,
        food_score: food_score !== undefined ? food_score : 0.5,
        travelerType: travelerType !== undefined ? travelerType : 'solo',
        minBudget: minBudget !== undefined ? minBudget : 0,
        maxBudget: maxBudget !== undefined ? maxBudget : 10000
      });
      console.log('Preferences created');
    }

    res.status(200).json({
      message: 'Préférences mises à jour avec succès',
      preference
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour des préférences', error: error.message });
  }
};

module.exports = {
  getProfile,
  uploadAvatar,
  updateProfile,
  updatePreferences,
  changePassword,
  deleteAccount
};