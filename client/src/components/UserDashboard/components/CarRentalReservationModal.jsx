import React, { useState } from 'react';
import { X, Car, ChevronRight, ChevronLeft, Calendar, CreditCard, CheckCircle, Smartphone, Banknote, MapPin, Clock, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { generateAndDownloadBonReservation } from '../../../utils/generateBonReservation';
import { useTheme } from '../../../contexts/ThemeContext';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

const CarRentalReservationModal = ({ isOpen, onClose, transport, user }) => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [step, setStep] = useState(1);
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [pickupTime, setPickupTime] = useState('10:00');
  const [returnTime, setReturnTime] = useState('10:00');
  const [paymentMethod, setPaymentMethod] = useState('chargily');
  const [driverDetails, setDriverDetails] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: user?.phone || '',
    licenseNumber: '',
    licenseExpiry: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [reservationComplete, setReservationComplete] = useState(false);
  const [confirmationNumber, setConfirmationNumber] = useState('');
  const [invoiceData, setInvoiceData] = useState(null);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // Initialize default dates
  React.useEffect(() => {
    if (isOpen) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      setPickupDate(tomorrow.toISOString().split('T')[0]);

      const returnDateObj = new Date(tomorrow);
      returnDateObj.setDate(tomorrow.getDate() + 3);
      setReturnDate(returnDateObj.toISOString().split('T')[0]);

      setStep(1);
      setReservationComplete(false);
      setError('');
      setInvoiceData(null);
    }
  }, [isOpen]);

  const rentalDays = pickupDate && returnDate 
    ? Math.max(1, Math.ceil((new Date(returnDate) - new Date(pickupDate)) / (1000 * 60 * 60 * 24))) + 1
    : 1;

  const unitPrice = transport ? parseFloat(transport.price) : 0;
  const totalPrice = unitPrice * rentalDays;

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

  const updateDriverDetail = (field, value) => {
    setDriverDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleChargilyPayment = async (reservation) => {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.post(`${API_URL}/api/payment/create-chargily-checkout`, {
        amount: totalPrice,
        currency: 'dzd',
        reservationId: reservation.id,
        customer: {
          name: `${driverDetails.firstName || ''} ${driverDetails.lastName || ''}`.trim(),
          email: driverDetails.email || '',
          phone: driverDetails.phone || ''
        }
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
      } else {
        throw new Error('URL de paiement non reçue du serveur');
      }
    } catch (error) {
      let errorMsg = 'Erreur lors de la création du paiement Chargily';

      if (error.response?.data?.details) {
        errorMsg = error.response.data.details;
      } else if (error.response?.data?.error) {
        errorMsg = error.response.data.error;
      } else if (error.message) {
        errorMsg = error.message;
      }

      if (error.code === 'ERR_NETWORK') {
        errorMsg = "Le serveur backend n'est pas accessible. Veuillez vérifier que le serveur est démarré (port 3000).";
      }

      throw new Error(errorMsg);
    }
  };

  const handleStripePayment = async (reservation) => {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.post(`${API_URL}/api/payment/create-stripe-checkout`, {
        amount: totalPrice,
        currency: 'dzd',
        reservationId: reservation.id
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.details || error.response?.data?.error || error.message || 'Erreur lors de la création du paiement Stripe';
      throw new Error(errorMessage);
    }
  };

  const submitReservation = async () => {
    setIsProcessing(true);
    setError('');

    try {
      const token = localStorage.getItem('token');

      // 1. Créer la réservation
      const reservationResponse = await axios.post(`${API_URL}/api/reservations/car-rental`, {
        transport_id: transport.id,
        pickup_date: pickupDate,
        return_date: returnDate,
        pickup_time: pickupTime,
        return_time: returnTime,
        driver_details: driverDetails,
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

      // 2. Paiement Chargily ou Stripe → redirection
      if (paymentMethod === 'chargily') {
        await handleChargilyPayment(reservation);
        return;
      } else if (paymentMethod === 'stripe') {
        await handleStripePayment(reservation);
        return;
      }

      // 3. Paiement "on_arrival" : on ne fait AUCUN appel au backend pour récupérer la facture
      // Le backend a déjà créé la facture en base. On génère le bon localement avec les données qu'on a.
      
      const localInvoiceData = {
        invoice_number: `INV-${Date.now().toString().slice(-6)}`,
        amount: totalPrice,
        currency: 'DZD',
        payment_method: paymentMethod,
        payment_status: 'pending',
        customer_name: `${driverDetails.firstName || ''} ${driverDetails.lastName || ''}`.trim(),
        customer_email: driverDetails.email || '',
        customer_phone: driverDetails.phone || '',
        invoice_details: {
          destination: transport?.destination?.name || '',
          transportName: transport?.name || '',
          carModel: transport?.car_model || '',
          rentalAgency: transport?.rental_agency || '',
          pickupLocation: transport?.pickup_location || '',
          pickupDate: pickupDate,
          returnDate: returnDate,
          rentalDays: rentalDays,
          unitPrice: transport?.price || 0
        }
      };

      setInvoiceData(localInvoiceData);
      generateAndDownloadBonReservation(reservation, localInvoiceData);

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
            <p style={{ color: t.textMuted }} className="mb-6">Votre réservation de voiture a été enregistrée avec succès.</p>

            <div style={{ backgroundColor: isDark ? '#2d7a5a1a' : '#f7f5f0' }} className="rounded-full p-6 mb-6">
              <p style={{ color: t.textMuted }} className="text-sm mb-2">Numéro de confirmation</p>
              <p style={{ color: t.primary }} className="text-2xl font-bold">{confirmationNumber}</p>
            </div>

            {invoiceData && (
              <div style={{ backgroundColor: isDark ? '#2d7a5a1a' : '#f7f5f0' }} className="rounded-full p-4 mb-6">
                <p style={{ color: t.textMuted }} className="text-sm mb-2">Numéro de facture</p>
                <p style={{ color: t.text }} className="text-lg font-bold">{invoiceData.invoice_number}</p>
                <p style={{ color: t.textMuted }} className="text-xs mt-2">Le bon de réservation a été téléchargé automatiquement</p>
              </div>
            )}

            <div className="text-left space-y-3 mb-6">
              <div className="flex justify-between">
                <span style={{ color: t.textMuted }}>Voiture</span>
                <span style={{ color: t.text }} className="font-medium">{transport?.car_model || transport?.name}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: t.textMuted }}>Agence</span>
                <span style={{ color: t.text }} className="font-medium">{transport?.rental_agency || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: t.textMuted }}>Durée</span>
                <span style={{ color: t.text }} className="font-medium">{rentalDays} jour(s)</span>
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
            <h2 style={{ color: t.text }} className="text-xl font-bold">Réserver votre voiture</h2>
            <p style={{ color: t.textMuted }} className="text-sm mt-1">{transport?.name} - {transport?.car_model}</p>
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
                  {s === 1 ? 'Dates' : s === 2 ? 'Conducteur' : 'Paiement'}
                </span>
              </div>
              {s < 3 && <div className={`w-12 h-0.5`} style={{ backgroundColor: step > s ? t.primary : t.bgBadge }} />}
            </React.Fragment>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {/* Step 1: Date Selection */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Car Info Banner */}
                <div style={{ borderColor: t.border, background: `linear-gradient(to right, ${t.primary}1a, transparent)` }} className="border rounded-full p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p style={{ color: t.primary }} className="font-bold text-lg">{transport?.car_model || transport?.name}</p>
                      <p style={{ color: t.textMuted }} className="text-sm">{transport?.rental_agency || 'Agence de location'}</p>
                    </div>
                    <Car className="w-8 h-8 text-[#2d7a5a]" />
                  </div>
                </div>

                {/* Pickup Location */}
                {transport?.pickup_location && (
                  <div>
                    <label style={{ color: t.textMuted }} className="text-sm mb-2 block">Lieu de récupération</label>
                    <div style={{ backgroundColor: t.bgInput, borderColor: t.border, color: t.text }} className="border rounded-full px-4 py-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#2d7a5a]" />
                      {transport.pickup_location}
                    </div>
                  </div>
                )}

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label style={{ color: t.text }} className="font-medium mb-2 block flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Date de récupération
                    </label>
                    <input
                      type="date"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      style={{ backgroundColor: t.bgInput, borderColor: t.border, color: t.text }}
                      className="w-full border rounded-full px-4 py-3 outline-none focus:border-[#2d7a5a]"
                    />
                  </div>
                  <div>
                    <label style={{ color: t.text }} className="font-medium mb-2 block flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Date de retour
                    </label>
                    <input
                      type="date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      min={pickupDate}
                      style={{ backgroundColor: t.bgInput, borderColor: t.border, color: t.text }}
                      className="w-full border rounded-full px-4 py-3 outline-none focus:border-[#2d7a5a]"
                    />
                  </div>
                </div>

                {/* Times */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label style={{ color: t.text }} className="font-medium mb-2 block flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Heure de récupération
                    </label>
                    <input
                      type="time"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      style={{ backgroundColor: t.bgInput, borderColor: t.border, color: t.text }}
                      className="w-full border rounded-full px-4 py-3 outline-none focus:border-[#2d7a5a]"
                    />
                  </div>
                  <div>
                    <label style={{ color: t.text }} className="font-medium mb-2 block flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Heure de retour
                    </label>
                    <input
                      type="time"
                      value={returnTime}
                      onChange={(e) => setReturnTime(e.target.value)}
                      style={{ backgroundColor: t.bgInput, borderColor: t.border, color: t.text }}
                      className="w-full border rounded-full px-4 py-3 outline-none focus:border-[#2d7a5a]"
                    />
                  </div>
                </div>

                {/* Price Summary */}
                <div style={{ backgroundColor: t.bgInput, borderColor: t.border }} className="border rounded-3xl p-6">
                  <div className="flex justify-between items-center mb-2">
                    <span style={{ color: t.textMuted }}>Prix par jour</span>
                    <span style={{ color: t.text }}>{unitPrice.toFixed(2)} DA</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span style={{ color: t.textMuted }}>Durée</span>
                    <span style={{ color: t.text }}>{rentalDays} jour(s)</span>
                  </div>
                  <div style={{ borderColor: t.border }} className="flex justify-between items-center pt-2 border-t">
                    <span style={{ color: t.textMuted }}>Total</span>
                    <span style={{ color: t.primary }} className="font-bold text-lg">{totalPrice.toFixed(2)} DA</span>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleNextStep}
                    className="w-full bg-[#2d7a5a] text-black font-bold py-3 rounded-full hover:bg-[#1a4a36] transition flex items-center justify-center gap-2"
                  >
                    Suivant
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Driver Details */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h3 style={{ color: t.text }} className="text-lg font-bold mb-4">Informations du conducteur</h3>

                <div style={{ backgroundColor: isDark ? '#2d7a5a0d' : '#f7f5f080', borderColor: t.border }} className="border rounded-3xl p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label style={{ color: t.textMuted }} className="text-xs mb-1 block">Prénom *</label>
                      <input
                        type="text"
                        value={driverDetails.firstName}
                        onChange={(e) => updateDriverDetail('firstName', e.target.value)}
                        style={{ backgroundColor: t.bgBadge, borderColor: t.border, color: t.text }}
                        className="w-full border rounded-full px-4 py-2 text-sm focus:border-[#2d7a5a] outline-none"
                        placeholder="Prénom"
                      />
                    </div>
                    <div>
                      <label style={{ color: t.textMuted }} className="text-xs mb-1 block">Nom *</label>
                      <input
                        type="text"
                        value={driverDetails.lastName}
                        onChange={(e) => updateDriverDetail('lastName', e.target.value)}
                        style={{ backgroundColor: t.bgBadge, borderColor: t.border, color: t.text }}
                        className="w-full border rounded-full px-4 py-2 text-sm focus:border-[#2d7a5a] outline-none"
                        placeholder="Nom"
                      />
                    </div>
                    <div>
                      <label style={{ color: t.textMuted }} className="text-xs mb-1 block">Email *</label>
                      <input
                        type="email"
                        value={driverDetails.email}
                        onChange={(e) => updateDriverDetail('email', e.target.value)}
                        style={{ backgroundColor: t.bgBadge, borderColor: t.border, color: t.text }}
                        className="w-full border rounded-full px-4 py-2 text-sm focus:border-[#2d7a5a] outline-none"
                        placeholder="Email"
                      />
                    </div>
                    <div>
                      <label style={{ color: t.textMuted }} className="text-xs mb-1 block">Téléphone *</label>
                      <input
                        type="tel"
                        value={driverDetails.phone}
                        onChange={(e) => updateDriverDetail('phone', e.target.value)}
                        style={{ backgroundColor: t.bgBadge, borderColor: t.border, color: t.text }}
                        className="w-full border rounded-full px-4 py-2 text-sm focus:border-[#2d7a5a] outline-none"
                        placeholder="Téléphone"
                      />
                    </div>
                    <div className="col-span-2">
                      <label style={{ color: t.textMuted }} className="text-xs mb-1 block">Numéro de permis de conduire *</label>
                      <input
                        type="text"
                        value={driverDetails.licenseNumber}
                        onChange={(e) => updateDriverDetail('licenseNumber', e.target.value)}
                        style={{ backgroundColor: t.bgBadge, borderColor: t.border, color: t.text }}
                        className="w-full border rounded-full px-4 py-2 text-sm focus:border-[#2d7a5a] outline-none"
                        placeholder="Numéro de permis"
                      />
                    </div>
                    <div className="col-span-2">
                      <label style={{ color: t.textMuted }} className="text-xs mb-1 block">Date d'expiration du permis *</label>
                      <input
                        type="date"
                        value={driverDetails.licenseExpiry}
                        onChange={(e) => updateDriverDetail('licenseExpiry', e.target.value)}
                        style={{ backgroundColor: t.bgBadge, borderColor: t.border, color: t.text }}
                        className="w-full border rounded-full px-4 py-2 text-sm focus:border-[#2d7a5a] outline-none"
                      />
                    </div>
                  </div>
                </div>

                {transport?.deposit && (
                  <div style={{ backgroundColor: isDark ? '#2d7a5a1a' : '#fffbeb', borderColor: isDark ? t.border : '#fef3c7' }} className="border rounded-full px-6 py-4">
                    <div className="flex items-center gap-2 text-amber-600">
                      <DollarSign className="w-5 h-5" />
                      <span className="text-sm font-medium">Caution requise : {transport.deposit}DA (à payer sur place)</span>
                    </div>
                  </div>
                )}
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
                      <span style={{ color: t.textMuted }}>Voiture</span>
                      <span style={{ color: t.text }}>{transport?.car_model || transport?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: t.textMuted }}>Agence</span>
                      <span style={{ color: t.text }}>{transport?.rental_agency || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: t.textMuted }}>Récupération</span>
                      <span style={{ color: t.text }}>{pickupDate} à {pickupTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: t.textMuted }}>Retour</span>
                      <span style={{ color: t.text }}>{returnDate} à {returnTime}</span>
                    </div>
                    <div style={{ borderColor: t.border }} className="flex justify-between pt-2 border-t">
                      <span style={{ color: t.textMuted }}>Prix par jour</span>
                      <span style={{ color: t.text }}>{unitPrice.toFixed(2)} DA</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: t.textMuted }}>Durée</span>
                      <span style={{ color: t.text }}>{rentalDays} jour(s)</span>
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
                      <span className="text-sm text-center">Payer à la prise en charge</span>
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
                      Votre réservation sera enregistrée avec le statut "En attente de paiement". Vous paierez directement lors de la prise en charge du véhicule.
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

export default CarRentalReservationModal;