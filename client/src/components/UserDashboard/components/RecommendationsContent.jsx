import React, { useState, useEffect } from 'react';
import { Star, MapPin, ChevronRight, Heart, Search } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import DestinationDetailPage from './DestinationDetailPage';

// API URL
const API_URL = (import.meta.env && import.meta.env.VITE_API_URL) 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : 'http://localhost:3000/api';

// ============================================================================
// CARD SIMPLE
// ============================================================================

const RecommendationCard = ({ destination, onViewDetails, openAuthModal, t }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const { isAuthenticated } = useAuth();

  const imageUrl = destination.image_url || 'https://images.unsplash.com/photo-1567874790230-3acbb51e61dd?auto=format&fit=crop&w=800&q=80';
  const locationBadge = destination.country || destination.location || 'ALGÉRIE';
  const matchPercentage = destination.matchPercentage || Math.round((destination.affinityScore || 0) * 100);

  const toggleFavorite = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) { 
      if (openAuthModal) openAuthModal('login'); 
      return; 
    }
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      if (isFavorite) {
        const res = await fetch(`${API_URL.replace('/api', '')}/api/favorites`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        const fav = data.favorites?.find(f => f.targetId === destination.id && f.targetType === 'destination');
        if (fav) {
          await fetch(`${API_URL.replace('/api', '')}/api/favorites/${fav.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          });
        }
        setIsFavorite(false);
      } else {
        await fetch(`${API_URL.replace('/api', '')}/api/favorites`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ targetType: 'destination', targetId: destination.id })
        });
        setIsFavorite(true);
      }
    } catch (err) { console.error('Fav error:', err); }
  };

  return (
    <div className="w-full rounded-xl overflow-hidden border border-stone-200 dark:border-dark-border bg-white dark:bg-dark-surface hover:shadow-lg transition-shadow duration-300">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden group cursor-pointer" onClick={onViewDetails}>
        <img
          src={imageUrl}
          alt={destination.name || 'Destination'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => { 
            e.target.onerror = null; 
            e.target.src = 'https://images.unsplash.com/photo-1567874790230-3acbb51e61dd?auto=format&fit=crop&w=800&q=80'; 
          }}
        />
        
        {/* Badge location */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded text-white text-xs font-medium uppercase">
          <MapPin className="w-3 h-3" />
          {locationBadge}
        </div>

        {/* Badge Match */}
        {matchPercentage > 0 && (
          <div className="absolute top-3 right-3 px-2 py-1 rounded font-bold text-[10px] uppercase bg-[#2d7a5a] text-white">
            {matchPercentage}% Match
          </div>
        )}

        {/* Favori */}
        <button
          onClick={toggleFavorite}
          className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#2d7a5a]"
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-[#2d7a5a] text-[#2d7a5a]' : 'text-white'}`} />
        </button>
      </div>

      {/* Contenu */}
      <div className="p-4">
        <h3 className="text-xl font-serif font-bold text-[#1a4a36] dark:text-dark-text mb-2">
          {destination.name || 'Destination'}
        </h3>

        <div className="flex items-center gap-3 mb-3 text-stone-500 dark:text-dark-text-muted text-sm">
          <span className="flex items-center gap-1">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            {destination.rating || '4.5'}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {destination.location || destination.country || ''}
          </span>
        </div>

        <button
          onClick={onViewDetails}
          className="flex items-center gap-1 text-[#2d7a5a] hover:text-[#1a4a36] text-sm font-medium uppercase tracking-wider transition-colors"
        >
          {t && t('dashboard.viewDetails') ? t('dashboard.viewDetails') : 'Découvrir'}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// RECOMMENDATIONS CONTENT
// ============================================================================

const RecommendationsContent = ({ openAuthModal, t }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [allDestinations, setAllDestinations] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [activeTab, setActiveTab] = useState('recommendations');
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // S'assurer que t est défini
  const safeT = t || ((key) => key);

  useEffect(() => { 
    let mounted = true;
    fetchRecommendations().then(() => {
      if (!mounted) return;
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (activeTab === 'all' && allDestinations.length === 0) {
      fetchAllDestinations();
    }
  }, [activeTab]);

  useEffect(() => {
    const source = activeTab === 'recommendations' ? recommendations : allDestinations;
    if (!searchQuery.trim()) {
      setFilteredItems(source);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredItems(source.filter(dest =>
        (dest.name || '').toLowerCase().includes(q) ||
        (dest.location || '').toLowerCase().includes(q) ||
        (dest.country || '').toLowerCase().includes(q)
      ));
    }
  }, [searchQuery, recommendations, allDestinations, activeTab]);

  const fetchRecommendations = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    if (!token) { 
      await fetchPopular(); 
      return; 
    }
    
    try {
      const res = await fetch(`${API_URL}/recommendations/hybrid?limit=15`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Hybrid failed');
      const data = await res.json();
      setRecommendations(data.recommendations || []);
      setFilteredItems(data.recommendations || []);
    } catch (err) { 
      console.error('Hybrid error:', err);
      await fetchPopular(); 
    }
  };

  const fetchAllDestinations = async () => {
    try {
      const res = await fetch(`${API_URL}/recommendations/all-destinations`);
      if (res.ok) {
        const data = await res.json();
        setAllDestinations(data.destinations || []);
      }
    } catch (err) { console.error('All dest error:', err); }
  };

  const fetchPopular = async () => {
    try {
      const res = await fetch(`${API_URL}/recommendations/popular?limit=15`);
      if (res.ok) {
        const data = await res.json();
        setRecommendations(data.recommendations || []);
        setFilteredItems(data.recommendations || []);
      }
    } catch (err) { console.error('Popular error:', err); }
    finally { setLoading(false); }
  };

  // Rendu conditionnel avec vérifications
  if (selectedItem) {
    return <DestinationDetailPage item={selectedItem} onBack={() => setSelectedItem(null)} openAuthModal={openAuthModal} />;
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-stone-500">
        <Star size={48} className="mx-auto mb-4 text-[#2d7a5a] opacity-20 animate-pulse" />
        <p>Chargement des recommandations...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-serif font-bold mb-2 dark:text-dark-text">
          {safeT('dashboard.personalizedRecommendations') || 'Recommandations'}
        </h1>
        <p className="text-stone-500 dark:text-dark-text-muted">
          {safeT('dashboard.premiumSelection') || 'Sélection personnalisée'}
        </p>
      </header>

      {/* Onglets */}
      <div className="flex gap-3 mb-8 overflow-x-auto pb-1">
        <button 
          onClick={() => { setActiveTab('all'); setSearchQuery(''); }}
          className={`px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider whitespace-nowrap transition-all ${activeTab === 'all' ? 'bg-[#2d7a5a] text-white' : 'border border-stone-200 text-stone-500 hover:border-[#2d7a5a]'}`}
        >
          Toutes ({allDestinations.length})
        </button>
        <button 
          onClick={() => { setActiveTab('recommendations'); setSearchQuery(''); }}
          className={`px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider whitespace-nowrap transition-all ${activeTab === 'recommendations' ? 'bg-[#2d7a5a] text-white' : 'border border-stone-200 text-stone-500 hover:border-[#2d7a5a]'}`}
        >
          Recommandations ({recommendations.length})
        </button>
      </div>

      {/* Recherche */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 pointer-events-none" />
          <input 
            type="text" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une destination..."
            className="w-full pl-12 pr-4 py-3 border border-stone-200 rounded-3xl focus:outline-none focus:border-[#2d7a5a] dark:bg-dark-surface dark:border-dark-border dark:text-dark-text"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              ✕
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="mt-2 text-sm text-stone-500">
            {filteredItems.length} résultat{filteredItems.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Liste */}
      {filteredItems.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-stone-500 text-lg">
            {searchQuery ? 'Aucun résultat pour cette recherche' : 'Aucune recommandation disponible'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((dest) => (
            <RecommendationCard 
              key={dest.id || Math.random()} 
              destination={dest} 
              onViewDetails={() => setSelectedItem(dest)} 
              openAuthModal={openAuthModal} 
              t={safeT} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendationsContent;
