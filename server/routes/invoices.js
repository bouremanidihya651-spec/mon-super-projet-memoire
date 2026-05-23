const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { authenticateToken } = require('../middleware/auth');

// Get all invoices for authenticated user
router.get('/', authenticateToken, reservationController.getUserInvoices);

// Get single invoice
router.get('/:id', authenticateToken, reservationController.getInvoice);

// Create invoice (called after reservation)
router.post('/', authenticateToken, reservationController.createInvoice);

module.exports = router;
