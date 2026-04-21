const { User } = require('../models');

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const { page, limit, search, sortBy = 'id', sortOrder = 'ASC' } = req.query;

    const whereClause = {};
    if (search) {
      const { Op } = require('sequelize');
      whereClause[Op.or] = [
        { username: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // If no pagination params provided, return all users
    if (!page && !limit) {
      const users = await User.findAndCountAll({
        where: whereClause,
        order: [[sortBy, sortOrder.toUpperCase()]],
        attributes: { exclude: ['password'] }
      });

      return res.status(200).json({
        total: users.count,
        pages: 1,
        currentPage: 1,
        users: users.rows
      });
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder.toUpperCase()]],
      attributes: { exclude: ['password'] }
    });

    res.status(200).json({
      total: users.count,
      pages: Math.ceil(users.count / limit),
      currentPage: parseInt(page),
      users: users.rows
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get a single user
const getUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Delete a user (admin only)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedRows = await User.destroy({
      where: { id }
    });

    if (deletedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Block a user (admin only)
const blockUser = async (req, res) => {
  try {
    const { id } = req.params;

    const [updatedRowsCount] = await User.update(
      { isBlocked: true },
      { where: { id } }
    );

    if (updatedRowsCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    res.status(200).json({
      message: 'User blocked successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Unblock a user (admin only)
const unblockUser = async (req, res) => {
  try {
    const { id } = req.params;

    const [updatedRowsCount] = await User.update(
      { isBlocked: false },
      { where: { id } }
    );

    if (updatedRowsCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    res.status(200).json({
      message: 'User unblocked successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Unblock user error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUser,
  deleteUser,
  blockUser,
  unblockUser
};
