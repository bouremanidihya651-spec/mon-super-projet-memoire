import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calendar, Clock, MapPin, User, CreditCard, CheckCircle, XCircle, 
  AlertCircle, Plane, Hotel, Car, Ticket, Download, Eye, X, Bus, 
  Filter, ChevronLeft, SlidersHorizontal 
} from 'lucide-react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

// ✅ API URL corrigée avec backticks
const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api`;

/* ============================================
   HOOK PERSONNALISÉ POUR DETECTER MOBILE
   ============================================ */
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) setMatches(media.matches);
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
};

/* ============================================
   BADGE DE STATUT - RESPONSIVE
   ============================================ */
const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { 
      color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800', 
      icon: AlertCircle, 
      label: 'En attente' 
    },
    confirmed: { 
      color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800', 
      icon: CheckCircle, 
      label: 'Confirmé' 
    },
    cancelled: { 
      color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800', 
      icon: XCircle, 
      label: 'Annulé' 
    },
    completed: { 
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800', 
      icon: CheckCircle, 
      label: 'Terminé' 
    },
    paid: { 
      color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800', 
      icon: CreditCard, 
      label: 'Payé' 
    }
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium border ${config.color}`}>
      <Icon size={12} className="shrink-0" />
      <span className="hidden sm:inline">{config.label}</span>
    </span>
  );
};

/* ============================================
   BADGE DE TYPE - RESPONSIVE
   ============================================ */
const TypeBadge = ({ type }) => {
  const typeConfig = {
    flight: { icon: Plane, label: 'Vol', shortLabel: 'Vol', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
    hotel: { icon: Hotel, label: 'Hôtel', shortLabel: 'Hôtel', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800' },
    car_rental: { icon: Car, label: 'Location', shortLabel: 'Auto', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800' },
    ground_transport: { icon: Bus, label: 'Transport', shortLabel: 'Bus', color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800' },
    activity: { icon: Ticket, label: 'Activité', shortLabel: 'Act.', color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-800' }
  };

  const config = typeConfig[type] || { 
    icon: Calendar, 
    label: 'Réservation', 
    shortLabel: 'Résa', 
    color: 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700' 
  };
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-medium border ${config.color}`}>
      <Icon size={12} className="shrink-0" />
      <span className="sm:hidden">{config.shortLabel}</span>
      <span className="hidden sm:inline">{config.label}</span>
    </span>
  );
};

/* ============================================
   CARTE DE RÉSERVATION - RESPONSIVE
   ============================================ */
const ReservationCard = ({ reservation, onViewDetails, onDownloadInvoice }) => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery('(max-width: 640px)');

  const getReservationName = useCallback(() => {
    if (reservation.transport?.name) return reservation.transport.name;
    if (reservation.hotel?.name) return reservation.hotel.name;
    if (reservation.activity?.name) return reservation.activity.name;
    return 'Réservation';
  }, [reservation]);

  const getReservationImage = useCallback(() => {
    if (reservation.transport?.image_url) return reservation.transport.image_url;
    if (reservation.hotel?.image_url) return reservation.hotel.image_url;
    if (reservation.activity?.image_url) return reservation.activity.image_url;
    return null;
  }, [reservation]);

  const getReservationDates = useCallback(() => {
    const departure = new Date(reservation.departure_date).toLocaleDateString('fr-FR', { 
      day: 'numeric', month: 'short' 
    });
    
    if (reservation.return_date && reservation.return_date !== reservation.departure_date) {
      const returnDate = new Date(reservation.return_date).toLocaleDateString('fr-FR', { 
        day: 'numeric', month: 'short' 
      });
      return `${departure} - ${returnDate}`;
    }
    
    return departure;
  }, [reservation]);

  const getTravelersCount = useCallback(() => {
    const total = (reservation.adults || 1) + (reservation.children || 0) + (reservation.infants || 0);
    return isMobile ? `${total} pers.` : `${total} ${total > 1 ? 'voyageurs' : 'voyageur'}`;
  }, [reservation, isMobile]);

  const imageUrl = getReservationImage();
  const name = getReservationName();

  return (
    <div className="bg-white dark:bg-dark-surface rounded-2xl sm:rounded-3xl border border-stone-200 dark:border-dark-border overflow-hidden hover:border-[#2d7a5a] transition-all group shadow-sm hover:shadow-md">
      {/* Header avec image - hauteur responsive */}
      <div className="relative h-40 sm:h-48 bg-stone-100 dark:bg-dark-bg overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl.startsWith('http') ? imageUrl : `http://localhost:3000${imageUrl}`}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Calendar size={40} className="text-stone-400 dark:text-dark-text-muted sm:size-12" />
          </div>
        )}
        
        {/* Badges positionnés intelligemment */}
        <div className="absolute top-2 sm:top-4 left-2 sm:left-4 flex gap-1 sm:gap-2 flex-wrap max-w-[70%]">
          <TypeBadge type={reservation.trip_type} />
        </div>
        
        <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
          <StatusBadge status={reservation.status} />
        </div>
      </div>

      {/* Corps de la carte - padding responsive */}
      <div className="p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-bold mb-2 truncate text-[#1a4a36] dark:text-dark-text">
          {name}
        </h3>
        
        <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-stone-500 dark:text-dark-text-muted">
            <Calendar size={14} className="shrink-0" />
            <span>{getReservationDates()}</span>
          </div>
          
          <div className="flex items-center gap-2 text-xs sm:text-sm text-stone-500 dark:text-dark-text-muted">
            <User size={14} className="shrink-0" />
            <span>{getTravelersCount()}</span>
          </div>
          
          {reservation.transport?.departure_city && reservation.transport?.arrival_city && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-stone-500 dark:text-dark-text-muted">
              <MapPin size={14} className="shrink-0" />
              <span className="truncate">
                {reservation.transport.departure_city} → {reservation.transport.arrival_city}
              </span>
            </div>
          )}
          
          {reservation.transport?.company && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-stone-500 dark:text-dark-text-muted">
              <Plane size={14} className="shrink-0" />
              <span className="truncate">{reservation.transport.company}</span>
            </div>
          )}
        </div>

        {/* Footer avec prix et actions */}
        <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-stone-200 dark:border-dark-border">
          <div>
            <span className="text-xs text-stone-500 dark:text-dark-text-muted block">Total payé</span>
            <div className="text-lg sm:text-xl font-bold text-[#2d7a5a]">
              {parseFloat(reservation.total_price || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DA
            </div>
          </div>
          
          <div className="flex gap-1.5 sm:gap-2">
            <button
              onClick={() => onViewDetails(reservation)}
              className="p-2 sm:p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center bg-white dark:bg-dark-surface hover:bg-stone-50 dark:hover:bg-dark-surface-2 border border-stone-200 dark:border-dark-border rounded-full transition-all active:scale-95"
              title="Voir détails"
              aria-label="Voir détails"
            >
              <Eye size={16} className="text-[#2d7a5a]" />
            </button>
            {reservation.payment_status === 'paid' && (
              <button
                onClick={() => onDownloadInvoice(reservation)}
                className="p-2 sm:p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center bg-[#2d7a5a]/10 hover:bg-[#2d7a5a]/20 border border-stone-200 dark:border-dark-border rounded-full transition-all active:scale-95"
                title="Télécharger facture"
                aria-label="Télécharger facture"
              >
                <Download size={16} className="text-[#2d7a5a]" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================
   MODAL DE DÉTAILS - FULLY RESPONSIVE
   ============================================ */
const ReservationDetailsModal = ({ reservation, onClose }) => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery('(max-width: 640px)');
  const [activeTab, setActiveTab] = useState('info');

  if (!reservation) return null;

  // Empêcher le scroll du body quand modal ouvert
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const renderTypeSpecificDetails = () => {
    const detailSections = {
      flight: {
        icon: Plane,
        title: 'Détails du vol',
        fields: [
          { label: 'Numéro de vol', value: reservation.transport?.flight_number },
          { label: 'Compagnie', value: reservation.transport?.company },
          { label: 'Départ', value: reservation.transport?.departure_airport },
          { label: 'Arrivée', value: reservation.transport?.arrival_airport },
          { label: 'Trajet', value: reservation.transport?.departure_city && reservation.transport?.arrival_city ? `${reservation.transport.departure_city} → ${reservation.transport.arrival_city}` : null },
          { label: 'Heure départ', value: reservation.transport?.departure_time },
          { label: 'Heure arrivée', value: reservation.transport?.arrival_time },
          { label: 'Durée', value: reservation.transport?.duration },
        ]
      },
      hotel: {
        icon: Hotel,
        title: "Détails de l'hôtel",
        fields: [
          { label: 'Hôtel', value: reservation.hotel?.name },
          { label: 'Catégorie', value: reservation.hotel?.stars ? `${'★'.repeat(reservation.hotel.stars)} (${reservation.hotel.stars}★)` : null },
          { label: 'Adresse', value: reservation.hotel?.location },
          { label: 'Ville', value: reservation.hotel?.city },
          { label: 'Check-in', value: new Date(reservation.departure_date).toLocaleDateString('fr-FR') },
          { label: 'Check-out', value: reservation.return_date ? new Date(reservation.return_date).toLocaleDateString('fr-FR') : null },
          { label: 'Nuits', value: reservation.number_of_nights ? `${reservation.number_of_nights} nuits` : null },
        ]
      },
      car_rental: {
        icon: Car,
        title: 'Détails location',
        fields: [
          { label: 'Véhicule', value: reservation.transport?.car_model },
          { label: 'Catégorie', value: reservation.transport?.category },
          { label: 'Agence', value: reservation.transport?.rental_agency },
          { label: 'Prise en charge', value: reservation.transport?.pickup_location },
          { label: 'Date départ', value: new Date(reservation.departure_date).toLocaleDateString('fr-FR') },
          { label: 'Date retour', value: reservation.return_date ? new Date(reservation.return_date).toLocaleDateString('fr-FR') : null },
          { label: 'Caution', value: reservation.transport?.deposit ? `${reservation.transport.deposit} DA` : null },
        ]
      },
      ground_transport: {
        icon: Bus,
        title: 'Transport',
        fields: [
          { label: 'Type', value: reservation.transport?.name },
          { label: 'Catégorie', value: reservation.transport?.type },
          { label: 'Compagnie', value: reservation.transport?.company },
          { label: 'Trajet', value: reservation.transport?.departure_city && reservation.transport?.arrival_city ? `${reservation.transport.departure_city} → ${reservation.transport.arrival_city}` : null },
          { label: 'Horaires', value: reservation.transport?.schedule },
        ]
      },
      activity: {
        icon: Ticket,
        title: 'Activité',
        fields: [
          { label: 'Activité', value: reservation.activity?.name },
          { label: 'Type', value: reservation.activity?.category },
          { label: 'Lieu', value: reservation.activity?.location },
          { label: 'Ville', value: reservation.activity?.city },
          { label: 'Date', value: new Date(reservation.departure_date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }) },
          { label: 'Durée', value: reservation.activity?.duration },
        ]
      }
    };

    const section = detailSections[reservation.trip_type];
    if (!section) return null;

    const Icon = section.icon;

    return (
      <div className="border-t border-stone-200 dark:border-dark-border pt-4 sm:pt-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#2d7a5a] mb-3 sm:mb-4 flex items-center gap-2">
          <Icon size={16} />
          {section.title}
        </h3>
        
        <div className="space-y-0">
          {section.fields.map((field, idx) => (
            field.value ? (
              <div key={idx} className="flex flex-col sm:flex-row sm:justify-between py-2.5 sm:py-2 border-b border-stone-100 dark:border-dark-border gap-1">
                <span className="text-xs sm:text-sm text-stone-500 dark:text-dark-text-muted">{field.label}</span>
                <span className="text-sm sm:text-base font-medium text-[#1a4a36] dark:text-dark-text text-left sm:text-right">{field.value}</span>
              </div>
            ) : null
          ))}
        </div>

        {/* Équipements / Tags spéciaux */}
        {reservation.trip_type === 'hotel' && reservation.hotel?.amenities && (
          <div className="mt-4">
            <span className="text-xs text-stone-500 dark:text-dark-text-muted block mb-2">Équipements</span>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {(() => {
                try {
                  const amenities = typeof reservation.hotel.amenities === 'string' 
                    ? JSON.parse(reservation.hotel.amenities) 
                    : reservation.hotel.amenities;
                  return amenities?.map((amenity, idx) => (
                    <span key={idx} className="px-2 py-1 bg-[#2d7a5a]/10 text-[#2d7a5a] text-xs rounded border border-stone-200 dark:border-dark-border">
                      {amenity}
                    </span>
                  ));
                } catch { return null; }
              })()}
            </div>
          </div>
        )}

        {reservation.trip_type === 'activity' && reservation.activity?.tags && (
          <div className="mt-4">
            <span className="text-xs text-stone-500 dark:text-dark-text-muted block mb-2">Points forts</span>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {(() => {
                try {
                  const tags = typeof reservation.activity.tags === 'string' 
                    ? JSON.parse(reservation.activity.tags) 
                    : reservation.activity.tags;
                  return tags?.map((tag, idx) => (
                    <span key={idx} className="px-2 py-1 bg-[#2d7a5a]/10 text-[#2d7a5a] text-xs rounded border border-stone-200 dark:border-dark-border">
                      {tag}
                    </span>
                  ));
                } catch { return null; }
              })()}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div 
        className="bg-[#f7f5f0] dark:bg-dark-bg w-full sm:max-w-2xl sm:rounded-3xl rounded-t-3xl sm:border border-stone-200 dark:border-dark-border max-h-[90vh] sm:max-h-[85vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header sticky */}
        <div className="sticky top-0 bg-[#f7f5f0] dark:bg-dark-bg border-b border-stone-200 dark:border-dark-border p-4 sm:p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button 
              onClick={onClose}
              className="sm:hidden p-2 -ml-2 hover:bg-stone-200 rounded-full transition-colors"
              aria-label="Retour"
            >
              <ChevronLeft size={20} />
            </button>
            {reservation.trip_type === 'flight' && <Plane size={20} className="text-blue-600 shrink-0" />}
            {reservation.trip_type === 'hotel' && <Hotel size={20} className="text-purple-600 shrink-0" />}
            {reservation.trip_type === 'car_rental' && <Car size={20} className="text-amber-600 shrink-0" />}
            {reservation.trip_type === 'ground_transport' && <Bus size={20} className="text-cyan-600 shrink-0" />}
            {reservation.trip_type === 'activity' && <Ticket size={20} className="text-pink-600 shrink-0" />}
            <h2 className="text-lg sm:text-xl font-bold truncate">Détails réservation</h2>
          </div>
          <button 
            onClick={onClose} 
            className="hidden sm:block p-2 hover:bg-stone-200 dark:hover:bg-dark-surface rounded-full transition-all"
            aria-label="Fermer"
          >
            <X size={20} className="text-stone-500" />
          </button>
        </div>

        {/* Contenu */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Numéro de confirmation */}
          <div className="bg-[#2d7a5a]/10 border border-stone-200 dark:border-dark-border rounded-2xl p-3 sm:p-4 text-center">
            <p className="text-xs text-[#2d7a5a] uppercase tracking-wider mb-1">Confirmation</p>
            <p className="text-xl sm:text-2xl font-bold text-[#2d7a5a] break-all">{reservation.confirmation_number}</p>
          </div>

          {/* Statut & Paiement */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <p className="text-xs text-stone-500 dark:text-dark-text-muted uppercase tracking-wider mb-2">Statut</p>
              <StatusBadge status={reservation.status} />
            </div>
            <div>
              <p className="text-xs text-stone-500 dark:text-dark-text-muted uppercase tracking-wider mb-2">Paiement</p>
              <StatusBadge status={reservation.payment_status} />
            </div>
          </div>

          {/* Informations principales - grille responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-white dark:bg-dark-surface rounded-xl p-3 border border-stone-200 dark:border-dark-border">
              <p className="text-xs text-stone-500 dark:text-dark-text-muted uppercase tracking-wider mb-2">Date début</p>
              <div className="flex items-center gap-2 text-[#1a4a36] dark:text-dark-text">
                <Calendar size={16} className="text-[#2d7a5a] shrink-0" />
                <span className="text-sm sm:text-base">{new Date(reservation.departure_date).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
            
            {reservation.return_date && (
              <div className="bg-white dark:bg-dark-surface rounded-xl p-3 border border-stone-200 dark:border-dark-border">
                <p className="text-xs text-stone-500 dark:text-dark-text-muted uppercase tracking-wider mb-2">Date fin</p>
                <div className="flex items-center gap-2 text-[#1a4a36] dark:text-dark-text">
                  <Calendar size={16} className="text-[#2d7a5a] shrink-0" />
                  <span className="text-sm sm:text-base">{new Date(reservation.return_date).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-dark-surface rounded-xl p-3 border border-stone-200 dark:border-dark-border">
              <p className="text-xs text-stone-500 dark:text-dark-text-muted uppercase tracking-wider mb-2">Participants</p>
              <div className="flex items-center gap-2 text-[#1a4a36] dark:text-dark-text">
                <User size={16} className="text-[#2d7a5a] shrink-0" />
                <span className="text-sm sm:text-base">
                  {reservation.adults} adultes
                  {reservation.children > 0 && `, ${reservation.children} enfants`}
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-dark-surface rounded-xl p-3 border border-stone-200 dark:border-dark-border">
              <p className="text-xs text-stone-500 dark:text-dark-text-muted uppercase tracking-wider mb-2">Prix total</p>
              <div className="text-xl sm:text-2xl font-bold text-[#2d7a5a]">
                {parseFloat(reservation.total_price || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DA
              </div>
            </div>
          </div>

          {/* Détails spécifiques */}
          {renderTypeSpecificDetails()}

          {/* Notes */}
          {reservation.notes && (
            <div className="border-t border-stone-200 dark:border-dark-border pt-4 sm:pt-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#2d7a5a] mb-2">Notes</h3>
              <p className="text-stone-600 dark:text-dark-text-muted text-sm bg-white dark:bg-dark-surface p-3 rounded-xl border border-stone-200 dark:border-dark-border">
                {reservation.notes}
              </p>
            </div>
          )}

          {/* Date de création */}
          <div className="border-t border-stone-200 dark:border-dark-border pt-4">
            <p className="text-xs text-stone-500 dark:text-dark-text-muted">
              Créée le {new Date(reservation.created_at).toLocaleDateString('fr-FR', {
                day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </p>
          </div>
        </div>

        {/* Footer actions - sticky bottom */}
        <div className="sticky bottom-0 bg-[#f7f5f0] dark:bg-dark-bg border-t border-stone-200 dark:border-dark-border p-4 sm:p-6 flex gap-2 sm:gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 sm:px-6 py-3 bg-white dark:bg-dark-surface border border-stone-200 dark:border-dark-border rounded-full font-semibold text-sm sm:text-base hover:bg-stone-50 transition-all active:scale-95 min-h-[48px]"
          >
            Fermer
          </button>
          {reservation.payment_status === 'paid' && (
            <button
              onClick={() => {
                window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/invoices/${reservation.id}/download`, '_blank');
              }}
              className="flex-1 px-4 sm:px-6 py-3 bg-[#2d7a5a] hover:bg-[#1a4a36] text-white rounded-full font-semibold text-sm sm:text-base transition-all flex items-center justify-center gap-2 active:scale-95 min-h-[48px]"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Télécharger</span>
              <span className="sm:hidden">Facture</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ============================================
   COMPOSANT PRINCIPAL - RESPONSIVE
   ============================================ */
const ReservationsContent = ({ openAuthModal, t }) => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const token = localStorage.getItem('token');
  const isMobile = useMediaQuery('(max-width: 640px)');

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError(null);

      const userData = JSON.parse(atob(token.split('.')[1]));
      const userId = userData.id;

      const response = await axios.get(`${API_URL}/reservations/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setReservations(response.data.reservations);
      }
    } catch (err) {
      console.error('Error fetching reservations:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (reservation) => {
    setSelectedReservation(reservation);
  };

  const handleDownloadInvoice = (reservation) => {
    window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/invoices/${reservation.id}/download`, '_blank');
  };

  const filteredReservations = reservations.filter(r => {
    const statusMatch = filterStatus === 'all' || r.status === filterStatus;
    const categoryMatch = filterCategory === 'all' || r.trip_type === filterCategory;
    return statusMatch && categoryMatch;
  });

  // Stats
  const stats = {
    total: reservations.length,
    pending: reservations.filter(r => r.status === 'pending').length,
    confirmed: reservations.filter(r => r.status === 'confirmed').length,
    cancelled: reservations.filter(r => r.status === 'cancelled').length,
    completed: reservations.filter(r => r.status === 'completed').length
  };

  const categoryStats = {
    flight: reservations.filter(r => r.trip_type === 'flight').length,
    hotel: reservations.filter(r => r.trip_type === 'hotel').length,
    car_rental: reservations.filter(r => r.trip_type === 'car_rental').length,
    ground_transport: reservations.filter(r => r.trip_type === 'ground_transport').length,
    activity: reservations.filter(r => r.trip_type === 'activity').length
  };

  const categoryConfig = {
    all: { label: 'Toutes', shortLabel: 'Tout', icon: Calendar, color: 'text-stone-500' },
    flight: { label: 'Vols', shortLabel: 'Vols', icon: Plane, color: 'text-blue-600' },
    hotel: { label: 'Hôtels', shortLabel: 'Hôtels', icon: Hotel, color: 'text-purple-600' },
    car_rental: { label: 'Locations', shortLabel: 'Autos', icon: Car, color: 'text-amber-600' },
    ground_transport: { label: 'Transports', shortLabel: 'Bus', icon: Bus, color: 'text-cyan-600' },
    activity: { label: 'Activités', shortLabel: 'Act.', icon: Ticket, color: 'text-pink-600' }
  };

  const statusFilters = [
    { value: 'all', label: 'Tous' },
    { value: 'pending', label: 'En attente' },
    { value: 'confirmed', label: 'Confirmées' },
    { value: 'completed', label: 'Terminées' },
    { value: 'cancelled', label: 'Annulées' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 sm:pb-0">
      {/* Header */}
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold mb-1 sm:mb-2 text-[#1a4a36] dark:text-dark-text">
          Mes Réservations
        </h1>
        <p className="text-sm sm:text-base text-stone-500 dark:text-dark-text-muted">
          Consultez et gérez vos réservations
        </p>
      </header>

      {/* Stats par statut - scrollable horizontal sur mobile */}
      <div className="mb-6 sm:mb-8">
        <div className="flex sm:grid sm:grid-cols-5 gap-2 sm:gap-4 overflow-x-auto pb-2 sm:pb-0 -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-hide">
          {[
            { key: 'total', label: 'Total', color: 'text-[#1a4a36]' },
            { key: 'pending', label: 'Attente', color: 'text-yellow-600' },
            { key: 'confirmed', label: 'Confirmé', color: 'text-green-600' },
            { key: 'completed', label: 'Terminé', color: 'text-blue-600' },
            { key: 'cancelled', label: 'Annulé', color: 'text-red-600' }
          ].map(({ key, label, color }) => (
            <div 
              key={key}
              className="flex-shrink-0 w-[100px] sm:w-auto bg-white dark:bg-dark-surface p-3 sm:p-4 rounded-2xl border border-stone-200 dark:border-dark-border"
            >
              <div className={`text-xl sm:text-2xl font-bold ${color}`}>{stats[key]}</div>
              <div className="text-xs text-stone-500 dark:text-dark-text-muted">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats par catégorie - scrollable horizontal sur mobile */}
      <div className="mb-6 sm:mb-8">
        <div className="flex sm:grid sm:grid-cols-6 gap-2 sm:gap-4 overflow-x-auto pb-2 sm:pb-0 -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-hide">
          {Object.entries(categoryConfig).map(([key, config]) => {
            const Icon = config.icon;
            const count = key === 'all' ? stats.total : categoryStats[key];
            const isActive = filterCategory === key;
            return (
              <button
                key={key}
                onClick={() => setFilterCategory(key)}
                className={`flex-shrink-0 w-[110px] sm:w-auto p-3 sm:p-4 rounded-2xl border transition-all text-left sm:text-center ${
                  isActive
                    ? 'bg-[#2d7a5a]/10 border-[#2d7a5a]/30'
                    : 'bg-white dark:bg-dark-surface border-stone-200 dark:border-dark-border hover:border-stone-300'
                }`}
              >
                <div className="flex items-center sm:justify-between gap-2 sm:mb-2">
                  <Icon size={18} className={isActive ? 'text-[#2d7a5a]' : config.color} />
                  <div className={`text-lg sm:text-2xl font-bold ${isActive ? 'text-[#2d7a5a]' : 'text-[#1a4a36] dark:text-dark-text'}`}>
                    {count}
                  </div>
                </div>
                <div className={`text-xs ${isActive ? 'text-[#2d7a5a]' : 'text-stone-500 dark:text-dark-text-muted'}`}>
                  <span className="sm:hidden">{config.shortLabel}</span>
                  <span className="hidden sm:inline">{config.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filtres par statut - version mobile compacte */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-hide flex-1">
          {statusFilters.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilterStatus(value)}
              className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all min-h-[36px] ${
                filterStatus === value
                  ? 'bg-[#2d7a5a] text-white shadow-md'
                  : 'bg-white dark:bg-dark-surface text-stone-600 dark:text-dark-text-muted border border-stone-200 dark:border-dark-border hover:bg-stone-50'
              }`}
            >
              {isMobile && value !== 'all' ? label.split(' ')[0] : label}
            </button>
          ))}
        </div>
        
        {/* Bouton filtres mobile */}
        <button 
          className="sm:hidden ml-2 p-2 bg-white dark:bg-dark-surface border border-stone-200 dark:border-dark-border rounded-full"
          onClick={() => setShowMobileFilters(!showMobileFilters)}
        >
          <SlidersHorizontal size={18} />
        </button>
      </div>

      {/* Filtre actif */}
      {(filterCategory !== 'all' || filterStatus !== 'all') && (
        <div className="mb-4 sm:mb-6 flex items-center gap-2 flex-wrap">
          <span className="text-stone-500 text-sm">Filtres :</span>
          {filterCategory !== 'all' && (
            <span className="px-2 py-1 bg-[#2d7a5a]/10 text-[#2d7a5a] rounded-full text-xs font-medium border border-[#2d7a5a]/20 flex items-center gap-1">
              {categoryConfig[filterCategory]?.label}
              <button onClick={() => setFilterCategory('all')} className="hover:bg-[#2d7a5a]/20 rounded-full p-0.5">
                <X size={12} />
              </button>
            </span>
          )}
          {filterStatus !== 'all' && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium border border-blue-200 flex items-center gap-1">
              {statusFilters.find(s => s.value === filterStatus)?.label}
              <button onClick={() => setFilterStatus('all')} className="hover:bg-blue-200 rounded-full p-0.5">
                <X size={12} />
              </button>
            </span>
          )}
          <button
            onClick={() => { setFilterCategory('all'); setFilterStatus('all'); }}
            className="text-xs text-stone-500 hover:text-[#1a4a36] underline"
          >
            Tout effacer
          </button>
        </div>
      )}

      {/* Contenu */}
      {loading ? (
        <div className="text-center py-12 sm:py-20">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-[#2d7a5a] mx-auto mb-4"></div>
          <p className="text-stone-500 dark:text-dark-text-muted text-sm sm:text-base">Chargement...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 sm:py-20 px-4">
          <AlertCircle size={40} className="mx-auto mb-4 text-red-500 sm:size-12" />
          <p className="text-red-600 mb-4 text-sm sm:text-base">{error}</p>
          <button
            onClick={fetchReservations}
            className="px-5 sm:px-6 py-2.5 sm:py-3 bg-[#2d7a5a] text-white rounded-full font-semibold hover:bg-[#1a4a36] transition-all text-sm sm:text-base min-h-[44px]"
          >
            Réessayer
          </button>
        </div>
      ) : filteredReservations.length === 0 ? (
        <div className="text-center py-12 sm:py-20 px-4">
          <Calendar size={48} className="mx-auto mb-4 text-stone-400 sm:size-16" />
          <p className="text-stone-500 dark:text-dark-text-muted mb-2 text-sm sm:text-base">
            {filterCategory === 'all' && filterStatus === 'all'
              ? "Aucune réservation"
              : "Aucun résultat pour ces filtres"}
          </p>
          <p className="text-stone-400 text-xs sm:text-sm">
            {(filterCategory !== 'all' || filterStatus !== 'all') && (
              <button 
                onClick={() => { setFilterCategory('all'); setFilterStatus('all'); }}
                className="text-[#2d7a5a] hover:underline"
              >
                Réinitialiser les filtres
              </button>
            )}
          </p>
        </div>
      ) : (
        <div>
          {/* Titre de section */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-[#1a4a36] dark:text-dark-text">
              {filterCategory === 'all' ? 'Toutes' : categoryConfig[filterCategory]?.label}
              <span className="text-stone-500 dark:text-dark-text-muted text-xs sm:text-sm font-normal ml-2">
                ({filteredReservations.length})
              </span>
            </h2>
          </div>

          {/* Grille responsive : 1 col mobile, 2 cols tablet, 3 cols desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredReservations.map((reservation) => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                onViewDetails={handleViewDetails}
                onDownloadInvoice={handleDownloadInvoice}
              />
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {selectedReservation && (
        <ReservationDetailsModal
          reservation={selectedReservation}
          onClose={() => setSelectedReservation(null)}
        />
      )}
    </div>
  );
};

export default ReservationsContent;
