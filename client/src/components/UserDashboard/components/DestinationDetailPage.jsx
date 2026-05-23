import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  Heart,
  Star,
  MapPin,
  DollarSign,
  Send,
  Mountain,
  Tent,
  Landmark,
  Waves,
  Globe,
  Building,
  Compass,
  Calendar,
  Plane,
  Bus,
  Car,
  Clock,
  X,
  MessageCircle,
  PenLine,
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import HotelDetailPage from './HotelDetailPage';
import ActivityDetailPage from './ActivityDetailPage';
import FlightReservationModal from './FlightReservationModal';
import CarRentalReservationModal from './CarRentalReservationModal';
import GroundTransportReservationModal from './GroundTransportReservationModal';

/* ─────────────────────────────────────────────
   Theme hook
───────────────────────────────────────────── */
const useThemeColors = () => {
  const { isDark } = useTheme();
  return {
    primary:      '#2d7a5a',
    primaryLight: isDark ? '#1a2e25' : '#e8f5ee',
    primaryDark:  isDark ? '#3db383' : '#1a4a36',
    accent:       '#c9a844',
    accentDark:   '#a88930',
    bg:           isDark ? '#0d1411' : '#f5f2ed',
    card:         isDark ? '#141c18' : '#ffffff',
    cardBorder:   isDark ? '#1e2d26' : '#e8e3dc',
    surface:      isDark ? '#1a2520' : '#f0ede8',
    text:         isDark ? '#e8f0eb' : '#1a2e22',
    textMuted:    isDark ? '#7aab8e' : '#5a7a68',
    textFaint:    isDark ? '#3d6650' : '#a0b8ac',
    border:       isDark ? '#1e2d26' : '#e8e3dc',
    shadow:       isDark ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(0,0,0,0.08)',
    danger:       '#dc4040',
    isDark,
  };
};

/* ─────────────────────────────────────────────
   Small reusable pieces
───────────────────────────────────────────── */
const RatingStars = ({ rating, size = 13 }) => {
  const C = useThemeColors();
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(s => (
        <Star key={s} size={size} style={{ color: C.accent, fill: s <= Math.round(rating) ? C.accent : 'none' }} />
      ))}
    </div>
  );
};

const PriceBadge = ({ price, unit }) => {
  if (!price) return null;
  return (
    <div style={{
      position: 'absolute', top: 10, right: 10,
      background: 'rgba(13,20,17,0.82)', backdropFilter: 'blur(8px)',
      color: '#fff', borderRadius: 999, padding: '4px 12px',
      fontSize: 12, fontWeight: 700, border: '1px solid rgba(255,255,255,0.12)',
    }}>
      {price} DA{unit === 'per_day' ? '/j' : ''}
    </div>
  );
};

const SectionHeading = ({ icon: Icon, label }) => {
  const C = useThemeColors();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: `${C.primary}18`, border: `1px solid ${C.primary}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={17} style={{ color: C.primary }} />
      </div>
      <span style={{ fontSize: 18, fontWeight: 700, color: C.text, fontFamily: "'Playfair Display', Georgia, serif" }}>
        {label}
      </span>
    </div>
  );
};

const EmptyState = ({ icon: Icon, message }) => {
  const C = useThemeColors();
  return (
    <div style={{
      background: C.surface, border: `2px dashed ${C.border}`,
      borderRadius: 16, padding: '36px 20px', textAlign: 'center',
    }}>
      <Icon size={32} style={{ color: C.textFaint, margin: '0 auto 10px' }} />
      <p style={{ color: C.textFaint, fontSize: 13, margin: 0 }}>{message}</p>
    </div>
  );
};

/* Card with hover lift */
const CardBase = ({ children, onClick, style = {} }) => {
  const C = useThemeColors();
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: C.card,
        borderRadius: 18,
        border: `1px solid ${C.cardBorder}`,
        overflow: 'hidden',
        transition: 'all 0.25s cubic-bezier(0.22,1,0.36,1)',
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: hovered
          ? (C.isDark ? '0 16px 48px rgba(0,0,0,0.6)' : '0 12px 36px rgba(0,0,0,0.12)')
          : (C.isDark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.05)'),
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const BtnPrimary = ({ onClick, children, style = {} }) => {
  const C = useThemeColors();
  return (
    <button
      onClick={e => { e.stopPropagation(); onClick && onClick(e); }}
      style={{
        background: C.primary, color: '#fff', border: 'none',
        borderRadius: 999, padding: '9px 20px',
        fontSize: 12, fontWeight: 700, letterSpacing: '0.05em',
        cursor: 'pointer', transition: 'background 0.2s',
        fontFamily: "'DM Sans', sans-serif",
        ...style,
      }}
      onMouseEnter={e => e.currentTarget.style.background = C.primaryDark}
      onMouseLeave={e => e.currentTarget.style.background = C.primary}
    >
      {children}
    </button>
  );
};

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
const DestinationDetailPage = ({ item, onBack, openAuthModal }) => {
  const { user, isAuthenticated } = useAuth();
  const C = useThemeColors();

  const [rating, setRating]               = useState(0);
  const [hoverRating, setHoverRating]     = useState(0);
  const [comment, setComment]             = useState('');
  const [reviews, setReviews]             = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [isFavorite, setIsFavorite]       = useState(false);
  const [hotels, setHotels]               = useState([]);
  const [activities, setActivities]       = useState([]);
  const [transports, setTransports]       = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showComments, setShowComments]   = useState(false);
  const [showForm, setShowForm]           = useState(false);
  const [selectedFlight, setSelectedFlight]               = useState(null);
  const [showFlightModal, setShowFlightModal]             = useState(false);
  const [selectedCarRental, setSelectedCarRental]         = useState(null);
  const [showCarRentalModal, setShowCarRentalModal]       = useState(false);
  const [selectedGroundTransport, setSelectedGroundTransport] = useState(null);
  const [showGroundTransportModal, setShowGroundTransportModal] = useState(false);

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : item.rating || '0';

  const getTypeBadge = () => {
    if ((item.culture_score || 0) >= 0.7)   return { icon: <Landmark size={12} />, label: 'Culture' };
    if ((item.adventure_score || 0) >= 0.7) return { icon: <Tent size={12} />, label: 'Aventure' };
    if ((item.beach_score || 0) >= 0.7)     return { icon: <Waves size={12} />, label: 'Plage' };
    if ((item.nature_score || 0) >= 0.7)    return { icon: <Mountain size={12} />, label: 'Nature' };
    return { icon: <Globe size={12} />, label: 'Destination' };
  };
  const typeBadge = getTypeBadge();

  useEffect(() => {
    fetchReviews();
    checkFavoriteStatus();
    fetchHotels();
    fetchActivities();
    fetchTransports();
  }, [item.id]);

  const fetchReviews = async () => {
    try {
      setLoadingReviews(true);
      const res  = await fetch(`http://localhost:3000/api/reviews/destination/${item.id}`);
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (e) { console.error(e); }
    finally { setLoadingReviews(false); }
  };

  const fetchHotels = async () => {
    try {
      const res  = await fetch(`http://localhost:3000/api/hotels/destination/${item.id}`);
      const data = await res.json();
      setHotels(Array.isArray(data.hotels) ? data.hotels : Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
  };

  const fetchActivities = async () => {
    try {
      const res  = await fetch(`http://localhost:3000/api/activities/destination/${item.id}`);
      const data = await res.json();
      setActivities(Array.isArray(data.activities) ? data.activities : Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
  };

  const fetchTransports = async () => {
    try {
      const res  = await fetch(`http://localhost:3000/api/transports/destination/${item.id}`);
      const data = await res.json();
      setTransports(Array.isArray(data.transports) ? data.transports : Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
  };

  const checkFavoriteStatus = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res  = await fetch(`http://localhost:3000/api/favorites/check/destination/${item.id}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setIsFavorite(data.isFavorite);
    } catch (e) { console.error(e); }
  };

  const toggleFavorite = async () => {
    if (!isAuthenticated) { openAuthModal('login'); return; }
    const token = localStorage.getItem('token');
    try {
      if (isFavorite) {
        const res  = await fetch('http://localhost:3000/api/favorites', { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        const fav  = data.favorites?.find(f => f.targetId === item.id && f.targetType === 'destination');
        if (fav) await fetch(`http://localhost:3000/api/favorites/${fav.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
        setIsFavorite(false);
      } else {
        await fetch('http://localhost:3000/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ targetType: 'destination', targetId: item.id }),
        });
        setIsFavorite(true);
      }
    } catch (e) { console.error(e); }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (rating === 0)       { alert('Veuillez sélectionner une note'); return; }
    if (!comment.trim())    { alert('Veuillez entrer un commentaire'); return; }
    try {
      const token = localStorage.getItem('token');
      if (!token) { openAuthModal('login'); return; }
      const res = await fetch('http://localhost:3000/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating, comment, targetType: 'destination', targetId: item.id }),
      });
      if (res.ok) { setComment(''); setRating(0); fetchReviews(); setShowForm(false); }
      else { const d = await res.json(); alert(d.error || 'Erreur'); }
    } catch (e) { console.error(e); }
  };

  /* Sub-pages */
  if (selectedHotel)    return <HotelDetailPage    hotel={selectedHotel}       onBack={() => setSelectedHotel(null)}    openAuthModal={openAuthModal} />;
  if (selectedActivity) return <ActivityDetailPage activity={selectedActivity} onBack={() => setSelectedActivity(null)} openAuthModal={openAuthModal} />;

  /* ── Shared card image style ── */
  const cardImgStyle = {
    width: '100%', height: '100%', objectFit: 'cover', display: 'block',
    transition: 'transform 0.45s cubic-bezier(0.22,1,0.36,1)',
  };

  const divider = <div style={{ height: 1, background: C.border, margin: '36px 0' }} />;

  /* ── font shorthand ── */
  const serif  = "'Playfair Display', Georgia, serif";
  const sans   = "'DM Sans', sans-serif";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{ maxWidth: 960, margin: '0 auto', padding: '12px 0 60px', fontFamily: sans }}
    >
      {/* ── Back ── */}
      <button
        onClick={onBack}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 24,
          background: 'none', border: 'none', cursor: 'pointer',
          color: C.textMuted, fontSize: 13, fontWeight: 500, padding: 0, transition: 'color 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = C.primary}
        onMouseLeave={e => e.currentTarget.style.color = C.textMuted}
      >
        <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} />
        Retour aux recommandations
      </button>

      {/* ════════════════════════════════════════
          HERO — image pleine largeur
      ════════════════════════════════════════ */}
      <div style={{
        position: 'relative', borderRadius: 24, overflow: 'hidden',
        height: 480, marginBottom: 28,
        transform: 'translateZ(0)', backfaceVisibility: 'hidden',
        boxShadow: C.shadow,
      }}>
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            loading="eager"
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              objectPosition: 'center', display: 'block',
              imageRendering: 'auto', willChange: 'transform',
            }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})` }} />
        )}

        {/* Dark gradient */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(8,18,12,0.90) 0%, rgba(8,18,12,0.35) 55%, rgba(8,18,12,0.05) 100%)',
        }} />

        {/* Type badge */}
        <div style={{
          position: 'absolute', top: 20, left: 20,
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.25)',
          borderRadius: 999, padding: '5px 14px',
          fontSize: 11, fontWeight: 600, color: '#fff', letterSpacing: '0.06em',
        }}>
          {typeBadge.icon} {typeBadge.label.toUpperCase()}
        </div>

        {/* Favorite */}
        <button
          onClick={toggleFavorite}
          style={{
            position: 'absolute', top: 18, right: 18,
            width: 42, height: 42, borderRadius: '50%',
            background: isFavorite ? C.danger : 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            border: isFavorite ? 'none' : '1px solid rgba(255,255,255,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.25s',
          }}
        >
          <Heart size={18} style={{ color: '#fff', fill: isFavorite ? '#fff' : 'none' }} />
        </button>

        {/* Title + meta */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '32px 36px' }}>
          <h1 style={{
            fontFamily: serif, fontSize: 48, fontWeight: 700, fontStyle: 'italic',
            color: '#fff', margin: '0 0 10px', lineHeight: 1.1,
            textShadow: '0 2px 16px rgba(0,0,0,0.4)',
          }}>
            {item.name}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Star size={14} style={{ color: C.accent, fill: C.accent }} />
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{averageRating}</span>
              {reviews.length > 0 && (
                <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>({reviews.length} avis)</span>
              )}
            </div>

            {/* Location */}
            {(item.location || item.country) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                <MapPin size={13} />
                {item.country || item.location}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Review / Comments action bar ── */}
      <div style={{
        display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24,
      }}>
        {!reviews.some(r => r.userId === user?.id) ? (
          <button
            onClick={() => { setShowForm(!showForm); setShowComments(false); }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '10px 20px', borderRadius: 999,
              background: showForm ? C.primary : 'transparent',
              border: `1.5px solid ${showForm ? C.primary : C.border}`,
              color: showForm ? '#fff' : C.textMuted,
              fontSize: 12, fontWeight: 600, letterSpacing: '0.06em',
              cursor: 'pointer', transition: 'all 0.2s', fontFamily: sans,
            }}
          >
            <PenLine size={13} /> {showForm ? 'Masquer' : 'Laisser un avis'}
          </button>
        ) : (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '10px 20px', borderRadius: 999,
            background: `${C.primary}15`, border: `1px solid ${C.primary}30`,
            color: C.primary, fontSize: 12, fontWeight: 600,
          }}>
            <Star size={13} style={{ fill: C.primary }} /> Avis déjà publié
          </div>
        )}

        {reviews.length > 0 && (
          <button
            onClick={() => { setShowComments(!showComments); setShowForm(false); }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '10px 20px', borderRadius: 999,
              background: showComments ? `${C.primary}15` : 'transparent',
              border: `1.5px solid ${showComments ? C.primary : C.border}`,
              color: showComments ? C.primary : C.textMuted,
              fontSize: 12, fontWeight: 600, letterSpacing: '0.06em',
              cursor: 'pointer', transition: 'all 0.2s', fontFamily: sans,
            }}
          >
            <MessageCircle size={13} /> Voir les avis ({reviews.length})
          </button>
        )}
      </div>

      {/* ── Review form ── */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            style={{ overflow: 'hidden', marginBottom: 20 }}
          >
            <div style={{
              background: C.card, border: `1px solid ${C.cardBorder}`,
              borderRadius: 20, padding: 28, boxShadow: C.shadow,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <span style={{ fontFamily: serif, fontSize: 17, fontWeight: 700, color: C.text, fontStyle: 'italic' }}>
                  Votre avis
                </span>
                <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textFaint }}>
                  <X size={17} />
                </button>
              </div>
              <div style={{ display: 'flex', gap: 4, marginBottom: 18 }}>
                {[1,2,3,4,5].map(s => (
                  <button key={s}
                    onClick={() => setRating(s)}
                    onMouseEnter={() => setHoverRating(s)}
                    onMouseLeave={() => setHoverRating(0)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 3, transition: 'transform 0.15s' }}
                    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.88)'}
                    onMouseUp={e => e.currentTarget.style.transform = 'scale(1.1)'}
                  >
                    <Star size={28} style={{
                      color: C.accent, fill: s <= (hoverRating || rating) ? C.accent : 'none',
                      transition: 'fill 0.15s',
                    }} />
                  </button>
                ))}
              </div>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Partagez votre expérience..."
                rows={4}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: 12, padding: '12px 16px',
                  fontSize: 14, color: C.text, fontFamily: sans,
                  outline: 'none', resize: 'none', lineHeight: 1.65,
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = C.primary}
                onBlur={e => e.target.style.borderColor = C.border}
              />
              <button
                onClick={handleSubmitReview}
                style={{
                  marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 7,
                  padding: '10px 22px', borderRadius: 999,
                  background: C.primary, border: 'none', color: '#fff',
                  fontSize: 12, fontWeight: 700, letterSpacing: '0.08em',
                  cursor: 'pointer', fontFamily: sans, transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = C.primaryDark}
                onMouseLeave={e => e.currentTarget.style.background = C.primary}
              >
                <Send size={13} /> Publier l'avis
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Comments list ── */}
      <AnimatePresence>
        {showComments && reviews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            style={{ overflow: 'hidden', marginBottom: 20 }}
          >
            <div style={{
              background: C.card, border: `1px solid ${C.cardBorder}`,
              borderRadius: 20, padding: 28, boxShadow: C.shadow,
              maxHeight: 420, overflowY: 'auto',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <span style={{ fontFamily: serif, fontSize: 17, fontWeight: 700, color: C.text, fontStyle: 'italic' }}>
                  {reviews.length} avis
                </span>
                <button onClick={() => setShowComments(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textFaint }}>
                  <X size={17} />
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {reviews.map((review, i) => (
                  <div key={i} style={{
                    padding: '18px 0',
                    borderBottom: i < reviews.length - 1 ? `1px solid ${C.border}` : 'none',
                  }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                        background: `linear-gradient(135deg, ${C.primary}, #1a4a36)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: serif, fontSize: 14, fontWeight: 700, color: '#fff',
                      }}>
                        {review.user?.firstName?.[0] || 'U'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{review.user?.firstName || 'Utilisateur'}</span>
                            <span style={{ fontSize: 11, color: C.textFaint }}>
                              {new Date(review.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                          <RatingStars rating={review.rating} size={12} />
                        </div>
                        <p style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.7, margin: 0, fontWeight: 300 }}>
                          {review.comment}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {divider}

      {/* ── À propos — affiché UNE SEULE FOIS, uniquement si description en BDD ── */}
      {item.description && (
        <>
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 4, height: 24, background: C.primary, borderRadius: 2 }} />
              <h3 style={{ fontFamily: serif, fontWeight: 700, fontSize: 20, color: C.text, margin: 0, fontStyle: 'italic' }}>
                À propos
              </h3>
            </div>
            <p style={{ color: C.textMuted, lineHeight: 1.85, fontSize: 15, margin: 0, fontWeight: 300 }}>
              {item.description}
            </p>
          </div>
          {divider}
        </>
      )}

      {/* ════════════════════════════════════════
          HÔTELS
      ════════════════════════════════════════ */}
      <div style={{ marginBottom: 36 }}>
        <SectionHeading icon={Building} label="Où dormir" />
        {hotels.length === 0 ? (
          <EmptyState icon={Building} message="Aucun hôtel disponible pour cette destination" />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {hotels.map(hotel => (
              <CardBase key={hotel.id} onClick={() => setSelectedHotel(hotel)}>
                <div style={{ position: 'relative', height: 200, overflow: 'hidden' }}>
                  <img
                    src={hotel.image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'}
                    alt={hotel.name}
                    loading="lazy"
                    style={cardImgStyle}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  />
                  <PriceBadge price={hotel.price} />
                </div>
                <div style={{ padding: '16px 18px 20px' }}>
                  {hotel.stars > 0 && (
                    <div style={{ display: 'flex', gap: 2, marginBottom: 6 }}>
                      {[...Array(hotel.stars)].map((_, i) => (
                        <Star key={i} size={11} style={{ color: C.accent, fill: C.accent }} />
                      ))}
                    </div>
                  )}
                  <h4 style={{ fontFamily: serif, fontWeight: 700, fontSize: 16, color: C.text, margin: '0 0 6px', fontStyle: 'italic' }}>
                    {hotel.name}
                  </h4>
                  {hotel.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: C.textFaint, fontSize: 11, marginBottom: 10 }}>
                      <MapPin size={10} style={{ color: C.primary }} /> {hotel.location}
                    </div>
                  )}
                  <BtnPrimary style={{ width: '100%', fontSize: 11, textAlign: 'center' }}>
                    Voir détails →
                  </BtnPrimary>
                </div>
              </CardBase>
            ))}
          </div>
        )}
      </div>

      {divider}

      {/* ════════════════════════════════════════
          ACTIVITÉS
      ════════════════════════════════════════ */}
      <div style={{ marginBottom: 36 }}>
        <SectionHeading icon={Compass} label="Quoi faire" />
        {activities.length === 0 ? (
          <EmptyState icon={Compass} message="Aucune activité disponible pour cette destination" />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {activities.map(activity => (
              <CardBase key={activity.id} onClick={() => setSelectedActivity(activity)}>
                <div style={{ position: 'relative', height: 200, overflow: 'hidden' }}>
                  <img
                    src={activity.image_url || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80'}
                    alt={activity.name}
                    loading="lazy"
                    style={cardImgStyle}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  />
                  <PriceBadge price={activity.price} />
                </div>
                <div style={{ padding: '16px 18px 20px' }}>
                  <h4 style={{ fontFamily: serif, fontWeight: 700, fontSize: 16, color: C.text, margin: '0 0 6px', fontStyle: 'italic' }}>
                    {activity.name}
                  </h4>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                    {activity.duration && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: C.surface, borderRadius: 999, padding: '3px 10px', fontSize: 11, color: C.textMuted }}>
                        <Clock size={10} /> {activity.duration}
                      </div>
                    )}
                    {activity.rating && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: C.surface, borderRadius: 999, padding: '3px 10px', fontSize: 11, color: C.textMuted }}>
                        <Star size={10} style={{ color: C.accent }} /> {activity.rating}
                      </div>
                    )}
                  </div>
                  <BtnPrimary style={{ width: '100%', fontSize: 11, textAlign: 'center' }}>
                    Voir détails →
                  </BtnPrimary>
                </div>
              </CardBase>
            ))}
          </div>
        )}
      </div>

      {divider}

      {/* ════════════════════════════════════════
          TRANSPORTS
      ════════════════════════════════════════ */}
      <div style={{ marginBottom: 36 }}>
        <SectionHeading icon={Plane} label="Comment s'y rendre ?" />
        {transports.length === 0 ? (
          <EmptyState icon={Plane} message="Aucune option de transport disponible" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

            {/* Vols */}
            {transports.filter(t => t.category === 'flight').length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <Plane size={14} style={{ color: C.accent }} />
                  <span style={{ fontWeight: 600, fontSize: 14, color: C.text, letterSpacing: '0.04em' }}>VOLS</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                  {transports.filter(t => t.category === 'flight').map(t => (
                    <CardBase key={t.id}>
                      <div style={{ position: 'relative', height: 160, overflow: 'hidden' }}>
                        <img
                          src={t.image_url || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80'}
                          alt={t.name} loading="lazy" style={cardImgStyle}
                        />
                        <PriceBadge price={t.price} />
                      </div>
                      <div style={{ padding: '14px 16px 18px' }}>
                        <h5 style={{ fontFamily: serif, fontWeight: 700, fontSize: 15, color: C.text, margin: '0 0 4px', fontStyle: 'italic' }}>{t.name}</h5>
                        {t.company        && <p style={{ color: C.textMuted, fontSize: 11, margin: '0 0 2px' }}>{t.company}</p>}
                        {t.flight_number  && <p style={{ color: C.textFaint,  fontSize: 10, margin: '0 0 8px' }}>Vol : {t.flight_number}</p>}
                        {(t.departure_airport || t.arrival_airport) && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: C.textMuted, marginBottom: 6 }}>
                            <Plane size={11} style={{ color: C.primary }} />
                            {t.departure_airport || 'N/A'} → {t.arrival_airport || 'N/A'}
                          </div>
                        )}
                        {(t.departure_time || t.arrival_time) && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', background: C.surface, borderRadius: 8, padding: '5px 10px', fontSize: 11, color: C.textMuted, marginBottom: 6 }}>
                            <span>Départ : <strong style={{ color: C.text }}>{t.departure_time || 'N/A'}</strong></span>
                            <span>Arrivée : <strong style={{ color: C.text }}>{t.arrival_time || 'N/A'}</strong></span>
                          </div>
                        )}
                        {t.duration && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: C.textMuted, marginBottom: 12 }}>
                            <Clock size={10} /> {t.duration}
                          </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <RatingStars rating={t.rating} size={12} />
                          <BtnPrimary onClick={() => { setSelectedFlight(t); setShowFlightModal(true); }} style={{ fontSize: 11 }}>
                            Réserver
                          </BtnPrimary>
                        </div>
                      </div>
                    </CardBase>
                  ))}
                </div>
              </div>
            )}

            {/* Transports terrestres */}
            {transports.filter(t => t.category === 'ground').length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <Bus size={14} style={{ color: C.accent }} />
                  <span style={{ fontWeight: 600, fontSize: 14, color: C.text, letterSpacing: '0.04em' }}>TRANSPORTS TERRESTRES</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                  {transports.filter(t => t.category === 'ground').map(t => (
                    <CardBase key={t.id}>
                      <div style={{ position: 'relative', height: 160, overflow: 'hidden' }}>
                        <img
                          src={t.image_url || 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80'}
                          alt={t.name} loading="lazy" style={cardImgStyle}
                        />
                        <PriceBadge price={t.price} />
                      </div>
                      <div style={{ padding: '14px 16px 18px' }}>
                        <h5 style={{ fontFamily: serif, fontWeight: 700, fontSize: 15, color: C.text, margin: '0 0 4px', fontStyle: 'italic' }}>{t.name}</h5>
                        {t.type && <p style={{ color: C.textMuted, fontSize: 11, margin: '0 0 8px' }}>{t.type}</p>}
                        {(t.departure_city || t.arrival_city) && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: C.textMuted, marginBottom: 6 }}>
                            <MapPin size={11} style={{ color: C.primary }} />
                            {t.departure_city || 'N/A'} → {t.arrival_city || 'N/A'}
                          </div>
                        )}
                        {t.schedule && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: C.textMuted, marginBottom: 12 }}>
                            <Clock size={10} /> {t.schedule}
                          </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <RatingStars rating={t.rating} size={12} />
                          <BtnPrimary onClick={() => { setSelectedGroundTransport(t); setShowGroundTransportModal(true); }} style={{ fontSize: 11 }}>
                            Réserver
                          </BtnPrimary>
                        </div>
                      </div>
                    </CardBase>
                  ))}
                </div>
              </div>
            )}

            {/* Locations de voiture */}
            {transports.filter(t => t.category === 'car_rental').length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <Car size={14} style={{ color: C.accent }} />
                  <span style={{ fontWeight: 600, fontSize: 14, color: C.text, letterSpacing: '0.04em' }}>LOCATIONS DE VOITURE</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                  {transports.filter(t => t.category === 'car_rental').map(t => (
                    <CardBase key={t.id}>
                      <div style={{ position: 'relative', height: 160, overflow: 'hidden' }}>
                        <img
                          src={t.image_url || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80'}
                          alt={t.name} loading="lazy" style={cardImgStyle}
                        />
                        <PriceBadge price={t.price} unit={t.price_unit} />
                      </div>
                      <div style={{ padding: '14px 16px 18px' }}>
                        <h5 style={{ fontFamily: serif, fontWeight: 700, fontSize: 15, color: C.text, margin: '0 0 4px', fontStyle: 'italic' }}>{t.name}</h5>
                        {t.car_model      && <p style={{ color: C.textMuted, fontSize: 11, margin: '0 0 2px' }}>{t.car_model}</p>}
                        {t.rental_agency  && <p style={{ color: C.textFaint,  fontSize: 10, margin: '0 0 8px' }}>{t.rental_agency}</p>}
                        {t.pickup_location && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: C.textMuted, marginBottom: 6 }}>
                            <MapPin size={11} style={{ color: C.primary }} /> {t.pickup_location}
                          </div>
                        )}
                        {t.deposit && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: C.textMuted, marginBottom: 12 }}>
                            <DollarSign size={10} /> Caution : {t.deposit} DA
                          </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <RatingStars rating={t.rating} size={12} />
                          <BtnPrimary onClick={() => { setSelectedCarRental(t); setShowCarRentalModal(true); }} style={{ fontSize: 11 }}>
                            Réserver
                          </BtnPrimary>
                        </div>
                      </div>
                    </CardBase>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {divider}

      {/* ── Back (bottom) ── */}
      <button
        onClick={onBack}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', cursor: 'pointer',
          color: C.textMuted, fontSize: 13, fontWeight: 500, padding: 0, transition: 'color 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = C.primary}
        onMouseLeave={e => e.currentTarget.style.color = C.textMuted}
      >
        <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} />
        Retour aux recommandations
      </button>

      {/* ── Modals ── */}
      <FlightReservationModal
        isOpen={showFlightModal}
        onClose={() => { setShowFlightModal(false); setSelectedFlight(null); }}
        transport={selectedFlight}
        user={{ email: localStorage.getItem('userEmail') || '', phone: localStorage.getItem('userPhone') || '' }}
      />
      <CarRentalReservationModal
        isOpen={showCarRentalModal}
        onClose={() => { setShowCarRentalModal(false); setSelectedCarRental(null); }}
        transport={selectedCarRental}
        user={{ email: localStorage.getItem('userEmail') || '', phone: localStorage.getItem('userPhone') || '' }}
      />
      <GroundTransportReservationModal
        isOpen={showGroundTransportModal}
        onClose={() => { setShowGroundTransportModal(false); setSelectedGroundTransport(null); }}
        transport={selectedGroundTransport}
        user={{ email: localStorage.getItem('userEmail') || '', phone: localStorage.getItem('userPhone') || '' }}
      />
    </motion.div>
  );
};

export default DestinationDetailPage;