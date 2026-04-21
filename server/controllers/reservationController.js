const { Reservation, Transport, User, Invoice, Hotel, Activity, Review, Destination, Favorite, sequelize } = require('../models');
const crypto = require('crypto');
const { Op } = require('sequelize');

// Helper function to get time ago in French
const getTimeAgo = (date) => {
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSec < 60) {
    return 'Il y a quelques secondes';
  } else if (diffMin < 60) {
    return diffMin === 1 ? 'Il y a 1 minute' : `Il y a ${diffMin} minutes`;
  } else if (diffHours < 24) {
    return diffHours === 1 ? 'Il y a 1 heure' : `Il y a ${diffHours} heures`;
  } else if (diffDays < 7) {
    return diffDays === 1 ? 'Il y a 1 jour' : `Il y a ${diffDays} jours`;
  } else {
    return date.toLocaleDateString('fr-FR');
  }
};

// Generate unique confirmation number
const generateConfirmationNumber = () => {
  return 'TRV' + crypto.randomBytes(6).toString('hex').toUpperCase();
};

// Generate invoice number
const generateInvoiceNumber = async () => {
  const lastInvoice = await Invoice.findOne({ order: [['id', 'DESC']] });
  const nextNum = lastInvoice ? parseInt(lastInvoice.invoice_number.replace('INV-', '')) + 1 : 1;
  return `INV-${nextNum.toString().padStart(6, '0')}`;
};

/**
 * Generate invoice details based on reservation type
 * @param {string} type - Reservation type: 'flight', 'ground_transport', 'car_rental', 'hotel', 'activity'
 * @param {object} data - Reservation data
 * @returns {object} - Invoice details object
 */
const generateInvoiceDetails = (type, data) => {
  const baseDetails = {
    reservationType: type,
    createdAt: new Date().toISOString()
  };

  switch (type) {
    case 'flight':
      return {
        ...baseDetails,
        typeLabel: 'Réservation de Vol',
        flightNumber: data.transport.flight_number || 'N/A',
        airline: data.transport.company || 'N/A',
        route: `${data.transport.departure_city || 'Départ'} → ${data.transport.arrival_city || 'Arrivée'}`,
        departureAirport: `${data.transport.departure_airport || 'Aéroport de départ'}`,
        arrivalAirport: `${data.transport.arrival_airport || 'Aéroport d\'arrivée'}`,
        departureDate: data.departure_date,
        departureTime: data.transport.departure_time || 'N/A',
        arrivalDate: data.return_date || data.departure_date,
        arrivalTime: data.transport.arrival_time || 'N/A',
        tripType: data.trip_type === 'round_trip' ? 'Aller-Retour' : 'Aller Simple',
        passengers: {
          adults: data.adults,
          children: data.children || 0,
          infants: data.infants || 0
        },
        unitPrice: data.unit_price,
        duration: data.transport.duration || 'N/A'
      };

    case 'ground_transport':
      return {
        ...baseDetails,
        typeLabel: 'Réservation de Transport Terrestre',
        transportName: data.transport.name,
        transportType: data.transport.type || 'Transport terrestre',
        company: data.transport.company || 'N/A',
        route: `${data.transport.departure_city || 'Départ'} → ${data.transport.arrival_city || 'Arrivée'}`,
        travelDate: data.departure_date,
        travelTime: data.pickup_time || 'N/A',
        passengers: {
          adults: data.adults,
          children: data.children || 0
        },
        unitPrice: data.unit_price
      };

    case 'car_rental':
      return {
        ...baseDetails,
        typeLabel: 'Location de Voiture',
        carModel: data.transport.car_model || 'N/A',
        rentalAgency: data.transport.rental_agency || 'N/A',
        category: data.transport.category || 'N/A',
        pickupLocation: data.transport.pickup_location || 'N/A',
        pickupDate: data.departure_date,
        pickupTime: data.pickup_time || 'N/A',
        returnDate: data.return_date,
        returnTime: data.return_time || 'N/A',
        rentalDays: data.rental_days,
        deposit: data.transport.deposit || 'N/A',
        driver: data.driver_details ? {
          firstName: data.driver_details.firstName,
          lastName: data.driver_details.lastName,
          email: data.driver_details.email,
          phone: data.driver_details.phone
        } : {},
        unitPrice: data.unit_price
      };

    case 'hotel':
      return {
        ...baseDetails,
        typeLabel: 'Réservation d\'Hôtel',
        hotelName: data.hotel.name,
        stars: data.hotel.stars ? '★'.repeat(data.hotel.stars) : 'N/A',
        starsNumber: data.hotel.stars || 0,
        location: data.hotel.location || data.hotel.city || 'N/A',
        checkInDate: data.departure_date,
        checkOutDate: data.return_date,
        numberOfNights: data.number_of_nights,
        guests: {
          adults: data.adults,
          children: data.children || 0
        },
        amenities: data.hotel.amenities ? JSON.parse(data.hotel.amenities) : [],
        unitPrice: data.unit_price
      };

    case 'activity':
      return {
        ...baseDetails,
        typeLabel: 'Réservation d\'Activité',
        activityName: data.activity.name,
        activityType: data.activity.category || 'Activité',
        location: data.activity.location || data.activity.city || 'N/A',
        activityDate: data.departure_date,
        activityTime: data.pickup_time || 'N/A',
        duration: data.activity.duration || 'N/A',
        participants: {
          adults: data.adults,
          children: data.children || 0
        },
        highlights: data.activity.highlights ? JSON.parse(data.activity.highlights) : [],
        unitPrice: data.unit_price
      };

    default:
      return {
        ...baseDetails,
        typeLabel: 'Réservation',
        description: 'Détails de la réservation',
        unitPrice: data.unit_price
      };
  }
};

// Get all reservations for a user
const getUserReservations = async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.user.role !== 'admin' && req.user.id !== parseInt(userId)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const reservations = await Reservation.findAll({
      where: { user_id: userId },
      include: [{
        model: Transport,
        as: 'transport',
        attributes: ['id', 'name', 'category', 'type', 'image_url', 'company', 'flight_number', 
                     'departure_airport', 'arrival_airport', 'departure_city', 'arrival_city']
      }],
      order: [['created_at', 'DESC']]
    });
    res.status(200).json({ success: true, count: reservations.length, reservations });
  } catch (error) {
    console.error('Get user reservations error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get all reservations (admin)
const getAllReservations = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const whereClause = status ? { status } : {};
    const reservations = await Reservation.findAndCountAll({
      where: whereClause,
      include: [{
        model: User, as: 'user', attributes: ['id', 'username', 'email', 'firstName', 'lastName']
      }, {
        model: Transport, as: 'transport',
        attributes: ['id', 'name', 'category', 'type', 'price', 'image_url', 'company',
                     'departure_airport', 'arrival_airport', 'departure_city', 'arrival_city']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });
    res.status(200).json({
      success: true, total: reservations.count,
      pages: Math.ceil(reservations.count / limit),
      currentPage: parseInt(page), reservations: reservations.rows
    });
  } catch (error) {
    console.error('Get all reservations error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get single reservation
const getReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const reservation = await Reservation.findByPk(id, {
      include: [{
        model: Transport, as: 'transport',
        attributes: ['id', 'name', 'category', 'type', 'price', 'image_url', 'company', 
                     'departure_airport', 'arrival_airport', 'departure_city', 'arrival_city']
      }]
    });
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
    if (req.user.role !== 'admin' && reservation.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    res.status(200).json(reservation);
  } catch (error) {
    console.error('Get reservation error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Create new reservation
const createReservation = async (req, res) => {
  try {
    const { transport_id, trip_type, departure_date, return_date, adults, children, infants, travelers_details, payment_method, notes } = req.body;
    if (!transport_id || !trip_type || !departure_date || !adults || !travelers_details) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const transport = await Transport.findByPk(transport_id);
    if (!transport) return res.status(404).json({ message: 'Transport not found' });
    if (!transport.is_available) return res.status(400).json({ message: 'Transport is not available' });
    const totalTravelers = adults + children + infants;
    const unitPrice = parseFloat(transport.price);
    const totalPrice = unitPrice * totalTravelers;
    const reservation = await Reservation.create({
      user_id: req.user.id, transport_id, trip_type, departure_date,
      return_date: trip_type === 'round_trip' ? return_date : null,
      adults, children, infants, travelers_details,
      unit_price: unitPrice, total_price: totalPrice,
      payment_method: payment_method || 'on_arrival',
      payment_status: payment_method === 'on_arrival' ? 'pending' : 'pending',
      status: 'pending', confirmation_number: generateConfirmationNumber(), notes
    });
    
    // Create invoice automatically for the reservation
    const traveler = travelers_details[0];
    const invoiceDetails = {
      destination: transport.name,
      transportName: transport.name,
      route: `${transport.departure_city || 'Départ'} → ${transport.arrival_city || 'Arrivée'}`,
      departureDate: departure_date,
      returnDate: return_date,
      tripType: trip_type,
      adults, children, infants,
      unitPrice: unitPrice.toFixed(2)
    };
    
    const invoiceNumber = await generateInvoiceNumber();
    await Invoice.create({
      invoice_number: invoiceNumber,
      user_id: req.user.id,
      reservation_id: reservation.id,
      invoice_date: new Date(),
      amount: totalPrice,
      currency: 'EUR',
      payment_method: payment_method || 'on_arrival',
      payment_status: 'pending',
      customer_name: traveler ? `${traveler.firstName || ''} ${traveler.lastName || ''}`.trim() : 'Client',
      customer_email: traveler?.email || req.user?.email || '',
      customer_phone: traveler?.phone || '',
      invoice_details: invoiceDetails,
      notes: notes || null
    });
    
    const populatedReservation = await Reservation.findByPk(reservation.id, {
      include: [{ model: Transport, as: 'transport',
        attributes: ['id', 'name', 'category', 'type', 'price', 'image_url', 'company',
                     'departure_airport', 'arrival_airport', 'departure_city', 'arrival_city']
      }]
    });
    res.status(201).json({ success: true, message: 'Reservation created successfully', reservation: populatedReservation });
  } catch (error) {
    console.error('Create reservation error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
// Create invoice for a reservation
const createInvoice = async (req, res) => {
  try {
    const { reservation_id, amount, currency, payment_method, payment_status, customer_name, customer_email, customer_phone, invoice_details, notes } = req.body;
    const reservation = await Reservation.findByPk(reservation_id);
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
    if (reservation.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const invoiceNumber = await generateInvoiceNumber();
    const invoice = await Invoice.create({
      invoice_number: invoiceNumber, user_id: req.user.id, reservation_id,
      amount, currency: currency || 'EUR', payment_method, payment_status,
      customer_name, customer_email, customer_phone, invoice_details, notes
    });
    res.status(201).json({ success: true, message: 'Invoice created successfully', invoice });
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get user invoices
const getUserInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.findAll({
      where: { user_id: req.user.id },
      include: [{
        model: Reservation, as: 'reservation',
        include: [{ model: Transport, as: 'transport', attributes: ['id', 'name', 'category', 'type', 'image_url'] }]
      }],
      order: [['created_at', 'DESC']]
    });
    res.status(200).json({ success: true, count: invoices.length, invoices });
  } catch (error) {
    console.error('Get user invoices error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get invoice for a reservation
const getReservationInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const reservation = await Reservation.findByPk(id, {
      include: [
        { model: Transport, as: 'transport', attributes: ['id', 'name', 'category', 'type', 'image_url', 'company', 'departure_airport', 'arrival_airport', 'departure_city', 'arrival_city', 'flight_number', 'departure_time', 'arrival_time', 'duration', 'car_model', 'rental_agency', 'pickup_location', 'deposit'] },
        { model: Hotel, as: 'hotel', attributes: ['id', 'name', 'stars', 'location', 'city', 'price', 'image_url', 'tags'] },
        { model: Activity, as: 'activity', attributes: ['id', 'name', 'category', 'location', 'city', 'price', 'image_url', 'duration', 'tags'] }
      ]
    });
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
    if (req.user.role !== 'admin' && reservation.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const invoice = await Invoice.findOne({
      where: { reservation_id: id }
    });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    
    // Generate proper invoice details based on reservation type
    let invoiceDetails = invoice.invoice_details;
    const reservationType = reservation.trip_type;
    
    // Re-generate invoice details with full data if needed
    if (reservationType === 'hotel' && reservation.hotel) {
      const checkIn = new Date(reservation.departure_date);
      const checkOut = new Date(reservation.return_date);
      const numberOfNights = Math.max(1, Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)));
      invoiceDetails = generateInvoiceDetails('hotel', {
        hotel: {
          name: reservation.hotel.name,
          stars: reservation.hotel.stars,
          location: reservation.hotel.location,
          city: reservation.hotel.city,
          amenities: reservation.hotel.tags
        },
        departure_date: reservation.departure_date,
        return_date: reservation.return_date,
        number_of_nights: numberOfNights,
        adults: reservation.adults,
        children: reservation.children || 0,
        unit_price: reservation.unit_price
      });
    } else if (reservationType === 'activity' && reservation.activity) {
      invoiceDetails = generateInvoiceDetails('activity', {
        activity: {
          name: reservation.activity.name,
          category: reservation.activity.category,
          location: reservation.activity.location,
          city: reservation.activity.city,
          duration: reservation.activity.duration,
          highlights: reservation.activity.tags
        },
        departure_date: reservation.departure_date,
        pickup_time: reservation.pickup_time,
        adults: reservation.adults,
        children: reservation.children || 0,
        unit_price: reservation.unit_price
      });
    } else if (reservationType === 'car_rental' && reservation.transport) {
      const pickup = new Date(reservation.departure_date);
      const returnD = new Date(reservation.return_date);
      const rentalDays = Math.max(1, Math.ceil((returnD - pickup) / (1000 * 60 * 60 * 24))) + 1;
      invoiceDetails = generateInvoiceDetails('car_rental', {
        transport: {
          car_model: reservation.transport.car_model,
          rental_agency: reservation.transport.rental_agency,
          category: reservation.transport.category,
          pickup_location: reservation.transport.pickup_location,
          deposit: reservation.transport.deposit
        },
        departure_date: reservation.departure_date,
        return_date: reservation.return_date,
        pickup_time: reservation.pickup_time,
        return_time: reservation.return_time,
        rental_days: rentalDays,
        driver_details: reservation.travelers_details ? reservation.travelers_details[0] : {},
        unit_price: reservation.unit_price
      });
    } else if (reservationType === 'ground_transport' && reservation.transport) {
      invoiceDetails = generateInvoiceDetails('ground_transport', {
        transport: {
          name: reservation.transport.name,
          type: reservation.transport.type,
          company: reservation.transport.company,
          departure_city: reservation.transport.departure_city,
          arrival_city: reservation.transport.arrival_city
        },
        departure_date: reservation.departure_date,
        pickup_time: reservation.pickup_time,
        adults: reservation.adults,
        children: reservation.children || 0,
        unit_price: reservation.unit_price
      });
    } else if (reservation.transport) {
      invoiceDetails = generateInvoiceDetails('flight', {
        transport: {
          flight_number: reservation.transport.flight_number,
          company: reservation.transport.company,
          departure_city: reservation.transport.departure_city,
          arrival_city: reservation.transport.arrival_city,
          departure_airport: reservation.transport.departure_airport,
          arrival_airport: reservation.transport.arrival_airport,
          departure_time: reservation.transport.departure_time,
          arrival_time: reservation.transport.arrival_time,
          duration: reservation.transport.duration
        },
        trip_type: reservation.trip_type,
        departure_date: reservation.departure_date,
        return_date: reservation.return_date,
        adults: reservation.adults,
        children: reservation.children || 0,
        infants: reservation.infants || 0,
        unit_price: reservation.unit_price
      });
    }
    
    res.status(200).json({ 
      success: true, 
      invoice: {
        ...invoice.toJSON(),
        invoice_details: invoiceDetails,
        reservation: {
          ...reservation.toJSON(),
          trip_type: reservationType
        }
      }
    });
  } catch (error) {
    console.error('Get reservation invoice error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get single invoice
const getInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findByPk(id, {
      include: [{
        model: Reservation, as: 'reservation',
        include: [{ model: Transport, as: 'transport',
          attributes: ['id', 'name', 'category', 'type', 'image_url', 'company', 'departure_airport', 'arrival_airport']
        }]
      }]
    });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    if (invoice.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    res.status(200).json(invoice);
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Update reservation status (admin)
const updateReservationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) return res.status(400).json({ message: 'Invalid status' });
    const [updatedRows] = await Reservation.update({ status }, { where: { id } });
    if (updatedRows === 0) return res.status(404).json({ message: 'Reservation not found' });
    const updatedReservation = await Reservation.findByPk(id);
    res.status(200).json({ success: true, message: 'Reservation status updated successfully', reservation: updatedReservation });
  } catch (error) {
    console.error('Update reservation status error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Cancel reservation
const cancelReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const reservation = await Reservation.findByPk(id);
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
    if (req.user.role !== 'admin' && reservation.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    if (reservation.status === 'completed' || reservation.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot cancel this reservation' });
    }
    await reservation.update({ status: 'cancelled' });
    res.status(200).json({ success: true, message: 'Reservation cancelled successfully', reservation });
  } catch (error) {
    console.error('Cancel reservation error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Create Car Rental Reservation
const createCarRentalReservation = async (req, res) => {
  try {
    const { transport_id, pickup_date, return_date, pickup_time, return_time, driver_details, payment_method, notes } = req.body;
    if (!transport_id || !pickup_date || !return_date || !driver_details) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const transport = await Transport.findByPk(transport_id);
    if (!transport) return res.status(404).json({ message: 'Transport not found' });
    if (!transport.is_available) return res.status(400).json({ message: 'Transport is not available' });
    
    // Calculate rental days
    const pickup = new Date(pickup_date);
    const returnD = new Date(return_date);
    const rentalDays = Math.max(1, Math.ceil((returnD - pickup) / (1000 * 60 * 60 * 24))) + 1;
    
    const unitPrice = parseFloat(transport.price);
    const totalPrice = unitPrice * rentalDays;
    const reservation = await Reservation.create({
      user_id: req.user.id, transport_id, 
      trip_type: 'car_rental',
      departure_date: pickup_date,
      return_date: return_date,
      pickup_time: pickup_time || '10:00',
      return_time: return_time || '10:00',
      adults: 1, children: 0, infants: 0,
      travelers_details: [driver_details],
      unit_price: unitPrice, total_price: totalPrice,
      payment_method: payment_method || 'on_arrival',
      payment_status: payment_method === 'on_arrival' ? 'pending' : 'pending',
      status: 'pending', confirmation_number: generateConfirmationNumber(), notes
    });

    // Create invoice automatically
    const invoiceDetails = {
      destination: transport.destination?.name || '',
      transportName: transport.name,
      carModel: transport.car_model || '',
      rentalAgency: transport.rental_agency || '',
      pickupLocation: transport.pickup_location || '',
      pickupDate: pickup_date,
      returnDate: return_date,
      rentalDays: rentalDays,
      unitPrice: unitPrice.toFixed(2)
    };

    const invoiceNumber = await generateInvoiceNumber();
    await Invoice.create({
      invoice_number: invoiceNumber,
      user_id: req.user.id,
      reservation_id: reservation.id,
      invoice_date: new Date(),
      amount: totalPrice,
      currency: 'EUR',
      payment_method: payment_method || 'on_arrival',
      payment_status: 'pending',
      customer_name: `${driver_details.firstName || ''} ${driver_details.lastName || ''}`.trim(),
      customer_email: driver_details.email || req.user?.email || '',
      customer_phone: driver_details.phone || '',
      invoice_details: invoiceDetails,
      notes: notes || null
    });

    const populatedReservation = await Reservation.findByPk(reservation.id, {
      include: [{ model: Transport, as: 'transport',
        attributes: ['id', 'name', 'category', 'type', 'price', 'image_url', 'company', 'car_model', 'rental_agency']
      }]
    });
    res.status(201).json({ success: true, message: 'Car rental reservation created successfully', reservation: populatedReservation });
  } catch (error) {
    console.error('Create car rental reservation error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Create Ground Transport Reservation
const createGroundTransportReservation = async (req, res) => {
  try {
    const { transport_id, travel_date, travel_time, adults, children, passenger_details, payment_method, notes } = req.body;
    if (!transport_id || !travel_date || !adults || !passenger_details) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const transport = await Transport.findByPk(transport_id);
    if (!transport) return res.status(404).json({ message: 'Transport not found' });
    if (!transport.is_available) return res.status(400).json({ message: 'Transport is not available' });
    
    const totalPassengers = adults + (children || 0);
    const unitPrice = parseFloat(transport.price);
    const totalPrice = unitPrice * totalPassengers;
    
    const reservation = await Reservation.create({
      user_id: req.user.id, transport_id,
      trip_type: 'ground_transport',
      departure_date: travel_date,
      return_date: null,
      pickup_time: travel_time || '08:00',
      adults, children: children || 0, infants: 0,
      travelers_details: [passenger_details],
      unit_price: unitPrice, total_price: totalPrice,
      payment_method: payment_method || 'on_arrival',
      payment_status: payment_method === 'on_arrival' ? 'pending' : 'pending',
      status: 'pending', confirmation_number: generateConfirmationNumber(), notes
    });

    // Create invoice automatically
    const invoiceDetails = {
      destination: transport.destination?.name || '',
      transportName: transport.name,
      transportType: transport.type || 'Transport terrestre',
      route: `${transport.departure_city || 'Départ'} → ${transport.arrival_city || 'Arrivée'}`,
      travelDate: travel_date,
      travelTime: travel_time,
      adults,
      children: children || 0,
      unitPrice: unitPrice.toFixed(2)
    };

    const invoiceNumber = await generateInvoiceNumber();
    await Invoice.create({
      invoice_number: invoiceNumber,
      user_id: req.user.id,
      reservation_id: reservation.id,
      invoice_date: new Date(),
      amount: totalPrice,
      currency: 'EUR',
      payment_method: payment_method || 'on_arrival',
      payment_status: 'pending',
      customer_name: `${passenger_details.firstName || ''} ${passenger_details.lastName || ''}`.trim(),
      customer_email: passenger_details.email || req.user?.email || '',
      customer_phone: passenger_details.phone || '',
      invoice_details: invoiceDetails,
      notes: notes || null
    });

    const populatedReservation = await Reservation.findByPk(reservation.id, {
      include: [{ model: Transport, as: 'transport',
        attributes: ['id', 'name', 'category', 'type', 'price', 'image_url', 'company', 'departure_city', 'arrival_city']
      }]
    });
    res.status(201).json({ success: true, message: 'Ground transport reservation created successfully', reservation: populatedReservation });
  } catch (error) {
    console.error('Create ground transport reservation error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Create Hotel Reservation
const createHotelReservation = async (req, res) => {
  try {
    console.log('=== CREATE HOTEL RESERVATION ===');
    console.log('Request body:', req.body);
    console.log('User:', req.user);
    
    const { hotel_id, check_in_date, check_out_date, adults, children, guest_details, payment_method, notes } = req.body;
    if (!hotel_id || !check_in_date || !check_out_date || !adults || !guest_details) {
      console.log('Missing required fields:', { hotel_id, check_in_date, check_out_date, adults, guest_details });
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const hotel = await Hotel.findByPk(hotel_id);
    if (!hotel) {
      console.log('Hotel not found:', hotel_id);
      return res.status(404).json({ message: 'Hotel not found' });
    }

    // Calculate number of nights
    const checkIn = new Date(check_in_date);
    const checkOut = new Date(check_out_date);
    const numberOfNights = Math.max(1, Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)));

    const unitPrice = parseFloat(hotel.price);
    const totalPrice = unitPrice * numberOfNights;

    console.log('Creating reservation with:', {
      user_id: req.user.id,
      hotel_id,
      trip_type: 'hotel',
      payment_method,
      totalPrice
    });

    const reservation = await Reservation.create({
      user_id: req.user.id,
      transport_id: null,
      hotel_id: hotel_id,
      activity_id: null,
      trip_type: 'hotel',
      departure_date: check_in_date,
      return_date: check_out_date,
      adults,
      children: children || 0,
      infants: 0,
      travelers_details: guest_details,
      unit_price: unitPrice,
      total_price: totalPrice,
      payment_method: payment_method || 'on_arrival',
      payment_status: 'pending',
      status: 'pending',
      confirmation_number: generateConfirmationNumber(),
      notes
    });

    console.log('Reservation created:', reservation.id);

    // Create invoice automatically with specific hotel details
    const invoiceDetails = generateInvoiceDetails('hotel', {
      hotel: {
        name: hotel.name,
        stars: hotel.stars,
        location: hotel.location,
        city: hotel.city,
        amenities: hotel.tags
      },
      departure_date: check_in_date,
      return_date: check_out_date,
      number_of_nights: numberOfNights,
      adults,
      children: children || 0,
      unit_price: unitPrice.toFixed(2)
    });

    const invoiceNumber = await generateInvoiceNumber();
    await Invoice.create({
      invoice_number: invoiceNumber,
      user_id: req.user.id,
      reservation_id: reservation.id,
      invoice_date: new Date(),
      amount: totalPrice,
      currency: 'EUR',
      payment_method: payment_method || 'on_arrival',
      payment_status: 'pending',
      customer_name: `${guest_details.firstName || ''} ${guest_details.lastName || ''}`.trim(),
      customer_email: guest_details.email || req.user?.email || '',
      customer_phone: guest_details.phone || '',
      invoice_details: invoiceDetails,
      notes: notes || null
    });

    console.log('Invoice created for reservation:', reservation.id);

    res.status(201).json({ 
      success: true, 
      message: 'Hotel reservation created successfully', 
      reservation: {
        ...reservation.toJSON(),
        hotel: {
          id: hotel.id,
          name: hotel.name,
          stars: hotel.stars,
          price: hotel.price,
          image_url: hotel.image_url,
          location: hotel.location
        }
      }
    });
  } catch (error) {
    console.error('=== CREATE HOTEL RESERVATION ERROR ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Create Activity Reservation
const createActivityReservation = async (req, res) => {
  try {
    const { activity_id, activity_date, activity_time, adults, children, participant_details, payment_method, notes } = req.body;
    if (!activity_id || !activity_date || !adults || !participant_details) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const activity = await Activity.findByPk(activity_id);
    if (!activity) return res.status(404).json({ message: 'Activity not found' });

    const totalParticipants = adults + (children || 0);
    const unitPrice = parseFloat(activity.price);
    const totalPrice = unitPrice * totalParticipants;

    const reservation = await Reservation.create({
      user_id: req.user.id,
      transport_id: null,
      hotel_id: null,
      activity_id: activity_id,
      trip_type: 'activity',
      departure_date: activity_date,
      return_date: null,
      pickup_time: activity_time || '09:00',
      adults,
      children: children || 0,
      infants: 0,
      travelers_details: participant_details,
      unit_price: unitPrice,
      total_price: totalPrice,
      payment_method: payment_method || 'on_arrival',
      payment_status: 'pending',
      status: 'pending',
      confirmation_number: generateConfirmationNumber(),
      notes
    });

    // Create invoice automatically with specific activity details
    const invoiceDetails = generateInvoiceDetails('activity', {
      activity: {
        name: activity.name,
        category: activity.category,
        location: activity.location,
        city: activity.city,
        duration: activity.duration,
        highlights: activity.tags
      },
      departure_date: activity_date,
      pickup_time: activity_time || '09:00',
      adults,
      children: children || 0,
      unit_price: unitPrice.toFixed(2)
    });

    const invoiceNumber = await generateInvoiceNumber();
    await Invoice.create({
      invoice_number: invoiceNumber,
      user_id: req.user.id,
      reservation_id: reservation.id,
      invoice_date: new Date(),
      amount: totalPrice,
      currency: 'EUR',
      payment_method: payment_method || 'on_arrival',
      payment_status: 'pending',
      customer_name: `${participant_details.firstName || ''} ${participant_details.lastName || ''}`.trim(),
      customer_email: participant_details.email || req.user?.email || '',
      customer_phone: participant_details.phone || '',
      invoice_details: invoiceDetails,
      notes: notes || null
    });

    res.status(201).json({ 
      success: true, 
      message: 'Activity reservation created successfully',
      reservation: {
        ...reservation.toJSON(),
        activity: {
          id: activity.id,
          name: activity.name,
          price: activity.price,
          image_url: activity.image_url,
          duration: activity.duration,
          location: activity.location
        }
      }
    });
  } catch (error) {
    console.error('Create activity reservation error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get admin dashboard statistics
const getAdminStats = async (req, res) => {
  try {
    console.log('Fetching admin stats...');
    
    // Get ALL reservations from the database
    const allReservations = await Reservation.findAll({
      attributes: ['id', 'created_at'],
      raw: true
    });

    console.log(`Total reservations found: ${allReservations.length}`);

    // Group reservations by date (last 7 days)
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    console.log('Date range (last 7 days):', sevenDaysAgo, 'to', now);

    // Filter reservations within last 7 days
    const recentReservations = allReservations.filter(r => {
      const createdAt = new Date(r.created_at);
      return createdAt >= sevenDaysAgo && createdAt <= now;
    });

    console.log(`Reservations in last 7 days: ${recentReservations.length}`);

    // Generate labels and data arrays for the last 7 days
    const visitsData = [0, 0, 0, 0, 0, 0, 0];
    const visitsLabels = [];
    
    // Count reservations per day
    recentReservations.forEach(r => {
      const createdAt = new Date(r.created_at);
      const daysDiff = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
      
      if (daysDiff >= 0 && daysDiff < 7) {
        visitsData[6 - daysDiff]++;
      }
    });
    
    // Generate labels
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = date.toLocaleDateString('fr-FR', { weekday: 'short' });
      visitsLabels.push(dayName.charAt(0).toUpperCase() + dayName.slice(1));
    }
    
    console.log('Visits data array:', visitsData);
    console.log('Visits labels array:', visitsLabels);

    // Get popular destinations from reviews
    let popularDestinationsData = [];
    
    try {
      const allReviews = await Review.findAll({
        attributes: ['targetId'],
        where: { targetType: 'destination' },
        raw: true
      });

      console.log(`Total reviews for destinations: ${allReviews.length}`);

      if (allReviews.length === 0) {
        console.log('No reviews found, fetching destinations');
        const allDestinations = await Destination.findAll({
          attributes: ['id', 'name', 'city', 'country'],
          limit: 5
        });
        
        popularDestinationsData = allDestinations.map(dest => ({
          name: `${dest.name} - ${dest.city}, ${dest.country}`,
          count: 0
        }));
      } else {
        // Count reviews per destination
        const reviewCounts = {};
        allReviews.forEach(review => {
          reviewCounts[review.targetId] = (reviewCounts[review.targetId] || 0) + 1;
        });

        // Sort by count and get top 5
        const sortedReviews = Object.entries(reviewCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);

        // Get destination details
        for (const [targetId, count] of sortedReviews) {
          const dest = await Destination.findByPk(parseInt(targetId), {
            attributes: ['id', 'name', 'city', 'country']
          });
          if (dest) {
            popularDestinationsData.push({
              name: `${dest.name} - ${dest.city}, ${dest.country}`,
              count: count
            });
          }
        }
      }
    } catch (reviewError) {
      console.error('Error fetching reviews:', reviewError);
      // Fallback to just showing destinations
      const allDestinations = await Destination.findAll({
        attributes: ['id', 'name', 'city', 'country'],
        limit: 5
      });
      
      popularDestinationsData = allDestinations.map(dest => ({
        name: `${dest.name} - ${dest.city}, ${dest.country}`,
        count: 0
      }));
    }

    console.log('Final popular destinations:', popularDestinationsData);

    // Get recent activity from database
    const recentActivity = [];

    // Get recent reservations (last 5)
    const latestReservations = await Reservation.findAll({
      attributes: ['id', 'trip_type', 'hotel_id', 'activity_id', 'transport_id', 'status', 'created_at'],
      order: [['created_at', 'DESC']],
      limit: 5,
      raw: true
    });

    console.log(`Recent reservations: ${latestReservations.length}`);

    // Process each reservation
    for (const res of latestReservations) {
      const timeAgo = getTimeAgo(new Date(res.created_at));
      let activityText = '';
      
      if (res.hotel_id) {
        const hotel = await Hotel.findByPk(res.hotel_id, { attributes: ['name'] });
        activityText = hotel ? `Nouvelle réservation hôtel - ${hotel.name}` : 'Nouvelle réservation hôtel';
      } else if (res.activity_id) {
        const activity = await Activity.findByPk(res.activity_id, { attributes: ['name'] });
        activityText = activity ? `Réservation activité - ${activity.name}` : 'Réservation activité';
      } else if (res.transport_id) {
        activityText = `Nouvelle réservation transport`;
      } else {
        activityText = `Nouvelle réservation #${res.id}`;
      }

      if (res.status === 'confirmed') {
        activityText = activityText.replace('Nouvelle', 'Confirmée');
      }

      recentActivity.push({
        text: activityText,
        time: timeAgo,
        type: 'reservation'
      });
    }

    // Get recent user registrations (last 3)
    const recentUsers = await User.findAll({
      attributes: ['id', 'firstName', 'lastName', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 3,
      raw: true
    });

    console.log(`Recent users: ${recentUsers.length}`);

    recentUsers.forEach(user => {
      const timeAgo = getTimeAgo(new Date(user.createdAt));
      const name = user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'Nouvel utilisateur';
      recentActivity.push({
        text: `Nouvel utilisateur inscrit - ${name}`,
        time: timeAgo,
        type: 'user'
      });
    });

    // Get recent favorites (last 3)
    const recentFavorites = await Favorite.findAll({
      attributes: ['id', 'targetType', 'targetId', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 3,
      raw: true
    });

    console.log(`Recent favorites: ${recentFavorites.length}`);

    for (const fav of recentFavorites) {
      const timeAgo = getTimeAgo(new Date(fav.createdAt));
      let targetName = '';

      if (fav.targetType === 'destination') {
        const dest = await Destination.findByPk(fav.targetId, { attributes: ['name'] });
        targetName = dest ? dest.name : 'destination';
      } else if (fav.targetType === 'hotel') {
        const hotel = await Hotel.findByPk(fav.targetId, { attributes: ['name'] });
        targetName = hotel ? hotel.name : 'hôtel';
      } else if (fav.targetType === 'activity') {
        const activity = await Activity.findByPk(fav.targetId, { attributes: ['name'] });
        targetName = activity ? activity.name : 'activité';
      }

      recentActivity.push({
        text: `Nouveau favori - ${targetName}`,
        time: timeAgo,
        type: 'favorite'
      });
    }

    // Sort all activities by time (most recent first)
    // Parse time strings and sort
    const timePriority = { 'Il y a quelques secondes': 0, "Il y a moins d'une minute": 1 };
    recentActivity.sort((a, b) => {
      // Extract minutes for comparison
      const getMinutes = (timeStr) => {
        if (timeStr.includes('quelques secondes')) return 0;
        if (timeStr.includes('minute')) {
          const match = timeStr.match(/(\d+)/);
          return match ? parseInt(match[1]) : 1;
        }
        if (timeStr.includes('heure')) {
          const match = timeStr.match(/(\d+)/);
          return match ? parseInt(match[1]) * 60 : 60;
        }
        if (timeStr.includes('jour')) {
          const match = timeStr.match(/(\d+)/);
          return match ? parseInt(match[1]) * 1440 : 1440;
        }
        return 9999;
      };
      
      return getMinutes(a.time) - getMinutes(b.time);
    });

    // Limit to 10 activities
    const recentActivitiesLimited = recentActivity.slice(0, 10);

    console.log('Recent activities:', recentActivitiesLimited);

    res.status(200).json({
      success: true,
      visits: visitsData,
      visitsLabels: visitsLabels,
      popularDestinations: popularDestinationsData,
      recentActivity: recentActivitiesLimited
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error', 
      error: error.message 
    });
  }
};

module.exports = {
  getUserReservations, getAllReservations, getReservation, createReservation,
  createInvoice, getReservationInvoice, getUserInvoices, getInvoice, updateReservationStatus, cancelReservation,
  createCarRentalReservation, createGroundTransportReservation,
  createHotelReservation, createActivityReservation,
  getAdminStats
};
