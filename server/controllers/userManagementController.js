const { User, sequelize } = require('../models');

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

// Block a user (admin only) — uses raw SQL to bypass Sequelize model sync issues
const blockUser = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('[BLOCK USER] Request to block user id:', id);

    // Try a model update first (works if column exists with correct type)
    let result;
    try {
      result = await User.update(
        { isBlocked: true },
        { where: { id } }
      );
      console.log('[BLOCK USER] Sequelize update result:', result);
    } catch (modelErr) {
      console.warn('[BLOCK USER] Sequelize update failed, trying raw SQL:', modelErr.message);
      // Fallback: raw SQL that handles both BOOLEAN and INTEGER columns
      const dialect = sequelize.getDialect();
      if (dialect === 'postgres') {
        result = await sequelize.query(
          `UPDATE "Users" SET "isBlocked" = TRUE WHERE "id" = $1`,
          { bind: [id], type: sequelize.QueryTypes.UPDATE }
        );
      } else {
        result = await sequelize.query(
          `UPDATE Users SET isBlocked = 1 WHERE id = ?`,
          { bind: [id], type: sequelize.QueryTypes.UPDATE }
        );
      }
      console.log('[BLOCK USER] Raw SQL update result:', result);
    }

    // Verify the change was actually persisted
    const [verifyRows] = await sequelize.query(
      `SELECT id, "isBlocked" FROM "Users" WHERE id = $1`,
      { bind: [id], type: sequelize.QueryTypes.SELECT }
    ).catch(async () => {
      // SQLite fallback (no $-style params, different table quoting)
      return await sequelize.query(
        `SELECT id, isBlocked FROM Users WHERE id = ?`,
        { bind: [id], type: sequelize.QueryTypes.SELECT }
      );
    });

    const verify = Array.isArray(verifyRows) ? verifyRows[0] : verifyRows;
    console.log('[BLOCK USER] Verify after update:', verify);

    if (!verify) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    res.status(200).json({
      message: 'User blocked successfully',
      user: updatedUser,
      verified: verify
    });
  } catch (error) {
    console.error('[BLOCK USER] Error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Unblock a user (admin only) — uses raw SQL to bypass Sequelize model sync issues
const unblockUser = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('[UNBLOCK USER] Request to unblock user id:', id);

    let result;
    try {
      result = await User.update(
        { isBlocked: false },
        { where: { id } }
      );
    } catch (modelErr) {
      console.warn('[UNBLOCK USER] Sequelize update failed, trying raw SQL:', modelErr.message);
      const dialect = sequelize.getDialect();
      if (dialect === 'postgres') {
        result = await sequelize.query(
          `UPDATE "Users" SET "isBlocked" = FALSE WHERE "id" = $1`,
          { bind: [id], type: sequelize.QueryTypes.UPDATE }
        );
      } else {
        result = await sequelize.query(
          `UPDATE Users SET isBlocked = 0 WHERE id = ?`,
          { bind: [id], type: sequelize.QueryTypes.UPDATE }
        );
      }
    }

    const [verifyRows] = await sequelize.query(
      `SELECT id, "isBlocked" FROM "Users" WHERE id = $1`,
      { bind: [id], type: sequelize.QueryTypes.SELECT }
    ).catch(async () => {
      return await sequelize.query(
        `SELECT id, isBlocked FROM Users WHERE id = ?`,
        { bind: [id], type: sequelize.QueryTypes.SELECT }
      );
    });

    const verify = Array.isArray(verifyRows) ? verifyRows[0] : verifyRows;
    console.log('[UNBLOCK USER] Verify after update:', verify);

    if (!verify) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    res.status(200).json({
      message: 'User unblocked successfully',
      user: updatedUser,
      verified: verify
    });
  } catch (error) {
    console.error('[UNBLOCK USER] Error:', error);
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
