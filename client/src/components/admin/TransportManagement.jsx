import React, { useState, useEffect } from 'react';
import {
  Plane, Bus, Car, Plus, Trash2, Edit, X, Upload, CheckCircle2,
  MapPin, DollarSign, Clock, Star
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const TransportManagement = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [transports, setTransports] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    type: '',
    price: '',
    price_unit: 'per_person',
    destination_id: '',
    company: '',
    flight_number: '',
    departure_airport: '',
    arrival_airport: '',
    departure_time: '',
    arrival_time: '',
    duration: '',
    departure_city: '',
    arrival_city: '',
    schedule: '',
    car_model: '',
    rental_agency: '',
    pickup_location: '',
    deposit: '',
    is_api: false,
    rating: '5',
    comfort_score: '5',
    convenience_score: '5',
    is_available: true
  });

  useEffect(() => {
    fetchTransports();
    fetchDestinations();
  }, []);

  const fetchTransports = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/transports');
      const data = await response.json();
      setTransports(data.transports || []);
    } catch (err) {
      console.error('Fetch transports error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDestinations = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/destinations');
      const data = await response.json();
      setDestinations(data.destinations || data.rows || []);
    } catch (err) {
      console.error('Fetch destinations error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer ce transport ?')) {
      try {
        const token = localStorage.getItem('token');
        await fetch(`http://localhost:3000/api/transports/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchTransports();
        setSuccessMessage('Transport supprimé avec succès !');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } catch (err) {
        alert('Erreur suppression');
      }
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setSelectedCategory(null);
    setFormData({
      name: '', description: '', category: '', type: '', price: '',
      price_unit: 'per_person', destination_id: '', company: '',
      flight_number: '', departure_airport: '', arrival_airport: '',
      departure_time: '', arrival_time: '', duration: '',
      departure_city: '', arrival_city: '', schedule: '',
      car_model: '', rental_agency: '', pickup_location: '', deposit: '',
      is_api: false, rating: '5', comfort_score: '5',
      convenience_score: '5', is_available: true
    });
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (transport) => {
    setEditingId(transport.id);
    setSelectedCategory(transport.category);
    setFormData({
      name: transport.name || '',
      description: transport.description || '',
      category: transport.category || '',
      type: transport.type || '',
      price: transport.price || '',
      price_unit: transport.price_unit || 'per_person',
      destination_id: transport.destination_id || '',
      company: transport.company || '',
      flight_number: transport.flight_number || '',
      departure_airport: transport.departure_airport || '',
      arrival_airport: transport.arrival_airport || '',
      departure_time: transport.departure_time || '',
      arrival_time: transport.arrival_time || '',
      duration: transport.duration || '',
      departure_city: transport.departure_city || '',
      arrival_city: transport.arrival_city || '',
      schedule: transport.schedule || '',
      car_model: transport.car_model || '',
      rental_agency: transport.rental_agency || '',
      pickup_location: transport.pickup_location || '',
      deposit: transport.deposit || '',
      is_api: transport.is_api || false,
      rating: transport.rating?.toString() || '5',
      comfort_score: (transport.comfort_score * 10)?.toString() || '5',
      convenience_score: (transport.convenience_score * 10)?.toString() || '5',
      is_available: transport.is_available !== false
    });
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setFormData({ ...formData, category });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const data = new FormData();
    
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('category', formData.category);
    data.append('type', formData.type);
    data.append('price', formData.price);
    data.append('price_unit', formData.price_unit);
    data.append('destination_id', formData.destination_id);
    data.append('company', formData.company);
    data.append('flight_number', formData.flight_number);
    data.append('departure_airport', formData.departure_airport);
    data.append('arrival_airport', formData.arrival_airport);
    data.append('departure_time', formData.departure_time);
    data.append('arrival_time', formData.arrival_time);
    data.append('duration', formData.duration);
    data.append('departure_city', formData.departure_city);
    data.append('arrival_city', formData.arrival_city);
    data.append('schedule', formData.schedule);
    data.append('car_model', formData.car_model);
    data.append('rental_agency', formData.rental_agency);
    data.append('pickup_location', formData.pickup_location);
    data.append('deposit', formData.deposit);
    data.append('is_api', formData.is_api);
    data.append('rating', formData.rating);
    data.append('comfort_score', (parseFloat(formData.comfort_score) / 10).toString());
    data.append('convenience_score', (parseFloat(formData.convenience_score) / 10).toString());
    data.append('is_available', formData.is_available);
    
    if (selectedFile) data.append('image', selectedFile);

    const endpoint = editingId
      ? `http://localhost:3000/api/transports/${editingId}`
      : 'http://localhost:3000/api/transports';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 'Authorization': `Bearer ${token}` },
        body: data
      });
      const result = await response.json();

      if (response.status === 201 || response.status === 200) {
        setIsModalOpen(false);
        setSelectedFile(null);
        fetchTransports();
        setSuccessMessage(editingId ? 'Transport modifié avec succès !' : 'Transport créé avec succès !');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        console.error('Validation errors:', result);
        alert('Erreur: ' + (result.message || 'Erreur inconnue') + '\n' + (result.errors ? result.errors.join(', ') : ''));
      }
    } catch (err) {
      console.error('Erreur réseau:', err);
      alert('Erreur réseau: ' + err.message);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'flight': return <Plane className="w-5 h-5" />;
      case 'ground': return <Bus className="w-5 h-5" />;
      case 'car_rental': return <Car className="w-5 h-5" />;
      default: return <Plane className="w-5 h-5" />;
    }
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'flight': return 'Vol';
      case 'ground': return 'Transport Terrestre';
      case 'car_rental': return 'Location Voiture';
      default: return category;
    }
  };

  const getPriceUnitLabel = (unit) => {
    switch (unit) {
      case 'per_person': return 'par personne';
      case 'per_day': return 'par jour';
      case 'total': return 'total';
      default: return 'par personne';
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {showSuccess && (
        <div className="fixed top-5 right-5 z-[9999] flex items-center gap-3 bg-[#2d7a5a] text-white px-6 py-4 rounded-full shadow-lg animate-in slide-in-from-right-full duration-300">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-[#1a4a36] dark:text-dark-text">Gestion des Transports</h2>
          <p className="text-[#6b8f7b] dark:text-dark-text-muted text-sm mt-1">Gérez les options de transport pour chaque destination</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-[#2d7a5a] text-white px-6 py-2.5 rounded-full font-medium hover:bg-[#1a4a36] flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Créer un transport
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#ffffff] dark:bg-dark-surface border border-[#e0dcd4] dark:border-dark-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#f7f5f0] dark:bg-dark-surface-2 flex items-center justify-center">
              <Plane className="w-5 h-5 text-[#2d7a5a] dark:text-dark-primary" />
            </div>
            <span className="text-[#6b8f7b] dark:text-dark-text-muted text-sm">Vols</span>
          </div>
          <p className="text-2xl font-semibold text-[#1a4a36] dark:text-dark-text">
            {transports.filter(t => t.category === 'flight').length}
          </p>
        </div>
        <div className="bg-[#ffffff] dark:bg-dark-surface border border-[#e0dcd4] dark:border-dark-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#f7f5f0] dark:bg-dark-surface-2 flex items-center justify-center">
              <Bus className="w-5 h-5 text-[#2d7a5a] dark:text-dark-primary" />
            </div>
            <span className="text-[#6b8f7b] dark:text-dark-text-muted text-sm">Transports Terrestres</span>
          </div>
          <p className="text-2xl font-semibold text-[#1a4a36] dark:text-dark-text">
            {transports.filter(t => t.category === 'ground').length}
          </p>
        </div>
        <div className="bg-[#ffffff] dark:bg-dark-surface border border-[#e0dcd4] dark:border-dark-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#f7f5f0] dark:bg-dark-surface-2 flex items-center justify-center">
              <Car className="w-5 h-5 text-[#2d7a5a] dark:text-dark-primary" />
            </div>
            <span className="text-[#6b8f7b] dark:text-dark-text-muted text-sm">Locations Voiture</span>
          </div>
          <p className="text-2xl font-semibold text-[#1a4a36] dark:text-dark-text">
            {transports.filter(t => t.category === 'car_rental').length}
          </p>
        </div>
      </div>

      {/* Transports Table */}
      <div className="bg-[#ffffff] dark:bg-dark-surface border border-[#e0dcd4] dark:border-dark-border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-[#f7f5f0] dark:bg-dark-surface-2 text-[#6b8f7b] dark:text-dark-text-muted text-xs uppercase border-b border-[#e0dcd4] dark:border-dark-border">
            <tr>
              <th className="p-6">Visuel</th>
              <th className="p-6">Type</th>
              <th className="p-6">Nom/Compagnie</th>
              <th className="p-6">Destination</th>
              <th className="p-6">Prix</th>
              <th className="p-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e0dcd4] dark:divide-dark-border">
            {transports.map((t) => (
              <tr key={t.id} className="hover:bg-[#f7f5f0]/50 dark:hover:bg-dark-surface-2 transition">
                <td className="p-6">
                  <img
                    src={t.image_url || 'https://via.placeholder.com/150?text=Transport'}
                    className="w-16 h-12 object-cover rounded-lg border border-[#e0dcd4] dark:border-dark-border bg-[#f7f5f0] dark:bg-dark-surface-2"
                    alt=""
                    onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=No+Image'}
                  />
                </td>
                <td className="p-6">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(t.category)}
                    <span className="text-[#2d7a5a] dark:text-dark-primary text-sm">{getCategoryLabel(t.category)}</span>
                  </div>
                </td>
                <td className="p-6">
                  <div>
                    <p className="font-medium text-[#1a4a36] dark:text-dark-text">{t.name}</p>
                    {t.company && <p className="text-xs text-[#6b8f7b] dark:text-dark-text-muted">{t.company}</p>}
                  </div>
                </td>
                <td className="p-6">
                  <div className="flex items-center gap-2 text-[#6b8f7b] dark:text-dark-text-muted">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{t.destination?.name || 'N/A'}</span>
                  </div>
                </td>
                <td className="p-6">
                  <div>
                    <p className="text-[#2d7a5a] dark:text-dark-primary font-semibold">{t.price} DA</p>
                    <p className="text-xs text-[#6b8f7b] dark:text-dark-text-muted">{getPriceUnitLabel(t.price_unit)}</p>
                  </div>
                </td>
                <td className="p-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEditModal(t)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="p-2 text-[#dc2626] hover:bg-[#fef2f2] rounded-full transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {transports.length === 0 && (
          <div className="text-center py-12 text-[#6b8f7b] dark:text-dark-text-muted">
            Aucun transport enregistré pour le moment
          </div>
        )}
      </div>

      {/* Category Selection Modal */}
      {isModalOpen && !selectedCategory && !editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[#ffffff] dark:bg-dark-surface w-full max-w-2xl rounded-2xl p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-[#1a4a36] dark:text-dark-text">Créer un transport</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#6b8f7b] dark:text-dark-text-muted hover:text-[#2d7a5a] dark:hover:text-dark-primary">
                <X />
              </button>
            </div>
            <p className="text-[#6b8f7b] dark:text-dark-text-muted mb-6">Sélectionnez le type de transport que vous souhaitez créer :</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => handleCategorySelect('flight')}
                className="p-6 bg-[#f7f5f0] dark:bg-dark-surface-2 border border-[#e0dcd4] dark:border-dark-border rounded-xl hover:border-[#2d7a5a] dark:hover:border-dark-primary transition group"
              >
                <Plane className="w-10 h-10 text-[#2d7a5a] dark:text-dark-primary mb-3 group-hover:scale-110 transition-transform" />
                <h4 className="font-semibold text-[#1a4a36] dark:text-dark-text mb-1">Vol (Avion)</h4>
                <p className="text-xs text-[#6b8f7b] dark:text-dark-text-muted">Compagnie aérienne, numéro de vol, aéroports</p>
              </button>
              <button
                onClick={() => handleCategorySelect('ground')}
                className="p-6 bg-[#f7f5f0] dark:bg-dark-surface-2 border border-[#e0dcd4] dark:border-dark-border rounded-xl hover:border-[#2d7a5a] dark:hover:border-dark-primary transition group"
              >
                <Bus className="w-10 h-10 text-[#2d7a5a] dark:text-dark-primary mb-3 group-hover:scale-110 transition-transform" />
                <h4 className="font-semibold text-[#1a4a36] dark:text-dark-text mb-1">Transport Terrestre</h4>
                <p className="text-xs text-[#6b8f7b] dark:text-dark-text-muted">Bus, Taxi, Navette entre villes</p>
              </button>
              <button
                onClick={() => handleCategorySelect('car_rental')}
                className="p-6 bg-[#f7f5f0] dark:bg-dark-surface-2 border border-[#e0dcd4] dark:border-dark-border rounded-xl hover:border-[#2d7a5a] dark:hover:border-dark-primary transition group"
              >
                <Car className="w-10 h-10 text-[#2d7a5a] dark:text-dark-primary mb-3 group-hover:scale-110 transition-transform" />
                <h4 className="font-semibold text-[#1a4a36] dark:text-dark-text mb-1">Location Voiture</h4>
                <p className="text-xs text-[#6b8f7b] dark:text-dark-text-muted">Agence de location, modèle, caution</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transport Form Modal */}
      {isModalOpen && (selectedCategory || editingId) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#ffffff] dark:bg-dark-surface w-full max-w-2xl rounded-2xl p-8 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-[#1a4a36] dark:text-dark-text">
                {editingId ? 'Modifier le transport' : `Créer un ${getCategoryLabel(selectedCategory || '').toLowerCase()}`}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#6b8f7b] dark:text-dark-text-muted hover:text-[#2d7a5a] dark:hover:text-dark-primary">
                <X />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Upload */}
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#d0ccc4] dark:border-dark-border rounded-xl cursor-pointer hover:border-[#2d7a5a] dark:hover:border-dark-primary bg-[#f7f5f0] dark:bg-dark-surface-2 transition">
                <Upload className="w-8 h-8 text-[#6b8f7b] dark:text-dark-text-muted mb-1" />
                <p className="text-xs text-[#6b8f7b] dark:text-dark-text-muted px-4 text-center truncate w-full">
                  {selectedFile ? selectedFile.name : 'Uploader une photo'}
                </p>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => setSelectedFile(e.target.files[0])} />
              </label>

              {/* Basic Info */}
              <input
                placeholder="Nom *"
                required
                className="w-full bg-[#ffffff] dark:bg-dark-surface border border-[#d0ccc4] dark:border-dark-border rounded-lg px-4 py-2.5 focus:border-[#2d7a5a] dark:focus:border-dark-primary outline-none transition text-[#1a4a36] dark:text-dark-text placeholder-[#6b8f7b] dark:placeholder-dark-text-muted"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
              <textarea
                placeholder="Description"
                className="w-full bg-[#ffffff] dark:bg-dark-surface border border-[#d0ccc4] dark:border-dark-border rounded-lg px-4 py-2.5 focus:border-[#2d7a5a] dark:focus:border-dark-primary outline-none transition min-h-[80px] text-[#1a4a36] dark:text-dark-text placeholder-[#6b8f7b] dark:placeholder-dark-text-muted"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />

              {/* Destination Selection */}
              <select
                className="w-full bg-[#ffffff] dark:bg-dark-surface border border-[#d0ccc4] dark:border-dark-border rounded-lg px-4 py-2.5 focus:border-[#2d7a5a] dark:focus:border-dark-primary outline-none transition text-[#1a4a36] dark:text-dark-text"
                value={formData.destination_id}
                onChange={e => setFormData({ ...formData, destination_id: e.target.value })}
                required
              >
                <option value="">-- Sélectionner une destination --</option>
                {destinations.map(dest => (
                  <option key={dest.id} value={dest.id}>{dest.name}</option>
                ))}
              </select>

              {/* Category-specific fields */}
              {selectedCategory === 'flight' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      placeholder="Compagnie aérienne"
                      className="w-full bg-[#ffffff] dark:bg-dark-surface border border-[#d0ccc4] dark:border-dark-border rounded-lg px-4 py-2.5 focus:border-[#2d7a5a] dark:focus:border-dark-primary outline-none transition text-[#1a4a36] dark:text-dark-text placeholder-[#6b8f7b] dark:placeholder-dark-text-muted"
                      value={formData.company}
                      onChange={e => setFormData({ ...formData, company: e.target.value })}
                    />
                    <input
                      placeholder="N° de vol"
                      className="w-full bg-[#ffffff] dark:bg-dark-surface border border-[#d0ccc4] dark:border-dark-border rounded-lg px-4 py-2.5 focus:border-[#2d7a5a] dark:focus:border-dark-primary outline-none transition text-[#1a4a36] dark:text-dark-text placeholder-[#6b8f7b] dark:placeholder-dark-text-muted"
                      value={formData.flight_number}
                      onChange={e => setFormData({ ...formData, flight_number: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      placeholder="Aéroport départ"
                      className="w-full bg-[#ffffff] dark:bg-dark-surface border border-[#d0ccc4] dark:border-dark-border rounded-lg px-4 py-2.5 focus:border-[#2d7a5a] dark:focus:border-dark-primary outline-none transition text-[#1a4a36] dark:text-dark-text placeholder-[#6b8f7b] dark:placeholder-dark-text-muted"
                      value={formData.departure_airport}
                      onChange={e => setFormData({ ...formData, departure_airport: e.target.value })}
                    />
                    <input
                      placeholder="Aéroport arrivée"
                      className="w-full bg-[#ffffff] dark:bg-dark-surface border border-[#d0ccc4] dark:border-dark-border rounded-lg px-4 py-2.5 focus:border-[#2d7a5a] dark:focus:border-dark-primary outline-none transition text-[#1a4a36] dark:text-dark-text placeholder-[#6b8f7b] dark:placeholder-dark-text-muted"
                      value={formData.arrival_airport}
                      onChange={e => setFormData({ ...formData, arrival_airport: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      placeholder="Heure départ"
                      type="time"
                      className="w-full bg-[#ffffff] dark:bg-dark-surface border border-[#d0ccc4] dark:border-dark-border rounded-lg px-4 py-2.5 focus:border-[#2d7a5a] dark:focus:border-dark-primary outline-none transition text-[#1a4a36] dark:text-dark-text placeholder-[#6b8f7b] dark:placeholder-dark-text-muted"
                      value={formData.departure_time}
                      onChange={e => setFormData({ ...formData, departure_time: e.target.value })}
                    />
                    <input
                      placeholder="Heure arrivée"
                      type="time"
                      className="w-full bg-[#ffffff] dark:bg-dark-surface border border-[#d0ccc4] dark:border-dark-border rounded-lg px-4 py-2.5 focus:border-[#2d7a5a] dark:focus:border-dark-primary outline-none transition text-[#1a4a36] dark:text-dark-text placeholder-[#6b8f7b] dark:placeholder-dark-text-muted"
                      value={formData.arrival_time}
                      onChange={e => setFormData({ ...formData, arrival_time: e.target.value })}
                    />
                  </div>
                  <input
                    placeholder="Durée (ex: 2h30)"
                    className="w-full bg-[#ffffff] dark:bg-dark-surface border border-[#d0ccc4] dark:border-dark-border rounded-lg px-4 py-2.5 focus:border-[#2d7a5a] dark:focus:border-dark-primary outline-none transition text-[#1a4a36] dark:text-dark-text placeholder-[#6b8f7b] dark:placeholder-dark-text-muted"
                    value={formData.duration}
                    onChange={e => setFormData({ ...formData, duration: e.target.value })}
                  />
                </>
              )}

              {selectedCategory === 'ground' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      placeholder="Ville départ"
                      className="w-full bg-[#ffffff] dark:bg-dark-surface border border-[#d0ccc4] dark:border-dark-border rounded-lg px-4 py-2.5 focus:border-[#2d7a5a] dark:focus:border-dark-primary outline-none transition text-[#1a4a36] dark:text-dark-text placeholder-[#6b8f7b] dark:placeholder-dark-text-muted"
                      value={formData.departure_city}
                      onChange={e => setFormData({ ...formData, departure_city: e.target.value })}
                    />
                    <input
                      placeholder="Ville arrivée"
                      className="w-full bg-[#ffffff] dark:bg-dark-surface border border-[#d0ccc4] dark:border-dark-border rounded-lg px-4 py-2.5 focus:border-[#2d7a5a] dark:focus:border-dark-primary outline-none transition text-[#1a4a36] dark:text-dark-text placeholder-[#6b8f7b] dark:placeholder-dark-text-muted"
                      value={formData.arrival_city}
                      onChange={e => setFormData({ ...formData, arrival_city: e.target.value })}
                    />
                  </div>
                  <input
                    placeholder="Horaires (ex: Toutes les heures)"
                    className="w-full bg-[#ffffff] dark:bg-dark-surface border border-[#d0ccc4] dark:border-dark-border rounded-lg px-4 py-2.5 focus:border-[#2d7a5a] dark:focus:border-dark-primary outline-none transition text-[#1a4a36] dark:text-dark-text placeholder-[#6b8f7b] dark:placeholder-dark-text-muted"
                    value={formData.schedule}
                    onChange={e => setFormData({ ...formData, schedule: e.target.value })}
                  />
                </>
              )}

              {selectedCategory === 'car_rental' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      placeholder="Modèle de voiture"
                      className="w-full bg-[#ffffff] dark:bg-dark-surface border border-[#d0ccc4] dark:border-dark-border rounded-lg px-4 py-2.5 focus:border-[#2d7a5a] dark:focus:border-dark-primary outline-none transition text-[#1a4a36] dark:text-dark-text placeholder-[#6b8f7b] dark:placeholder-dark-text-muted"
                      value={formData.car_model}
                      onChange={e => setFormData({ ...formData, car_model: e.target.value })}
                    />
                    <input
                      placeholder="Agence de location"
                      className="w-full bg-[#ffffff] dark:bg-dark-surface border border-[#d0ccc4] dark:border-dark-border rounded-lg px-4 py-2.5 focus:border-[#2d7a5a] dark:focus:border-dark-primary outline-none transition text-[#1a4a36] dark:text-dark-text placeholder-[#6b8f7b] dark:placeholder-dark-text-muted"
                      value={formData.rental_agency}
                      onChange={e => setFormData({ ...formData, rental_agency: e.target.value })}
                    />
                  </div>
                  <input
                    placeholder="Lieu de retrait"
                    className="w-full bg-[#ffffff] dark:bg-dark-surface border border-[#d0ccc4] dark:border-dark-border rounded-lg px-4 py-2.5 focus:border-[#2d7a5a] dark:focus:border-dark-primary outline-none transition text-[#1a4a36] dark:text-dark-text placeholder-[#6b8f7b] dark:placeholder-dark-text-muted"
                    value={formData.pickup_location}
                    onChange={e => setFormData({ ...formData, pickup_location: e.target.value })}
                  />
                  <input
                    placeholder="Caution (DA)"
                    type="number"
                    className="w-full bg-[#ffffff] dark:bg-dark-surface border border-[#d0ccc4] dark:border-dark-border rounded-lg px-4 py-2.5 focus:border-[#2d7a5a] dark:focus:border-dark-primary outline-none transition text-[#1a4a36] dark:text-dark-text placeholder-[#6b8f7b] dark:placeholder-dark-text-muted"
                    value={formData.deposit}
                    onChange={e => setFormData({ ...formData, deposit: e.target.value })}
                  />
                </>
              )}

              {/* Price and Rating */}
              <div className="grid grid-cols-3 gap-4">
                <input
                  placeholder="Prix DA *"
                  type="number"
                  required
                  className="w-full bg-[#ffffff] dark:bg-dark-surface border border-[#d0ccc4] dark:border-dark-border rounded-lg px-4 py-2.5 focus:border-[#2d7a5a] dark:focus:border-dark-primary outline-none transition text-[#1a4a36] dark:text-dark-text placeholder-[#6b8f7b] dark:placeholder-dark-text-muted"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                />
                <select
                  className="w-full bg-[#ffffff] dark:bg-dark-surface border border-[#d0ccc4] dark:border-dark-border rounded-lg px-4 py-2.5 focus:border-[#2d7a5a] dark:focus:border-dark-primary outline-none transition text-[#1a4a36] dark:text-dark-text"
                  value={formData.price_unit}
                  onChange={e => setFormData({ ...formData, price_unit: e.target.value })}
                >
                  <option value="per_person">Par personne</option>
                  <option value="per_day">Par jour</option>
                  <option value="total">Total</option>
                </select>
                <input
                  placeholder="Note (0-5)"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  className="w-full bg-[#ffffff] dark:bg-dark-surface border border-[#d0ccc4] dark:border-dark-border rounded-lg px-4 py-2.5 focus:border-[#2d7a5a] dark:focus:border-dark-primary outline-none transition text-[#1a4a36] dark:text-dark-text placeholder-[#6b8f7b] dark:placeholder-dark-text-muted"
                  value={formData.rating}
                  onChange={e => setFormData({ ...formData, rating: e.target.value })}
                />
              </div>

              {/* Scores */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#f7f5f0] dark:bg-dark-surface-2 border border-[#e0dcd4] dark:border-dark-border rounded-lg p-3">
                  <label className="text-xs text-[#6b8f7b] dark:text-dark-text-muted font-medium mb-1 block">Confort</label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    className="w-full accent-[#2d7a5a] dark:accent-dark-primary"
                    value={formData.comfort_score}
                    onChange={e => setFormData({ ...formData, comfort_score: e.target.value })}
                  />
                  <div className="text-right text-xs text-[#2d7a5a] dark:text-dark-primary font-medium mt-1">{formData.comfort_score}/10</div>
                </div>
                <div className="bg-[#f7f5f0] dark:bg-dark-surface-2 border border-[#e0dcd4] dark:border-dark-border rounded-lg p-3">
                  <label className="text-xs text-[#6b8f7b] dark:text-dark-text-muted font-medium mb-1 block">Praticité</label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    className="w-full accent-[#2d7a5a] dark:accent-dark-primary"
                    value={formData.convenience_score}
                    onChange={e => setFormData({ ...formData, convenience_score: e.target.value })}
                  />
                  <div className="text-right text-xs text-[#2d7a5a] dark:text-dark-primary font-medium mt-1">{formData.convenience_score}/10</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-[#2d7a5a]"
                    checked={formData.is_available}
                    onChange={e => setFormData({ ...formData, is_available: e.target.checked })}
                  />
                  <span className="text-sm text-[#2d7a5a] dark:text-dark-primary">Disponible</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-[#2d7a5a]"
                    checked={formData.is_api}
                    onChange={e => setFormData({ ...formData, is_api: e.target.checked })}
                  />
                  <span className="text-sm text-[#2d7a5a] dark:text-dark-primary">Réservation interne</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-[#2d7a5a] text-white font-semibold py-3 rounded-full hover:bg-[#1a4a36] transition shadow-sm"
              >
                {editingId ? 'Modifier' : 'Créer'} le transport
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransportManagement;
