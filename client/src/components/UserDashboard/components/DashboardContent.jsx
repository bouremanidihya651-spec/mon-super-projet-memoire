import React, { useState } from 'react';
import { Heart, MapPin, Calendar, User, Globe, Plane, Star, TrendingUp, Award, ChevronRight, Edit3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';

/* ── Palette cohérente avec Home.jsx ── */
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

const fadeUp  = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } } };
const stagger = { show: { transition: { staggerChildren: 0.09 } } };

/* ── Stat Card ── */
const StatCard = ({ icon, count, label, delay = 0, colors, isDark, isMobile }) => {
  const [hov, setHov] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      onHoverStart={() => setHov(true)}
      onHoverEnd={() => setHov(false)}
      style={{
        background: hov ? (isDark ? '#242d2a' : colors.dark) : colors.card,
        border: `1px solid ${hov ? 'transparent' : colors.border}`,
        padding: isMobile ? '16px 14px' : '28px 24px',
        display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 20,
        transition: 'all 0.3s ease',
        cursor: 'default',
        boxShadow: hov ? '0 12px 40px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{
        width: isMobile ? 40 : 52, height: isMobile ? 40 : 52,
        background: hov ? 'rgba(201,168,68,0.2)' : colors.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: hov ? colors.gold : colors.accent,
        transition: 'all 0.3s',
        flexShrink: 0,
      }}>
        {React.cloneElement(icon, { size: isMobile ? 18 : 20 })}
      </div>
      <div>
        <div style={{
          fontFamily: colors.serif, fontStyle: 'italic', fontWeight: 600,
          fontSize: isMobile ? 22 : 32, lineHeight: 1, color: hov ? '#fff' : colors.text,
          transition: 'color 0.3s',
        }}>{count}</div>
        <div style={{
          fontFamily: colors.sans, fontSize: isMobile ? 8 : 10, fontWeight: 500,
          letterSpacing: '0.14em', textTransform: 'uppercase',
          color: hov ? 'rgba(255,255,255,0.7)' : colors.text3,
          marginTop: 4, transition: 'color 0.3s',
        }}>{label}</div>
      </div>
    </motion.div>
  );
};

/* ── Preference Row ── */
const PreferenceRow = ({ icon, label, value, colors }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '13px 0', borderBottom: `1px solid ${colors.border}`,
  }}>
    <span style={{
      display: 'flex', alignItems: 'center', gap: 8,
      fontFamily: colors.sans, fontSize: 13, fontWeight: 300, color: colors.text3,
    }}>
      <span style={{ color: colors.accent }}>{icon}</span> {label}
    </span>
    <span style={{
      fontFamily: colors.sans, fontSize: 12, fontWeight: 500,
      color: colors.text, background: colors.bg,
      padding: '3px 12px', border: `1px solid ${colors.border}`,
      letterSpacing: '0.04em',
    }}>{value}</span>
  </div>
);

/* ── Action Button ── */
const ActionBtn = ({ icon, label, onClick, accent = false, colors, isDark }) => {
  const [hov, setHov] = useState(false);
  return (
    <motion.button
      onClick={onClick}
      onHoverStart={() => setHov(true)}
      onHoverEnd={() => setHov(false)}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '20px 24px',
        background: hov ? (accent ? colors.gold : (isDark ? '#242d2a' : colors.dark)) : colors.card,
        border: `1px solid ${hov ? 'transparent' : colors.border}`,
        cursor: 'pointer', width: '100%', textAlign: 'left',
        boxShadow: hov ? '0 8px 28px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.04)',
        transition: 'background 0.25s, box-shadow 0.25s, border 0.25s',
      }}
    >
      <div style={{
        width: 40, height: 40, background: hov ? 'rgba(255,255,255,0.12)' : colors.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: hov ? '#fff' : colors.accent,
        flexShrink: 0, transition: 'all 0.25s',
      }}>
        {icon}
      </div>
      <span style={{
        fontFamily: colors.sans, fontSize: 11, fontWeight: 500,
        letterSpacing: '0.12em', textTransform: 'uppercase',
        color: hov ? '#fff' : colors.text, transition: 'color 0.25s',
        flex: 1,
      }}>{label}</span>
      <ChevronRight size={14} style={{ color: hov ? 'rgba(255,255,255,0.5)' : colors.text3, transition: 'color 0.25s' }} />
    </motion.button>
  );
};

/* ══════════════════════
   MAIN DASHBOARD
══════════════════════ */
const DashboardContent = ({ dashboardUser, setActiveTab }) => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 868);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 868);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', fontFamily: colors.sans, padding: isMobile ? '0 16px 40px' : '0 0 40px' }}>

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: isMobile ? 32 : 44 }}
      >
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          fontFamily: colors.sans, fontSize: 10, fontWeight: 500,
          letterSpacing: '0.22em', textTransform: 'uppercase', color: colors.text3,
          marginBottom: 12,
        }}>
          <span style={{ width: 24, height: 1, background: colors.text3, display: 'inline-block' }} />
          Espace personnel
        </span>
        <h1 style={{
          fontFamily: colors.serif, fontStyle: 'italic', fontWeight: 600,
          fontSize: isMobile ? '24px' : 'clamp(28px, 4vw, 44px)', color: colors.text,
          lineHeight: 1.1, marginBottom: 10,
        }}>
          Bienvenue, <span style={{ color: colors.accent }}>{dashboardUser?.name}</span>
        </h1>
        <p style={{
          fontFamily: colors.sans, fontSize: 14, color: colors.text3,
          fontWeight: 300, lineHeight: 1.75,
        }}>
          {t('dashboard.profileDescription')}
        </p>
      </motion.div>

      {/* ── Stats ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: isMobile ? 8 : 12, marginBottom: isMobile ? 24 : 32,
      }}>
        <StatCard icon={<Heart size={18} />} count="0" label={t('dashboard.favorites')} delay={0} colors={colors} isDark={isDark} isMobile={isMobile} />
        <StatCard icon={<MapPin size={18} />} count="0" label={t('dashboard.visitedDestinations')} delay={0.08} colors={colors} isDark={isDark} isMobile={isMobile} />
        <StatCard icon={<Calendar size={18} />} count="0" label={t('dashboard.plannedTrips')} delay={0.16} colors={colors} isDark={isDark} isMobile={isMobile} />
        <StatCard icon={<TrendingUp size={18} />} count="0" label="Avis" delay={0.24} colors={colors} isDark={isDark} isMobile={isMobile} />
      </div>

      {/* ── Profile + Preferences ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: isMobile ? 8 : 12, marginBottom: isMobile ? 8 : 12,
      }}>

        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            background: colors.card, border: `1px solid ${colors.border}`,
            padding: isMobile ? '24px 20px' : '32px 32px 28px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          {/* Card header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            fontFamily: colors.sans, fontSize: 10, fontWeight: 500,
            letterSpacing: '0.22em', textTransform: 'uppercase',
            color: colors.text3, marginBottom: 28,
          }}>
            <span style={{ width: 20, height: 1, background: colors.text3, display: 'inline-block' }} />
            {t('dashboard.profileInfo')}
          </div>

          {/* Avatar + info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
            <div style={{
              width: isMobile ? 56 : 72, height: isMobile ? 56 : 72,
              background: colors.dark,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(181,228,202,0.7)', flexShrink: 0,
            }}>
              <User size={isMobile ? 24 : 32} />
            </div>
            <div>
              <h3 style={{
                fontFamily: colors.serif, fontStyle: 'italic', fontWeight: 600,
                fontSize: isMobile ? 18 : 20, color: colors.text, marginBottom: 4, lineHeight: 1.2,
              }}>
                {dashboardUser?.name}
              </h3>
              <p style={{
                fontFamily: colors.sans, fontSize: 12, color: colors.text3,
                fontWeight: 300, marginBottom: 10, overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {dashboardUser?.email}
              </p>
              {/* Badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: 'rgba(201,168,68,0.1)', border: '1px solid rgba(201,168,68,0.3)',
                padding: '3px 10px',
                fontFamily: colors.sans, fontSize: 9, fontWeight: 600,
                letterSpacing: '0.1em', textTransform: 'uppercase', color: colors.gold,
              }}>
                <Award size={10} /> {t('dashboard.premiumMember')}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: colors.border, marginBottom: 20 }} />

          {/* Edit button */}
          <button
            onClick={() => setActiveTab('settings')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 20px',
              background: 'transparent', border: `1px solid ${colors.border}`,
              fontFamily: colors.sans, fontSize: 11, fontWeight: 500,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: colors.text, cursor: 'pointer',
              transition: 'all 0.2s', width: isMobile ? '100%' : 'auto',
              justifyContent: 'center',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = colors.dark; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = colors.dark; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = colors.text; e.currentTarget.style.borderColor = colors.border; }}
          >
            <Edit3 size={12} /> {t('dashboard.editProfile')}
          </button>
        </motion.div>

        {/* Preferences card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.28 }}
          style={{
            background: colors.card, border: `1px solid ${colors.border}`,
            padding: isMobile ? '24px 20px' : '32px 32px 28px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            fontFamily: colors.sans, fontSize: 10, fontWeight: 500,
            letterSpacing: '0.22em', textTransform: 'uppercase',
            color: colors.text3, marginBottom: 28,
          }}>
            <span style={{ width: 20, height: 1, background: colors.text3, display: 'inline-block' }} />
            {t('dashboard.travelPreferences')}
          </div>

          <div>
            <PreferenceRow icon={<Plane size={13}/>} label={t('dashboard.travelType')} value={isMobile ? "Luxe" : "Luxe & Détente"} colors={colors} />
            <PreferenceRow icon={<Globe size={13}/>} label={t('dashboard.preferredLanguage')} value="Français" colors={colors} />
            <PreferenceRow icon={<MapPin size={13}/>} label={t('dashboard.favoriteContinent')} value="Europe" colors={colors} />
            <PreferenceRow icon={<Star size={13}/>} label="Budget moyen" value="2 000DA+" colors={colors} />
          </div>

          <button
            onClick={() => setActiveTab('settings')}
            style={{
              marginTop: 24,
              fontFamily: colors.sans, fontSize: 11, fontWeight: 500,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: colors.accent, background: 'none', border: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              padding: 0, width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'center' : 'flex-start',
            }}
            onMouseEnter={e => e.currentTarget.style.color = colors.dark}
            onMouseLeave={e => e.currentTarget.style.color = colors.accent}
          >
            {t('dashboard.modifyPreferences')} <ChevronRight size={12} />
          </button>
        </motion.div>
      </div>

      {/* ── Quick Actions ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.36 }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: colors.sans, fontSize: 10, fontWeight: 500,
          letterSpacing: '0.22em', textTransform: 'uppercase',
          color: colors.text3, marginBottom: 14,
        }}>
          <span style={{ width: 20, height: 1, background: colors.text3, display: 'inline-block' }} />
          {t('dashboard.quickActions')}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: isMobile ? 8 : 10,
        }}>
          <ActionBtn icon={<Heart size={16} />} label={t('dashboard.viewFavorites')} onClick={() => setActiveTab('favorites')} colors={colors} isDark={isDark} />
          <ActionBtn icon={<Star size={16} />} label={t('dashboard.myRecommendations')} onClick={() => setActiveTab('recommendations')} accent colors={colors} isDark={isDark} />
   
        </div>
      </motion.div>

    </div>
  );
};

export default DashboardContent;

