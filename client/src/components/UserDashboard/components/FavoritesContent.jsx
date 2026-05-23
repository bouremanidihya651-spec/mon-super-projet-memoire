import React, { useState, useEffect } from 'react';
import { Heart, X, Globe, Building, Star, MapPin, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import DestinationDetailPage from './DestinationDetailPage';
import { useTheme } from '../../../contexts/ThemeContext';

/* ── Palette cohérente ── */
const getColors = (isDark) => ({
  bg:     isDark ? '#0f1412' : '#f7f5f0',
  card:   isDark ? '#1a2320' : '#ffffff',
  border: isDark ? '#2d3a36' : '#e0dcd4',
  text:   isDark ? '#e8ece9' : '#1a4a36',
  text2:  isDark ? '#b5e4ca' : '#2d7a5a',
  text3:  isDark ? '#9db8aa' : '#6b8f7b',
  accent: '#2d7a5a',
  dark:   isDark ? '#0f1f17' : '#1a4a36',
  gold:   '#c9a844',
  serif:  "'Playfair Display', Georgia, serif",
  sans:   "'DM Sans', sans-serif",
});

const fadeUp  = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

/* ── Favorite Card ── */
const FavCard = ({ fav, onRemove, onSelect, colors, isDark }) => {
  const [hov, setHov] = useState(false);
  const img = fav.image_url || 'https://images.unsplash.com/photo-1567874790230-3acbb51e61dd?auto=format&fit=crop&w=800&q=80';

  return (
    <motion.div
      variants={fadeUp}
      onHoverStart={() => setHov(true)}
      onHoverEnd={() => setHov(false)}
      style={{
        background: colors.card,
        border: `1px solid ${hov ? colors.accent : colors.border}`,
        overflow: 'hidden',
        boxShadow: hov ? '0 16px 48px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.04)',
        transform: hov ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', height: 200, overflow: 'hidden' }} onClick={() => onSelect(fav)}>
        <motion.img
          src={img}
          alt={fav.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          animate={{ scale: hov ? 1.07 : 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
        {/* Gradient */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.55) 100%)',
        }} />

        {/* Remove button */}
        <button
          onClick={e => { e.stopPropagation(); onRemove(fav); }}
          style={{
            position: 'absolute', top: 12, right: 12,
            width: 34, height: 34,
            background: 'rgba(220,38,38,0.85)', backdropFilter: 'blur(4px)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,38,38,1)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(220,38,38,0.85)'}
        >
          <X size={14} color="#fff" />
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: '18px 20px 20px' }}>
        {/* Rating */}
        {fav.rating && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            marginBottom: 8,
          }}>
            <Star size={11} fill={colors.gold} style={{ color: colors.gold }} />
            <span style={{ fontFamily: colors.sans, fontSize: 12, color: colors.text2, fontWeight: 500 }}>
              {fav.rating}
            </span>
            {(fav.country || fav.location) && (
              <>
                <span style={{ color: colors.border }}>·</span>
                <MapPin size={11} style={{ color: colors.text3 }} />
                <span style={{ fontFamily: colors.sans, fontSize: 12, color: colors.text3, fontWeight: 300 }}>
                  {fav.country || fav.location}
                </span>
              </>
            )}
          </div>
        )}

        <h3 style={{
          fontFamily: colors.serif, fontStyle: 'italic', fontWeight: 600,
          fontSize: 18, color: colors.text, marginBottom: 6, lineHeight: 1.2,
        }}>
          {fav.name}
        </h3>

        <p style={{
          fontFamily: colors.sans, fontSize: 13, color: colors.text3,
          fontWeight: 300, lineHeight: 1.7, marginBottom: 16,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {fav.description}
        </p>

        <button
          onClick={() => onSelect(fav)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontFamily: colors.sans, fontSize: 11, fontWeight: 500,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: colors.accent, background: 'none', border: 'none',
            borderBottom: `1px solid ${colors.border}`,
            cursor: 'pointer', padding: 0, paddingBottom: 2,
          }}
        >
          Voir les détails <ChevronRight size={12} />
        </button>
      </div>
    </motion.div>
  );
};

/* ── Empty State ── */
const EmptyState = ({ tab, colors }) => {
  const messages = {
    destinations: { title: 'Aucune destination', sub: 'Explorez nos destinations et ajoutez-les à vos favoris.' },
    hotels:       { title: 'Aucun hôtel',        sub: 'Parcourez nos hôtels de luxe et sauvegardez vos préférés.' },
    activities:   { title: 'Aucune activité',    sub: 'Découvrez nos activités exclusives et gardez celles qui vous intéressent.' },
  };
  const m = messages[tab];
  return (
    <div style={{ padding: '80px 24px', textAlign: 'center' }}>
      <div style={{
        width: 64, height: 64, background: colors.bg, border: `1px solid ${colors.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 24px', color: colors.accent,
      }}>
        <Heart size={24} />
      </div>
      <h3 style={{
        fontFamily: colors.serif, fontStyle: 'italic', fontSize: 22,
        fontWeight: 600, color: colors.text, marginBottom: 10,
      }}>{m.title}</h3>
      <p style={{
        fontFamily: colors.sans, fontSize: 14, color: colors.text3,
        fontWeight: 300, maxWidth: 320, margin: '0 auto', lineHeight: 1.75,
      }}>{m.sub}</p>
    </div>
  );
};

/* ══════════════════════
   MAIN FAVORITES
══════════════════════ */
const FavoritesContent = ({ openAuthModal }) => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const [favorites, setFavorites]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeTab, setActiveTab]     = useState('destinations');

  useEffect(() => { loadFavorites(); }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res  = await fetch('http://localhost:3000/api/favorites', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        setFavorites(data.favorites.map(fav => ({
          id: fav.item?.id, type: fav.targetType,
          name: fav.item?.name, description: fav.item?.description,
          image_url: fav.item?.image_url, country: fav.item?.country,
          location: fav.item?.location, price: fav.item?.price,
          rating: fav.item?.rating, favoriteId: fav.id,
        })));
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const removeFavorite = async (fav) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:3000/api/favorites/${fav.favoriteId}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` },
      });
      loadFavorites();
    } catch (e) { console.error(e); }
  };

  const destFavs     = favorites.filter(f => f.type === 'destination');
  const hotelFavs    = favorites.filter(f => f.type === 'hotel');
  const activityFavs = favorites.filter(f => f.type === 'activity');

  const tabs = [
    { key: 'destinations', label: t('favorites.destinations'), icon: <Globe size={14} />,     count: destFavs.length },
    { key: 'hotels',       label: t('favorites.hotels'),       icon: <Building size={14} />,  count: hotelFavs.length },
    { key: 'activities',   label: t('favorites.activities'),   icon: <Star size={14} />,      count: activityFavs.length },
  ];

  const currentFavs = { destinations: destFavs, hotels: hotelFavs, activities: activityFavs }[activeTab];

  /* Loading */
  if (loading) return (
    <div style={{ textAlign: 'center', padding: '80px 0' }}>
      <div style={{
        width: 40, height: 40, border: `2px solid ${colors.border}`,
        borderTopColor: colors.accent, borderRadius: '50%',
        margin: '0 auto 16px', animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ fontFamily: colors.sans, fontSize: 13, color: colors.text3, fontWeight: 300 }}>
        Chargement…
      </p>
    </div>
  );

  /* Detail view */
  if (selectedItem) return (
    <DestinationDetailPage item={selectedItem} onBack={() => setSelectedItem(null)} openAuthModal={openAuthModal} />
  );

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', fontFamily: colors.sans }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ marginBottom: 36 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          fontFamily: colors.sans, fontSize: 10, fontWeight: 500,
          letterSpacing: '0.22em', textTransform: 'uppercase', color: colors.text3, marginBottom: 12,
        }}>
          <span style={{ width: 24, height: 1, background: colors.text3, display: 'inline-block' }} />
          Collection personnelle
        </span>
        <h1 style={{
          fontFamily: colors.serif, fontStyle: 'italic', fontWeight: 600,
          fontSize: 'clamp(26px, 3.5vw, 40px)', color: colors.text,
          lineHeight: 1.1, marginBottom: 10,
        }}>
          {t('favorites.title')}
        </h1>
        <p style={{ fontFamily: colors.sans, fontSize: 14, color: colors.text3, fontWeight: 300, lineHeight: 1.75 }}>
          {t('favorites.description')}
        </p>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
        style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}
      >
        {tabs.map(({ key, label, icon, count }) => {
          const active = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '10px 20px',
                background: active ? (isDark ? colors.card : colors.dark) : 'transparent',
                border: `1px solid ${active ? (isDark ? colors.card : colors.dark) : colors.border}`,
                color: active ? (isDark ? colors.text : '#fff') : colors.text3,
                fontFamily: colors.sans, fontSize: 11, fontWeight: 500,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = colors.accent; e.currentTarget.style.color = colors.accent; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.color = colors.text3; } }}
            >
              {icon} {label}
              <span style={{
                background: active ? 'rgba(255,255,255,0.2)' : colors.bg,
                border: `1px solid ${active ? 'transparent' : colors.border}`,
                color: active ? (isDark ? colors.text : '#fff') : colors.text2,
                fontFamily: colors.sans, fontSize: 10, fontWeight: 600,
                padding: '1px 7px',
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </motion.div>

      {/* Cards grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {currentFavs.length === 0 ? (
            <div style={{ border: `1px solid ${colors.border}`, background: colors.card }}>
              <EmptyState tab={activeTab} colors={colors} />
            </div>
          ) : (
            <motion.div
              variants={stagger} initial="hidden" animate="show"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 16,
              }}
            >
              {currentFavs.map(fav => (
                <FavCard
                  key={`${fav.type}-${fav.id}`}
                  fav={fav}
                  onRemove={removeFavorite}
                  onSelect={setSelectedItem}
                  colors={colors}
                  isDark={isDark}
                />
              ))}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

    </div>
  );
};

export default FavoritesContent;