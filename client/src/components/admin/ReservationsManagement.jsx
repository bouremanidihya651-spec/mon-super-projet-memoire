import React, { useState, useEffect } from 'react';
import {
  Search, Filter, Download, Eye, X, AlertCircle,
  Calendar, Plane, Hotel, Car, Bus, Ticket, DollarSign, User
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const ReservationsManagement = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReservation, setSelectedReservation] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    // Vérifier si le token existe
    if (!token) {
      setError('Non autorisé. Veuillez vous connecter.');
      setLoading(false);
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
    
    // Vérifier si le token est expiré
    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      if (tokenData.exp && tokenData.exp * 1000 < Date.now()) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setError('Session expirée. Redirection...');
        setLoading(false);
        setTimeout(() => navigate('/login'), 2000);
        return;
      }
    } catch (e) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setError('Token invalide. Redirection...');
      setLoading(false);
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
    
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/reservations`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setReservations(response.data.reservations || response.data.rows || []);
      }
    } catch (err) {
      console.error('Error fetching reservations:', err);
      
      // Gérer les erreurs d'authentification
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Session expirée. Veuillez vous reconnecter.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(err.response?.data?.message || 'Erreur lors du chargement');
      }
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      flight: <Plane size={14} />,
      hotel: <Hotel size={14} />,
      car_rental: <Car size={14} />,
      ground_transport: <Bus size={14} />,
      activity: <Ticket size={14} />
    };
    return icons[type] || <Calendar size={14} />;
  };

  const getTypeLabel = (type) => {
    const labels = {
      flight: 'Vol',
      hotel: 'Hôtel',
      car_rental: 'Location voiture',
      ground_transport: 'Transport terrestre',
      activity: 'Activité'
    };
    return labels[type] || 'Réservation';
  };

  const getReservationName = (reservation) => {
    if (reservation.transport?.name) return reservation.transport.name;
    if (reservation.hotel?.name) return reservation.hotel.name;
    if (reservation.activity?.name) return reservation.activity.name;
    return 'Réservation';
  };

  const filteredReservations = reservations.filter(r => {
    const typeMatch = filterType === 'all' || r.trip_type === filterType;
    const searchMatch = searchTerm === '' ||
      getReservationName(r).toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.confirmation_number?.toLowerCase().includes(searchTerm.toLowerCase());
    return typeMatch && searchMatch;
  });

  const stats = {
    total: reservations.length
  };

  const totalRevenue = reservations
    .filter(r => r.payment_status === 'paid')
    .reduce((sum, r) => sum + parseFloat(r.total_price || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2d7a5a] dark:border-dark-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <AlertCircle size={48} className="mx-auto mb-4 text-[#dc2626]" />
        <p className="text-[#dc2626]">{error}</p>
        <button onClick={fetchReservations} className="mt-4 px-6 py-2 bg-[#2d7a5a] text-white rounded-full font-medium hover:bg-[#1a4a36] transition-colors">
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
        <div className="bg-[#ffffff] dark:bg-dark-surface border border-[#e0dcd4] dark:border-dark-border rounded-2xl p-5 shadow-sm">
          <p className="text-xs text-[#6b8f7b] dark:text-dark-text-muted uppercase tracking-wide">Total</p>
          <p className="text-3xl font-semibold mt-1 text-[#1a4a36] dark:text-dark-text">{stats.total}</p>
        </div>
        <div className="bg-[#ffffff] dark:bg-dark-surface border border-[#e0dcd4] dark:border-dark-border rounded-2xl p-5 shadow-sm">
          <p className="text-xs text-[#6b8f7b] dark:text-dark-text-muted uppercase tracking-wide">Revenus</p>
          <p className="text-2xl font-semibold mt-1 text-[#2d7a5a] dark:text-dark-primary">{totalRevenue.toFixed(0)} DA</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b8f7b] dark:text-dark-text-muted" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-[#ffffff] dark:bg-dark-surface border border-[#d0ccc4] dark:border-dark-border rounded-full text-sm text-[#1a4a36] dark:text-dark-text focus:border-[#2d7a5a] outline-none"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 bg-[#ffffff] dark:bg-dark-surface border border-[#d0ccc4] dark:border-dark-border rounded-full text-sm text-[#1a4a36] dark:text-dark-text focus:border-[#2d7a5a] outline-none"
          >
            <option value="all">Tous types</option>
            <option value="flight">Vols</option>
            <option value="hotel">Hôtels</option>
            <option value="car_rental">Locations voiture</option>
            <option value="ground_transport">Transports</option>
            <option value="activity">Activités</option>
          </select>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 bg-[#ffffff] dark:bg-dark-surface border border-[#d0ccc4] dark:border-dark-border text-[#1a4a36] dark:text-dark-text rounded-full text-sm hover:border-[#2d7a5a] transition">
          <Download size={16} />
          Exporter
        </button>
      </div>

      {/* Tableau */}
      <div className="bg-[#ffffff] dark:bg-dark-surface border border-[#e0dcd4] dark:border-dark-border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-[#f7f5f0] dark:bg-dark-surface-2 text-[#6b8f7b] dark:text-dark-text-muted text-xs uppercase border-b border-[#e0dcd4] dark:border-dark-border">
            <tr>
              <th className="p-6">Réservation</th>
              <th className="p-6">Client</th>
              <th className="p-6">Type</th>
              <th className="p-6">Date</th>
              <th className="p-6">Prix</th>
              <th className="p-6">Paiement</th>
              <th className="p-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e0dcd4] dark:divide-dark-border">
            {filteredReservations.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-12 text-center text-[#6b8f7b] dark:text-dark-text-muted">
                  Aucune réservation trouvée
                </td>
              </tr>
            ) : (
              filteredReservations.map((reservation) => (
                <tr key={reservation.id} className="hover:bg-[#f7f5f0]/50 dark:hover:bg-dark-bg/50 transition">
                  <td className="p-6">
                    <div>
                      <p className="font-medium truncate max-w-[200px] text-[#1a4a36] dark:text-dark-text">{getReservationName(reservation)}</p>
                      <p className="text-xs text-[#6b8f7b] dark:text-dark-text-muted">{reservation.confirmation_number}</p>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#f7f5f0] dark:bg-dark-bg flex items-center justify-center border border-[#e0dcd4] dark:border-dark-border">
                        <User size={16} className="text-[#6b8f7b] dark:text-dark-text-muted" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#1a4a36] dark:text-dark-text">{reservation.user?.username || 'N/A'}</p>
                        <p className="text-xs text-[#6b8f7b] dark:text-dark-text-muted">{reservation.user?.email || ''}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                      <span className="text-[#6b8f7b] dark:text-dark-text-muted">{getTypeIcon(reservation.trip_type)}</span>
                      <span className="text-sm text-[#1a4a36] dark:text-dark-text">{getTypeLabel(reservation.trip_type)}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="text-sm">
                      <p className="text-[#1a4a36] dark:text-dark-text">{new Date(reservation.departure_date).toLocaleDateString('fr-FR')}</p>
                      {reservation.return_date && (
                        <p className="text-xs text-[#6b8f7b] dark:text-dark-text-muted">
                          au {new Date(reservation.return_date).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="p-6">
                    <p className="font-semibold text-[#2d7a5a] dark:text-dark-primary">{parseFloat(reservation.total_price || 0).toFixed(2)} DA</p>
                  </td>
                  <td className="p-6">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      reservation.payment_status === 'paid'
                        ? 'bg-[#dcfce7] dark:bg-green-900/30 text-[#15803d] dark:text-green-500'
                        : reservation.payment_status === 'pending'
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-500'
                        : 'bg-[#f7f5f0] dark:bg-dark-bg text-[#2d7a5a] dark:text-dark-text-muted'
                    }`}>
                      {reservation.payment_status === 'paid' ? 'Payé' :
                       reservation.payment_status === 'pending' ? 'En attente' :
                       reservation.payment_status}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedReservation(reservation)}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition"
                        title="Voir détails"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de détails */}
      {selectedReservation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#ffffff] dark:bg-dark-surface rounded-2xl border border-[#e0dcd4] dark:border-dark-border max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-[#ffffff] dark:bg-dark-surface border-b border-[#e0dcd4] dark:border-dark-border p-6 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <span className="text-[#2d7a5a] dark:text-surface">{getTypeIcon(selectedReservation.trip_type)}</span>
                <h2 className="text-xl font-semibold text-[#1a4a36] dark:text-dark-text">Détails de la réservation</h2>
              </div>
              <button onClick={() => setSelectedReservation(null)} className="p-2 hover:bg-[#f7f5f0] dark:hover:bg-dark-bg rounded-full text-[#6b8f7b] dark:text-dark-text-muted transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Confirmation number */}
              <div className="bg-[#f7f5f0] dark:bg-dark-bg border border-[#e0dcd4] dark:border-dark-border rounded-xl p-4 text-center">
                <p className="text-xs text-[#2d7a5a] dark:text-surface uppercase tracking-widest mb-1">Numéro de confirmation</p>
                <p className="text-2xl font-semibold text-[#2d7a5a] dark:text-surface">{selectedReservation.confirmation_number}</p>
              </div>

              {/* Paiement */}
              <div>
                <p className="text-xs text-[#6b8f7b] dark:text-dark-text-muted uppercase tracking-widest mb-2">Paiement</p>
                <span className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                  selectedReservation.payment_status === 'paid'
                    ? 'bg-[#dcfce7] dark:bg-green-900/30 text-[#15803d] dark:text-green-500 border-green-200 dark:border-green-900/50'
                    : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-500 border-yellow-200 dark:border-yellow-900/50'
                }`}>
                  {selectedReservation.payment_status === 'paid' ? 'Payé' :
                   selectedReservation.payment_status === 'pending' ? 'En attente' :
                   selectedReservation.payment_status}
                </span>
              </div>

              {/* Informations client */}
              <div className="border-t border-[#e0dcd4] dark:border-dark-border pt-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#2d7a5a] dark:text-surface mb-4">Informations client</h3>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b border-[#f0ece6] dark:border-dark-border">
                    <span className="text-[#6b8f7b] dark:text-dark-text-muted">Nom d'utilisateur</span>
                    <span className="font-medium text-[#1a4a36] dark:text-dark-text">{selectedReservation.user?.username}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#f0ece6] dark:border-dark-border">
                    <span className="text-[#6b8f7b] dark:text-dark-text-muted">Email</span>
                    <span className="font-medium text-[#1a4a36] dark:text-dark-text">{selectedReservation.user?.email}</span>
                  </div>
                </div>
              </div>

              {/* Détails de la réservation */}
              <div className="border-t border-[#e0dcd4] dark:border-dark-border pt-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#2d7a5a] dark:text-surface mb-4">Détails de l'offre</h3>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b border-[#f0ece6] dark:border-dark-border">
                    <span className="text-[#6b8f7b] dark:text-dark-text-muted">Nom</span>
                    <span className="font-medium text-[#1a4a36] dark:text-dark-text">{getReservationName(selectedReservation)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#f0ece6] dark:border-dark-border">
                    <span className="text-[#6b8f7b] dark:text-dark-text-muted">Type</span>
                    <span className="font-medium text-[#1a4a36] dark:text-dark-text">{getTypeLabel(selectedReservation.trip_type)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#f0ece6] dark:border-dark-border">
                    <span className="text-[#6b8f7b] dark:text-dark-text-muted">Date de début</span>
                    <span className="font-medium text-[#1a4a36] dark:text-dark-text">
                      {new Date(selectedReservation.departure_date).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </span>
                  </div>
                  {selectedReservation.return_date && (
                    <div className="flex justify-between py-2 border-b border-[#f0ece6] dark:border-dark-border">
                      <span className="text-[#6b8f7b] dark:text-dark-text-muted">Date de fin</span>
                      <span className="font-medium text-[#1a4a36] dark:text-dark-text">
                        {new Date(selectedReservation.return_date).toLocaleDateString('fr-FR', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-b border-[#f0ece6] dark:border-dark-border">
                    <span className="text-[#6b8f7b] dark:text-dark-text-muted">Participants</span>
                    <span className="font-medium text-[#1a4a36] dark:text-dark-text">
                      {selectedReservation.adults} adultes{selectedReservation.children > 0 && `, ${selectedReservation.children} enfants`}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#f0ece6] dark:border-dark-border">
                    <span className="text-[#6b8f7b] dark:text-dark-text-muted">Prix total</span>
                    <span className="font-bold text-[#c9a844]">
                      {parseFloat(selectedReservation.total_price || 0).toFixed(2)} DA
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-[#e0dcd4] dark:border-dark-border pt-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#2d7a5a] dark:text-surface mb-4">Actions</h3>
                <div className="grid grid-cols-1 gap-3">
                  {selectedReservation.payment_status === 'paid' && (
                    <button
                      onClick={() => {
                        window.open(`${API_URL}/invoices/${selectedReservation.id}/download`, '_blank');
                      }}
                      className="px-4 py-3 bg-[#f7f5f0] dark:bg-dark-bg border border-[#e0dcd4] dark:border-dark-border text-[#2d7a5a] dark:text-surface rounded-xl font-bold hover:bg-[#e8e4de] dark:hover:bg-dark-surface-2 transition-all flex items-center justify-center gap-2"
                    >
                      <Download size={16} />
                      Télécharger facture
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-[#ffffff] dark:bg-dark-surface border-t border-[#e0dcd4] dark:border-dark-border p-6">
              <button
                onClick={() => setSelectedReservation(null)}
                className="w-full px-6 py-3 bg-[#2d7a5a] text-white rounded-full font-bold hover:bg-[#1a4a36] transition-all shadow-md"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationsManagement;
