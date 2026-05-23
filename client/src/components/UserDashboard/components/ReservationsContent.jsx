import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, CreditCard, CheckCircle, XCircle, AlertCircle, Plane, Hotel, Car, Ticket, Download, Eye, X, Bus } from 'lucide-react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Badge de statut
 */
const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-500 border-yellow-200 dark:border-yellow-900/50', icon: AlertCircle, label: 'En attente' },
    confirmed: { color: 'bg-[#dcfce7] dark:bg-green-900/30 text-[#16a34a] dark:text-green-500 border-[#bbf7d0] dark:border-green-900/50', icon: CheckCircle, label: 'Confirmé' },
    cancelled: { color: 'bg-[#fef2f2] dark:bg-red-900/30 text-[#dc2626] dark:text-red-500 border-[#fecaca] dark:border-red-900/50', icon: XCircle, label: 'Annulé' },
    completed: { color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-500 border-blue-200 dark:border-blue-900/50', icon: CheckCircle, label: 'Terminé' }
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      <Icon size={12} />
      {config.label}
    </span>
  );
};

/**
 * Badge de type de réservation
 */
const TypeBadge = ({ type }) => {
  const typeConfig = {
    flight: { icon: Plane, label: 'Vol', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-500 border-blue-200 dark:border-blue-900/50' },
    hotel: { icon: Hotel, label: 'Hôtel', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-500 border-purple-200 dark:border-purple-900/50' },
    car_rental: { icon: Car, label: 'Location voiture', color: 'bg-orange-100 dark:bg-orange-900/30 text-[#c9a844] border-orange-200 dark:border-orange-900/50' },
    ground_transport: { icon: Bus, label: 'Transport terrestre', color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-500 border-cyan-200 dark:border-cyan-900/50' },
    activity: { icon: Ticket, label: 'Activité', color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-500 border-pink-200 dark:border-pink-900/50' }
  };

  const config = typeConfig[type] || { icon: Calendar, label: 'Réservation', color: 'bg-[#e8e4de] dark:bg-dark-surface-2 text-[#2d7a5a] dark:text-surface border-[#d0ccc4] dark:border-dark-border' };
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      <Icon size={12} />
      {config.label}
    </span>
  );
};

/**
 * Carte de réservation
 */
const ReservationCard = ({ reservation, onViewDetails, onDownloadInvoice }) => {
  const { t } = useTranslation();

  const getReservationName = () => {
    if (reservation.transport?.name) return reservation.transport.name;
    if (reservation.hotel?.name) return reservation.hotel.name;
    if (reservation.activity?.name) return reservation.activity.name;
    return 'Réservation';
  };

  const getReservationImage = () => {
    if (reservation.transport?.image_url) return reservation.transport.image_url;
    if (reservation.hotel?.image_url) return reservation.hotel.image_url;
    if (reservation.activity?.image_url) return reservation.activity.image_url;
    return null;
  };

  const getReservationDates = () => {
    const departure = new Date(reservation.departure_date).toLocaleDateString('fr-FR', { 
      day: 'numeric', month: 'short', year: 'numeric' 
    });
    
    if (reservation.return_date && reservation.return_date !== reservation.departure_date) {
      const returnDate = new Date(reservation.return_date).toLocaleDateString('fr-FR', { 
        day: 'numeric', month: 'short', year: 'numeric' 
      });
      return `${departure} - ${returnDate}`;
    }
    
    return departure;
  };

  const getTravelersCount = () => {
    const total = (reservation.adults || 1) + (reservation.children || 0) + (reservation.infants || 0);
    return `${total} ${total > 1 ? 'voyageurs' : 'voyageur'}`;
  };

  return (
    <div className="bg-white dark:bg-dark-surface dark:bg-dark-surface rounded-3xl border border-[#e0dcd4] dark:border-dark-border dark:border-dark-border overflow-hidden hover:border-[#2d7a5a] transition-all group shadow-sm hover:shadow-md">
      {/* Header avec image et type */}
      <div className="relative h-48 bg-[#e8e4de] dark:bg-dark-bg overflow-hidden">
        {getReservationImage() ? (
          <img
            src={getReservationImage().startsWith('http') ? getReservationImage() : `http://localhost:3000${getReservationImage()}`}
            alt={getReservationName()}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Calendar size={48} className="text-[#6b8f7b] dark:text-dark-text-muted dark:text-dark-text-muted" />
          </div>
        )}
        
        <div className="absolute top-4 left-4 flex gap-2">
          <TypeBadge type={reservation.trip_type} />
        </div>
        
        <div className="absolute top-4 right-4">
          <StatusBadge status={reservation.status} />
        </div>
      </div>

      {/* Corps de la carte */}
      <div className="p-6">
        <h3 className="text-lg font-bold mb-2 truncate text-[#1a4a36] dark:text-dark-text dark:text-dark-text">{getReservationName()}</h3>
        
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-[#6b8f7b] dark:text-dark-text-muted dark:text-dark-text-muted">
            <Calendar size={14} />
            <span>{getReservationDates()}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-[#6b8f7b] dark:text-dark-text-muted dark:text-dark-text-muted">
            <User size={14} />
            <span>{getTravelersCount()}</span>
          </div>
          
          {reservation.transport?.departure_city && reservation.transport?.arrival_city && (
            <div className="flex items-center gap-2 text-sm text-[#6b8f7b] dark:text-dark-text-muted dark:text-dark-text-muted">
              <MapPin size={14} />
              <span>{reservation.transport.departure_city} → {reservation.transport.arrival_city}</span>
            </div>
          )}
          
          {reservation.transport?.company && (
            <div className="flex items-center gap-2 text-sm text-[#6b8f7b] dark:text-dark-text-muted dark:text-dark-text-muted">
              <Plane size={14} />
              <span>{reservation.transport.company}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-[#e0dcd4] dark:border-dark-border dark:border-dark-border">
          <div>
            <span className="text-xs text-[#6b8f7b] dark:text-dark-text-muted dark:text-dark-text-muted">Total payé</span>
            <div className="text-xl font-bold text-[#2d7a5a] dark:text-surface">
              {parseFloat(reservation.total_price || 0).toFixed(2)} DA
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => onViewDetails(reservation)}
              className="p-2.5 bg-white dark:bg-dark-surface dark:bg-dark-bg hover:bg-[#f7f5f0] dark:bg-dark-bg dark:hover:bg-dark-surface-2 border border-[#e0dcd4] dark:border-dark-border dark:border-dark-border rounded-full transition-all"
              title="Voir détails"
            >
              <Eye size={16} className="text-[#2d7a5a] dark:text-surface" />
            </button>
            {reservation.payment_status === 'paid' && (
              <button
                onClick={() => onDownloadInvoice(reservation)}
                className="p-2.5 bg-[#2d7a5a]/10 dark:bg-dark-bg hover:bg-[#2d7a5a]/20 dark:hover:bg-dark-surface-2 border border-[#e0dcd4] dark:border-dark-border dark:border-dark-border rounded-full transition-all"
                title="Télécharger facture"
              >
                <Download size={16} className="text-[#2d7a5a] dark:text-surface" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Modal de détails de réservation
 */
const ReservationDetailsModal = ({ reservation, onClose }) => {
  const { t } = useTranslation();

  if (!reservation) return null;

  // Helper pour afficher les détails spécifiques au type
  const renderTypeSpecificDetails = () => {
    switch (reservation.trip_type) {
      case 'flight':
        return (
          <div className="border-t border-[#e0dcd4] dark:border-dark-border pt-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#2d7a5a] mb-4 flex items-center gap-2">
              <Plane size={16} />
              Détails du vol
            </h3>
            
            <div className="space-y-3">
              {reservation.transport?.flight_number && (
                <div className="flex justify-between py-2 border-b border-[#e0dcd4] dark:border-dark-border dark:border-dark-border">
                  <span className="text-[#6b8f7b] dark:text-dark-text-muted dark:text-dark-text-muted">Numéro de vol</span>
                  <span className="font-medium text-[#1a4a36] dark:text-dark-text dark:text-dark-text">{reservation.transport.flight_number}</span>
                </div>
              )}
              
              {reservation.transport?.company && (
                <div className="flex justify-between py-2 border-b border-[#e0dcd4] dark:border-dark-border dark:border-dark-border">
                  <span className="text-[#6b8f7b] dark:text-dark-text-muted dark:text-dark-text-muted">Compagnie aérienne</span>
                  <span className="font-medium text-[#1a4a36] dark:text-dark-text dark:text-dark-text">{reservation.transport.company}</span>
                </div>
              )}
              
              {reservation.transport?.departure_airport && (
                <div className="flex justify-between py-2 border-b border-[#e0dcd4] dark:border-dark-border dark:border-dark-border">
                  <span className="text-[#6b8f7b] dark:text-dark-text-muted dark:text-dark-text-muted">Aéroport de départ</span>
                  <span className="font-medium text-[#1a4a36] dark:text-dark-text dark:text-dark-text">{reservation.transport.departure_airport}</span>
                </div>
              )}
              
              {reservation.transport?.arrival_airport && (
                <div className="flex justify-between py-2 border-b border-[#e0dcd4] dark:border-dark-border dark:border-dark-border">
                  <span className="text-[#6b8f7b] dark:text-dark-text-muted dark:text-dark-text-muted">Aéroport d'arrivée</span>
                  <span className="font-medium text-[#1a4a36] dark:text-dark-text dark:text-dark-text">{reservation.transport.arrival_airport}</span>
                </div>
              )}
              
              {reservation.transport?.departure_city && reservation.transport?.arrival_city && (
                <div className="flex justify-between py-2 border-b border-[#e0dcd4] dark:border-dark-border dark:border-dark-border">
                  <span className="text-[#6b8f7b] dark:text-dark-text-muted dark:text-dark-text-muted">Trajet</span>
                  <span className="font-medium text-[#1a4a36] dark:text-dark-text dark:text-dark-text">
                    {reservation.transport.departure_city} → {reservation.transport.arrival_city}
                  </span>
                </div>
              )}
              
              {reservation.transport?.departure_time && (
                <div className="flex justify-between py-2 border-b border-[#e0dcd4] dark:border-dark-border dark:border-dark-border">
                  <span className="text-[#6b8f7b] dark:text-dark-text-muted dark:text-dark-text-muted">Heure de départ</span>
                  <span className="font-medium text-[#1a4a36] dark:text-dark-text dark:text-dark-text">{reservation.transport.departure_time}</span>
                </div>
              )}
              
              {reservation.transport?.arrival_time && (
                <div className="flex justify-between py-2 border-b border-[#e0dcd4] dark:border-dark-border dark:border-dark-border">
                  <span className="text-[#6b8f7b] dark:text-dark-text-muted dark:text-dark-text-muted">Heure d'arrivée</span>
                  <span className="font-medium text-[#1a4a36] dark:text-dark-text dark:text-dark-text">{reservation.transport.arrival_time}</span>
                </div>
              )}
              
              {reservation.transport?.duration && (
                <div className="flex justify-between py-2 border-b border-[#e0dcd4] dark:border-dark-border dark:border-dark-border">
                  <span className="text-[#6b8f7b] dark:text-dark-text-muted dark:text-dark-text-muted">Durée du vol</span>
                  <span className="font-medium text-[#1a4a36] dark:text-dark-text dark:text-dark-text">{reservation.transport.duration}</span>
                </div>
              )}
              
              {reservation.trip_type === 'round_trip' && (
                <div className="flex justify-between py-2 border-b border-[#e0dcd4] dark:border-dark-border dark:border-dark-border">
                  <span className="text-[#6b8f7b] dark:text-dark-text-muted dark:text-dark-text-muted">Type de billet</span>
                  <span className="font-medium text-[#2d7a5a] dark:text-surface">Aller-Retour</span>
                </div>
              )}
            </div>
          </div>
        );

      case 'hotel':
        return (
          <div className="border-t border-[#e0dcd4] dark:border-dark-border dark:border-dark-border pt-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#2d7a5a] dark:text-surface mb-4 flex items-center gap-2">
              <Hotel size={16} />
              Détails de l'hôtel
            </h3>
            
            <div className="space-y-3">
              {reservation.hotel?.name && (
                <div className="flex justify-between py-2 border-b border-[#e0dcd4] dark:border-dark-border dark:border-dark-border">
                  <span className="text-[#6b8f7b] dark:text-dark-text-muted dark:text-dark-text-muted">Nom de l'hôtel</span>
                  <span className="font-medium text-[#1a4a36] dark:text-dark-text dark:text-dark-text">{reservation.hotel.name}</span>
                </div>
              )}
              
              {reservation.hotel?.stars && (
                <div className="flex justify-between py-2 border-b border-[#e0dcd4] dark:border-dark-border dark:border-dark-border">
                  <span className="text-[#6b8f7b] dark:text-dark-text-muted dark:text-dark-text-muted">Catégorie</span>
                  <span className="font-medium text-[#2d7a5a] dark:text-surface">
                    {'★'.repeat(reservation.hotel.stars)} ({reservation.hotel.stars} étoiles)
                  </span>
                </div>
              )}
              
              {reservation.hotel?.location && (
                <div className="flex justify-between py-2 border-b border-[#e0dcd4] dark:border-dark-border dark:border-dark-border">
                  <span className="text-[#6b8f7b] dark:text-dark-text-muted dark:text-dark-text-muted">Adresse</span>
                  <span className="font-medium text-[#1a4a36] dark:text-dark-text dark:text-dark-text">{reservation.hotel.location}</span>
                </div>
              )}
              
              {reservation.hotel?.city && (
                <div className="flex justify-between py-2 border-b border-[#e0dcd4] dark:border-dark-border dark:border-dark-border">
                  <span className="text-[#6b8f7b] dark:text-dark-text-muted dark:text-dark-text-muted">Ville</span>
                  <span className="font-medium text-[#1a4a36] dark:text-dark-text dark:text-dark-text">{reservation.hotel.city}</span>
                </div>
              )}
              
              <div className="flex justify-between py-2 border-b border-[#e0dcd4] dark:border-dark-border dark:border-dark-border">
                <span className="text-[#6b8f7b] dark:text-dark-text-muted dark:text-dark-text-muted">Check-in</span>
                <span className="font-medium text-[#1a4a36] dark:text-dark-text dark:text-dark-text">
                  {new Date(reservation.departure_date).toLocaleDateString('fr-FR', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-[#e0dcd4] dark:border-dark-border dark:border-dark-border">
                <span className="text-[#6b8f7b] dark:text-dark-text-muted dark:text-dark-text-muted">Check-out</span>
                <span className="font-medium text-[#1a4a36] dark:text-dark-text dark:text-dark-text">
                  {new Date(reservation.return_date).toLocaleDateString('fr-FR', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </span>
              </div>
              
              {reservation.number_of_nights && (
                <div className="flex justify-between py-2 border-b border-[#e0dcd4] dark:border-dark-border dark:border-dark-border">
                  <span className="text-[#6b8f7b] dark:text-dark-text-muted dark:text-dark-text-muted">Nombre de nuits</span>
                  <span className="font-medium text-[#1a4a36] dark:text-dark-text dark:text-dark-text">{reservation.number_of_nights} nuits</span>
                </div>
              )}
              
              {reservation.hotel?.amenities && (
                <div className="py-3 border-b border-[#e0dcd4] dark:border-dark-border dark:border-dark-border">
                  <span className="text-[#6b8f7b] dark:text-dark-text-muted dark:text-dark-text-muted block mb-2">Équipements</span>
                  <div className="flex flex-wrap gap-2">
                    {(() => {
                      try {
                        const amenities = typeof reservation.hotel.amenities === 'string' 
                          ? JSON.parse(reservation.hotel.amenities) 
                          : reservation.hotel.amenities;
                        return amenities?.map((amenity, idx) => (
                          <span key={idx} className="px-2 py-1 bg-[#2d7a5a]/10 dark:bg-dark-bg text-[#2d7a5a] dark:text-surface text-xs rounded border border-[#e0dcd4] dark:border-dark-border dark:border-dark-border">
                            {amenity}
                          </span>
                        ));
                      } catch {
                        return null;
                      }
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'car_rental':
        return (
          <div className="border-t border-[#e0dcd4] dark:border-dark-border pt-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#2d7a5a] mb-4 flex items-center gap-2">
              <Car size={16} />
              Détails de la location
            </h3>
            
            <div className="space-y-3">
              {reservation.transport?.car_model && (
                <div className="flex justify-between py-2 border-b border-[#e0dcd4] dark:border-dark-border">
                  <span className="text-[#6b8f7b] dark:text-dark-text-muted">Modèle du véhicule</span>
                  <span className="font-medium">{reservation.transport.car_model}</span>
                </div>
              )}
              
              {reservation.transport?.category && (
                <div className="flex justify-between py-2 border-b border-[#e0dcd4] dark:border-dark-border">
                  <span className="text-[#6b8f7b] dark:text-dark-text-muted">Catégorie</span>
                  <span className="font-medium">{reservation.transport.category}</span>
                </div>
              )}
              
              {reservation.transport?.rental_agency && (
                <div className="flex justify-between py-2 border-b border-[#e0dcd4] dark:border-dark-border">
                  <span className="text-[#6b8f7b] dark:text-dark-text-muted">Agence de location</span>
                  <span className="font-medium">{reservation.transport.rental_agency}</span>
                </div>
              )}
              
              {reservation.transport?.pickup_location && (
                <div className="flex justify-between py-2 border-b border-[#e0dcd4] dark:border-dark-border">
                  <span className="text-[#6b8f7b] dark:text-dark-text-muted">Lieu de prise en charge</span>
                  <span className="font-medium">{reservation.transport.pickup_location}</span>
                </div>
              )}
              
              <div className="flex justify-between py-2 border-b border-[#e0dcd4] dark:border-dark-border">
                <span className="text-[#6b8f7b] dark:text-dark-text-muted">Date de prise en charge</span>
                <span className="font-medium">
                  {new Date(reservation.departure_date).toLocaleDateString('fr-FR', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </span>
              </div>
              
              {reservation.pickup_time && (
                <div className="flex justify-between py-2 border-b border-[#e0dcd4] dark:border-dark-border">
                  <span className="text-[#6b8f7b] dark:text-dark-text-muted">Heure de prise en charge</span>
                  <span className="font-medium">{reservation.pickup_time}</span>
                </div>
              )}
              
              <div className="flex justify-between py-2 border-b border-[#e0dcd4] dark:border-dark-border">
                <span className="text-[#6b8f7b] dark:text-dark-text-muted">Date de retour</span>
                <span className="font-medium">
                  {new Date(reservation.return_date).toLocaleDateString('fr-FR', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </span>
              </div>
              
              {reservation.return_time && (
                <div className="flex justify-between py-2 border-b border-[#e0dcd4] dark:border-dark-border">
                  <span className="text-[#6b8f7b] dark:text-dark-text-muted">Heure de retour</span>
                  <span className="font-medium">{reservation.return_time}</span>
                </div>
              )}
              
              {reservation.transport?.deposit && (
                <div className="flex justify-between py-2 border-b border-[#e0dcd4] dark:border-dark-border">
                  <span className="text-[#6b8f7b] dark:text-dark-text-muted">Caution</span>
                  <span className="font-medium">{reservation.transport.deposit} DA</span>
                </div>
              )}
              
              {reservation.travelers_details && reservation.travelers_details[0] && (
                <>
                  <div className="py-3 border-b border-[#e0dcd4] dark:border-dark-border">
                    <span className="text-[#6b8f7b] dark:text-dark-text-muted text-xs uppercase tracking-widest block mb-2">Informations conducteur</span>
                    {reservation.travelers_details[0].firstName && (
                      <div className="flex justify-between py-1">
                        <span className="text-[#6b8f7b] dark:text-dark-text-muted text-sm">Nom</span>
                        <span className="font-medium text-sm">
                          {reservation.travelers_details[0].firstName} {reservation.travelers_details[0].lastName}
                        </span>
                      </div>
                    )}
                    {reservation.travelers_details[0].email && (
                      <div className="flex justify-between py-1">
                        <span className="text-[#6b8f7b] dark:text-dark-text-muted text-sm">Email</span>
                        <span className="font-medium text-sm">{reservation.travelers_details[0].email}</span>
                      </div>
                    )}
                    {reservation.travelers_details[0].phone && (
                      <div className="flex justify-between py-1">
                        <span className="text-[#6b8f7b] dark:text-dark-text-muted text-sm">Téléphone</span>
                        <span className="font-medium text-sm">{reservation.travelers_details[0].phone}</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        );

      case 'ground_transport':
        return (
          <div className="border-t border-[#e0dcd4] dark:border-dark-border pt-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#2d7a5a] mb-4 flex items-center gap-2">
              <Bus size={16} />
              Détails du transport terrestre
            </h3>
            
            <div className="space-y-3">
              {reservation.transport?.name && (
                <div className="flex justify-between py-2 border-b border-[#e0dcd4] dark:border-dark-border">
                  <span className="text-[#6b8f7b] dark:text-dark-text-muted">Type de transport</span>
                  <span className="font-medium">{reservation.transport.name}</span>
                </div>
              )}
              
              {reservation.transport?.type && (
                <div className="flex justify-between py-2 border-b border-[#e0dcd4] dark:border-dark-border">
                  <span className="text-[#6b8f7b] dark:text-dark-text-muted">Catégorie</span>
                  <span className="font-medium">{reservation.transport.type}</span>
                </div>
              )}
              
              {reservation.transport?.company && (
                <div className="flex justify-between py-2 border-b border-[#e0dcd4] dark:border-dark-border">
                  <span className="text-[#6b8f7b] dark:text-dark-text-muted">Compagnie</span>
                  <span className="font-medium">{reservation.transport.company}</span>
                </div>
              )}
              
              {reservation.transport?.departure_city && reservation.transport?.arrival_city && (
                <div className="flex justify-between py-2 border-b border-[#e0dcd4] dark:border-dark-border">
                  <span className="text-[#6b8f7b] dark:text-dark-text-muted">Trajet</span>
                  <span className="font-medium">
                    {reservation.transport.departure_city} → {reservation.transport.arrival_city}
                  </span>
                </div>
              )}
              
              {reservation.pickup_time && (
                <div className="flex justify-between py-2 border-b border-[#e0dcd4] dark:border-dark-border">
                  <span className="text-[#6b8f7b] dark:text-dark-text-muted">Heure de départ</span>
                  <span className="font-medium">{reservation.pickup_time}</span>
                </div>
              )}
              
              {reservation.transport?.schedule && (
                <div className="flex justify-between py-2 border-b border-[#e0dcd4] dark:border-dark-border">
                  <span className="text-[#6b8f7b] dark:text-dark-text-muted">Horaires</span>
                  <span className="font-medium">{reservation.transport.schedule}</span>
                </div>
              )}
            </div>
          </div>
        );

      case 'activity':
        return (
          <div className="border-t border-[#e0dcd4] dark:border-dark-border pt-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#2d7a5a] mb-4 flex items-center gap-2">
              <Ticket size={16} />
              Détails de l'activité
            </h3>
            
            <div className="space-y-3">
              {reservation.activity?.name && (
                <div className="flex justify-between py-2 border-b border-[#e0dcd4] dark:border-dark-border">
                  <span className="text-[#6b8f7b] dark:text-dark-text-muted">Nom de l'activité</span>
                  <span className="font-medium">{reservation.activity.name}</span>
                </div>
              )}
              
              {reservation.activity?.category && (
                <div className="flex justify-between py-2 border-b border-[#e0dcd4] dark:border-dark-border">
                  <span className="text-[#6b8f7b] dark:text-dark-text-muted">Type d'activité</span>
                  <span className="font-medium">{reservation.activity.category}</span>
                </div>
              )}
              
              {reservation.activity?.location && (
                <div className="flex justify-between py-2 border-b border-[#e0dcd4] dark:border-dark-border">
                  <span className="text-[#6b8f7b] dark:text-dark-text-muted">Lieu</span>
                  <span className="font-medium">{reservation.activity.location}</span>
                </div>
              )}
              
              {reservation.activity?.city && (
                <div className="flex justify-between py-2 border-b border-[#e0dcd4] dark:border-dark-border">
                  <span className="text-[#6b8f7b] dark:text-dark-text-muted">Ville</span>
                  <span className="font-medium">{reservation.activity.city}</span>
                </div>
              )}
              
              <div className="flex justify-between py-2 border-b border-[#e0dcd4] dark:border-dark-border">
                <span className="text-[#6b8f7b] dark:text-dark-text-muted">Date de l'activité</span>
                <span className="font-medium">
                  {new Date(reservation.departure_date).toLocaleDateString('fr-FR', {
                    day: 'numeric', month: 'long', year: 'numeric', weekday: 'long'
                  })}
                </span>
              </div>
              
              {reservation.pickup_time && (
                <div className="flex justify-between py-2 border-b border-[#e0dcd4] dark:border-dark-border">
                  <span className="text-[#6b8f7b] dark:text-dark-text-muted">Heure de rendez-vous</span>
                  <span className="font-medium">{reservation.pickup_time}</span>
                </div>
              )}
              
              {reservation.activity?.duration && (
                <div className="flex justify-between py-2 border-b border-[#e0dcd4] dark:border-dark-border">
                  <span className="text-[#6b8f7b] dark:text-dark-text-muted">Durée</span>
                  <span className="font-medium">{reservation.activity.duration}</span>
                </div>
              )}
              
              {reservation.activity?.tags && (
                <div className="py-3 border-b border-[#e0dcd4] dark:border-dark-border">
                  <span className="text-[#6b8f7b] dark:text-dark-text-muted block mb-2">Points forts</span>
                  <div className="flex flex-wrap gap-2">
                    {(() => {
                      try {
                        const tags = typeof reservation.activity.tags === 'string' 
                          ? JSON.parse(reservation.activity.tags) 
                          : reservation.activity.tags;
                        return tags?.map((tag, idx) => (
                          <span key={idx} className="px-2 py-1 bg-[#2d7a5a]/10 text-[#2d7a5a] text-xs rounded border border-[#e0dcd4] dark:border-dark-border">
                            {tag}
                          </span>
                        ));
                      } catch {
                        return null;
                      }
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-[#f7f5f0] dark:bg-dark-bg rounded-3xl border border-[#e0dcd4] dark:border-dark-border max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#f7f5f0] dark:bg-dark-bg border-b border-[#e0dcd4] dark:border-dark-border p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            {reservation.trip_type === 'flight' && <Plane size={24} className="text-blue-600" />}
            {reservation.trip_type === 'hotel' && <Hotel size={24} className="text-purple-600" />}
            {reservation.trip_type === 'car_rental' && <Car size={24} className="text-[#c9a844]" />}
            {reservation.trip_type === 'ground_transport' && <Bus size={24} className="text-cyan-600" />}
            {reservation.trip_type === 'activity' && <Ticket size={24} className="text-pink-600" />}
            <h2 className="text-xl font-bold">Détails de la réservation</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#f7f5f0] dark:bg-dark-bg rounded-full transition-all">
            <X size={20} className="text-[#6b8f7b] dark:text-dark-text-muted" />
          </button>
        </div>

        {/* Contenu */}
        <div className="p-6 space-y-6">
          {/* Confirmation number */}
          <div className="bg-[#2d7a5a]/10 border border-[#e0dcd4] dark:border-dark-border rounded-full p-4 text-center">
            <p className="text-xs text-[#2d7a5a] uppercase tracking-widest mb-1">Numéro de confirmation</p>
            <p className="text-2xl font-bold text-[#2d7a5a]">{reservation.confirmation_number}</p>
          </div>

          {/* Statut & Paiement */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-[#6b8f7b] dark:text-dark-text-muted uppercase tracking-widest mb-2">Statut</p>
              <StatusBadge status={reservation.status} />
            </div>
            <div>
              <p className="text-xs text-[#6b8f7b] dark:text-dark-text-muted uppercase tracking-widest mb-2">Paiement</p>
              <StatusBadge status={reservation.payment_status} />
            </div>
          </div>

          {/* Informations principales */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-[#6b8f7b] dark:text-dark-text-muted uppercase tracking-widest mb-2">Date de début</p>
              <div className="flex items-center gap-2 text-[#1a4a36] dark:text-dark-text">
                <Calendar size={16} className="text-[#2d7a5a]" />
                <span>{new Date(reservation.departure_date).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
            
            {reservation.return_date && (
              <div>
                <p className="text-xs text-[#6b8f7b] dark:text-dark-text-muted uppercase tracking-widest mb-2">Date de fin</p>
                <div className="flex items-center gap-2 text-[#1a4a36] dark:text-dark-text">
                  <Calendar size={16} className="text-[#2d7a5a]" />
                  <span>{new Date(reservation.return_date).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
            )}

            <div>
              <p className="text-xs text-[#6b8f7b] dark:text-dark-text-muted uppercase tracking-widest mb-2">Participants</p>
              <div className="flex items-center gap-2 text-[#1a4a36] dark:text-dark-text">
                <User size={16} className="text-[#2d7a5a]" />
                <span>{reservation.adults} adultes{reservation.children > 0 && `, ${reservation.children} enfants`}</span>
              </div>
            </div>

            <div>
              <p className="text-xs text-[#6b8f7b] dark:text-dark-text-muted uppercase tracking-widest mb-2">Prix total</p>
              <div className="text-2xl font-bold text-[#2d7a5a]">
                {parseFloat(reservation.total_price || 0).toFixed(2)} DA
              </div>
            </div>
          </div>

          {/* Détails spécifiques au type */}
          {renderTypeSpecificDetails()}

          {/* Notes */}
          {reservation.notes && (
            <div className="border-t border-[#e0dcd4] dark:border-dark-border pt-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#2d7a5a] mb-2">Notes</h3>
              <p className="text-[#6b8f7b] dark:text-dark-text-muted text-sm">{reservation.notes}</p>
            </div>
          )}

          {/* Date de création */}
          <div className="border-t border-[#e0dcd4] dark:border-dark-border pt-6">
            <p className="text-xs text-[#6b8f7b] dark:text-dark-text-muted">
              Réservation créée le {new Date(reservation.created_at).toLocaleDateString('fr-FR', {
                day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="sticky bottom-0 bg-[#f7f5f0] dark:bg-dark-bg border-t border-[#e0dcd4] dark:border-dark-border p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-[#f7f5f0] dark:bg-dark-bg hover:bg-[#f7f5f0] dark:bg-dark-bg border border-[#e0dcd4] dark:border-dark-border rounded-full font-semibold transition-all"
          >
            Fermer
          </button>
          {reservation.payment_status === 'paid' && (
            <button
              onClick={() => {
                window.open(`http://localhost:3000/api/invoices/${reservation.id}/download`, '_blank');
              }}
              className="flex-1 px-6 py-3 bg-[#2d7a5a] hover:bg-[#1a4a36] text-black rounded-full font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Download size={16} />
              Télécharger facture
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Composant principal ReservationsContent
 */
const ReservationsContent = ({ openAuthModal, t }) => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user ID from token
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
      setError(err.response?.data?.message || 'Erreur lors du chargement des réservations');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (reservation) => {
    setSelectedReservation(reservation);
  };

  const handleDownloadInvoice = (reservation) => {
    window.open(`http://localhost:3000/api/invoices/${reservation.id}/download`, '_blank');
  };

  // Filtrer par statut ET par catégorie
  const filteredReservations = reservations.filter(r => {
    const statusMatch = filterStatus === 'all' || r.status === filterStatus;
    const categoryMatch = filterCategory === 'all' || r.trip_type === filterCategory;
    return statusMatch && categoryMatch;
  });

  // Statistiques par statut
  const stats = {
    total: reservations.length,
    pending: reservations.filter(r => r.status === 'pending').length,
    confirmed: reservations.filter(r => r.status === 'confirmed').length,
    cancelled: reservations.filter(r => r.status === 'cancelled').length,
    completed: reservations.filter(r => r.status === 'completed').length
  };

  // Statistiques par catégorie
  const categoryStats = {
    flight: reservations.filter(r => r.trip_type === 'flight').length,
    hotel: reservations.filter(r => r.trip_type === 'hotel').length,
    car_rental: reservations.filter(r => r.trip_type === 'car_rental').length,
    ground_transport: reservations.filter(r => r.trip_type === 'ground_transport').length,
    activity: reservations.filter(r => r.trip_type === 'activity').length
  };

  const categoryConfig = {
    all: { label: 'Toutes', icon: Calendar, color: 'text-[#6b8f7b] dark:text-dark-text-muted' },
    flight: { label: 'Vols', icon: Plane, color: 'text-blue-600' },
    hotel: { label: 'Hôtels', icon: Hotel, color: 'text-purple-600' },
    car_rental: { label: 'Locations voiture', icon: Car, color: 'text-[#c9a844]' },
    ground_transport: { label: 'Transports terrestres', icon: Bus, color: 'text-cyan-600' },
    activity: { label: 'Activités', icon: Ticket, color: 'text-pink-600' }
  };

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-serif font-bold mb-2 text-[#1a4a36] dark:text-dark-text">Mes Réservations</h1>
        <p className="text-[#6b8f7b] dark:text-dark-text-muted">Consultez et gérez toutes vos réservations de voyage</p>
      </header>

      {/* Stats par statut */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-[#f7f5f0] dark:bg-dark-bg p-4 rounded-full border border-[#e0dcd4] dark:border-dark-border">
          <div className="text-2xl font-bold text-[#1a4a36] dark:text-dark-text">{stats.total}</div>
          <div className="text-xs text-[#6b8f7b] dark:text-dark-text-muted">Total</div>
        </div>
        <div className="bg-[#f7f5f0] dark:bg-dark-bg p-4 rounded-full border border-[#e0dcd4] dark:border-dark-border">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-xs text-[#6b8f7b] dark:text-dark-text-muted">En attente</div>
        </div>
        <div className="bg-[#f7f5f0] dark:bg-dark-bg p-4 rounded-full border border-[#e0dcd4] dark:border-dark-border">
          <div className="text-2xl font-bold text-[#16a34a]">{stats.confirmed}</div>
          <div className="text-xs text-[#6b8f7b] dark:text-dark-text-muted">Confirmées</div>
        </div>
        <div className="bg-[#f7f5f0] dark:bg-dark-bg p-4 rounded-full border border-[#e0dcd4] dark:border-dark-border">
          <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
          <div className="text-xs text-[#6b8f7b] dark:text-dark-text-muted">Terminées</div>
        </div>
        <div className="bg-[#f7f5f0] dark:bg-dark-bg p-4 rounded-full border border-[#e0dcd4] dark:border-dark-border">
          <div className="text-2xl font-bold text-[#dc2626]">{stats.cancelled}</div>
          <div className="text-xs text-[#6b8f7b] dark:text-dark-text-muted">Annulées</div>
        </div>
      </div>

      {/* Stats par catégorie */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        {Object.entries(categoryConfig).map(([key, config]) => {
          const Icon = config.icon;
          const count = key === 'all' ? stats.total : categoryStats[key];
          return (
            <button
              key={key}
              onClick={() => setFilterCategory(key)}
              className={`p-4 rounded-full border transition-all ${
                filterCategory === key
                  ? 'bg-[#2d7a5a]/10 border-[#e0dcd4] dark:border-dark-border'
                  : 'bg-[#f7f5f0] dark:bg-dark-bg border-[#e0dcd4] dark:border-dark-border hover:border-[#e0dcd4] dark:border-dark-border'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon size={20} className={filterCategory === key ? 'text-[#2d7a5a]' : config.color} />
                <div className={`text-2xl font-bold ${filterCategory === key ? 'text-[#2d7a5a]' : 'text-[#1a4a36] dark:text-dark-text'}`}>
                  {count}
                </div>
              </div>
              <div className={`text-xs ${filterCategory === key ? 'text-[#2d7a5a]' : 'text-[#6b8f7b] dark:text-dark-text-muted'}`}>
                {config.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Filtres par statut */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {[
          { value: 'all', label: 'Tous statuts' },
          { value: 'pending', label: 'En attente' },
          { value: 'confirmed', label: 'Confirmées' },
          { value: 'completed', label: 'Terminées' },
          { value: 'cancelled', label: 'Annulées' }
        ].map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilterStatus(value)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              filterStatus === value
                ? 'bg-[#2d7a5a] text-black'
                : 'bg-[#f7f5f0] dark:bg-dark-bg text-[#6b8f7b] dark:text-dark-text-muted hover:bg-[#f7f5f0] dark:bg-dark-bg'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Affichage de la catégorie active */}
      {filterCategory !== 'all' && (
        <div className="mb-6 flex items-center gap-2">
          <span className="text-[#6b8f7b] dark:text-dark-text-muted text-sm">Filtre actif :</span>
          <span className="px-3 py-1 bg-[#2d7a5a]/10 text-[#2d7a5a] rounded-full text-sm font-medium border border-[#e0dcd4] dark:border-dark-border">
            {categoryConfig[filterCategory]?.label}
          </span>
          <button
            onClick={() => setFilterCategory('all')}
            className="text-[#6b8f7b] dark:text-dark-text-muted hover:text-[#1a4a36] dark:text-dark-text text-sm underline"
          >
            Effacer
          </button>
        </div>
      )}

      {/* Contenu */}
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2d7a5a] mx-auto mb-4"></div>
          <p className="text-[#6b8f7b] dark:text-dark-text-muted">Chargement de vos réservations...</p>
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <AlertCircle size={48} className="mx-auto mb-4 text-[#dc2626]" />
          <p className="text-[#dc2626] mb-4">{error}</p>
          <button
            onClick={fetchReservations}
            className="px-6 py-2 bg-[#2d7a5a] text-black rounded-full font-semibold hover:bg-[#1a4a36] transition-all"
          >
            Réessayer
          </button>
        </div>
      ) : filteredReservations.length === 0 ? (
        <div className="text-center py-20">
          <Calendar size={64} className="mx-auto mb-4 text-[#6b8f7b] dark:text-dark-text-muted" />
          <p className="text-[#6b8f7b] dark:text-dark-text-muted mb-2">
            {filterCategory === 'all' && filterStatus === 'all'
              ? "Vous n'avez aucune réservation pour le moment"
              : filterCategory !== 'all'
              ? `Aucune réservation de type "${categoryConfig[filterCategory]?.label}"`
              : `Aucune réservation ${filterStatus === 'pending' ? 'en attente' : filterStatus === 'confirmed' ? 'confirmée' : filterStatus === 'completed' ? 'terminée' : 'annulée'}`}
          </p>
          <p className="text-[#6b8f7b] dark:text-dark-text-muted text-sm">
            {filterCategory === 'all' && filterStatus === 'all' && "Réservez votre premier voyage pour commencer"}
          </p>
        </div>
      ) : (
        <div>
          {/* Titre de section */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#1a4a36] dark:text-dark-text">
              {filterCategory === 'all' 
                ? 'Toutes les réservations' 
                : categoryConfig[filterCategory]?.label}
              <span className="text-[#6b8f7b] dark:text-dark-text-muted text-sm font-normal ml-3">
                ({filteredReservations.length} {filteredReservations.length > 1 ? 'réservations' : 'réservation'})
              </span>
            </h2>
          </div>

          {/* Grille des réservations */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* Modal de détails */}
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
