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

const InvoiceModal = ({ isOpen, reservationId, onClose }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && reservationId) {
      fetchInvoice();
    }
  }, [isOpen, reservationId]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/reservations/${reservationId}/invoice`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setInvoice(response.data.invoice);
      } else {
        setError("Impossible de charger la facture.");
      }
    } catch (err) {
      console.error('Error fetching invoice:', err);
      setError("Une erreur est survenue lors de la récupération de votre facture.");
    } finally {
      setLoading(false);
    }
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
                  <h4 className="text-xl font-bold text-[#1a4a36] dark:text-dark-text mb-2">Paiement Réussi !</h4>
                  <p className="text-stone-500 dark:text-dark-text-muted text-sm">
                    Votre réservation a été confirmée. Vous pouvez maintenant télécharger votre facture.
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
                  Télécharger ma Facture (PDF)
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
