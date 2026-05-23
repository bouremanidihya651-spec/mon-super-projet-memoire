const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

// Get admin dashboard statistics
router.get('/stats', authenticateToken, authorizeAdmin, reservationController.getAdminStats);

// Get all reservations for a user
router.get('/user/:userId', authenticateToken, reservationController.getUserReservations);

// Get all reservations (admin)
router.get('/', authenticateToken, authorizeAdmin, reservationController.getAllReservations);

// Get single reservation
router.get('/:id', authenticateToken, reservationController.getReservation);

// Get invoice for a reservation
router.get('/:id/invoice', authenticateToken, reservationController.getReservationInvoice);

// Create new reservation (Flight)
router.post('/', authenticateToken, reservationController.createReservation);

// Create new reservation (Car Rental)
router.post('/car-rental', authenticateToken, reservationController.createCarRentalReservation);

// Create new reservation (Ground Transport)
router.post('/ground-transport', authenticateToken, reservationController.createGroundTransportReservation);

// Create new reservation (Hotel)
router.post('/hotel', authenticateToken, reservationController.createHotelReservation);

// Create new reservation (Activity)
router.post('/activity', authenticateToken, reservationController.createActivityReservation);

// Create invoice for a reservation
router.post('/create-invoice', authenticateToken, reservationController.createInvoice);

// Update reservation status (admin)
router.put('/:id/status', authenticateToken, authorizeAdmin, reservationController.updateReservationStatus);

// Cancel reservation
router.put('/:id/cancel', authenticateToken, reservationController.cancelReservation);

module.exports = router;
