import React, { useState } from 'react';
import { X, Bus, ChevronRight, ChevronLeft, Calendar, CreditCard, CheckCircle, Smartphone, Banknote, MapPin, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { generateAndDownloadInvoice } from '../../../utils/generateFacture';
import { generateAndDownloadBonReservation } from '../../../utils/generateBonReservation';
import { useTheme } from '../../../contexts/ThemeContext';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

const GroundTransportReservationModal = ({ isOpen, onClose, transport, user }) => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [step, setStep] = useState(1);
  const [travelDate, setTravelDate] = useState('');
  const [travelTime, setTravelTime] = useState('');
  const [passengers, setPassengers] = useState({ adults: 1, children: 0 });
  const [paymentMethod, setPaymentMethod] = useState('chargily'); // chargily, stripe, on_arrival
  const [passengerDetails, setPassengerDetails] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [reservationComplete, setReservationComplete] = useState(false);
  const [confirmationNumber, setConfirmationNumber] = useState('');
  const [invoiceData, setInvoiceData] = useState(null);
  const [error, setError] = useState('');

  // Initialize default dates
  React.useEffect(() => {
    if (isOpen) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      setTravelDate(tomorrow.toISOString().split('T')[0]);
      
      // Set default time to 08:00
      setTravelTime('08:00');

      setStep(1);
      setReservationComplete(false);
      setError('');
    }
  }, [isOpen]);

  const totalPassengers = passengers.adults + passengers.children;
  const unitPrice = transport ? parseFloat(transport.price) : 0;
  const totalPrice = unitPrice * totalPassengers;

  const handleNextStep = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      submitReservation();
    }
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const updatePassengerDetail = (field, value) => {
    setPassengerDetails(prev => ({ ...prev, [field]: value }));
  };

  const createInvoice = async (reservation, paymentStatus) => {
    try {
      const token = localStorage.getItem('token');

      // Generate invoice number
      const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

      const invoiceData = {
        invoice_number: invoiceNumber,
        reservation_id: reservation.id,
        amount: totalPrice,
        currency: 'DZD',
        payment_method: paymentMethod,
        payment_status: paymentStatus,
        customer_name: `${passengerDetails.firstName || ''} ${passengerDetails.lastName || ''}`.trim(),
        customer_email: passengerDetails.email || '',
        customer_phone: passengerDetails.phone || '',
        invoice_details: {
          destination: transport?.destination?.name || '',
          transportName: transport?.name || '',
          transportType: transport?.type || 'Transport terrestre',
          route: `${transport?.departure_city || ''} → ${transport?.arrival_city || ''}`,
          travelDate: travelDate,
          travelTime: travelTime,
          adults: passengers.adults,
          children: passengers.children,
          unitPrice: transport?.price || 0
        }
      };

      // Save invoice to database
      const response = await axios.post('http://localhost:3000/api/reservations/create-invoice', invoiceData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.invoice;
    } catch (error) {
      console.error('Error creating invoice:', error);
      return null;
    }
  };

  const handleChargilyPayment = async (reservation) => {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.post('http://localhost:3000/api/payment/create-chargily-checkout', {
        amount: totalPrice,
        currency: 'dzd',
        reservationId: reservation.id,
        customer: {
          name: `${passengerDetails.firstName || ''} ${passengerDetails.lastName || ''}`.trim(),
          email: passengerDetails.email || '',
          phone: passengerDetails.phone || ''
        }
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Redirect to Chargily payment page
      if (response.data.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
      }
    } catch (error) {
      console.error('Chargily payment error:', error);
      throw new Error('Erreur lors de la création du paiement Chargily');
    }
  };

  const handleStripePayment = async (reservation) => {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.post('http://localhost:3000/api/payment/create-stripe-checkout', {
        amount: totalPrice,
        currency: 'dzd',
        reservationId: reservation.id
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Redirect to Stripe Checkout page
      if (response.data.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
      }
    } catch (error) {
      console.error('Stripe payment error:', error);
      const errorMessage = error.response?.data?.details || error.response?.data?.error || error.message || 'Erreur lors de la création du paiement Stripe';
      throw new Error(errorMessage);
    }
  };

  const submitReservation = async () => {
    setIsProcessing(true);
    setError('');

    try {
      const token = localStorage.getItem('token');

      // Create reservation
      const reservationResponse = await axios.post('http://localhost:3000/api/reservations/ground-transport', {
        transport_id: transport.id,
        travel_date: travelDate,
        travel_time: travelTime,
        adults: passengers.adults,
        children: passengers.children,
        passenger_details: passengerDetails,
        payment_method: paymentMethod,
        notes: ''
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const reservation = reservationResponse.data.reservation;
      setConfirmationNumber(reservation.confirmation_number);

      // Handle payment based on method
      if (paymentMethod === 'chargily') {
        await handleChargilyPayment(reservation);
        return;
      } else if (paymentMethod === 'stripe') {
        await handleStripePayment(reservation);
        return;
      }

      // For on_arrival (no redirect needed)
      const paymentStatus = 'pending';

      // Create invoice
      const invoice = await createInvoice(reservation, paymentStatus);

      if (invoice) {
        setInvoiceData(invoice);
        generateAndDownloadBonReservation(reservation, invoice);
      }

      setReservationComplete(true);
      setStep(4);
    } catch (error) {
      console.error('Reservation error:', error);
      setError(error.response?.data?.message || error.message || 'Erreur lors de la réservation');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  // Theme colors
  const t = {
    bg: isDark ? '#1a2320' : '#f7f5f0',
    bgSecondary: isDark ? '#242d2a' : '#f7f5f0',
    bgInput: isDark ? '#0f1412' : '#f7f5f0',
    bgBadge: isDark ? '#2d7a5a33' : '#e8e4de',
    border: isDark ? '#2d3a36' : '#e0dcd4',
    text: isDark ? '#e8ece9' : '#1a4a36',
    textMuted: isDark ? '#9db8aa' : '#6b8f7b',
    primary: '#2d7a5a',
    accent: isDark ? '#3db383' : '#2d7a5a',
    card: isDark ? '#242d2a' : '#f7f5f0'
  };

  // Step 4: Confirmation
  if (step === 4) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ backgroundColor: t.bg, borderColor: t.border }}
          className="w-full max-w-lg rounded-3xl p-8 shadow-2xl relative border"
        >
          <button onClick={onClose} style={{ color: t.textMuted }} className="absolute top-4 right-4 hover:opacity-70">
            <X className="w-6 h-6" />
          </button>

          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-[#2d7a5a]/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-[#2d7a5a]" />
            </div>

            <h2 style={{ color: t.text }} className="text-2xl font-bold mb-2">Réservation Confirmée !</h2>
            <p style={{ color: t.textMuted }} className="mb-6">Votre réservation de transport terrestre a été enregistrée avec succès.</p>

            <div style={{ backgroundColor: isDark ? '#2d7a5a1a' : '#f7f5f0' }} className="rounded-full p-6 mb-6">
              <p style={{ color: t.textMuted }} className="text-sm mb-2">Numéro de confirmation</p>
              <p style={{ color: t.primary }} className="text-2xl font-bold">{confirmationNumber}</p>
            </div>

            {invoiceData && (
              <div style={{ backgroundColor: isDark ? '#2d7a5a1a' : '#f7f5f0' }} className="rounded-full p-4 mb-6">
                <p style={{ color: t.textMuted }} className="text-sm mb-2">Numéro de facture</p>
                <p style={{ color: t.text }} className="text-lg font-bold">{invoiceData.invoice_number}</p>
                <p style={{ color: t.textMuted }} className="text-xs mt-2">La facture a été téléchargée automatiquement</p>
              </div>
            )}

            <div className="text-left space-y-3 mb-6">
              <div className="flex justify-between">
                <span style={{ color: t.textMuted }}>Transport</span>
                <span style={{ color: t.text }} className="font-medium">{transport?.name}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: t.textMuted }}>Type</span>
                <span style={{ color: t.text }} className="font-medium">{transport?.type || 'Transport terrestre'}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: t.textMuted }}>Trajet</span>
                <span style={{ color: t.text }} className="font-medium">{transport?.departure_city} → {transport?.arrival_city}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: t.textMuted }}>Voyageurs</span>
                <span style={{ color: t.text }} className="font-medium">{totalPassengers}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: t.textMuted }}>Total</span>
                <span style={{ color: t.primary }} className="font-bold">{totalPrice.toFixed(2)} DA</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-[#2d7a5a] text-black font-bold py-3 rounded-full hover:bg-[#1a4a36] transition"
            >
              Retour à l'accueil
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#f7f5f0] border border-[#e0dcd4] w-full max-w-4xl rounded-3xl my-8 shadow-2xl relative flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#e0dcd4]">
          <div>
            <h2 className="text-xl font-bold text-[#1a4a36]">Réserver votre transport</h2>
            <p className="text-[#6b8f7b] text-sm mt-1">{transport?.name} - {transport?.type}</p>
          </div>
          <button onClick={onClose} className="text-[#6b8f7b] hover:text-[#1a4a36]">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 p-6 border-b border-[#e0dcd4]">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-2 ${step >= s ? 'text-[#2d7a5a]' : 'text-[#6b8f7b]'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= s ? 'bg-[#2d7a5a] text-black' : 'bg-[#e8e4de] text-[#6b8f7b]'
                }`}>
                  {s}
                </div>
                <span className="text-sm font-medium hidden sm:inline">
                  {s === 1 ? 'Voyage' : s === 2 ? 'Passager' : 'Paiement'}
                </span>
              </div>
              {s < 3 && <div className={`w-12 h-0.5 ${step > s ? 'bg-[#2d7a5a]' : 'bg-[#e8e4de]'}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {/* Step 1: Travel Selection */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Transport Info Banner */}
                <div className="bg-gradient-to-r from-[#2d7a5a]/10 to-transparent border border-[#e0dcd4] rounded-full p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#2d7a5a] font-bold text-lg">{transport?.name}</p>
                      <p className="text-[#6b8f7b] text-sm">{transport?.type || 'Transport terrestre'}</p>
                    </div>
                    <Bus className="w-8 h-8 text-[#2d7a5a]" />
                  </div>
                </div>

                {/* Route Info */}
                <div>
                  <label className="text-[#6b8f7b] text-sm mb-2 block">Trajet</label>
                  <div className="bg-[#f7f5f0] border border-[#e0dcd4] rounded-full px-4 py-3 text-[#1a4a36] flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#2d7a5a]" />
                    {transport?.departure_city || 'N/A'} → {transport?.arrival_city || 'N/A'}
                  </div>
                </div>

                {/* Schedule Info */}
                {transport?.schedule && (
                  <div>
                    <label className="text-[#6b8f7b] text-sm mb-2 block">Horaires</label>
                    <div className="bg-[#f7f5f0] border border-[#e0dcd4] rounded-full px-4 py-3 text-[#1a4a36] flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#2d7a5a]" />
                      {transport.schedule}
                    </div>
                  </div>
                )}

                {/* Date */}
                <div>
                  <label className="text-[#1a4a36] font-medium mb-2 block flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date de voyage
                  </label>
                  <input
                    type="date"
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    className="w-full bg-[#f7f5f0] border border-[#e0dcd4] rounded-full px-4 py-3 text-[#1a4a36] focus:border-[#2d7a5a] outline-none"
                  />
                </div>

                {/* Time */}
                <div>
                  <label className="text-[#1a4a36] font-medium mb-2 block flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Heure de départ
                  </label>
                  <input
                    type="time"
                    value={travelTime}
                    onChange={(e) => setTravelTime(e.target.value)}
                    className="w-full bg-[#f7f5f0] border border-[#e0dcd4] rounded-full px-4 py-3 text-[#1a4a36] focus:border-[#2d7a5a] outline-none"
                  />
                </div>

                {/* Passengers */}
                <div>
                  <label className="text-[#1a4a36] font-medium mb-3 block">Voyageurs</label>
                  <div className="bg-[#f7f5f0] border border-[#e0dcd4] rounded-full p-4 space-y-4">
                    {/* Adults */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[#1a4a36] font-medium">Adultes</p>
                        <p className="text-[#6b8f7b] text-xs">(12 ans et +)</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setPassengers(p => ({ ...p, adults: Math.max(1, p.adults - 1) }))}
                          className="w-10 h-10 rounded-full bg-[#e8e4de] text-[#1a4a36] hover:bg-[#d0ccc4] transition"
                        >
                          -
                        </button>
                        <span className="text-[#1a4a36] font-bold w-8 text-center">{passengers.adults}</span>
                        <button
                          onClick={() => setPassengers(p => ({ ...p, adults: p.adults + 1 }))}
                          className="w-10 h-10 rounded-full bg-[#e8e4de] text-[#1a4a36] hover:bg-[#d0ccc4] transition"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Children */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[#1a4a36] font-medium">Enfants</p>
                        <p className="text-[#6b8f7b] text-xs">(3-11 ans)</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setPassengers(p => ({ ...p, children: Math.max(0, p.children - 1) }))}
                          className="w-10 h-10 rounded-full bg-[#e8e4de] text-[#1a4a36] hover:bg-[#d0ccc4] transition"
                        >
                          -
                        </button>
                        <span className="text-[#1a4a36] font-bold w-8 text-center">{passengers.children}</span>
                        <button
                          onClick={() => setPassengers(p => ({ ...p, children: p.children + 1 }))}
                          className="w-10 h-10 rounded-full bg-[#e8e4de] text-[#1a4a36] hover:bg-[#d0ccc4] transition"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#e0dcd4]">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[#6b8f7b]">Prix unitaire</span>
                        <span className="text-[#1a4a36]">{unitPrice.toFixed(2)} DA</span>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t border-[#e0dcd4]">
                        <span className="text-[#6b8f7b]">Total</span>
                        <span className="text-[#2d7a5a] font-bold text-lg">{totalPrice.toFixed(2)} DA</span>
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={handleNextStep}
                        className="w-full bg-[#2d7a5a] text-black font-bold py-3 rounded-full hover:bg-[#1a4a36] transition flex items-center justify-center gap-2"
                      >
                        Appliquer | {totalPassengers} Voyageur(s)
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Passenger Details */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-bold text-[#1a4a36] mb-4">Informations du passager principal</h3>

                <div className="bg-[#f7f5f0]/50 border border-[#e0dcd4] rounded-full p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[#6b8f7b] text-xs mb-1 block">Prénom *</label>
                      <input
                        type="text"
                        value={passengerDetails.firstName}
                        onChange={(e) => updatePassengerDetail('firstName', e.target.value)}
                        className="w-full bg-[#e8e4de] border border-[#d0ccc4] rounded-full px-3 py-2 text-[#1a4a36] text-sm focus:border-[#2d7a5a] outline-none"
                        placeholder="Prénom"
                      />
                    </div>
                    <div>
                      <label className="text-[#6b8f7b] text-xs mb-1 block">Nom *</label>
                      <input
                        type="text"
                        value={passengerDetails.lastName}
                        onChange={(e) => updatePassengerDetail('lastName', e.target.value)}
                        className="w-full bg-[#e8e4de] border border-[#d0ccc4] rounded-full px-3 py-2 text-[#1a4a36] text-sm focus:border-[#2d7a5a] outline-none"
                        placeholder="Nom"
                      />
                    </div>
                    <div>
                      <label className="text-[#6b8f7b] text-xs mb-1 block">Email *</label>
                      <input
                        type="email"
                        value={passengerDetails.email}
                        onChange={(e) => updatePassengerDetail('email', e.target.value)}
                        className="w-full bg-[#e8e4de] border border-[#d0ccc4] rounded-full px-3 py-2 text-[#1a4a36] text-sm focus:border-[#2d7a5a] outline-none"
                        placeholder="Email"
                      />
                    </div>
                    <div>
                      <label className="text-[#6b8f7b] text-xs mb-1 block">Téléphone *</label>
                      <input
                        type="tel"
                        value={passengerDetails.phone}
                        onChange={(e) => updatePassengerDetail('phone', e.target.value)}
                        className="w-full bg-[#e8e4de] border border-[#d0ccc4] rounded-full px-3 py-2 text-[#1a4a36] text-sm focus:border-[#2d7a5a] outline-none"
                        placeholder="Téléphone"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-amber-100 border border-amber-300 rounded-full p-4">
                  <p className="text-amber-600 text-sm">
                    ⚠️ Veuillez arriver 15 minutes avant l'heure de départ pour l'embarquement.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Summary */}
                <div className="bg-gradient-to-r from-[#2d7a5a]/10 to-transparent border border-[#e0dcd4] rounded-full p-4">
                  <h3 className="text-[#1a4a36] font-bold mb-3">Récapitulatif</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#6b8f7b]">Transport</span>
                      <span className="text-[#1a4a36]">{transport?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6b8f7b]">Type</span>
                      <span className="text-[#1a4a36]">{transport?.type || 'Transport terrestre'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6b8f7b]">Trajet</span>
                      <span className="text-[#1a4a36]">{transport?.departure_city} → {transport?.arrival_city}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6b8f7b]">Date</span>
                      <span className="text-[#1a4a36]">{travelDate} à {travelTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6b8f7b]">Voyageurs</span>
                      <span className="text-[#1a4a36]">{totalPassengers} (Adultes: {passengers.adults}, Enfants: {passengers.children})</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-[#e0dcd4]">
                      <span className="text-[#6b8f7b]">Prix unitaire</span>
                      <span className="text-[#1a4a36]">{unitPrice.toFixed(2)} DA</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-[#2d7a5a]">Total</span>
                      <span className="text-[#2d7a5a]">{totalPrice.toFixed(2)} DA</span>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="text-[#1a4a36] font-medium mb-3 block">Mode de paiement</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Chargily */}
                    <button
                      onClick={() => setPaymentMethod('chargily')}
                      className={`p-4 rounded-full font-medium transition border-2 flex flex-col items-center gap-2 ${
                        paymentMethod === 'chargily'
                          ? 'border-[#2d7a5a] bg-[#2d7a5a]/10 text-[#2d7a5a]'
                          : 'border-[#e0dcd4] bg-[#f7f5f0] text-[#6b8f7b] hover:border-[#d0ccc4]'
                      }`}
                    >
                      <Smartphone className="w-6 h-6" />
                      <span className="text-sm text-center">Carte Edahabia / CIB</span>
                    </button>

                    {/* Stripe */}
                    <button
                      onClick={() => setPaymentMethod('stripe')}
                      className={`p-4 rounded-full font-medium transition border-2 flex flex-col items-center gap-2 ${
                        paymentMethod === 'stripe'
                          ? 'border-[#2d7a5a] bg-[#2d7a5a]/10 text-[#2d7a5a]'
                          : 'border-[#e0dcd4] bg-[#f7f5f0] text-[#6b8f7b] hover:border-[#d0ccc4]'
                      }`}
                    >
                      <CreditCard className="w-6 h-6" />
                      <span className="text-sm text-center">Carte Bancaire</span>
                    </button>

                    {/* Pay on Arrival */}
                    <button
                      onClick={() => setPaymentMethod('on_arrival')}
                      className={`p-4 rounded-full font-medium transition border-2 flex flex-col items-center gap-2 ${
                        paymentMethod === 'on_arrival'
                          ? 'border-[#2d7a5a] bg-[#2d7a5a]/10 text-[#2d7a5a]'
                          : 'border-[#e0dcd4] bg-[#f7f5f0] text-[#6b8f7b] hover:border-[#d0ccc4]'
                      }`}
                    >
                      <Banknote className="w-6 h-6" />
                      <span className="text-sm text-center">Payer avant l'embarquement</span>
                    </button>
                  </div>
                </div>

                {/* Payment Info */}
                {paymentMethod === 'chargily' && (
                  <div className="bg-[#f7f5f0]/50 border border-[#e0dcd4] rounded-full p-4">
                    <p className="text-[#6b8f7b] text-sm">
                      Vous serez redirigé vers la page de paiement sécurisée de Chargily pour payer avec votre carte Edahabia ou CIB.
                    </p>
                  </div>
                )}

                {paymentMethod === 'stripe' && (
                  <div className="bg-[#f7f5f0]/50 border border-[#e0dcd4] rounded-full p-4">
                    <p className="text-[#6b8f7b] text-sm">
                      Vous serez redirigé vers la page de paiement sécurisée de Stripe pour payer avec votre carte bancaire internationale.
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-xs text-[#6b8f7b]">
                      <CheckCircle className="w-4 h-4" />
                      <span>Paiement 100% sécurisé par Stripe</span>
                    </div>
                  </div>
                )}

                {paymentMethod === 'on_arrival' && (
                  <div className="bg-[#f7f5f0]/50 border border-[#e0dcd4] rounded-full p-4">
                    <p className="text-[#6b8f7b] text-sm">
                      Votre réservation sera enregistrée avec le statut "En attente de paiement". Vous paierez directement avant l'embarquement.
                    </p>
                  </div>
                )}

                {error && (
                  <div className="bg-[#fef2f2] border border-[#fca5a5] rounded-full p-4">
                    <p className="text-[#dc2626] text-sm">{error}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        {step < 4 && (
          <div className="flex items-center justify-between p-6 border-t border-[#e0dcd4]">
            {step > 1 ? (
              <button
                onClick={handlePrevStep}
                className="flex items-center gap-2 text-[#6b8f7b] hover:text-[#1a4a36] transition px-4 py-2"
              >
                <ChevronLeft className="w-5 h-5" />
                Retour
              </button>
            ) : (
              <div />
            )}

            {step < 3 && (
              <button
                onClick={handleNextStep}
                className="bg-[#2d7a5a] text-black font-bold px-8 py-3 rounded-full hover:bg-[#1a4a36] transition flex items-center gap-2"
              >
                Suivant
                <ChevronRight className="w-5 h-5" />
              </button>
            )}

            {step === 3 && (
              <button
                onClick={handleNextStep}
                disabled={isProcessing}
                className="bg-[#2d7a5a] text-black font-bold px-8 py-3 rounded-full hover:bg-[#1a4a36] transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Traitement...' : `Confirmer et payer ${totalPrice.toFixed(2)} DA`}
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default GroundTransportReservationModal;
