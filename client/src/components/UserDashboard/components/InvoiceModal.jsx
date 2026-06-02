import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, CheckCircle, Download, FileText, Calendar, 
  CreditCard, MapPin, ArrowRight, Loader2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { generateAndDownloadInvoice } from '../../../utils/generateFacture';
import { generateAndDownloadBonReservation } from '../../../utils/generateBonReservation';
import axios from 'axios';

const InvoiceModal = ({ isOpen, reservationId, onClose, reservationData }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState(null);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    if (isOpen && reservationId) {
      // Si on a déjà les données de réservation (passées en props), on les utilise directement
      if (reservationData) {
        buildLocalInvoice(reservationData);
      } else {
        // Sinon on essaie de récupérer, mais on ne bloque pas en cas d'erreur
        fetchInvoiceSafe();
      }
    }
  }, [isOpen, reservationId, reservationData]);

  // Version sécurisée : si le backend plante, on génère localement
  const fetchInvoiceSafe = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      // Essayer de récupérer la réservation d'abord
      let reservation = null;
      try {
        const resResponse = await axios.get(
          `${API_URL}/api/reservations/${reservationId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        reservation = resResponse.data;
      } catch (e) {
        console.warn('Could not fetch reservation:', e.message);
      }

      // Essayer de récupérer la facture
      let invoiceData = null;
      try {
        const invResponse = await axios.get(
          `${API_URL}/api/reservations/invoice/${reservationId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (invResponse.data?.success && invResponse.data?.invoice) {
          invoiceData = invResponse.data.invoice;
        }
      } catch (e) {
        console.warn('Could not fetch invoice:', e.message);
      }

      // Si on a la facture du backend → l'utiliser
      if (invoiceData) {
        setInvoice(invoiceData);
        setLoading(false);
        return;
      }

      // Sinon, si on a la réservation → générer localement
      if (reservation) {
        buildLocalInvoice(reservation);
        return;
      }

      // Dernier recours : données minimales
      setError('Impossible de charger les détails. Veuillez vérifier vos réservations dans votre profil.');
      setLoading(false);

    } catch (err) {
      console.error('Invoice fetch error:', err);
      setError('Une erreur est survenue. Veuillez réessayer plus tard.');
      setLoading(false);
    }
  };

  // Génère une invoice locale à partir des données de réservation
  const buildLocalInvoice = (reservation) => {
    const isCarRental = reservation.trip_type === 'car_rental';
    const isHotel = reservation.trip_type === 'hotel';
    const isActivity = reservation.trip_type === 'activity';
    
    const transport = reservation.transport || {};
    const hotel = reservation.hotel || {};
    const activity = reservation.activity || {};
    
    // Calculer les jours de location si car_rental
    let rentalDays = 1;
    if (isCarRental && reservation.departure_date && reservation.return_date) {
      const pickup = new Date(reservation.departure_date);
      const returnD = new Date(reservation.return_date);
      rentalDays = Math.max(1, Math.ceil((returnD - pickup) / (1000 * 60 * 60 * 24))) + 1;
    }

    const localInvoice = {
      invoice_number: `INV-${Date.now().toString().slice(-6)}`,
      invoice_date: new Date().toISOString(),
      amount: reservation.total_price || 0,
      currency: 'DZD',
      payment_method: reservation.payment_method || 'on_arrival',
      payment_status: reservation.payment_status || 'pending',
      customer_name: reservation.travelers_details?.[0] 
        ? `${reservation.travelers_details[0].firstName || ''} ${reservation.travelers_details[0].lastName || ''}`.trim()
        : 'Client',
      customer_email: reservation.travelers_details?.[0]?.email || '',
      customer_phone: reservation.travelers_details?.[0]?.phone || '',
      invoice_details: {
        destination: transport.destination?.name || hotel.city || activity.city || 'N/A',
        itemName: transport.car_model || transport.name || hotel.name || activity.name || 'Réservation',
        carModel: transport.car_model || '',
        rentalAgency: transport.rental_agency || '',
        pickupLocation: transport.pickup_location || '',
        pickupDate: reservation.departure_date,
        returnDate: reservation.return_date,
        rentalDays: rentalDays,
        unitPrice: reservation.unit_price || 0,
        hotelName: hotel.name || '',
        activityName: activity.name || '',
      },
      reservation: reservation
    };

    setInvoice(localInvoice);
    setLoading(false);
  };

  const handleDownload = () => {
    if (!invoice) return;
    try {
      const isArrival = invoice.payment_method === 'on_arrival';
      if (isArrival) {
        generateAndDownloadBonReservation(invoice.reservation, invoice);
      } else {
        generateAndDownloadInvoice(invoice.reservation, invoice);
      }
    } catch (err) {
      console.error('Download error:', err);
      alert("Erreur lors de la génération du PDF.");
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white dark:bg-dark-surface rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-stone-100 dark:border-dark-border">
            <h3 className="text-lg font-bold text-[#1a4a36] dark:text-dark-text flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#2d7a5a]" />
              Confirmation de Réservation
            </h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-stone-100 dark:hover:bg-dark-border rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-stone-400" />
            </button>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-10 h-10 text-[#2d7a5a] animate-spin mb-4" />
                <p className="text-stone-500 dark:text-dark-text-muted">Préparation de votre document...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-8 h-8 text-red-500" />
                </div>
                <p className="text-stone-600 dark:text-dark-text-muted mb-6">{error}</p>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-[#2d7a5a] text-white rounded-full font-bold hover:bg-[#1a4a36] transition-colors"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Success Message */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-[#2d7a5a]" />
                  </div>
                  <h4 className="text-xl font-bold text-[#1a4a36] dark:text-dark-text mb-2">
                    {invoice.payment_status === 'paid' ? 'Paiement Réussi !' : 'Réservation Confirmée !'}
                  </h4>
                  <p className="text-stone-500 dark:text-dark-text-muted text-sm">
                    {invoice.payment_status === 'paid' 
                      ? 'Votre réservation a été confirmée. Vous pouvez maintenant télécharger votre facture.'
                      : 'Votre réservation est enregistrée. Vous paierez à la prise en charge.'}
                  </p>
                </div>

                {/* Summary Box */}
                <div className="bg-stone-50 dark:bg-dark-bg rounded-xl p-4 border border-stone-100 dark:border-dark-border">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Détails</span>
                    <span className="text-xs font-bold text-[#2d7a5a] bg-[#2d7a5a]/10 px-2 py-1 rounded">
                      {invoice.invoice_number}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="w-4 h-4 text-stone-400" />
                      <span className="text-stone-600 dark:text-dark-text-muted">Date:</span>
                      <span className="font-medium text-[#1a4a36] dark:text-dark-text ml-auto">
                        {new Date(invoice.invoice_date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <CreditCard className="w-4 h-4 text-stone-400" />
                      <span className="text-stone-600 dark:text-dark-text-muted">Montant:</span>
                      <span className="font-bold text-[#2d7a5a] ml-auto">
                        {parseFloat(invoice.amount).toLocaleString()} DA
                      </span>
                    </div>
                    {invoice.invoice_details?.destination && (
                      <div className="flex items-center gap-3 text-sm">
                        <MapPin className="w-4 h-4 text-stone-400" />
                        <span className="text-stone-600 dark:text-dark-text-muted">Destination:</span>
                        <span className="font-medium text-[#1a4a36] dark:text-dark-text ml-auto truncate max-w-[180px]">
                          {invoice.invoice_details.destination}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={handleDownload}
                  className="w-full flex items-center justify-center gap-2 bg-[#2d7a5a] text-white py-4 rounded-xl font-bold hover:bg-[#1a4a36] transition-all shadow-lg shadow-[#2d7a5a]/20 group"
                >
                  <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
                  {invoice.payment_method === 'on_arrival' ? 'Télécharger le Bon (PDF)' : 'Télécharger ma Facture (PDF)'}
                </button>
                
                <button
                  onClick={onClose}
                  className="w-full text-stone-400 hover:text-stone-600 dark:hover:text-dark-text text-sm font-medium transition-colors"
                >
                  Continuer vers mon tableau de bord
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

export default InvoiceModal;