const { Publication, User } = require('../models');

/**
 * Get all publications
 */
const getAllPublications = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category, featured } = req.query;
    
    const offset = (page - 1) * limit;
    
    const whereClause = {};
    if (status) whereClause.status = status;
    if (category) whereClause.category = category;
    if (featured !== undefined) whereClause.featured = featured === 'true';
    
    const publications = await Publication.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      total: publications.count,
      pages: Math.ceil(publications.count / limit),
      currentPage: parseInt(page),
      publications: publications.rows
    });
  } catch (error) {
    console.error('Get publications error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

/**
 * Get a single publication by ID
 */
const getPublicationById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const publication = await Publication.findByPk(id);
    
    if (!publication) {
      return res.status(404).json({ message: 'Publication not found' });
    }
    
    res.status(200).json(publication);
  } catch (error) {
    console.error('Get publication error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

/**
 * Create a new publication (admin only)
 */
const createPublication = async (req, res) => {
  try {
    const { title, content, author, category, featured, imageUrl, status } = req.body;
    
    const publication = await Publication.create({
      title,
      content,
      author: author || req.user.username, // Default to logged in user's username
      category,
      featured: featured || false,
      imageUrl,
      status: status || 'draft'
    });
    
    res.status(201).json({
      message: 'Publication created successfully',
      publication
    });
  } catch (error) {
    console.error('Create publication error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

/**
 * Update a publication (admin only)
 */
const updatePublication = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, author, category, featured, imageUrl, status } = req.body;
    
    const [updatedRowsCount] = await Publication.update(
      {
        title,
        content,
        author,
        category,
        featured,
        imageUrl,
        status
      },
      {
        where: { id }
      }
    );
    
    if (updatedRowsCount === 0) {
      return res.status(404).json({ message: 'Publication not found' });
    }
    
    const updatedPublication = await Publication.findByPk(id);
    
    res.status(200).json({
      message: 'Publication updated successfully',
      publication: updatedPublication
    });
  } catch (error) {
    console.error('Update publication error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

/**
 * Delete a publication (admin only)
 */
const deletePublication = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedRows = await Publication.destroy({
      where: { id }
    });
    
    if (deletedRows === 0) {
      return res.status(404).json({ message: 'Publication not found' });
    }
    
    res.status(200).json({ message: 'Publication deleted successfully' });
  } catch (error) {
    console.error('Delete publication error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

/**
 * Get featured publications
 */
const getFeaturedPublications = async (req, res) => {
  try {
    const publications = await Publication.findAll({
      where: { featured: true, status: 'published' },
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    
    res.status(200).json(publications);
  } catch (error) {
    console.error('Get featured publications error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

module.exports = {
  getAllPublications,
  getPublicationById,
  createPublication,
  updatePublication,
  deletePublication,
  getFeaturedPublications
};