import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  Star, MapPin, ChevronRight, Heart, Search, 
  Sparkles, Users, TrendingUp, UserCheck, Info, X,
  Brain, Compass, ThumbsUp, BarChart3, Filter, SlidersHorizontal,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import DestinationDetailPage from './DestinationDetailPage';
import { useTheme } from '../../../contexts/ThemeContext';

/* ============================================
   STYLES GLOBAUX INLINE
   ============================================ */
const GlobalStyles = () => (
  <style>{`
    .scrollbar-hide {
      -ms-overflow-style: none !important;
      scrollbar-width: none !important;
    }
    .scrollbar-hide::-webkit-scrollbar {
      display: none !important;
      width: 0 !important;
      height: 0 !important;
    }
    
    @supports (-webkit-touch-callout: none) {
      .ios-no-zoom input, .ios-no-zoom textarea, .ios-no-zoom select {
        font-size: 16px !important;
      }
    }
    
    .safe-bottom { padding-bottom: env(safe-area-inset-bottom, 0px); }
    .no-select { -webkit-user-select: none; user-select: none; }
    .scroll-smooth { scroll-behavior: smooth; -webkit-overflow-scrolling: touch; }
    
    .line-clamp-1 {
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .animate-fade-in { animation: fadeIn 0.3s ease-out; }
    .animate-slide-up { animation: slideUp 0.4s ease-out; }
    
    .focus-ring:focus-visible { outline: 2px solid #2d7a5a; outline-offset: 2px; }
    
    .card-hover-lift {
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .card-hover-lift:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0,0,0,0.15);
    }
    
    /* Classes utilitaires responsive sans JS */
    .hidden-mobile { display: none; }
    .hidden-desktop { display: block; }
    
    @media (min-width: 640px) {
      .hidden-mobile { display: block; }
      .hidden-desktop { display: none; }
    }
    
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
  `}</style>
);

// ============================================================================
// MAPPING TECHNIQUE
// ============================================================================

const TECHNIQUE_DISPLAY = {
  'cold-start': { shortLabel: 'Vos préférences', fullLabel: 'Basé sur vos préférences', color: '#3b82f6', icon: UserCheck },
  'content': { shortLabel: 'Vos goûts', fullLabel: 'Correspond à vos goûts', color: '#10b981', icon: Brain },
  'collaborative': { shortLabel: 'Similaires', fullLabel: 'Apprécié par voyageurs similaires', color: '#8b5cf6', icon: Users },
  'popular': { shortLabel: 'Populaire', fullLabel: 'Destination populaire', color: '#f59e0b', icon: ThumbsUp },
  'hybrid-behavioral': { shortLabel: 'Hybride', fullLabel: 'Recommandation hybride', color: '#2d7a5a', icon: Compass }
};

// ============================================================================
// BADGE DE TECHNIQUE - SANS useMediaQuery
// ============================================================================

const TechniqueBadge = ({ algorithmUsed, displayCause }) => {
  if (!algorithmUsed) return null;

  const tech = TECHNIQUE_DISPLAY[algorithmUsed] || TECHNIQUE_DISPLAY['popular'];
  const Icon = tech.icon;
  const [showTooltip, setShowTooltip] = useState(false);
  const badgeRef = useRef(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [portalReady, setPortalReady] = useState(false);

  // Détection mobile avec resize listener
  useEffect(() => {
    setPortalReady(true);
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (isMobile || !badgeRef.current) return;
    const rect = badgeRef.current.getBoundingClientRect();
    setTooltipPos({
      top: rect.bottom + window.scrollY + 8,
      left: Math.min(rect.left + window.scrollX, window.innerWidth - 320 - 16)
    });
    setShowTooltip(true);
  }, [isMobile]);

  return (
    <>
      <div 
        ref={badgeRef}
        className="inline-flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border border-white/20 cursor-help no-select"
        style={{ 
          backgroundColor: `${tech.color}40`,
          color: '#ffffff',
          textShadow: '0 1px 2px rgba(0,0,0,0.3)'
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={(e) => isMobile && e.stopPropagation()}
      >
        <Icon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
        <span className="hidden-mobile">{tech.shortLabel}</span>
        <span className="hidden-desktop">{tech.shortLabel.slice(0, 8)}</span>
      </div>

      {portalReady && showTooltip && !isMobile && typeof document !== 'undefined' && document.body && createPortal(
        <div 
          className="fixed w-[320px] p-4 rounded-xl bg-black/95 backdrop-blur-xl border border-white/10 shadow-2xl z-[9999] animate-fade-in"
          style={{ 
            top: `${tooltipPos.top}px`, 
            left: `${tooltipPos.left}px` 
          }}
        >
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${tech.color}30` }}>
              <Icon className="w-4 h-4" style={{ color: tech.color }} />
            </div>
            <div>
              <p className="text-white font-bold text-sm">{tech.fullLabel}</p>
              <p className="text-[10px] text-white/50">Technique : {algorithmUsed}</p>
            </div>
          </div>

          {displayCause?.causeDetails && (
            <ul className="space-y-1 mt-2">
              {displayCause.causeDetails.map((detail, i) => (
                <li key={i} className="text-white/70 text-[11px] flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#2d7a5a] mt-1 shrink-0" />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          )}

          {displayCause?.featureMatches && displayCause.featureMatches.length > 0 && (
            <div className="mt-2 pt-2 border-t border-white/10">
              <p className="text-[10px] text-white/50 uppercase mb-1.5">Features qui matchent</p>
              <div className="flex flex-wrap gap-1">
                {displayCause.featureMatches.map((m, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-[#2d7a5a]/20 text-[#2d7a5a] text-[10px] font-medium">
                    {m.label} {m.compat}%
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="absolute -top-2 left-6 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[10px] border-b-black/95" />
        </div>,
        document.body
      )}
    </>
  );
};

// ============================================================================
// PANNEAU DEBUG
// ============================================================================

const DebugPanel = ({ destination, onClose }) => {
  if (!destination) return null;

  const tech = TECHNIQUE_DISPLAY[destination.algorithmUsed] || TECHNIQUE_DISPLAY['popular'];
  const TechIcon = tech.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute inset-2 sm:inset-3 rounded-2xl bg-black/95 backdrop-blur-xl border border-[#2d7a5a]/30 p-3 sm:p-4 overflow-y-auto z-50 scroll-smooth"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-[#2d7a5a]" />
          <h4 className="text-[#2d7a5a] font-bold text-sm">Pourquoi cette destination ?</h4>
        </div>
        <button onClick={onClose} className="text-white/50 hover:text-white p-1 focus-ring rounded">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-3 rounded-lg mb-3" style={{ backgroundColor: `${tech.color}15`, border: `1px solid ${tech.color}30` }}>
        <div className="flex items-center gap-2 mb-2">
          <TechIcon className="w-5 h-5" style={{ color: tech.color }} />
          <span className="text-white font-bold text-sm">{tech.fullLabel}</span>
        </div>
        <p className="text-white/60 text-[11px]">
          {destination.displayCause?.mainCause || 'Recommandation basée sur votre profil'}
        </p>
      </div>

      {destination.algorithmScores && (
        <div className="p-3 rounded-lg bg-white/5 border border-white/10 mb-3">
          <p className="text-white/50 text-[10px] uppercase mb-2">Contribution de chaque technique</p>
          {Object.entries(destination.algorithmScores).map(([algo, score]) => {
            const algoTech = TECHNIQUE_DISPLAY[algo] || TECHNIQUE_DISPLAY['popular'];
            const AlgoIcon = algoTech.icon;
            return (
              <div key={algo} className="flex items-center justify-between mt-1.5">
                <div className="flex items-center gap-1.5">
                  <AlgoIcon className="w-3 h-3" style={{ color: algoTech.color }} />
                  <span className="text-white/60 text-[11px] capitalize">{algo}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1 rounded-full bg-white/10">
                    <div className="h-full rounded-full" style={{ width: `${score * 100}%`, backgroundColor: algoTech.color }} />
                  </div>
                  <span className="text-[10px] text-white/50 w-8 text-right">{(score * 100).toFixed(1)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="p-3 rounded-lg bg-[#2d7a5a]/20 border border-[#2d7a5a]/30">
        <div className="flex justify-between">
          <span className="text-white/70 text-[11px]">Score final</span>
          <span className="text-[#2d7a5a] font-bold">{(destination.finalScore * 100).toFixed(1)}%</span>
        </div>
      </div>

      <div className="p-3 rounded-lg bg-white/5 border border-white/10 mt-2">
        <div className="flex justify-between">
          <span className="text-white/70 text-[11px]">Match préférences</span>
          <span className="text-white font-bold">{destination.matchPercentage}%</span>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// CARD - STYLE AFALOU TOURS
// ============================================================================

const RecommendationCard = ({ destination, index, onViewDetails, openAuthModal, t }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [avgRating, setAvgRating] = useState(null);
  const [showDebug, setShowDebug] = useState(false);
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

  const matchPercentage = destination.matchPercentage || Math.round((destination.affinityScore || 0) * 100);
  const algorithmUsed = destination.algorithmUsed || 'popular';
  const locationBadge = destination.country || destination.location || 'ALGÉRIE';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="w-full h-full"
    >
      <div
        className="relative w-full rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer border border-stone-200/50 dark:border-dark-border/50 hover:border-[#2d7a5a]/50 transition-all duration-500 group card-hover-lift bg-white dark:bg-dark-surface"
        onClick={onViewDetails}
      >
        {/* Image container */}
        <div className="relative aspect-[4/3] sm:aspect-[16/10] overflow-hidden">
          <img
            src={imageUrl}
            alt={destination.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badge ALGÉRIE */}
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-black/50 backdrop-blur-md rounded-md text-white text-[10px] sm:text-xs font-medium uppercase tracking-wider">
              <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              {locationBadge}
            </div>
          </div>

          {/* Badge Match % */}
          {matchPercentage > 0 && (
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
              <div className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-md font-bold text-[9px] sm:text-[10px] uppercase tracking-wider ${
                matchPercentage >= 70 ? 'bg-[#2d7a5a] text-white' :
                matchPercentage >= 50 ? 'bg-orange-500 text-white' :
                'bg-white/90 text-black'
              }`}>
                {matchPercentage}% Match
              </div>
            </div>
          )}

          {/* Bouton favori */}
          <button
            onClick={toggleFavorite}
            disabled={favoriteLoading}
            className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-[#2d7a5a] hover:border-[#2d7a5a] transition-all group/btn active:scale-95 focus-ring no-select opacity-0 group-hover:opacity-100"
            aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          >
            <Heart className={`w-4 h-4 transition-colors ${isFavorite ? 'fill-[#2d7a5a] text-[#2d7a5a]' : 'text-white group-hover/btn:text-white'}`} />
          </button>
        </div>

        {/* Contenu sous l'image */}
        <div className="p-4 sm:p-5">
          <h3 className="text-lg sm:text-xl md:text-2xl font-serif font-bold text-[#1a4a36] dark:text-dark-text mb-2 sm:mb-3 line-clamp-1">
            {destination.name}
          </h3>

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

          <div className="flex items-center justify-between">
            <button
              onClick={(e) => { e.stopPropagation(); onViewDetails(); }}
              className="inline-flex items-center gap-1.5 sm:gap-2 text-[#2d7a5a] hover:text-[#1a4a36] font-medium text-xs sm:text-sm uppercase tracking-wider transition-colors group/link focus-ring no-select"
            >
              {t('dashboard.viewDetails') || 'Découvrir'}
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover/link:translate-x-1 transition-transform" />
            </button>

            <TechniqueBadge algorithmUsed={algorithmUsed} displayCause={destination.displayCause} />
          </div>
        </div>

        {/* Bouton info debug */}
        <div className="absolute top-1/2 right-3 sm:right-4 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={(e) => { e.stopPropagation(); setShowDebug(!showDebug); }}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-[#2d7a5a] transition-colors focus-ring"
            aria-label="Détails recommandation"
          >
            <Info className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
          </button>
        </div>

        <AnimatePresence>
          {showDebug && <DebugPanel destination={destination} onClose={() => setShowDebug(false)} />}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// ============================================================================
// RECOMMENDATIONS CONTENT
// ============================================================================

const RecommendationsContent = ({ openAuthModal, t }) => {
  const { user } = useAuth();
  const { isDark } = useTheme();

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
    return <DestinationDetailPage item={selectedItem} onBack={() => setSelectedItem(null)} openAuthModal={openAuthModal} />;
  }

  if (loading) {
    return (
      <div className="py-16 sm:py-20 text-center text-stone-500 animate-pulse px-4">
        <Star size={40} className="mx-auto mb-4 text-[#2d7a5a] opacity-20 sm:size-12" />
        <p className="text-sm sm:text-base">{t('dashboard.analyzingPreferences')}</p>
      </div>
    );
  }

  return (
    <>
      <GlobalStyles />
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 pb-20 sm:pb-0 safe-bottom ios-no-zoom">
        
        <header className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold mb-1 sm:mb-2 dark:text-dark-text">
            {t('dashboard.personalizedRecommendations') || 'Recommandations'}
          </h1>
          <p className="text-sm sm:text-base text-stone-500 dark:text-dark-text-muted">
            {t('dashboard.premiumSelection') || 'Sélection personnalisée pour vous'}
          </p>
        </header>

        <div className="flex gap-2 sm:gap-3 mb-6 sm:mb-8 overflow-x-auto pb-1 -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-hide scroll-smooth">
          <button onClick={() => handleTabChange('all')}
            className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-full font-bold text-[10px] sm:text-[11px] uppercase tracking-widest transition-all whitespace-nowrap min-h-[40px] focus-ring no-select active:scale-95 ${activeTab === 'all' ? 'bg-[#2d7a5a] text-white border border-[#2d7a5a]' : 'bg-transparent border border-stone-200 dark:border-dark-border text-stone-500 hover:border-[#2d7a5a] hover:text-[#2d7a5a]'}`}>
            <span className="hidden-mobile">Toutes les destinations</span>
            <span className="hidden-desktop">Toutes</span>
            {allDestinations.length > 0 && <span className="ml-1.5 sm:ml-2 text-[9px] opacity-70">({allDestinations.length})</span>}
          </button>
          <button onClick={() => handleTabChange('recommendations')}
            className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-full font-bold text-[10px] sm:text-[11px] uppercase tracking-widest transition-all whitespace-nowrap min-h-[40px] focus-ring no-select active:scale-95 ${activeTab === 'recommendations' ? 'bg-[#2d7a5a] text-white border border-[#2d7a5a]' : 'bg-transparent border border-stone-200 dark:border-dark-border text-stone-500 hover:border-[#2d7a5a] hover:text-[#2d7a5a]'}`}>
            <span className="hidden-mobile">Recommandations</span>
            <span className="hidden-desktop">Recommandé</span>
            {recommendations.length > 0 && <span className="ml-1.5 sm:ml-2 text-[9px] opacity-70">({recommendations.length})</span>}
          </button>
        </div>

        <div className="mb-6 sm:mb-8">
          <div className="relative max-w-full sm:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-stone-400" />
            </div>
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une destination..."
              className="w-full pl-9 sm:pl-12 pr-10 py-2.5 sm:py-3 bg-white dark:bg-dark-surface border border-stone-200 dark:border-dark-border rounded-2xl sm:rounded-3xl text-sm sm:text-base text-[#1a4a36] dark:text-dark-text placeholder-stone-400 focus:outline-none focus:border-[#2d7a5a] focus:ring-2 focus:ring-[#2d7a5a]/20 transition-all shadow-sm min-h-[44px]" />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-stone-400 hover:text-[#1a4a36] transition-colors focus-ring rounded"
                aria-label="Effacer">
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
          </div>
          {searchQuery && <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-stone-500">{filteredItems.length} résultat{filteredItems.length !== 1 ? 's' : ''} pour "{searchQuery}"</p>}
        </div>

        {loadingAll && activeTab === 'all' ? (
          <div className="py-16 sm:py-20 text-center text-stone-500 animate-pulse px-4">
            <Star size={40} className="mx-auto mb-4 text-[#2d7a5a] opacity-20 sm:size-12" />
            <p className="text-sm sm:text-base">Chargement...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-12 sm:py-20 text-center px-4 animate-slide-up">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-stone-100 dark:bg-dark-surface rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              {searchQuery ? <Search size={28} className="text-[#2d7a5a] sm:size-8" /> : <Star size={28} className="text-[#2d7a5a] sm:size-8" />}
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2 dark:text-dark-text">{searchQuery ? 'Aucun résultat' : 'Aucune recommandation'}</h3>
            <p className="text-stone-500 max-w-md mx-auto mb-4 sm:mb-6 text-sm sm:text-base">{searchQuery ? `Aucune destination ne correspond à "${searchQuery}"` : 'Aucune recommandation disponible pour le moment'}</p>
            {searchQuery ? (
              <button onClick={() => setSearchQuery('')} className="bg-[#2d7a5a] text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-full font-bold hover:bg-[#1a4a36] transition text-sm sm:text-base min-h-[44px] focus-ring no-select active:scale-95">Effacer la recherche</button>
            ) : (
              <button onClick={() => window.dispatchEvent(new CustomEvent('nav-explorer'))} className="bg-[#2d7a5a] text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-full font-bold hover:bg-[#1a4a36] transition text-sm sm:text-base min-h-[44px] focus-ring no-select active:scale-95">Explorer les destinations</button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            {filteredItems.map((dest, index) => (
              <RecommendationCard key={dest.id} destination={dest} index={index} onViewDetails={() => setSelectedItem(dest)} openAuthModal={openAuthModal} t={t} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default RecommendationsContent;
