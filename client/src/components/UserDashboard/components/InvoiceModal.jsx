import React, { useState, useEffect } from 'react';
import { X, Download, FileText, Calendar, CreditCard, Euro, CheckCircle, MapPin, Plane, Users, Clock } from 'lucide-react';
import { generateAndDownloadInvoice } from '../../../utils/generateFacture';
import { generateAndDownloadBonReservation } from '../../../utils/generateBonReservation';
import axios from 'axios';

const InvoiceModal = ({ isOpen, reservationId, onClose }) => {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && reservationId) {
      fetchInvoice();
    }
  }, [isOpen, reservationId]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log('Fetching invoice for reservation:', reservationId);
      
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/payment/invoice-by-reservation/${reservationId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('Invoice response:', response.data);
      
      if (response.data.success && response.data.invoice) {
        setInvoice(response.data.invoice);
      } else {
        setError('Facture non trouvée');
      }
    } catch (err) {
      console.error('Error fetching invoice:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || 'Erreur lors du chargement de la facture');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = () => {
    try {
      if (!invoice || !invoice.reservation) return;
      
      const reservation = invoice.reservation;
      const invoiceData = {
        invoice_number: invoice.invoice_number,
        reservation_id: invoice.reservation_id,
        amount: invoice.amount,
        currency: invoice.currency,
        payment_method: invoice.payment_method,
        payment_status: invoice.payment_status,
        customer_name: invoice.customer_name,
        customer_email: invoice.customer_email,
        customer_phone: invoice.customer_phone,
        invoice_details: invoice.invoice_details,
        invoice_date: invoice.invoice_date
      };

      const isPayOnArrival = invoice.payment_method === 'on_arrival';
      if (isPayOnArrival) {
        generateAndDownloadBonReservation(reservation, invoiceData);
      } else {
        generateAndDownloadInvoice(reservation, invoiceData);
      }
    } catch (err) {
      console.error('Error downloading invoice:', err);
      alert('Erreur lors du téléchargement de la facture');
    }
  };

  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'chargily':
        return 'Chargily (Edahabia/CIB)';
      case 'stripe':
        return 'Carte Bancaire (Stripe)';
      case 'on_arrival':
        return 'Paiement à l\'arrivée';
      default:
        return method;
    }
  };

  // Don't render if modal is not open
  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-[#f7f5f0] border border-[#e0dcd4] rounded-3xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2d7a5a] mx-auto mb-4"></div>
          <p className="text-[#1a4a36] text-lg">Chargement de votre facture...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-[#f7f5f0] border border-[#e0dcd4] rounded-3xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#fef2f2] rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-[#dc2626]" />
            </div>
            <h3 className="text-xl font-bold text-[#1a4a36] mb-2">Erreur</h3>
            <p className="text-[#6b8f7b] mb-6">{error || 'Facture non trouvée'}</p>
            <button
              onClick={onClose}
              className="bg-[#2d7a5a] text-black px-6 py-2 rounded-full font-medium hover:bg-[#1a4a36] transition"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isPayOnArrival = invoice.payment_method === 'on_arrival';
  const documentType = isPayOnArrival ? 'Bon de Réservation' : 'Facture';

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#f7f5f0] border border-[#e0dcd4] rounded-3xl max-w-3xl w-full my-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#e0dcd4]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#2d7a5a]/20 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-[#2d7a5a]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1a4a36]">{documentType}</h2>
              <p className="text-[#6b8f7b] text-sm">{invoice.invoice_number}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#6b8f7b] hover:text-[#1a4a36] hover:bg-[#e8e4de] rounded-full transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Banner */}
          <div className={`p-4 rounded-full border ${
            invoice.payment_status === 'paid' 
              ? 'bg-[#dcfce7] border-[#86efac]' 
              : 'bg-orange-100 border-orange-300'
          }`}>
            <div className="flex items-center gap-3">
              {invoice.payment_status === 'paid' ? (
                <CheckCircle className="w-6 h-6 text-[#16a34a]" />
              ) : (
                <Clock className="w-6 h-6 text-[#c9a844]" />
              )}
              <div>
                <p className="font-bold text-[#1a4a36]">
                  {invoice.payment_status === 'paid' ? 'Paiement Confirmé' : 'Paiement en Attente'}
                </p>
                <p className="text-sm text-[#6b8f7b]">
                  {isPayOnArrival 
                    ? 'Vous paierez à votre arrivée' 
                    : 'Votre paiement a été traité avec succès'}
                </p>
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#f7f5f0] border border-[#e0dcd4] rounded-full p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-[#2d7a5a]" />
                <span className="text-[#6b8f7b] text-sm">Date d'émission</span>
              </div>
              <p className="text-[#1a4a36] font-medium">
                {new Date(invoice.invoice_date).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
            <div className="bg-[#f7f5f0] border border-[#e0dcd4] rounded-full p-4">
              <div className="flex items-center gap-2 mb-2">
                <Euro className="w-4 h-4 text-[#2d7a5a]" />
                <span className="text-[#6b8f7b] text-sm">Montant total</span>
              </div>
              <p className="text-[#2d7a5a] font-bold text-2xl">{parseFloat(invoice.amount).toFixed(2)} DA</p>
            </div>
            <div className="bg-[#f7f5f0] border border-[#e0dcd4] rounded-full p-4">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-4 h-4 text-[#2d7a5a]" />
                <span className="text-[#6b8f7b] text-sm">Méthode de paiement</span>
              </div>
              <p className="text-[#1a4a36] font-medium">{getPaymentMethodText(invoice.payment_method)}</p>
            </div>
            <div className="bg-[#f7f5f0] border border-[#e0dcd4] rounded-full p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-[#2d7a5a]" />
                <span className="text-[#6b8f7b] text-sm">Statut</span>
              </div>
              <p className={`font-medium ${
                invoice.payment_status === 'paid' ? 'text-[#16a34a]' : 'text-[#c9a844]'
              }`}>
                {invoice.payment_status === 'paid' ? 'Payé' : 'En attente'}
              </p>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-[#f7f5f0] border border-[#e0dcd4] rounded-full p-4">
            <h3 className="text-[#1a4a36] font-bold mb-3">Informations Client</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#6b8f7b]">Nom:</span>
                <span className="text-[#1a4a36]">{invoice.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6b8f7b]">Email:</span>
                <span className="text-[#1a4a36]">{invoice.customer_email}</span>
              </div>
              {invoice.customer_phone && (
                <div className="flex justify-between">
                  <span className="text-[#6b8f7b]">Téléphone:</span>
                  <span className="text-[#1a4a36]">{invoice.customer_phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Reservation Details */}
          {invoice.invoice_details && (
            <div className="bg-[#f7f5f0] border border-[#e0dcd4] rounded-full p-4">
              <h3 className="text-[#1a4a36] font-bold mb-3">Détails de la Réservation</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#2d7a5a]" />
                  <span className="text-[#6b8f7b] text-sm">Destination:</span>
                  <span className="text-[#1a4a36] font-medium">{invoice.invoice_details.destination}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Plane className="w-4 h-4 text-[#2d7a5a]" />
                  <span className="text-[#6b8f7b] text-sm">Transport:</span>
                  <span className="text-[#1a4a36] font-medium">{invoice.invoice_details.transportName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#2d7a5a]" />
                  <span className="text-[#6b8f7b] text-sm">Départ:</span>
                  <span className="text-[#1a4a36] font-medium">
                    {new Date(invoice.invoice_details.departureDate).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#2d7a5a]" />
                  <span className="text-[#6b8f7b] text-sm">Voyageurs:</span>
                  <span className="text-[#1a4a36] font-medium">
                    {invoice.invoice_details.adults + (invoice.invoice_details.children || 0) + (invoice.invoice_details.infants || 0)} 
                    ({invoice.invoice_details.adults} adultes{invoice.invoice_details.children ? `, ${invoice.invoice_details.children} enfants` : ''}{invoice.invoice_details.infants ? `, ${invoice.invoice_details.infants} bébés` : ''})
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-[#e0dcd4] flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-[#e8e4de] text-[#1a4a36] px-6 py-3 rounded-full font-medium hover:bg-[#d0ccc4] transition"
          >
            Accéder au Dashboard
          </button>
          <button
            onClick={handleDownloadInvoice}
            className="flex-1 bg-[#2d7a5a] text-black px-6 py-3 rounded-full font-medium hover:bg-[#1a4a36] transition flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Télécharger {documentType}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;


