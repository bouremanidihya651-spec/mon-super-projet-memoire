import React, { useState } from 'react';
import { X, Plane, ChevronRight, ChevronLeft, Users, Calendar, CreditCard, CheckCircle, Smartphone, Banknote } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { generateAndDownloadInvoice } from '../../../utils/generateFacture';
import { generateAndDownloadBonReservation } from '../../../utils/generateBonReservation';
import { useTheme } from '../../../contexts/ThemeContext';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

const FlightReservationModal = ({ isOpen, onClose, transport, user }) => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [step, setStep] = useState(1);
  const [tripType, setTripType] = useState('round_trip');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [travelers, setTravelers] = useState({ adults: 1, children: 0, infants: 0 });
  const [travelerDetails, setTravelerDetails] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('chargily'); // chargily, stripe, on_arrival
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
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
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      
      setDepartureDate(nextWeek.toISOString().split('T')[0]);
      
      const returnDateObj = new Date(nextWeek);
      returnDateObj.setDate(nextWeek.getDate() + 7);
      setReturnDate(returnDateObj.toISOString().split('T')[0]);
      
      setStep(1);
      setReservationComplete(false);
      setError('');
    }
  }, [isOpen]);

  const totalTravelers = travelers.adults + travelers.children + travelers.infants;
  const totalPrice = transport ? parseFloat(transport.price) * totalTravelers : 0;

  const handleNextStep = () => {
    if (step === 1) {
      // Initialize traveler details array
      const newDetails = Array(totalTravelers).fill(null).map((_, i) => ({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        nationality: '',
        passportNumber: '',
        email: i === 0 ? user?.email || '' : '',
        phone: i === 0 ? user?.phone || '' : ''
      }));
      setTravelerDetails(newDetails);
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

  const updateTravelerDetail = (index, field, value) => {
    const newDetails = [...travelerDetails];
    newDetails[index] = { ...newDetails[index], [field]: value };
    setTravelerDetails(newDetails);
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
        customer_name: `${travelerDetails[0]?.firstName || ''} ${travelerDetails[0]?.lastName || ''}`.trim(),
        customer_email: travelerDetails[0]?.email || '',
        customer_phone: travelerDetails[0]?.phone || '',
        invoice_details: {
          destination: transport?.destination?.name || '',
          transportName: transport?.name || '',
          route: `${transport?.departure_airport || ''} → ${transport?.arrival_airport || ''}`,
          departureDate: departureDate,
          tripType: tripType,
          adults: travelers.adults,
          children: travelers.children,
          infants: travelers.infants,
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
          name: `${travelerDetails[0]?.firstName || ''} ${travelerDetails[0]?.lastName || ''}`.trim(),
          email: travelerDetails[0]?.email || '',
          phone: travelerDetails[0]?.phone || ''
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
      const reservationResponse = await axios.post('http://localhost:3000/api/reservations', {
        transport_id: transport.id,
        trip_type: tripType,
        departure_date: departureDate,
        return_date: tripType === 'round_trip' ? returnDate : null,
        adults: travelers.adults,
        children: travelers.children,
        infants: travelers.infants,
        travelers_details: travelerDetails,
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
        // For Chargily, we redirect so don't show confirmation yet
        return;
      } else if (paymentMethod === 'stripe') {
        await handleStripePayment(reservation);
        // For Stripe, we redirect so don't show confirmation yet
        return;
      }

      // For on_arrival (no redirect needed)
      const paymentStatus = 'pending';

      // Create invoice
      const invoice = await createInvoice(reservation, paymentStatus);

      if (invoice) {
        setInvoiceData(invoice);
        // Generate and download PDF for pay on arrival
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

  const formatAirportName = (airport) => {
    if (!airport) return 'N/A';
    return airport;
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
            <p style={{ color: t.textMuted }} className="mb-6">Votre réservation a été enregistrée avec succès.</p>
            
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
                <span style={{ color: t.textMuted }}>Destination</span>
                <span style={{ color: t.text }} className="font-medium">{transport?.destination?.name}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: t.textMuted }}>Vol</span>
                <span style={{ color: t.text }} className="font-medium">{transport?.name}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: t.textMuted }}>Voyageurs</span>
                <span style={{ color: t.text }} className="font-medium">{totalTravelers}</span>
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
        style={{ backgroundColor: t.bg, borderColor: t.border }}
        className="w-full max-w-4xl rounded-3xl my-8 shadow-2xl relative flex flex-col max-h-[90vh] border"
      >
        {/* Header */}
        <div style={{ borderColor: t.border }} className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 style={{ color: t.text }} className="text-xl font-bold">Réserver votre vol</h2>
            <p style={{ color: t.textMuted }} className="text-sm mt-1">{transport?.name} - {transport?.destination?.name}</p>
          </div>
          <button onClick={onClose} style={{ color: t.textMuted }} className="hover:opacity-70">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div style={{ borderColor: t.border }} className="flex items-center justify-center gap-4 p-6 border-b">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-2 ${step >= s ? 'text-[#2d7a5a]' : ''}`} style={{ color: step < s ? t.textMuted : '' }}>
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold`}
                  style={{ 
                    backgroundColor: step >= s ? t.primary : t.bgBadge,
                    color: step >= s ? '#000' : t.textMuted
                  }}
                >
                  {s}
                </div>
                <span className="text-sm font-medium hidden sm:inline">
                  {s === 1 ? 'Vol' : s === 2 ? 'Voyageurs' : 'Paiement'}
                </span>
              </div>
              {s < 3 && <div className={`w-12 h-0.5`} style={{ backgroundColor: step > s ? t.primary : t.bgBadge }} />}
            </React.Fragment>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {/* Step 1: Flight Selection */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Flight Info Banner */}
                <div style={{ borderColor: t.border, background: `linear-gradient(to right, ${t.primary}1a, transparent)` }} className="border rounded-full p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p style={{ color: t.primary }} className="font-bold text-lg">{transport?.name}</p>
                      <p style={{ color: t.textMuted }} className="text-sm">{formatAirportName(transport?.departure_airport)} → {formatAirportName(transport?.arrival_airport)}</p>
                    </div>
                    <Plane className="w-8 h-8 text-[#2d7a5a]" />
                  </div>
                </div>

                {/* Trip Type Toggle */}
                <div>
                  <label style={{ color: t.text }} className="font-medium mb-3 block">Type de voyage</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setTripType('round_trip')}
                      className={`flex-1 py-3 px-4 rounded-full font-medium transition`}
                      style={{
                        backgroundColor: tripType === 'round_trip' ? t.primary : t.bgBadge,
                        color: tripType === 'round_trip' ? '#000' : t.textMuted
                      }}
                    >
                      Aller-retour
                    </button>
                    <button
                      onClick={() => setTripType('one_way')}
                      className={`flex-1 py-3 px-4 rounded-full font-medium transition`}
                      style={{
                        backgroundColor: tripType === 'one_way' ? t.primary : t.bgBadge,
                        color: tripType === 'one_way' ? '#000' : t.textMuted
                      }}
                    >
                      Aller simple
                    </button>
                  </div>
                </div>

                {/* Route Info (Pre-filled) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label style={{ color: t.textMuted }} className="text-sm mb-2 block">De</label>
                    <div style={{ backgroundColor: t.bgInput, borderColor: t.border, color: t.text }} className="border rounded-full px-4 py-3">
                      {formatAirportName(transport?.departure_airport)}
                    </div>
                  </div>
                  <div>
                    <label style={{ color: t.textMuted }} className="text-sm mb-2 block">Vers</label>
                    <div style={{ backgroundColor: t.bgInput, borderColor: t.border, color: t.text }} className="border rounded-full px-4 py-3">
                      {formatAirportName(transport?.arrival_airport)}
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label style={{ color: t.text }} className="font-medium mb-2 block flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Départ
                    </label>
                    <input
                      type="date"
                      value={departureDate}
                      onChange={(e) => setDepartureDate(e.target.value)}
                      style={{ backgroundColor: t.bgInput, borderColor: t.border, color: t.text }}
                      className="w-full border rounded-full px-4 py-3 outline-none focus:border-[#2d7a5a]"
                    />
                  </div>
                  {tripType === 'round_trip' && (
                    <div>
                      <label style={{ color: t.text }} className="font-medium mb-2 block flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Retour
                      </label>
                      <input
                        type="date"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        min={departureDate}
                        style={{ backgroundColor: t.bgInput, borderColor: t.border, color: t.text }}
                        className="w-full border rounded-full px-4 py-3 outline-none focus:border-[#2d7a5a]"
                      />
                    </div>
                  )}
                </div>

                {/* Travelers */}
                <div>
                  <label style={{ color: t.text }} className="font-medium mb-3 block flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Voyageurs
                  </label>
                  <div style={{ backgroundColor: t.bgInput, borderColor: t.border }} className="border rounded-3xl p-6 space-y-4">
                    {/* Adults */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p style={{ color: t.text }} className="font-medium">Adultes</p>
                        <p style={{ color: t.textMuted }} className="text-xs">(12 ans et +)</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setTravelers(t => ({ ...t, adults: Math.max(1, t.adults - 1) }))}
                          style={{ backgroundColor: t.bgBadge, color: t.text }}
                          className="w-10 h-10 rounded-full hover:opacity-70 transition"
                        >
                          -
                        </button>
                        <span style={{ color: t.text }} className="font-bold w-8 text-center">{travelers.adults}</span>
                        <button
                          onClick={() => setTravelers(t => ({ ...t, adults: t.adults + 1 }))}
                          style={{ backgroundColor: t.bgBadge, color: t.text }}
                          className="w-10 h-10 rounded-full hover:opacity-70 transition"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Children */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p style={{ color: t.text }} className="font-medium">Enfants</p>
                        <p style={{ color: t.textMuted }} className="text-xs">(2-11 ans)</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setTravelers(t => ({ ...t, children: Math.max(0, t.children - 1) }))}
                          style={{ backgroundColor: t.bgBadge, color: t.text }}
                          className="w-10 h-10 rounded-full hover:opacity-70 transition"
                        >
                          -
                        </button>
                        <span style={{ color: t.text }} className="font-bold w-8 text-center">{travelers.children}</span>
                        <button
                          onClick={() => setTravelers(t => ({ ...t, children: t.children + 1 }))}
                          style={{ backgroundColor: t.bgBadge, color: t.text }}
                          className="w-10 h-10 rounded-full hover:opacity-70 transition"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Infants */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p style={{ color: t.text }} className="font-medium">Bébés</p>
                        <p style={{ color: t.textMuted }} className="text-xs">(moins de 2 ans)</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setTravelers(t => ({ ...t, infants: Math.max(0, t.infants - 1) }))}
                          style={{ backgroundColor: t.bgBadge, color: t.text }}
                          className="w-10 h-10 rounded-full hover:opacity-70 transition"
                        >
                          -
                        </button>
                        <span style={{ color: t.text }} className="font-bold w-8 text-center">{travelers.infants}</span>
                        <button
                          onClick={() => setTravelers(t => ({ ...t, infants: t.infants + 1 }))}
                          style={{ backgroundColor: t.bgBadge, color: t.text }}
                          className="w-10 h-10 rounded-full hover:opacity-70 transition"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div style={{ borderColor: t.border }} className="pt-4 border-t">
                      <button
                        onClick={handleNextStep}
                        className="w-full bg-[#2d7a5a] text-black font-bold py-3 rounded-full hover:bg-[#1a4a36] transition flex items-center justify-center gap-2"
                      >
                        Appliquer | {totalTravelers} Voyageur(s)
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Traveler Details */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h3 style={{ color: t.text }} className="text-lg font-bold mb-4">Informations des voyageurs</h3>
                
                {travelerDetails.map((traveler, index) => (
                  <div key={index} style={{ backgroundColor: isDark ? '#2d7a5a0d' : '#f7f5f080', borderColor: t.border }} className="border rounded-3xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div style={{ backgroundColor: isDark ? '#2d7a5a33' : '#2d7a5a33', color: t.primary }} className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <h4 style={{ color: t.text }} className="font-medium">
                        Voyageur {index + 1} {index === 0 && '(Principal)'}
                      </h4>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 sm:col-span-1">
                        <label style={{ color: t.textMuted }} className="text-xs mb-1 block">Prénom *</label>
                        <input
                          type="text"
                          value={traveler.firstName}
                          onChange={(e) => updateTravelerDetail(index, 'firstName', e.target.value)}
                          style={{ backgroundColor: t.bgBadge, borderColor: t.border, color: t.text }}
                          className="w-full border rounded-full px-4 py-2 text-sm focus:border-[#2d7a5a] outline-none"
                          placeholder="Prénom"
                        />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label style={{ color: t.textMuted }} className="text-xs mb-1 block">Nom *</label>
                        <input
                          type="text"
                          value={traveler.lastName}
                          onChange={(e) => updateTravelerDetail(index, 'lastName', e.target.value)}
                          style={{ backgroundColor: t.bgBadge, borderColor: t.border, color: t.text }}
                          className="w-full border rounded-full px-4 py-2 text-sm focus:border-[#2d7a5a] outline-none"
                          placeholder="Nom"
                        />
                      </div>
                      <div>
                        <label style={{ color: t.textMuted }} className="text-xs mb-1 block">Date de naissance</label>
                        <input
                          type="date"
                          value={traveler.dateOfBirth}
                          onChange={(e) => updateTravelerDetail(index, 'dateOfBirth', e.target.value)}
                          style={{ backgroundColor: t.bgBadge, borderColor: t.border, color: t.text }}
                          className="w-full border rounded-full px-4 py-2 text-sm focus:border-[#2d7a5a] outline-none"
                        />
                      </div>
                      <div>
                        <label style={{ color: t.textMuted }} className="text-xs mb-1 block">Nationalité</label>
                        <input
                          type="text"
                          value={traveler.nationality}
                          onChange={(e) => updateTravelerDetail(index, 'nationality', e.target.value)}
                          style={{ backgroundColor: t.bgBadge, borderColor: t.border, color: t.text }}
                          className="w-full border rounded-full px-4 py-2 text-sm focus:border-[#2d7a5a] outline-none"
                          placeholder="Nationalité"
                        />
                      </div>
                      <div className="col-span-2">
                        <label style={{ color: t.textMuted }} className="text-xs mb-1 block">Numéro de passeport (optionnel)</label>
                        <input
                          type="text"
                          value={traveler.passportNumber}
                          onChange={(e) => updateTravelerDetail(index, 'passportNumber', e.target.value)}
                          style={{ backgroundColor: t.bgBadge, borderColor: t.border, color: t.text }}
                          className="w-full border rounded-full px-4 py-2 text-sm focus:border-[#2d7a5a] outline-none"
                          placeholder="Numéro de passeport"
                        />
                      </div>
                      {index === 0 && (
                        <>
                          <div>
                            <label style={{ color: t.textMuted }} className="text-xs mb-1 block">Email *</label>
                            <input
                              type="email"
                              value={traveler.email}
                              onChange={(e) => updateTravelerDetail(index, 'email', e.target.value)}
                              style={{ backgroundColor: t.bgBadge, borderColor: t.border, color: t.text }}
                              className="w-full border rounded-full px-4 py-2 text-sm focus:border-[#2d7a5a] outline-none"
                              placeholder="Email"
                            />
                          </div>
                          <div>
                            <label style={{ color: t.textMuted }} className="text-xs mb-1 block">Téléphone *</label>
                            <input
                              type="tel"
                              value={traveler.phone}
                              onChange={(e) => updateTravelerDetail(index, 'phone', e.target.value)}
                              style={{ backgroundColor: t.bgBadge, borderColor: t.border, color: t.text }}
                              className="w-full border rounded-full px-4 py-2 text-sm focus:border-[#2d7a5a] outline-none"
                              placeholder="Téléphone"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
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
                <div style={{ borderColor: t.border, background: `linear-gradient(to right, ${t.primary}1a, transparent)` }} className="border rounded-3xl p-6">
                  <h3 style={{ color: t.text }} className="font-bold mb-3">Récapitulatif</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span style={{ color: t.textMuted }}>Destination</span>
                      <span style={{ color: t.text }}>{transport?.destination?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: t.textMuted }}>Vol</span>
                      <span style={{ color: t.text }}>{transport?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: t.textMuted }}>Trajet</span>
                      <span style={{ color: t.text }}>{tripType === 'round_trip' ? 'Aller-retour' : 'Aller simple'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: t.textMuted }}>Voyageurs</span>
                      <span style={{ color: t.text }}>{totalTravelers}</span>
                    </div>
                    <div style={{ borderColor: t.border }} className="flex justify-between pt-2 border-t">
                      <span style={{ color: t.textMuted }}>Prix unitaire</span>
                      <span style={{ color: t.text }}>{parseFloat(transport?.price || 0).toFixed(2)} DA</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span style={{ color: t.primary }}>Total</span>
                      <span style={{ color: t.primary }}>{totalPrice.toFixed(2)} DA</span>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label style={{ color: t.text }} className="font-medium mb-3 block">Mode de paiement</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Chargily */}
                    <button
                      onClick={() => setPaymentMethod('chargily')}
                      className={`p-4 rounded-3xl font-medium transition border-2 flex flex-col items-center gap-2`}
                      style={{
                        borderColor: paymentMethod === 'chargily' ? t.primary : t.border,
                        backgroundColor: paymentMethod === 'chargily' ? `${t.primary}1a` : t.bgBadge,
                        color: paymentMethod === 'chargily' ? t.primary : t.textMuted
                      }}
                    >
                      <Smartphone className="w-6 h-6" />
                      <span className="text-sm text-center">Carte Edahabia / CIB</span>
                    </button>
                    
                    {/* Stripe */}
                    <button
                      onClick={() => setPaymentMethod('stripe')}
                      className={`p-4 rounded-3xl font-medium transition border-2 flex flex-col items-center gap-2`}
                      style={{
                        borderColor: paymentMethod === 'stripe' ? t.primary : t.border,
                        backgroundColor: paymentMethod === 'stripe' ? `${t.primary}1a` : t.bgBadge,
                        color: paymentMethod === 'stripe' ? t.primary : t.textMuted
                      }}
                    >
                      <CreditCard className="w-6 h-6" />
                      <span className="text-sm text-center">Carte Bancaire</span>
                    </button>
                    
                    {/* Pay on Arrival */}
                    <button
                      onClick={() => setPaymentMethod('on_arrival')}
                      className={`p-4 rounded-3xl font-medium transition border-2 flex flex-col items-center gap-2`}
                      style={{
                        borderColor: paymentMethod === 'on_arrival' ? t.primary : t.border,
                        backgroundColor: paymentMethod === 'on_arrival' ? `${t.primary}1a` : t.bgBadge,
                        color: paymentMethod === 'on_arrival' ? t.primary : t.textMuted
                      }}
                    >
                      <Banknote className="w-6 h-6" />
                      <span className="text-sm text-center">Payer à l'arrivée</span>
                    </button>
                  </div>
                </div>

                {/* Payment Info */}
                {paymentMethod === 'chargily' && (
                  <div style={{ backgroundColor: isDark ? '#2d7a5a0d' : '#f7f5f080', borderColor: t.border }} className="border rounded-full px-6 py-4">
                    <p style={{ color: t.textMuted }} className="text-sm">
                      Vous serez redirigé vers la page de paiement sécurisée de Chargily pour payer avec votre carte Edahabia ou CIB.
                    </p>
                  </div>
                )}

                {paymentMethod === 'stripe' && (
                  <div style={{ backgroundColor: isDark ? '#2d7a5a0d' : '#f7f5f080', borderColor: t.border }} className="border rounded-full px-6 py-4">
                    <p style={{ color: t.textMuted }} className="text-sm">
                      Vous serez redirigé vers la page de paiement sécurisée de Stripe pour payer avec votre carte bancaire internationale.
                    </p>
                    <div style={{ color: t.textMuted }} className="mt-3 flex items-center gap-2 text-xs">
                      <CheckCircle className="w-4 h-4" />
                      <span>Paiement 100% sécurisé par Stripe</span>
                    </div>
                  </div>
                )}

                {paymentMethod === 'on_arrival' && (
                  <div style={{ backgroundColor: isDark ? '#2d7a5a0d' : '#f7f5f080', borderColor: t.border }} className="border rounded-full px-6 py-4">
                    <p style={{ color: t.textMuted }} className="text-sm">
                      Votre réservation sera enregistrée avec le statut "En attente de paiement". Vous paierez directement sur place.
                    </p>
                  </div>
                )}

                {error && (
                  <div className="bg-[#fef2f2] border border-[#fca5a5] rounded-full px-6 py-4">
                    <p className="text-[#dc2626] text-sm">{error}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        {step < 4 && (
          <div style={{ borderColor: t.border }} className="flex items-center justify-between p-6 border-t">
            {step > 1 ? (
              <button
                onClick={handlePrevStep}
                style={{ color: t.textMuted }}
                className="flex items-center gap-2 hover:opacity-70 transition px-4 py-2"
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

export default FlightReservationModal;
