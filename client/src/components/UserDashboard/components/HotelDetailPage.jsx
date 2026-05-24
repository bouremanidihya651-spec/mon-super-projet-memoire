import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronRight,
  Heart,
  Star,
  Send,
  Building,
  Wifi,
  Coffee,
  Car,
  UtensilsCrossed,
  Dumbbell,
  Waves,
  Clock,
  MapPin,
  Shield,
  Phone,
  Mail,
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import HotelReservationModal from './HotelReservationModal';

const HotelDetailPage = ({ hotel, onBack, openAuthModal }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { isDark } = useTheme();

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 868);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 868);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchReviews();
    checkFavoriteStatus();
  }, [hotel.id]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/reviews/hotel/${hotel.id}`);
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkFavoriteStatus = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/favorites/check/hotel/${hotel.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setIsFavorite(data.isFavorite);
    } catch (error) {
      console.error('Error checking favorite:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!isAuthenticated) { openAuthModal('login'); return; }
    const token = localStorage.getItem('token');
    try {
      if (isFavorite) {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/favorites`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        const favorite = data.favorites?.find(f => f.targetId === hotel.id && f.targetType === 'hotel');
        if (favorite) {
          await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/favorites/${favorite.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
        }
        setIsFavorite(false);
      } else {
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/favorites`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ targetType: 'hotel', targetId: hotel.id }),
        });
        setIsFavorite(true);
      }
    } catch (error) { console.error('Error toggling favorite:', error); }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (rating === 0) { alert('Veuillez sélectionner une note'); return; }
    if (!comment.trim()) { alert('Veuillez entrer un commentaire'); return; }
    try {
      const token = localStorage.getItem('token');
      if (!token) { openAuthModal('login'); return; }
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating, comment, targetType: 'hotel', targetId: hotel.id }),
      });
      if (res.ok) { setComment(''); setRating(0); fetchReviews(); }
      else { const data = await res.json(); alert(data.error || "Erreur lors de l'ajout du commentaire"); }
    } catch (error) { console.error('Error submitting review:', error); }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : hotel.rating || '0';

  const amenitiesList = hotel.amenities || [];

  const t = {
    bg:            isDark ? '#0d1411' : '#f5f2ed',
    card:          isDark ? '#141c18' : '#ffffff',
    cardBorder:    isDark ? '#1e2d26' : '#e8e3dc',
    surface:       isDark ? '#1a2520' : '#f0ede8',
    surfaceBorder: isDark ? '#243028' : '#ddd9d2',
    text:          isDark ? '#e8f0eb' : '#1a3328',
    textMuted:     isDark ? '#7aab8e' : '#5a7a68',
    textFaint:     isDark ? '#3d6650' : '#a0b8ac',
    accent:        '#2d7a5a',
    accentLight:   isDark ? 'rgba(45,122,90,0.18)' : 'rgba(45,122,90,0.08)',
    accentBorder:  isDark ? 'rgba(45,122,90,0.35)' : 'rgba(45,122,90,0.25)',
    gold:          '#c9a844',
    goldLight:     isDark ? 'rgba(201,168,68,0.15)' : 'rgba(201,168,68,0.08)',
    divider:       isDark ? '#1e2d26' : '#e8e3dc',
    input:         isDark ? '#111a16' : '#f0ede8',
    inputBorder:   isDark ? '#1e2d26' : '#ddd9d2',
    danger:        '#dc4040',
  };

  const sectionLabel = {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: t.textFaint,
    fontFamily: "'DM Sans', sans-serif",
    marginBottom: 20,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  };

  const sectionLine = {
    flex: 1,
    height: 1,
    background: t.divider,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{ minHeight: '100vh', background: t.bg, fontFamily: "'DM Sans', sans-serif" }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 28px 0' }}>
        <button
          onClick={onBack}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            color: t.textMuted, fontSize: 13, fontWeight: 500,
            letterSpacing: '0.04em', padding: '6px 0',
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = t.accent}
          onMouseLeave={e => e.currentTarget.style.color = t.textMuted}
        >
          <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} />
          Retour aux hôtels
        </button>
      </div>

      <div style={{ maxWidth: 1100, margin: '20px auto 0', padding: isMobile ? '0 16px' : '0 28px' }}>
        <div style={{
          position: 'relative',
          height: isMobile ? 320 : 480,
          borderRadius: isMobile ? 16 : 24,
          overflow: 'hidden',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
        }}>
          <img
            src={hotel.image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=80'}
            alt={hotel.name}
            loading="eager"
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              objectPosition: 'center center', display: 'block',
              imageRendering: 'auto', transform: 'scale(1)', willChange: 'transform',
            }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(8,18,12,0.92) 0%, rgba(8,18,12,0.4) 50%, rgba(8,18,12,0.05) 100%)',
          }} />

          {hotel.stars && (
            <div style={{
              position: 'absolute', top: isMobile ? 16 : 24, left: isMobile ? 16 : 24,
              display: 'flex', alignItems: 'center', gap: 4,
              background: 'rgba(201,168,68,0.18)', border: '1px solid rgba(201,168,68,0.4)',
              borderRadius: 99, padding: isMobile ? '4px 10px' : '5px 14px',
            }}>
              {[...Array(hotel.stars)].map((_, i) => (
                <Star key={i} size={isMobile ? 8 : 10} style={{ color: t.gold, fill: t.gold }} />
              ))}
              <span style={{ fontSize: isMobile ? 9 : 10, fontWeight: 600, letterSpacing: '0.14em', color: t.gold, marginLeft: 2 }}>
                {hotel.stars} ÉTOILES
              </span>
            </div>
          )}

          <button
            onClick={toggleFavorite}
            style={{
              position: 'absolute', top: isMobile ? 16 : 24, right: isMobile ? 16 : 24,
              width: isMobile ? 36 : 44, height: isMobile ? 36 : 44, borderRadius: '50%',
              background: isFavorite ? t.danger : 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(8px)',
              border: isFavorite ? 'none' : '1px solid rgba(255,255,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.25s',
            }}
          >
            <Heart size={isMobile ? 16 : 18} style={{ color: '#fff', fill: isFavorite ? '#fff' : 'none' }} />
          </button>

          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: isMobile ? '20px 24px' : '32px 36px' }}>
            <h1 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: isMobile ? 28 : 42, fontWeight: 700, fontStyle: 'italic',
              color: '#fff', lineHeight: 1.1, marginBottom: 8,
            }}>
              {hotel.name}
            </h1>
            {hotel.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.7)' }}>
                <MapPin size={12} />
                <span style={{ fontSize: 12, fontWeight: 300, letterSpacing: '0.03em' }}>{hotel.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: isMobile ? '0 16px' : '0 28px' }}>
        <div style={{
          marginTop: isMobile ? 12 : 16,
          background: isDark ? '#101a15' : '#1a3328',
          borderRadius: 16,
          padding: isMobile ? '16px 20px' : '20px 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 16 }}>
            <span style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: isMobile ? 36 : 48, fontWeight: 700, fontStyle: 'italic', color: t.accent, lineHeight: 1,
            }}>
              {averageRating}
            </span>
            <div>
              <div style={{ display: 'flex', gap: 3, marginBottom: 4 }}>
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={11} style={{
                    color: s <= Math.round(parseFloat(averageRating)) ? t.accent : t.textFaint,
                    fill: s <= Math.round(parseFloat(averageRating)) ? t.accent : 'none',
                  }} />
                ))}
              </div>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 300 }}>
                {reviews.length} avis
              </span>
            </div>
          </div>

          {hotel.price && (
            <div style={{ textAlign: isMobile ? 'left' : 'right' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 28 : 36, fontWeight: 700, color: '#fff' }}>
                  {hotel.price}
                </span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', fontWeight: 300 }}>DA / nuit</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{
        maxWidth: 1100,
        margin: isMobile ? '24px auto 60px' : '32px auto 60px',
        padding: isMobile ? '0 16px' : '0 28px',
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 320px',
        gap: 24,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, order: isMobile ? 2 : 1 }}>

          {hotel.description && (
            <div style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 20, padding: isMobile ? '24px 24px' : '32px 36px' }}>
              <div style={sectionLabel}>
                <span>À propos</span>
                <span style={sectionLine} />
              </div>
              <p style={{ fontSize: 14, color: t.textMuted, lineHeight: 1.8, fontWeight: 300, margin: 0 }}>
                {hotel.description}
              </p>
            </div>
          )}

          {amenitiesList.length > 0 && (
            <div style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 20, padding: isMobile ? '24px 24px' : '32px 36px' }}>
              <div style={sectionLabel}>
                <span>Équipements</span>
                <span style={sectionLine} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px 24px' }}>
                {amenitiesList.map((amenity, index) => {
                  const Icon = amenity.icon;
                  return (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {Icon && (
                        <div style={{
                          width: 32, height: 32, borderRadius: 10,
                          background: t.accentLight, border: `1px solid ${t.accentBorder}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          <Icon size={14} style={{ color: t.accent }} />
                        </div>
                      )}
                      <span style={{ fontSize: 13, color: t.textMuted, fontWeight: 400 }}>{amenity.label || amenity.name || amenity}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 20, padding: isMobile ? '24px 24px' : '32px 36px' }}>
            <div style={sectionLabel}>
              <span>Avis clients</span>
              <span style={sectionLine} />
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', gap: 20,
              background: t.surface, border: `1px solid ${t.surfaceBorder}`,
              borderRadius: 16, padding: '20px 24px', marginBottom: 20,
            }}>
              <div style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 52, fontWeight: 700, fontStyle: 'italic', color: t.accent, lineHeight: 1,
              }}>
                {averageRating}
              </div>
              <div>
                <div style={{ display: 'flex', gap: 3, marginBottom: 6 }}>
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={16} style={{
                      color: s <= Math.round(parseFloat(averageRating)) ? t.accent : t.textFaint,
                      fill: s <= Math.round(parseFloat(averageRating)) ? t.accent : 'none',
                    }} />
                  ))}
                </div>
                <span style={{ fontSize: 12, color: t.textFaint, fontWeight: 400 }}>{reviews.length} avis</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
              {!reviews.some(r => r.userId === user?.id) ? (
                <button
                  onClick={() => setShowForm(!showForm)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 20px', borderRadius: 10,
                    background: showForm ? t.accent : 'none',
                    border: `1px solid ${showForm ? t.accent : t.cardBorder}`,
                    color: showForm ? '#fff' : t.textMuted,
                    fontSize: 12, fontWeight: 600, letterSpacing: '0.08em',
                    textTransform: 'uppercase', cursor: 'pointer',
                    transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  ✏️ {showForm ? 'Masquer' : 'Laisser un avis'}
                </button>
              ) : (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 20px', borderRadius: 10,
                  background: t.accentLight, border: `1px solid ${t.accentBorder}`,
                  color: t.accent, fontSize: 12, fontWeight: 600, letterSpacing: '0.08em',
                  textTransform: 'uppercase', fontFamily: "'DM Sans', sans-serif",
                }}>
                  <Star size={12} fill={t.accent} /> Avis déjà publié
                </div>
              )}
              {reviews.length > 0 && (
                <button
                  onClick={() => setShowComments(!showComments)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 20px', borderRadius: 10,
                    background: showComments ? t.accentLight : 'none',
                    border: `1px solid ${showComments ? t.accentBorder : t.cardBorder}`,
                    color: showComments ? t.accent : t.textMuted,
                    fontSize: 12, fontWeight: 600, letterSpacing: '0.08em',
                    textTransform: 'uppercase', cursor: 'pointer',
                    transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  💬 Voir les avis ({reviews.length})
                </button>
              )}
            </div>

            <div style={{
              overflow: 'hidden', transition: 'all 0.35s ease',
              maxHeight: showForm ? 500 : 0, opacity: showForm ? 1 : 0,
              marginBottom: showForm ? 20 : 0,
            }}>
              <form onSubmit={handleSubmitReview} style={{
                background: t.surface, border: `1px solid ${t.surfaceBorder}`,
                borderRadius: 16, padding: '24px',
              }}>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: t.textFaint, display: 'block', marginBottom: 10 }}>
                  Votre note
                </label>
                <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                  {[1,2,3,4,5].map(s => (
                    <button key={s} type="button"
                      onClick={() => setRating(s)}
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(0)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, transition: 'transform 0.15s' }}
                      onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'}
                      onMouseUp={e => e.currentTarget.style.transform = 'scale(1.1)'}
                    >
                      <Star size={26} style={{
                        color: s <= (hoverRating || rating) ? t.gold : t.textFaint,
                        fill: s <= (hoverRating || rating) ? t.gold : 'none',
                        transition: 'all 0.15s',
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
                    background: t.input, border: `1px solid ${t.inputBorder}`,
                    borderRadius: 12, padding: '12px 16px',
                    fontSize: 14, color: t.text, fontFamily: "'DM Sans', sans-serif",
                    outline: 'none', resize: 'none', lineHeight: 1.6,
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = t.accent}
                  onBlur={e => e.target.style.borderColor = t.inputBorder}
                />
                <button
                  type="submit"
                  style={{
                    marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '10px 22px', borderRadius: 10,
                    background: t.accent, border: 'none', color: '#fff',
                    fontSize: 12, fontWeight: 600, letterSpacing: '0.08em',
                    textTransform: 'uppercase', cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif", transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#1a5a40'}
                  onMouseLeave={e => e.currentTarget.style.background = t.accent}
                >
                  <Send size={13} /> Publier l'avis
                </button>
              </form>
            </div>

            {reviews.length > 0 && (
              <div style={{
                overflow: 'hidden', transition: 'all 0.35s ease',
                maxHeight: showComments ? 2000 : 0, opacity: showComments ? 1 : 0,
              }}>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: 32 }}>
                    <div style={{ width: 32, height: 32, border: `2px solid ${t.accent}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {reviews.map((review, index) => (
                      <div key={index} style={{
                        padding: '20px 0',
                        borderBottom: index < reviews.length - 1 ? `1px solid ${t.divider}` : 'none',
                      }}>
                        <div style={{ display: 'flex', gap: 14 }}>
                          <div style={{
                            width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                            background: `linear-gradient(135deg, ${t.accent}, #1a4a36)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, color: '#fff',
                          }}>
                            {review.user?.firstName?.[0] || review.user?.email?.[0] || 'U'}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span style={{ fontSize: 13, fontWeight: 600, color: t.text }}>
                                  {review.user?.firstName || 'Utilisateur'}
                                </span>
                                <span style={{ fontSize: 11, color: t.textFaint }}>
                                  {new Date(review.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                              </div>
                              <div style={{ display: 'flex', gap: 2 }}>
                                {[1,2,3,4,5].map(s => (
                                  <Star key={s} size={11} style={{
                                    color: s <= review.rating ? t.gold : t.textFaint,
                                    fill: s <= review.rating ? t.gold : 'none',
                                  }} />
                                ))}
                              </div>
                            </div>
                            <p style={{ fontSize: 13, color: t.textMuted, fontWeight: 300, lineHeight: 1.7, margin: 0 }}>
                              {review.comment}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!loading && reviews.length === 0 && !showForm && (
              <p style={{ fontSize: 13, color: t.textFaint, textAlign: 'center', padding: '24px 0', margin: 0 }}>
                Soyez le premier à laisser un avis
              </p>
            )}
          </div>
        </div>

        <div style={{ order: isMobile ? 1 : 2 }}>
          <div style={{
            position: isMobile ? 'relative' : 'sticky', top: 24,
            background: t.card, border: `1px solid ${t.cardBorder}`,
            borderRadius: 20, overflow: 'hidden',
          }}>
            <div style={{
              background: isDark ? '#101a15' : '#1a3328',
              padding: isMobile ? '20px' : '28px 28px 24px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
                À partir de
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 6 }}>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 36 : 44, fontWeight: 700, color: '#fff', lineHeight: 1 }}>
                  {hotel.price || '---'}
                </span>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', fontWeight: 300 }}>DA</span>
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 4, letterSpacing: '0.08em' }}>PAR NUIT</div>
            </div>

            <div style={{ padding: isMobile ? '20px' : '24px 24px 28px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: t.accentLight, border: `1px solid ${t.accentBorder}`,
                borderRadius: 99, padding: '8px 18px', marginBottom: 20,
              }}>
                <Star size={12} style={{ color: t.accent, fill: t.accent }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: t.accent }}>{averageRating}</span>
                <span style={{ fontSize: 11, color: t.textFaint }}>· {reviews.length} avis</span>
              </div>

              <button
                onClick={() => setShowReservationModal(true)}
                style={{
                  width: '100%', padding: '14px 20px', borderRadius: 12,
                  background: t.accent, border: 'none', color: '#fff',
                  fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  fontFamily: "'DM Sans', sans-serif", transition: 'background 0.2s',
                  marginBottom: 10,
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#1a5a40'}
                onMouseLeave={e => e.currentTarget.style.background = t.accent}
              >
                <Building size={15} /> Réserver maintenant
              </button>

              <button
                onClick={toggleFavorite}
                style={{
                  width: '100%', padding: '13px 20px', borderRadius: 12,
                  background: isFavorite ? 'rgba(220,64,64,0.1)' : 'none',
                  border: `1px solid ${isFavorite ? '#dc4040' : t.cardBorder}`,
                  color: isFavorite ? t.danger : t.textMuted,
                  fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s',
                  marginBottom: isMobile ? 16 : 24,
                }}
              >
                <Heart size={15} style={{ fill: isFavorite ? t.danger : 'none' }} />
                {isFavorite ? 'Favori' : 'Favoris'}
              </button>

              {(hotel.phone || hotel.email) && (
                <>
                  <div style={{ height: 1, background: t.divider, marginBottom: 20 }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {hotel.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: t.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Phone size={13} style={{ color: t.accent }} />
                        </div>
                        <span style={{ fontSize: 12, color: t.textMuted, fontWeight: 300 }}>{hotel.phone}</span>
                      </div>
                    )}
                    {hotel.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: t.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Mail size={13} style={{ color: t.accent }} />
                        </div>
                        <span style={{ fontSize: 12, color: t.textMuted, fontWeight: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {hotel.email}
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .hotel-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <HotelReservationModal
        isOpen={showReservationModal}
        onClose={() => setShowReservationModal(false)}
        hotel={hotel}
        user={{ email: localStorage.getItem('userEmail'), phone: localStorage.getItem('userPhone') }}
      />
    </motion.div>
  );
};

export default HotelDetailPage;