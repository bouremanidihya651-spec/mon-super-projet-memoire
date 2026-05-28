import React, { useState, useEffect, useCallback } from 'react';
import { 
  Star, MapPin, Heart, Search, X, ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import DestinationDetailPage from './DestinationDetailPage';
import { useTheme } from '../../../contexts/ThemeContext';

/* ============================================
   STYLES GLOBAUX
   ============================================ */
const GlobalStyles = () => (
  <style>{`
    .scrollbar-hide { -ms-overflow-style: none !important; scrollbar-width: none !important; }
    .scrollbar-hide::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
    @supports (-webkit-touch-callout: none) {
      .ios-no-zoom input, .ios-no-zoom textarea, .ios-no-zoom select { font-size: 16px !important; }
    }
    .safe-bottom { padding-bottom: env(safe-area-inset-bottom, 0px); }
    .touch-pan-y { touch-action: pan-y; }
    .no-select { -webkit-user-select: none; user-select: none; }
    .scroll-smooth { scroll-behavior: smooth; -webkit-overflow-scrolling: touch; }
    .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
    .card-hover-lift { transition: transform 0.3s ease, box-shadow 0.3s ease; }
    .card-hover-lift:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.15); }
    .focus-ring:focus-visible { outline: 2px solid #2d7a5a; outline-offset: 2px; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .animate-fade-in { animation: fadeIn 0.3s ease-out; }
    .animate-slide-up { animation: slideUp 0.4s ease-out; }
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
    }
  `}</style>
);

/* ============================================
   HOOK MEDIA QUERY
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

// ============================================================================
// CARD — INFOS DESTINATION UNIQUEMENT (sans Match%, badge algo, debug)
// ============================================================================
const RecommendationCard = ({ destination, index, onViewDetails, openAuthModal }) => {
  const { t } = useTranslation();
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [avgRating, setAvgRating] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => { checkFavoriteStatus(); }, [destination.id]);

  useEffect(() => {
    const fetchAvgRating = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/reviews/destination/${destination.id}`);
        const data = await res.json();
        const reviews = data.reviews || [];
        if (reviews.length > 0) {
          const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
          setAvgRating(avg.toFixed(1));
        }
      } catch (err) { /* silencieux */ }
    };
    fetchAvgRating();
  }, [destination.id]);

  const checkFavoriteStatus = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/favorites/check/destination/${destination.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setIsFavorite(data.isFavorite);
    } catch (err) { /* silencieux */ }
  };

  const toggleFavorite = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { openAuthModal('login'); return; }
    setFavoriteLoading(true);
    const token = localStorage.getItem('token');
    try {
      if (isFavorite) {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/favorites`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        const fav = data.favorites?.find(f => f.targetId === destination.id && f.targetType === 'destination');
        if (fav) {
          await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/favorites/${fav.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          });
        }
        setIsFavorite(false);
      } else {
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/favorites`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ targetType: 'destination', targetId: destination.id })
        });
        setIsFavorite(true);
      }
    } catch (err) { /* silencieux */ } finally { setFavoriteLoading(false); }
  }, [isFavorite, isAuthenticated, destination.id, openAuthModal]);

  const imageUrl = destination.image_url ||
    'https://images.unsplash.com/photo-1567874790230-3acbb51e61dd?auto=format&fit=crop&w=1200&q=80';

  const locationBadge = destination.country || destination.location || 'ALGÉRIE';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="w-full h-full"
    >
      <div
        className="relative w-full rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer border border-stone-200/50 dark:border-dark-border/50 hover:border-[#2d7a5a]/50 transition-all duration-500 group card-hover-lift bg-white dark:bg-dark-surface touch-pan-y"
        onClick={onViewDetails}
      >
        {/* ── Image ── */}
        <div className="relative aspect-[4/3] sm:aspect-[16/10] overflow-hidden">
          <img
            src={imageUrl}
            alt={destination.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
          />

          {/* Overlay au hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badge localisation — haut gauche */}
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-black/50 backdrop-blur-md rounded-md text-white text-[10px] sm:text-xs font-medium uppercase tracking-wider">
              <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              {locationBadge}
            </div>
          </div>

          {/* Bouton favori — bas droit, visible au hover */}
          <button
            onClick={toggleFavorite}
            disabled={favoriteLoading}
            className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 w-8 h-8 sm:w-9 sm:h-9 min-w-[32px] min-h-[32px] rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-[#2d7a5a] hover:border-[#2d7a5a] transition-all group/btn active:scale-95 focus-ring no-select opacity-0 group-hover:opacity-100"
            aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          >
            <Heart className={`w-4 h-4 transition-colors ${
              isFavorite ? 'fill-[#2d7a5a] text-[#2d7a5a]' : 'text-white group-hover/btn:text-white'
            }`} />
          </button>
        </div>

        {/* ── Contenu ── */}
        <div className="p-4 sm:p-5">
          {/* Nom */}
          <h3 className="text-lg sm:text-xl md:text-2xl font-serif font-bold text-[#1a4a36] dark:text-dark-text mb-2 sm:mb-3 line-clamp-1">
            {destination.name}
          </h3>

          {/* Rating + localisation */}
          <div className="flex items-center gap-3 mb-3 sm:mb-4 text-stone-500 dark:text-dark-text-muted text-xs sm:text-sm">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 fill-amber-500" />
              <span className="font-medium">{avgRating || destination.rating || '4.5'}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-stone-400" />
              <span className="truncate">{destination.location || destination.country}</span>
            </div>
          </div>

          {/* Bouton Découvrir */}
          <button
            onClick={(e) => { e.stopPropagation(); onViewDetails(); }}
            className="inline-flex items-center gap-1.5 sm:gap-2 text-[#2d7a5a] hover:text-[#1a4a36] font-medium text-xs sm:text-sm uppercase tracking-wider transition-colors group/link focus-ring no-select"
          >
            {t('dashboard.viewDetails') || 'Découvrir'}
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover/link:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// RECOMMENDATIONS CONTENT
// ============================================================================
const RecommendationsContent = ({ openAuthModal }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const isMobile = useMediaQuery('(max-width: 640px)');

  const [recommendations, setRecommendations] = useState([]);
  const [allDestinations, setAllDestinations] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [activeTab, setActiveTab] = useState('recommendations');
  const [loading, setLoading] = useState(true);
  const [loadingAll, setLoadingAll] = useState(false);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { fetchRecommendations(); }, []);

  useEffect(() => {
    if (activeTab === 'all' && allDestinations.length === 0) fetchAllDestinations();
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
        (dest.country || '').toLowerCase().includes(q) ||
        (dest.city || '').toLowerCase().includes(q)
      ));
    }
  }, [searchQuery, recommendations, allDestinations, activeTab]);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    if (!token) { await fetchPopular(); return; }
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/recommendations/hybrid?limit=15`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (!res.ok) { await fetchPopular(); return; }
      const data = await res.json();
      const recs = data.recommendations || [];
      setRecommendations(recs);
      setFilteredItems(recs);
    } catch (err) {
      setError(err.message);
      await fetchPopular();
    } finally { setLoading(false); }
  };

  const fetchAllDestinations = async () => {
    setLoadingAll(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/recommendations/all-destinations`);
      if (res.ok) {
        const data = await res.json();
        setAllDestinations(data.destinations || []);
      }
    } catch (err) { /* silencieux */ } finally { setLoadingAll(false); }
  };

  const fetchPopular = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/recommendations/popular?limit=15`);
      if (res.ok) {
        const data = await res.json();
        const recs = data.recommendations || [];
        setRecommendations(recs);
        setFilteredItems(recs);
      }
    } catch (err) { /* silencieux */ } finally { setLoading(false); }
  };

  const handleTabChange = (tab) => { setActiveTab(tab); setSearchQuery(''); };

  if (selectedItem) {
    return (
      <DestinationDetailPage
        item={selectedItem}
        onBack={() => setSelectedItem(null)}
        openAuthModal={openAuthModal}
      />
    );
  }

  if (loading) {
    return (
      <div className="py-16 sm:py-20 text-center text-stone-500 animate-pulse px-4">
        <Star size={40} className="mx-auto mb-4 text-[#2d7a5a] opacity-20 sm:size-12" />
        <p className="text-sm sm:text-base">{t('dashboard.analyzingPreferences') || 'Chargement des destinations...'}</p>
      </div>
    );
  }

  return (
    <>
      <GlobalStyles />
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 pb-20 sm:pb-0 safe-bottom ios-no-zoom">

        {/* HEADER */}
        <header className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold mb-1 sm:mb-2 dark:text-dark-text">
            {t('dashboard.personalizedRecommendations') || 'Explorez l\'Algérie'}
          </h1>
          <p className="text-sm sm:text-base text-stone-500 dark:text-dark-text-muted">
            {t('dashboard.premiumSelection') || 'Sélection personnalisée pour vous'}
          </p>
        </header>

        {/* ONGLETS */}
        <div className="flex gap-2 sm:gap-3 mb-6 sm:mb-8 overflow-x-auto pb-1 -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-hide scroll-smooth">
          <button
            onClick={() => handleTabChange('all')}
            className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-full font-bold text-[10px] sm:text-[11px] uppercase tracking-widest transition-all duration-300 whitespace-nowrap min-h-[40px] focus-ring no-select active:scale-95 ${
              activeTab === 'all'
                ? 'bg-[#2d7a5a] text-white border border-[#2d7a5a]'
                : 'bg-transparent border border-stone-200 dark:border-dark-border text-stone-500 hover:border-[#2d7a5a] hover:text-[#2d7a5a]'
            }`}
          >
            <span className="hidden sm:inline">Toutes les destinations</span>
            <span className="sm:hidden">Toutes</span>
            {allDestinations.length > 0 && (
              <span className="ml-1.5 sm:ml-2 text-[9px] opacity-70">({allDestinations.length})</span>
            )}
          </button>
          <button
            onClick={() => handleTabChange('recommendations')}
            className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-full font-bold text-[10px] sm:text-[11px] uppercase tracking-widest transition-all duration-300 whitespace-nowrap min-h-[40px] focus-ring no-select active:scale-95 ${
              activeTab === 'recommendations'
                ? 'bg-[#2d7a5a] text-white border border-[#2d7a5a]'
                : 'bg-transparent border border-stone-200 dark:border-dark-border text-stone-500 hover:border-[#2d7a5a] hover:text-[#2d7a5a]'
            }`}
          >
            <span className="hidden sm:inline">Recommandations</span>
            <span className="sm:hidden">Recommandé</span>
            {recommendations.length > 0 && (
              <span className="ml-1.5 sm:ml-2 text-[9px] opacity-70">({recommendations.length})</span>
            )}
          </button>
        </div>

        {/* RECHERCHE */}
        <div className="mb-6 sm:mb-8">
          <div className="relative max-w-full sm:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-stone-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isMobile ? 'Rechercher...' : (t('dashboard.searchDestinations') || 'Rechercher une destination...')}
              className="w-full pl-9 sm:pl-12 pr-10 py-2.5 sm:py-3 bg-white dark:bg-dark-surface border border-stone-200 dark:border-dark-border rounded-2xl sm:rounded-3xl text-sm sm:text-base text-[#1a4a36] dark:text-dark-text placeholder-stone-400 focus:outline-none focus:border-[#2d7a5a] focus:ring-2 focus:ring-[#2d7a5a]/20 transition-all shadow-sm min-h-[44px]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-stone-400 hover:text-[#1a4a36] transition-colors focus-ring rounded"
                aria-label="Effacer la recherche"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-stone-500">
              {filteredItems.length} résultat{filteredItems.length !== 1 ? 's' : ''} pour "{searchQuery}"
            </p>
          )}
        </div>

        {/* GRILLE */}
        {loadingAll && activeTab === 'all' ? (
          <div className="py-16 sm:py-20 text-center text-stone-500 animate-pulse px-4">
            <Star size={40} className="mx-auto mb-4 text-[#2d7a5a] opacity-20" />
            <p className="text-sm sm:text-base">Chargement de toutes les destinations...</p>
          </div>

        ) : filteredItems.length === 0 ? (
          <div className="py-12 sm:py-20 text-center px-4 animate-slide-up">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-stone-100 dark:bg-dark-surface rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              {searchQuery
                ? <Search size={28} className="text-[#2d7a5a] sm:size-8" />
                : <Star size={28} className="text-[#2d7a5a] sm:size-8" />
              }
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2 dark:text-dark-text">
              {searchQuery
                ? (t('dashboard.noResultsFound') || 'Aucun résultat trouvé')
                : (t('dashboard.noRecommendationsAvailable') || 'Aucune recommandation disponible')}
            </h3>
            <p className="text-stone-500 max-w-md mx-auto mb-4 sm:mb-6 text-sm sm:text-base">
              {searchQuery
                ? `Aucune destination ne correspond à "${searchQuery}"`
                : (t('dashboard.noRecommendationsDescription') || 'Nous n\'avons pas encore assez de données.')}
            </p>
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="bg-[#2d7a5a] text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-full font-bold hover:bg-[#1a4a36] transition text-sm sm:text-base min-h-[44px] focus-ring no-select active:scale-95"
              >
                {t('dashboard.clearSearch') || 'Effacer la recherche'}
              </button>
            ) : (
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('nav-explorer'))}
                className="bg-[#2d7a5a] text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-full font-bold hover:bg-[#1a4a36] transition text-sm sm:text-base min-h-[44px] focus-ring no-select active:scale-95"
              >
                {t('dashboard.exploreDestinations') || 'Explorer les destinations'}
              </button>
            )}
          </div>

        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            {filteredItems.map((dest, index) => (
              <RecommendationCard
                key={dest.id}
                destination={dest}
                index={index}
                onViewDetails={() => setSelectedItem(dest)}
                openAuthModal={openAuthModal}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default RecommendationsContent;
