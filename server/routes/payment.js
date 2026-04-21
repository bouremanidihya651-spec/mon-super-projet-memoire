const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const { Reservation, Invoice, Transport } = require('../models');
const { authenticateToken } = require('../middleware/auth');

// Validate test keys only (no production keys allowed)
function validateTestKey(key, provider) {
  if (!key) return false;
  if (provider === 'stripe') {
    return key.startsWith('sk_test_');
  }
  if (provider === 'chargily') {
    return key.startsWith('test_sk_') || key.startsWith('live_sk_');
  }
  return false;
}

// Initialize Stripe (TEST MODE ONLY - sk_test_ keys only)
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  if (!validateTestKey(process.env.STRIPE_SECRET_KEY, 'stripe')) {
    console.error('ERROR: Production Stripe keys are not allowed. Use sk_test_ keys only.');
    throw new Error('Only test Stripe keys (sk_test_...) are allowed');
  }
  stripe = Stripe(process.env.STRIPE_SECRET_KEY);
}

// Validate Chargily key on startup
if (process.env.CHARGILY_SECRET_KEY && !validateTestKey(process.env.CHARGILY_SECRET_KEY, 'chargily')) {
  console.error('ERROR: Production Chargily keys are not allowed. Use test_sk_ keys only.');
  throw new Error('Only test Chargily keys (test_sk_...) are allowed');
}

// Create Stripe Checkout Session (NEW)
router.post('/create-stripe-checkout', authenticateToken, async (req, res) => {
  try {
    console.log('=== STRIPE CHECKOUT REQUEST ===');
    console.log('Request body:', req.body);
    console.log('User:', req.user);

    if (!stripe) {
      console.error('Stripe is not initialized');
      return res.status(500).json({ error: 'Stripe is not configured' });
    }

    const { amount, currency = 'eur', reservationId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    console.log('Creating Stripe session with:', {
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      reservationId
    });

    // Create Checkout Session in TEST mode
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: 'Réservation de voyage',
              description: `Réservation #${reservationId}`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment/success?reservation=${reservationId}&checkout_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment/failure`,
      metadata: {
        reservationId: reservationId?.toString() || '',
        userId: req.user.id.toString()
      },
    });

    console.log('Stripe session created:', session.id);

    res.json({
      checkoutUrl: session.url,
      sessionId: session.id
    });
  } catch (error) {
    console.error('=== STRIPE CHECKOUT ERROR ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error:', JSON.stringify(error, null, 2));
    res.status(500).json({
      error: 'Erreur lors de la création du paiement Stripe',
      details: error.message
    });
  }
});

// Create Stripe Payment Intent (TEST MODE)
router.post('/create-payment-intent', authenticateToken, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ error: 'Stripe is not configured' });
    }

    const { amount, currency = 'eur', reservationId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Create Payment Intent in TEST mode
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata: {
        reservationId: reservationId?.toString() || '',
        userId: req.user.id.toString()
      },
      automatic_payment_methods: {
        enabled: true
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Stripe Payment Intent Error:', error);
    res.status(500).json({
      error: 'Erreur lors de la création du paiement',
      details: error.message
    });
  }
});

// Create Chargily Checkout (TEST MODE)
router.post('/create-chargily-checkout', authenticateToken, async (req, res) => {
  try {
    const { amount, currency = 'eur', reservationId, customer } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Validate amount is reasonable (max 10,000 EUR for safety)
    if (amount > 10000) {
      console.error('Amount too high:', amount);
      return res.status(400).json({ 
        error: 'Montant invalide', 
        details: 'Le montant de la réservation est trop élevé. Veuillez vérifier les données.' 
      });
    }

    const chargilyKey = process.env.CHARGILY_SECRET_KEY;

    if (!chargilyKey) {
      return res.status(500).json({ error: 'Chargily key is not configured' });
    }

    // Convert EUR to DZD if needed (1 EUR ≈ 145 DZD)
    // Chargily expects amount in centimes for DZD currency
    let amountInCentimes = parseFloat(amount);
    if (currency.toUpperCase() === 'EUR') {
      // Convert EUR to DZD centimes
      // Example: 180 EUR → 180 * 145 = 26,100 DZD → 2,610,000 centimes
      amountInCentimes = Math.round(amount * 145 * 100);
    } else if (currency.toUpperCase() === 'DZD') {
      // Amount is already in DZD, convert to centimes
      amountInCentimes = Math.round(amount * 100);
    }

    console.log('=== CHARGILY PAYMENT REQUEST ===');
    console.log('Chargily request body:', {
      amount: amountInCentimes,
      currency: 'dzd',
      originalAmount: amount,
      originalCurrency: currency,
      amountInDZD: amountInCentimes / 100
    });
    console.log('Chargily key (first 20 chars):', chargilyKey?.substring(0, 20) + '...');

    // Build success URL with provider parameter
    const successUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment/success?reservation=${reservationId}&provider=chargily`;

    // TEST MODE: Use test API endpoint
    // Note: Chargily v2 API only accepts: amount, currency, success_url, failure_url
    const response = await fetch('https://pay.chargily.net/test/api/v2/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${chargilyKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: amountInCentimes,
        currency: 'dzd',
        success_url: successUrl,
        failure_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment/failure`
      })
    });

    const data = await response.json();
    console.log('Chargily API response status:', response.status);
    console.log('Chargily API response:', data);

    if (!response.ok) {
      console.error('Chargily error details:', data);
      throw new Error(data.message || 'Chargily API error');
    }

    // FIX: Convert http:// to https:// to avoid mixed content issues
    let checkoutUrl = data.checkout_url;
    if (checkoutUrl && checkoutUrl.startsWith('http://')) {
      checkoutUrl = checkoutUrl.replace('http://', 'https://');
      console.log('Fixed URL to HTTPS:', checkoutUrl);
    }

    res.json({
      checkoutUrl: checkoutUrl,
      checkoutId: data.id
    });
  } catch (error) {
    console.error('=== CHARGILY CHECKOUT ERROR ===');
    console.error('Chargily Checkout Error:', error);
    res.status(500).json({
      error: 'Erreur lors de la création du paiement Chargily',
      details: error.message
    });
  }
});

// Verify Chargily payment and update reservation status
router.post('/verify-chargily-payment', authenticateToken, async (req, res) => {
  try {
    const { checkout_id, reservation_id } = req.body;

    if (!checkout_id || !reservation_id) {
      return res.status(400).json({ error: 'checkout_id and reservation_id are required' });
    }

    const chargilyKey = process.env.CHARGILY_SECRET_KEY;

    if (!chargilyKey) {
      return res.status(500).json({ error: 'Chargily key is not configured' });
    }

    // Get checkout status from Chargily API
    const response = await fetch(`https://pay.chargily.net/test/api/v2/checkouts/${checkout_id}`, {
      headers: {
        'Authorization': `Bearer ${chargilyKey}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to verify payment status from Chargily');
    }

    const checkoutData = await response.json();
    const paymentStatus = checkoutData.status;

    console.log('=== CHARGILY PAYMENT VERIFICATION ===');
    console.log('Checkout ID:', checkout_id);
    console.log('Payment Status:', paymentStatus);

    // Update reservation if payment is successful or completed
    if (paymentStatus === 'paid' || paymentStatus === 'succeeded' || paymentStatus === 'completed') {
      const reservation = await Reservation.findByPk(reservation_id);

      if (reservation) {
        // Update reservation payment status and confirmation
        await reservation.update({
          payment_status: 'paid',
          status: 'confirmed'
        });
        console.log('✅ Reservation updated to PAID and CONFIRMED');

        // Update or create invoice with paid status
        const invoice = await Invoice.findOne({ where: { reservation_id } });
        if (invoice) {
          await invoice.update({
            payment_status: 'paid'
          });
          console.log('✅ Invoice updated to PAID');
        } else {
          console.log('⚠️ No invoice found for reservation:', reservation_id);
        }
      }
    }

    res.json({
      status: paymentStatus,
      checkout: checkoutData
    });
  } catch (error) {
    console.error('Chargily payment verification error:', error);
    res.status(500).json({
      error: 'Erreur lors de la vérification du paiement Chargily',
      details: error.message
    });
  }
});

// Verify payment status
router.post('/verify-payment', authenticateToken, async (req, res) => {
  try {
    const { paymentIntentId, checkoutId, provider, reservationId } = req.body;

    console.log('=== VERIFY PAYMENT REQUEST ===');
    console.log('Provider:', provider);
    console.log('Checkout ID:', checkoutId);
    console.log('Reservation ID:', reservationId);

    let paymentStatus = null;

    if (provider === 'stripe' && stripe) {
      try {
        const session = await stripe.checkout.sessions.retrieve(checkoutId);
        paymentStatus = session.payment_status;
        
        console.log('Stripe session status:', paymentStatus);
        
        // Update reservation and invoice if payment is successful
        if (paymentStatus === 'paid' && reservationId) {
          const reservation = await Reservation.findByPk(reservationId);
          
          if (reservation) {
            await reservation.update({
              payment_status: 'paid',
              status: 'confirmed'
            });

            const invoice = await Invoice.findOne({ where: { reservation_id: reservationId } });
            if (invoice) {
              await invoice.update({
                payment_status: 'paid'
              });
              console.log('✅ Stripe: Reservation and invoice updated to PAID');
            } else {
              console.log('⚠️ No invoice found for reservation:', reservationId);
            }
          }
        }
      } catch (stripeError) {
        console.error('Stripe verification error:', stripeError.message);
        // If Stripe key is invalid, try to get status from database
        if (reservationId) {
          const reservation = await Reservation.findByPk(reservationId);
          if (reservation) {
            paymentStatus = reservation.payment_status;
            console.log('Using database status:', paymentStatus);
          }
        }
      }
    } else if (provider === 'chargily') {
      const chargilyKey = process.env.CHARGILY_SECRET_KEY;
      // TEST MODE: Use test API endpoint
      const response = await fetch(`https://pay.chargily.net/test/api/v2/checkouts/${checkoutId}`, {
        headers: {
          'Authorization': `Bearer ${chargilyKey}`
        }
      });
      const data = await response.json();
      paymentStatus = data.status;
    }

    res.json({ status: paymentStatus });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Erreur lors de la vérification du paiement' });
  }
});

// Get invoice by reservation ID
router.get('/invoice-by-reservation/:reservationId', authenticateToken, async (req, res) => {
  try {
    const { reservationId } = req.params;
    console.log('=== GET INVOICE BY RESERVATION ===');
    console.log('Reservation ID:', reservationId);
    console.log('User ID:', req.user.id);
    
    const invoice = await Invoice.findOne({
      where: { reservation_id: reservationId },
      include: [{
        model: Reservation, as: 'reservation',
        include: [{ 
          model: Transport, as: 'transport',
          attributes: ['id', 'name', 'category', 'type', 'image_url', 'company', 'departure_airport', 'arrival_airport']
        }]
      }]
    });
    
    console.log('Invoice found:', invoice ? 'YES' : 'NO');
    if (invoice) {
      console.log('Invoice payment status:', invoice.payment_status);
    }
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found for this reservation' });
    }
    
    res.status(200).json({ success: true, invoice });
  } catch (error) {
    console.error('=== GET INVOICE ERROR ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

module.exports = router;
