import React, { useState, useEffect } from 'react';
import { Heart, MapPin, User, TrendingUp, Award, ChevronRight, Edit3, Cpu, FileText, CheckCircle, Clock, AlertCircle, Receipt, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';
import axios from 'axios';

/* ── Palette ── */
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

/* ── Stat Card ── */
const StatCard = ({ icon, count, label, delay = 0, colors, isDark, isMobile, onClick }) => {
  const [hov, setHov] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      onHoverStart={() => setHov(true)}
      onHoverEnd={() => setHov(false)}
      onClick={onClick}
      style={{
        background: hov ? (isDark ? '#242d2a' : colors.dark) : colors.card,
        border: `1px solid ${hov ? 'transparent' : colors.border}`,
        padding: isMobile ? '12px 8px' : '28px 24px',
        display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 20,
        transition: 'all 0.3s ease',
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: hov ? '0 12px 40px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.04)',
        minWidth: 0,
      }}
    >
      <div style={{
        width: isMobile ? 32 : 52, height: isMobile ? 32 : 52,
        background: hov ? 'rgba(201,168,68,0.2)' : colors.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: hov ? colors.gold : colors.accent,
        transition: 'all 0.3s', flexShrink: 0,
        minWidth: isMobile ? 32 : 52,
      }}>
        {React.cloneElement(icon, { size: isMobile ? 14 : 20 })}
      </div>
      <div style={{ minWidth: 0, overflow: 'hidden' }}>
        <div style={{
          fontFamily: colors.serif, fontStyle: 'italic', fontWeight: 600,
          fontSize: isMobile ? 18 : 32, lineHeight: 1,
          color: hov ? '#fff' : colors.text, transition: 'color 0.3s',
        }}>{count}</div>
        <div style={{
          fontFamily: colors.sans, fontSize: isMobile ? 7 : 10, fontWeight: 500,
          letterSpacing: isMobile ? '0.08em' : '0.14em', textTransform: 'uppercase',
          color: hov ? 'rgba(255,255,255,0.7)' : colors.text3,
          marginTop: isMobile ? 2 : 4, transition: 'color 0.3s',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{label}</div>
      </div>
    </motion.div>
  );
};

/* ── Finance Row ── */
const FinanceRow = ({ icon, label, value, valueColor, colors, isMobile }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: isMobile ? '10px 0' : '12px 0',
    borderBottom: `1px solid ${colors.border}`,
    gap: 8,
  }}>
    <span style={{
      display: 'flex', alignItems: 'center', gap: 8,
      fontFamily: colors.sans, fontSize: isMobile ? 12 : 13, fontWeight: 300, color: colors.text3,
      flexShrink: 0,
    }}>
      <span style={{ color: colors.accent, flexShrink: 0 }}>{icon}</span>
      <span style={{ whiteSpace: 'nowrap' }}>{label}</span>
    </span>
    <span style={{
      fontFamily: colors.sans, fontSize: isMobile ? 12 : 13, fontWeight: 600,
      color: valueColor || colors.text,
      letterSpacing: '0.02em',
      textAlign: 'right',
    }}>
      {value}
    </span>
  </div>
);

/* ── Action Button ── */
const ActionBtn = ({ icon, label, onClick, accent = false, colors, isDark, isMobile }) => {
  const [hov, setHov] = useState(false);
  return (
    <motion.button
      onClick={onClick}
      onHoverStart={() => setHov(true)}
      onHoverEnd={() => setHov(false)}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      style={{
        display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 14,
        padding: isMobile ? '14px 16px' : '20px 24px',
        background: hov ? (accent ? colors.gold : (isDark ? '#242d2a' : colors.dark)) : colors.card,
        border: `1px solid ${hov ? 'transparent' : colors.border}`,
        cursor: 'pointer', width: '100%', textAlign: 'left',
        boxShadow: hov ? '0 8px 28px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.04)',
        transition: 'background 0.25s, box-shadow 0.25s, border 0.25s',
        minWidth: 0,
      }}
    >
      <div style={{
        width: isMobile ? 32 : 40, height: isMobile ? 32 : 40,
        background: hov ? 'rgba(255,255,255,0.12)' : colors.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: hov ? '#fff' : colors.accent,
        flexShrink: 0, transition: 'all 0.25s',
        minWidth: isMobile ? 32 : 40,
      }}>
        {React.cloneElement(icon, { size: isMobile ? 14 : 16 })}
      </div>
      <span style={{
        fontFamily: colors.sans, fontSize: isMobile ? 9 : 11, fontWeight: 500,
        letterSpacing: '0.12em', textTransform: 'uppercase',
        color: hov ? '#fff' : colors.text, transition: 'color 0.25s', flex: 1,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>{label}</span>
      <ChevronRight size={isMobile ? 12 : 14} style={{ color: hov ? 'rgba(255,255,255,0.5)' : colors.text3, transition: 'color 0.25s', flexShrink: 0 }} />
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
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const isMobile = windowWidth <= 868;
  const isTablet = windowWidth <= 1024;
  const isPhone = windowWidth <= 580;

  const [loading, setLoading] = useState(true);
  const [realStats, setRealStats] = useState({
    favorites: 0,
    visited: 0,
    reviews: 0
  });
  const [financialStats, setFinancialStats] = useState({
    totalDocs: 0,
    totalPaid: 0,
    paid: 0,
    pending: 0,
    failed: 0
  });

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    fetchRealData();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchRealData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

      // 1. Fetch Favorites
      const favRes = await axios.get(`${API_URL}/api/favorites`, { headers });
      const favCount = favRes.data.count || (favRes.data.favorites ? favRes.data.favorites.length : 0);

      // 2. Fetch Invoices for Visited Destinations and Financial Stats
      const invRes = await axios.get(`${API_URL}/api/invoices`, { headers });
      const invoices = invRes.data.invoices || [];

      // Calculate unique visited destinations from invoices
      const visitedDestinations = new Set();
      invoices.forEach(inv => {
        const details = inv.invoice_details;
        if (details && details.destination && details.destination !== 'N/A') {
          visitedDestinations.add(details.destination);
        }
      });

      // 3. Fetch Reviews
      const revRes = await axios.get(`${API_URL}/api/reviews/my`, { headers });
      const revCount = revRes.data.reviews ? revRes.data.reviews.length : (revRes.data.count || 0);

      setRealStats({
        favorites: favCount,
        visited: visitedDestinations.size,
        reviews: revCount
      });

      // 4. Calculate Financial Stats
      const fin = {
        totalDocs: invoices.length,
        totalPaid: invoices.filter(i => i.payment_status === 'paid').reduce((s, i) => s + parseFloat(i.amount || 0), 0),
        paid: invoices.filter(i => i.payment_status === 'paid').length,
        pending: invoices.filter(i => i.payment_status === 'pending').length,
        failed: invoices.filter(i => i.payment_status === 'failed').length
      };
      setFinancialStats(fin);

    } catch (err) {
      console.error('Error fetching dashboard real data:', err);
    } finally {
      setLoading(false);
    }
  };

  const displayName = dashboardUser?.firstName && dashboardUser?.lastName
    ? `${dashboardUser.firstName} ${dashboardUser.lastName}`
    : dashboardUser?.name || '—';

  const firstName = dashboardUser?.firstName || (dashboardUser?.name ? dashboardUser.name.split(' ')[0] : '—');
  const email     = dashboardUser?.email || '—';
  const avatar    = dashboardUser?.profilePhoto || null;

  const memberType = dashboardUser?.memberType || dashboardUser?.role || 'standard';
  const isPremium  = memberType === 'premium' || dashboardUser?.isPremium;

  const formatDA = (amount) =>
    amount > 0
      ? `${Number(amount).toLocaleString('fr-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DA`
      : '0.00 DA';

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', padding: '0 16px' }}>
        <Loader2 size={isMobile ? 32 : 40} className="animate-spin" style={{ color: colors.accent, marginBottom: 16 }} />
        <p style={{ fontFamily: colors.sans, color: colors.text3, fontSize: isMobile ? 13 : 14, textAlign: 'center' }}>Chargement de vos informations...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', fontFamily: colors.sans, padding: isMobile ? '0 12px 24px' : '0 0 40px' }}>

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: isMobile ? 24 : 44 }}
      >
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          fontFamily: colors.sans, fontSize: isMobile ? 9 : 10, fontWeight: 500,
          letterSpacing: '0.22em', textTransform: 'uppercase', color: colors.text3,
          marginBottom: 12,
        }}>
          <span style={{ width: isMobile ? 16 : 24, height: 1, background: colors.text3, display: 'inline-block' }} />
          Espace personnel
        </span>
        <h1 style={{
          fontFamily: colors.serif, fontStyle: 'italic', fontWeight: 600,
          fontSize: isMobile ? '22px' : 'clamp(28px, 4vw, 44px)', color: colors.text,
          lineHeight: 1.1, marginBottom: 10,
        }}>
          Bienvenue, <span style={{ color: colors.accent }}>{firstName}</span>
        </h1>
        <p style={{
          fontFamily: colors.sans, fontSize: isMobile ? 13 : 14, color: colors.text3,
          fontWeight: 300, lineHeight: 1.75,
        }}>
          {t('dashboard.profileDescription') || 'Explorez vos destinations favorites, gérez vos réservations et consultez vos documents.'}
        </p>
      </motion.div>

      {/* ── 3 Stats ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isPhone ? '1fr' : (isMobile ? 'repeat(3, 1fr)' : 'repeat(3, 1fr)'),
        gap: isMobile ? 10 : 12,
        marginBottom: isMobile ? 20 : 32,
      }}>
        <StatCard icon={<Heart size={18} />}      count={realStats.favorites} label={t('dashboard.favorites') || 'Favoris'} delay={0}    colors={colors} isDark={isDark} isMobile={isMobile} onClick={() => setActiveTab('favorites')} />
        <StatCard icon={<MapPin size={18} />}     count={realStats.visited}   label={t('dashboard.visitedDestinations') || 'Visités'} delay={0.08} colors={colors} isDark={isDark} isMobile={isMobile} />
        <StatCard icon={<TrendingUp size={18} />} count={realStats.reviews}   label="Avis"                               delay={0.16} colors={colors} isDark={isDark} isMobile={isMobile} />
      </div>

      {/* ── Profil + Résumé Financier ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isTablet ? '1fr' : '1fr 1fr',
        gap: isMobile ? 16 : 24,
        marginBottom: isMobile ? 24 : 32,
      }}>

        {/* ── Card Profil ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            background: colors.card, border: `1px solid ${colors.border}`,
            padding: isMobile ? '20px 16px' : '32px 32px 28px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            fontFamily: colors.sans, fontSize: isMobile ? 9 : 10, fontWeight: 500,
            letterSpacing: '0.22em', textTransform: 'uppercase',
            color: colors.text3, marginBottom: isMobile ? 20 : 28,
          }}>
            <span style={{ width: isMobile ? 16 : 20, height: 1, background: colors.text3, display: 'inline-block' }} />
            {t('dashboard.profileInfo') || 'Informations du profil'}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 16, marginBottom: isMobile ? 20 : 28 }}>
            <div style={{
              width: isMobile ? 48 : 72, height: isMobile ? 48 : 72,
              background: colors.dark,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(181,228,202,0.7)', flexShrink: 0, overflow: 'hidden',
              minWidth: isMobile ? 48 : 72,
            }}>
              {avatar
                ? <img src={avatar.startsWith('http') ? avatar : `http://localhost:3000${avatar}`} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <User size={isMobile ? 20 : 32} />
              }
            </div>
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <h3 style={{
                fontFamily: colors.serif, fontStyle: 'italic', fontWeight: 600,
                fontSize: isMobile ? 16 : 20, color: colors.text, marginBottom: 4, lineHeight: 1.2,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{displayName}</h3>
              <p style={{
                fontFamily: colors.sans, fontSize: isMobile ? 11 : 12, color: colors.text3,
                fontWeight: 300, marginBottom: isMobile ? 8 : 10,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{email}</p>
              {isPremium && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  background: 'rgba(201,168,68,0.1)', border: '1px solid rgba(201,168,68,0.3)',
                  padding: '3px 8px',
                  fontFamily: colors.sans, fontSize: isMobile ? 8 : 9, fontWeight: 600,
                  letterSpacing: '0.1em', textTransform: 'uppercase', color: colors.gold,
                }}>
                  <Award size={isMobile ? 8 : 10} /> {t('dashboard.premiumMember') || 'Membre Premium'}
                </div>
              )}
            </div>
          </div>

          <div style={{ height: 1, background: colors.border, marginBottom: isMobile ? 16 : 20 }} />

          <button
            onClick={() => setActiveTab('settings')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: isMobile ? '8px 16px' : '10px 20px',
              background: 'transparent', border: `1px solid ${colors.border}`,
              fontFamily: colors.sans, fontSize: isMobile ? 10 : 11, fontWeight: 500,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: colors.text, cursor: 'pointer', transition: 'all 0.2s',
              width: '100%', justifyContent: 'center',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = colors.dark; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = colors.dark; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = colors.text; e.currentTarget.style.borderColor = colors.border; }}
          >
            <Edit3 size={isMobile ? 10 : 12} /> {t('dashboard.editProfile') || 'Modifier le profil'}
          </button>
        </motion.div>

        {/* ── Card Résumé Financier ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.28 }}
          style={{
            background: colors.card, border: `1px solid ${colors.border}`,
            padding: isMobile ? '20px 16px' : '32px 32px 28px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: isMobile ? 20 : 28,
            gap: 8,
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontFamily: colors.sans, fontSize: isMobile ? 9 : 10, fontWeight: 500,
              letterSpacing: '0.22em', textTransform: 'uppercase', color: colors.text3,
              flexShrink: 0,
            }}>
              <span style={{ width: isMobile ? 16 : 20, height: 1, background: colors.text3, display: 'inline-block' }} />
              Résumé Financier
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: colors.bg, border: `1px solid ${colors.border}`,
              padding: '3px 8px',
              fontFamily: colors.sans, fontSize: isMobile ? 8 : 9, fontWeight: 600,
              letterSpacing: '0.1em', textTransform: 'uppercase', color: colors.text3,
              flexShrink: 0,
            }}>
              <FileText size={isMobile ? 8 : 9} /> {financialStats.totalDocs} docs
            </div>
          </div>

          <div style={{
            background: isDark ? '#0f1f17' : '#f0f7f3',
            border: `1px solid ${isDark ? '#1e3d2a' : '#c3ddd0'}`,
            padding: isMobile ? '12px 14px' : '16px 20px',
            marginBottom: isMobile ? 12 : 16,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 8,
          }}>
            <span style={{
              fontFamily: colors.sans, fontSize: isMobile ? 10 : 11, fontWeight: 500,
              letterSpacing: '0.1em', textTransform: 'uppercase', color: colors.text3,
              flexShrink: 0,
            }}>
              Total payé
            </span>
            <span style={{
              fontFamily: colors.serif, fontStyle: 'italic', fontWeight: 700,
              fontSize: isMobile ? 16 : 22, color: colors.gold,
              textAlign: 'right',
            }}>
              {formatDA(financialStats.totalPaid)}
            </span>
          </div>

          <div>
            <FinanceRow
              icon={<CheckCircle size={isMobile ? 12 : 13} />}
              label="Payées"
              value={financialStats.paid}
              valueColor="#4caf82"
              colors={colors}
              isMobile={isMobile}
            />
            <FinanceRow
              icon={<Clock size={isMobile ? 12 : 13} />}
              label="En attente"
              value={financialStats.pending}
              valueColor={colors.gold}
              colors={colors}
              isMobile={isMobile}
            />
            <FinanceRow
              icon={<AlertCircle size={isMobile ? 12 : 13} />}
              label="Échouées"
              value={financialStats.failed}
              valueColor={financialStats.failed > 0 ? '#e05a5a' : colors.text3}
              colors={colors}
              isMobile={isMobile}
            />
          </div>

          <button
            onClick={() => setActiveTab('invoices')}
            style={{
              marginTop: isMobile ? 16 : 24,
              fontFamily: colors.sans, fontSize: isMobile ? 10 : 11, fontWeight: 500,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: colors.accent, background: 'none', border: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              padding: 0, width: '100%',
              justifyContent: 'center',
            }}
            onMouseEnter={e => e.currentTarget.style.color = colors.dark}
            onMouseLeave={e => e.currentTarget.style.color = colors.accent}
          >
            Voir toutes mes factures <ChevronRight size={isMobile ? 10 : 12} />
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
          fontFamily: colors.sans, fontSize: isMobile ? 9 : 10, fontWeight: 500,
          letterSpacing: '0.22em', textTransform: 'uppercase',
          color: colors.text3, marginBottom: isMobile ? 12 : 14,
        }}>
          <span style={{ width: isMobile ? 16 : 20, height: 1, background: colors.text3, display: 'inline-block' }} />
          {t('dashboard.quickActions') || 'Actions rapides'}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isPhone ? '1fr' : (isMobile ? 'repeat(auto-fit, minmax(200px, 1fr))' : 'repeat(auto-fit, minmax(240px, 1fr))'),
          gap: isMobile ? 12 : 16,
        }}>
          <ActionBtn icon={<Heart size={16} />}   label={t('dashboard.viewFavorites') || 'Mes favoris'}      onClick={() => setActiveTab('favorites')}       colors={colors} isDark={isDark} isMobile={isMobile} />
          <ActionBtn icon={<Receipt size={16} />} label="Mes Factures"                      onClick={() => setActiveTab('invoices')}        colors={colors} isDark={isDark} isMobile={isMobile} />
          <ActionBtn icon={<Cpu size={16} />}     label={t('dashboard.myRecommendations') || 'Recommandations'}  onClick={() => setActiveTab('recommendations')} accent colors={colors} isDark={isDark} isMobile={isMobile} />
        </div>
      </motion.div>

    </div>
  );
};

export default DashboardContent;