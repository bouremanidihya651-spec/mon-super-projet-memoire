import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Calendar, CreditCard, CheckCircle, Users, Clock, MapPin, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { generateAndDownloadInvoice } from '../../../utils/generateFacture';
import { generateAndDownloadBonReservation } from '../../../utils/generateBonReservation';

const ActivityReservationModal = ({ isOpen, onClose, activity, user }) => {
  const [step, setStep] = useState(1);
  const [activityDate, setActivityDate] = useState('');
  const [activityTime, setActivityTime] = useState('09:00');
  const [participants, setParticipants] = useState({ adults: 2, children: 0 });
  const [paymentMethod, setPaymentMethod] = useState('chargily');
  const [participantDetails, setParticipantDetails] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: user?.phone || '',
    specialRequests: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [reservationComplete, setReservationComplete] = useState(false);
  const [confirmationNumber, setConfirmationNumber] = useState('');
  const [invoiceData, setInvoiceData] = useState(null);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      setActivityDate(tomorrow.toISOString().split('T')[0]);
      setStep(1);
      setReservationComplete(false);
      setError('');
    }
  }, [isOpen]);

  const totalParticipants = participants.adults + participants.children;
  const unitPrice = activity ? parseFloat(activity.price) : 0;
  const totalPrice = unitPrice * totalParticipants;

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

  const updateParticipantDetail = (field, value) => {
    setParticipantDetails(prev => ({ ...prev, [field]: value }));
  };

  const createInvoice = async (reservation, paymentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

      const invoiceData = {
        invoice_number: invoiceNumber,
        reservation_id: reservation.id,
        amount: totalPrice,
        currency: 'DZD',
        payment_method: paymentMethod,
        payment_status: paymentStatus,
        customer_name: `${participantDetails.firstName || ''} ${participantDetails.lastName || ''}`.trim(),
        customer_email: participantDetails.email || '',
        customer_phone: participantDetails.phone || '',
        invoice_details: {
          destination: activity?.destination?.name || '',
          activityName: activity?.name || '',
          activityDate: activityDate,
          activityTime: activityTime,
          duration: activity?.duration || 'N/A',
          adults: participants.adults,
          children: participants.children,
          unitPrice: activity?.price || 0
        }
      };

      const response = await axios.post('${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/reservations/create-invoice', invoiceData, {
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

      const response = await axios.post('${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/payment/create-chargily-checkout', {
        amount: totalPrice,
        currency: 'dzd',
        reservationId: reservation.id,
        customer: {
          name: `${participantDetails.firstName || ''} ${participantDetails.lastName || ''}`.trim(),
          email: participantDetails.email || '',
          phone: participantDetails.phone || ''
        }
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

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

      const response = await axios.post('${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/payment/create-stripe-checkout', {
        amount: totalPrice,
        currency: 'dzd',
        reservationId: reservation.id
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

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

      const reservationResponse = await axios.post('${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/reservations/activity', {
        activity_id: activity.id,
        activity_date: activityDate,
        activity_time: activityTime,
        adults: participants.adults,
        children: participants.children,
        participant_details: participantDetails,
        payment_method: paymentMethod,
        notes: participantDetails.specialRequests
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const reservation = reservationResponse.data.reservation;
      setConfirmationNumber(reservation.confirmation_number);

      if (paymentMethod === 'chargily') {
        await handleChargilyPayment(reservation);
        return;
      } else if (paymentMethod === 'stripe') {
        await handleStripePayment(reservation);
        return;
      }

      const paymentStatus = 'pending';
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

  if (step === 4) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#f7f5f0] border border-[#e0dcd4] w-full max-w-lg rounded-3xl p-8 shadow-2xl relative"
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-[#6b8f7b] hover:text-[#1a4a36]">
            <X className="w-6 h-6" />
          </button>

          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-[#2d7a5a]/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-[#2d7a5a]" />
            </div>

            <h2 className="text-2xl font-bold text-[#1a4a36] mb-2">Réservation Confirmée !</h2>
            <p className="text-[#6b8f7b] mb-6">Votre réservation d'activité a été enregistrée avec succès.</p>

            <div className="bg-[#f7f5f0]/50 rounded-full p-6 mb-6">
              <p className="text-[#6b8f7b] text-sm mb-2">Numéro de confirmation</p>
              <p className="text-2xl font-bold text-[#2d7a5a]">{confirmationNumber}</p>
            </div>

            {invoiceData && (
              <div className="bg-[#f7f5f0]/50 rounded-full p-4 mb-6">
                <p className="text-[#6b8f7b] text-sm mb-2">Numéro de facture</p>
                <p className="text-lg font-bold text-[#1a4a36]">{invoiceData.invoice_number}</p>
                <p className="text-xs text-[#6b8f7b] mt-2">La facture a été téléchargée automatiquement</p>
              </div>
            )}

            <div className="text-left space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-[#6b8f7b]">Activité</span>
                <span className="text-[#1a4a36] font-medium">{activity?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6b8f7b]">Date</span>
                <span className="text-[#1a4a36] font-medium">{activityDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6b8f7b]">Participants</span>
                <span className="text-[#1a4a36] font-medium">{totalParticipants}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6b8f7b]">Total</span>
                <span className="text-[#2d7a5a] font-bold">{totalPrice.toFixed(2)} DA</span>
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
            <h2 className="text-xl font-bold text-[#1a4a36]">Réserver votre activité</h2>
            <p className="text-[#6b8f7b] text-sm mt-1">{activity?.name}</p>
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
                  {s === 1 ? 'Date' : s === 2 ? 'Participants' : 'Paiement'}
                </span>
              </div>
              {s < 3 && <div className={`w-12 h-0.5 ${step > s ? 'bg-[#2d7a5a]' : 'bg-[#e8e4de]'}`} />}
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
                {/* Activity Info Banner */}
                <div className="bg-gradient-to-r from-[#2d7a5a]/10 to-transparent border border-[#e0dcd4] rounded-full p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#2d7a5a] font-bold text-lg">{activity?.name}</p>
                      <p className="text-[#6b8f7b] text-sm">{activity?.duration || 'Durée non spécifiée'}</p>
                    </div>
                  </div>
                </div>

                {/* Location */}
                {activity?.location && (
                  <div>
                    <label className="text-[#6b8f7b] text-sm mb-2 block">Localisation</label>
                    <div className="bg-[#f7f5f0] border border-[#e0dcd4] rounded-full px-4 py-3 text-[#1a4a36] flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#2d7a5a]" />
                      {activity.location}
                    </div>
                  </div>
                )}

                {/* Date */}
                <div>
                  <label className="text-[#1a4a36] font-medium mb-2 block flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date de l'activité
                  </label>
                  <input
                    type="date"
                    value={activityDate}
                    onChange={(e) => setActivityDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-[#f7f5f0] border border-[#e0dcd4] rounded-full px-4 py-3 text-[#1a4a36] focus:border-[#2d7a5a] outline-none"
                  />
                </div>

                {/* Time */}
                <div>
                  <label className="text-[#1a4a36] font-medium mb-2 block flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Heure de début
                  </label>
                  <input
                    type="time"
                    value={activityTime}
                    onChange={(e) => setActivityTime(e.target.value)}
                    className="w-full bg-[#f7f5f0] border border-[#e0dcd4] rounded-full px-4 py-3 text-[#1a4a36] focus:border-[#2d7a5a] outline-none"
                  />
                </div>

                {/* Participants */}
                <div>
                  <label className="text-[#1a4a36] font-medium mb-3 block flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Participants
                  </label>
                  <div className="bg-[#f7f5f0] border border-[#e0dcd4] rounded-full p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[#1a4a36] font-medium">Adultes</p>
                        <p className="text-[#6b8f7b] text-xs">(18 ans et +)</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setParticipants(p => ({ ...p, adults: Math.max(1, p.adults - 1) }))}
                          className="w-10 h-10 rounded-full bg-[#e8e4de] text-[#1a4a36] hover:bg-[#d0ccc4] transition"
                        >
                          -
                        </button>
                        <span className="text-[#1a4a36] font-bold w-8 text-center">{participants.adults}</span>
                        <button
                          onClick={() => setParticipants(p => ({ ...p, adults: p.adults + 1 }))}
                          className="w-10 h-10 rounded-full bg-[#e8e4de] text-[#1a4a36] hover:bg-[#d0ccc4] transition"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[#1a4a36] font-medium">Enfants</p>
                        <p className="text-[#6b8f7b] text-xs">(0-17 ans)</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setParticipants(p => ({ ...p, children: Math.max(0, p.children - 1) }))}
                          className="w-10 h-10 rounded-full bg-[#e8e4de] text-[#1a4a36] hover:bg-[#d0ccc4] transition"
                        >
                          -
                        </button>
                        <span className="text-[#1a4a36] font-bold w-8 text-center">{participants.children}</span>
                        <button
                          onClick={() => setParticipants(p => ({ ...p, children: p.children + 1 }))}
                          className="w-10 h-10 rounded-full bg-[#e8e4de] text-[#1a4a36] hover:bg-[#d0ccc4] transition"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#e0dcd4]">
                      <button
                        onClick={handleNextStep}
                        className="w-full bg-[#2d7a5a] text-black font-bold py-3 rounded-full hover:bg-[#1a4a36] transition flex items-center justify-center gap-2"
                      >
                        Suivant
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Price Summary */}
                <div className="bg-[#f7f5f0] border border-[#e0dcd4] rounded-full p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[#6b8f7b]">Prix par personne</span>
                    <span className="text-[#1a4a36]">{unitPrice.toFixed(2)} DA</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[#6b8f7b]">Participants</span>
                    <span className="text-[#1a4a36]">{totalParticipants}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-[#e0dcd4]">
                    <span className="text-[#6b8f7b]">Total</span>
                    <span className="text-[#2d7a5a] font-bold text-lg">{totalPrice.toFixed(2)} DA</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Participant Details */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-bold text-[#1a4a36] mb-4">Informations des participants</h3>

                <div className="bg-[#f7f5f0]/50 border border-[#e0dcd4] rounded-full p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[#6b8f7b] text-xs mb-1 block">Prénom *</label>
                      <input
                        type="text"
                        value={participantDetails.firstName}
                        onChange={(e) => updateParticipantDetail('firstName', e.target.value)}
                        className="w-full bg-[#e8e4de] border border-[#d0ccc4] rounded-full px-3 py-2 text-[#1a4a36] text-sm focus:border-[#2d7a5a] outline-none"
                        placeholder="Prénom"
                      />
                    </div>
                    <div>
                      <label className="text-[#6b8f7b] text-xs mb-1 block">Nom *</label>
                      <input
                        type="text"
                        value={participantDetails.lastName}
                        onChange={(e) => updateParticipantDetail('lastName', e.target.value)}
                        className="w-full bg-[#e8e4de] border border-[#d0ccc4] rounded-full px-3 py-2 text-[#1a4a36] text-sm focus:border-[#2d7a5a] outline-none"
                        placeholder="Nom"
                      />
                    </div>
                    <div>
                      <label className="text-[#6b8f7b] text-xs mb-1 block">Email *</label>
                      <input
                        type="email"
                        value={participantDetails.email}
                        onChange={(e) => updateParticipantDetail('email', e.target.value)}
                        className="w-full bg-[#e8e4de] border border-[#d0ccc4] rounded-full px-3 py-2 text-[#1a4a36] text-sm focus:border-[#2d7a5a] outline-none"
                        placeholder="Email"
                      />
                    </div>
                    <div>
                      <label className="text-[#6b8f7b] text-xs mb-1 block">Téléphone *</label>
                      <input
                        type="tel"
                        value={participantDetails.phone}
                        onChange={(e) => updateParticipantDetail('phone', e.target.value)}
                        className="w-full bg-[#e8e4de] border border-[#d0ccc4] rounded-full px-3 py-2 text-[#1a4a36] text-sm focus:border-[#2d7a5a] outline-none"
                        placeholder="Téléphone"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[#6b8f7b] text-xs mb-1 block">Demandes spéciales</label>
                      <textarea
                        value={participantDetails.specialRequests}
                        onChange={(e) => updateParticipantDetail('specialRequests', e.target.value)}
                        className="w-full bg-[#e8e4de] border border-[#d0ccc4] rounded-full px-3 py-2 text-[#1a4a36] text-sm focus:border-[#2d7a5a] outline-none resize-none"
                        placeholder="Restrictions alimentaires, besoins spécifiques, etc."
                        rows={3}
                      />
                    </div>
                  </div>
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
                      <span className="text-[#6b8f7b]">Activité</span>
                      <span className="text-[#1a4a36]">{activity?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6b8f7b]">Date</span>
                      <span className="text-[#1a4a36]">{activityDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6b8f7b]">Heure</span>
                      <span className="text-[#1a4a36]">{activityTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6b8f7b]">Participants</span>
                      <span className="text-[#1a4a36]">{totalParticipants} ({participants.adults} adultes, {participants.children} enfants)</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-[#e0dcd4]">
                      <span className="text-[#6b8f7b]">Total</span>
                      <span className="text-[#2d7a5a] font-bold">{totalPrice.toFixed(2)} DA</span>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="text-[#1a4a36] font-medium mb-3 block flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Méthode de paiement
                  </label>
                  <div className="space-y-3">
                    <button
                      onClick={() => setPaymentMethod('chargily')}
                      className={`w-full p-4 rounded-full border text-left transition ${
                        paymentMethod === 'chargily'
                          ? 'border-[#2d7a5a] bg-[#2d7a5a]/10'
                          : 'border-[#d0ccc4] bg-[#e8e4de] hover:border-[#d0ccc4]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[#1a4a36] font-medium">Chargily (Algérie)</p>
                          <p className="text-[#6b8f7b] text-xs">Paiement sécurisé en DZD</p>
                        </div>
                        <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center">
                          {paymentMethod === 'chargily' && <div className="w-3 h-3 rounded-full bg-[#2d7a5a]" />}
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => setPaymentMethod('stripe')}
                      className={`w-full p-4 rounded-full border text-left transition ${
                        paymentMethod === 'stripe'
                          ? 'border-[#2d7a5a] bg-[#2d7a5a]/10'
                          : 'border-[#d0ccc4] bg-[#e8e4de] hover:border-[#d0ccc4]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[#1a4a36] font-medium">Stripe (International)</p>
                          <p className="text-[#6b8f7b] text-xs">Paiement par carte bancaire</p>
                        </div>
                        <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center">
                          {paymentMethod === 'stripe' && <div className="w-3 h-3 rounded-full bg-[#2d7a5a]" />}
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => setPaymentMethod('on_arrival')}
                      className={`w-full p-4 rounded-full border text-left transition ${
                        paymentMethod === 'on_arrival'
                          ? 'border-[#2d7a5a] bg-[#2d7a5a]/10'
                          : 'border-[#d0ccc4] bg-[#e8e4de] hover:border-[#d0ccc4]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[#1a4a36] font-medium">Payer sur place</p>
                          <p className="text-[#6b8f7b] text-xs">Paiement avant l'activité</p>
                        </div>
                        <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center">
                          {paymentMethod === 'on_arrival' && <div className="w-3 h-3 rounded-full bg-[#2d7a5a]" />}
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-[#fef2f2] border border-[#fca5a5] rounded-full p-4 text-[#dc2626] text-sm">
                    {error}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#e0dcd4] flex justify-between gap-4">
          {step > 1 ? (
            <button
              onClick={handlePrevStep}
              className="px-6 py-3 rounded-full font-medium text-[#6b8f7b] hover:text-[#1a4a36] hover:bg-[#e8e4de] transition flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              Retour
            </button>
          ) : (
            <div />
          )}
          <button
            onClick={handleNextStep}
            disabled={isProcessing}
            className="flex-1 sm:flex-none bg-[#2d7a5a] text-black font-bold py-3 px-8 rounded-full hover:bg-[#1a4a36] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {step === 3 ? (
              isProcessing ? (
                <span>Traitement...</span>
              ) : (
                <>
                  Confirmer | {totalPrice.toFixed(2)} DA
                  <CheckCircle className="w-5 h-5" />
                </>
              )
            ) : (
              <>
                Suivant
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ActivityReservationModal;


