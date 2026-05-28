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
        padding: isMobile ? '16px 14px' : '28px 24px',
        display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 20,
        transition: 'all 0.3s ease',
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: hov ? '0 12px 40px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{
        width: isMobile ? 40 : 52, height: isMobile ? 40 : 52,
        background: hov ? 'rgba(201,168,68,0.2)' : colors.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: hov ? colors.gold : colors.accent,
        transition: 'all 0.3s', flexShrink: 0,
      }}>
        {React.cloneElement(icon, { size: isMobile ? 18 : 20 })}
      </div>
      <div>
        <div style={{
          fontFamily: colors.serif, fontStyle: 'italic', fontWeight: 600,
          fontSize: isMobile ? 22 : 32, lineHeight: 1,
          color: hov ? '#fff' : colors.text, transition: 'color 0.3s',
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

/* ── Finance Row ── */
const FinanceRow = ({ icon, label, value, valueColor, colors }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 0', borderBottom: `1px solid ${colors.border}`,
  }}>
    <span style={{
      display: 'flex', alignItems: 'center', gap: 8,
      fontFamily: colors.sans, fontSize: 13, fontWeight: 300, color: colors.text3,
    }}>
      <span style={{ color: colors.accent }}>{icon}</span> {label}
    </span>
    <span style={{
      fontFamily: colors.sans, fontSize: 13, fontWeight: 600,
      color: valueColor || colors.text,
      letterSpacing: '0.02em',
    }}>
      {value}
    </span>
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
        color: hov ? '#fff' : colors.text, transition: 'color 0.25s', flex: 1,
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
    const handleResize = () => setIsMobile(window.innerWidth <= 868);
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
      const favCount = favRes.data.count || 0;

      // 2. Fetch Reservations for Visited count
      const resRes = await axios.get(`${API_URL}/api/reservations`, { headers });
      const reservations = resRes.data.reservations || [];
      const visitedCount = reservations.filter(r => 
        r.status === 'confirmed' && new Date(r.departure_date || r.check_in) < new Date()
      ).length;

      // 3. Fetch Reviews
      const revRes = await axios.get(`${API_URL}/api/reviews/my`, { headers });
      const revCount = revRes.data.count || 0;

      setRealStats({
        favorites: favCount,
        visited: visitedCount,
        reviews: revCount
      });

      // 4. Fetch Invoices for financial summary
      const invRes = await axios.get(`${API_URL}/api/invoices`, { headers });
      const invoices = invRes.data.invoices || [];
      
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

  // ─── Données utilisateur ───────────────────────────────────────────────────
  const displayName = dashboardUser?.firstName && dashboardUser?.lastName
    ? `${dashboardUser.firstName} ${dashboardUser.lastName}`
    : dashboardUser?.name || '—';

  const firstName = dashboardUser?.firstName || (dashboardUser?.name ? dashboardUser.name.split(' ')[0] : '—');
  const email     = dashboardUser?.email || '—';
  const avatar    = dashboardUser?.profilePhoto || null;

  // Badge membre
  const memberType = dashboardUser?.memberType || dashboardUser?.role || 'standard';
  const isPremium  = memberType === 'premium' || dashboardUser?.isPremium;

  // Formater le montant en DA
  const formatDA = (amount) =>
    amount > 0
      ? `${Number(amount).toLocaleString('fr-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DA`
      : '0.00 DA';

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
        <Loader2 size={40} className="animate-spin" style={{ color: colors.accent, marginBottom: 16 }} />
        <p style={{ fontFamily: colors.sans, color: colors.text3 }}>Chargement de vos informations...</p>
      </div>
    );
  }

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
          Bienvenue, <span style={{ color: colors.accent }}>{firstName}</span>
        </h1>
        <p style={{
          fontFamily: colors.sans, fontSize: 14, color: colors.text3,
          fontWeight: 300, lineHeight: 1.75,
        }}>
          {t('dashboard.profileDescription') || 'Explorez vos destinations favorites, gérez vos réservations et consultez vos documents.'}
        </p>
      </motion.div>

      {/* ── 3 Stats ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(3, 1fr)',
        gap: isMobile ? 8 : 12,
        marginBottom: isMobile ? 24 : 32,
      }}>
        <StatCard icon={<Heart size={18} />}      count={realStats.favorites} label={t('dashboard.favorites') || 'Favoris'} delay={0}    colors={colors} isDark={isDark} isMobile={isMobile} onClick={() => setActiveTab('favorites')} />
        <StatCard icon={<MapPin size={18} />}     count={realStats.visited}   label={t('dashboard.visitedDestinations') || 'Visités'} delay={0.08} colors={colors} isDark={isDark} isMobile={isMobile} />
        <StatCard icon={<TrendingUp size={18} />} count={realStats.reviews}   label="Avis"                               delay={0.16} colors={colors} isDark={isDark} isMobile={isMobile} />
      </div>

      {/* ── Profil + Résumé Financier côte à côte ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: isMobile ? 8 : 12,
        marginBottom: isMobile ? 8 : 12,
      }}>

        {/* ── Card Profil ── */}
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
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            fontFamily: colors.sans, fontSize: 10, fontWeight: 500,
            letterSpacing: '0.22em', textTransform: 'uppercase',
            color: colors.text3, marginBottom: 28,
          }}>
            <span style={{ width: 20, height: 1, background: colors.text3, display: 'inline-block' }} />
            {t('dashboard.profileInfo') || 'Informations du profil'}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
            {/* Avatar */}
            <div style={{
              width: isMobile ? 56 : 72, height: isMobile ? 56 : 72,
              background: colors.dark,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(181,228,202,0.7)', flexShrink: 0, overflow: 'hidden',
            }}>
              {avatar
                ? <img src={avatar.startsWith('http') ? avatar : `http://localhost:3000${avatar}`} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <User size={isMobile ? 24 : 32} />
              }
            </div>
            <div>
              <h3 style={{
                fontFamily: colors.serif, fontStyle: 'italic', fontWeight: 600,
                fontSize: isMobile ? 18 : 20, color: colors.text, marginBottom: 4, lineHeight: 1.2,
              }}>{displayName}</h3>
              <p style={{
                fontFamily: colors.sans, fontSize: 12, color: colors.text3,
                fontWeight: 300, marginBottom: 10,
              }}>{email}</p>
              {isPremium && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  background: 'rgba(201,168,68,0.1)', border: '1px solid rgba(201,168,68,0.3)',
                  padding: '3px 10px',
                  fontFamily: colors.sans, fontSize: 9, fontWeight: 600,
                  letterSpacing: '0.1em', textTransform: 'uppercase', color: colors.gold,
                }}>
                  <Award size={10} /> {t('dashboard.premiumMember') || 'Membre Premium'}
                </div>
              )}
            </div>
          </div>

          <div style={{ height: 1, background: colors.border, marginBottom: 20 }} />

          <button
            onClick={() => setActiveTab('settings')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 20px',
              background: 'transparent', border: `1px solid ${colors.border}`,
              fontFamily: colors.sans, fontSize: 11, fontWeight: 500,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: colors.text, cursor: 'pointer', transition: 'all 0.2s',
              width: isMobile ? '100%' : 'auto', justifyContent: 'center',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = colors.dark; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = colors.dark; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = colors.text; e.currentTarget.style.borderColor = colors.border; }}
          >
            <Edit3 size={12} /> {t('dashboard.editProfile') || 'Modifier le profil'}
          </button>
        </motion.div>

        {/* ── Card Résumé Financier (données de Mes Factures) ── */}
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
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 28,
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontFamily: colors.sans, fontSize: 10, fontWeight: 500,
              letterSpacing: '0.22em', textTransform: 'uppercase', color: colors.text3,
            }}>
              <span style={{ width: 20, height: 1, background: colors.text3, display: 'inline-block' }} />
              Résumé Financier
            </div>
            {/* Nb total de docs — badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: colors.bg, border: `1px solid ${colors.border}`,
              padding: '3px 10px',
              fontFamily: colors.sans, fontSize: 9, fontWeight: 600,
              letterSpacing: '0.1em', textTransform: 'uppercase', color: colors.text3,
            }}>
              <FileText size={9} /> {financialStats.totalDocs} documents
            </div>
          </div>

          {/* Total payé — mis en avant */}
          <div style={{
            background: isDark ? '#0f1f17' : '#f0f7f3',
            border: `1px solid ${isDark ? '#1e3d2a' : '#c3ddd0'}`,
            padding: '16px 20px',
            marginBottom: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{
              fontFamily: colors.sans, fontSize: 11, fontWeight: 500,
              letterSpacing: '0.1em', textTransform: 'uppercase', color: colors.text3,
            }}>
              Total payé
            </span>
            <span style={{
              fontFamily: colors.serif, fontStyle: 'italic', fontWeight: 700,
              fontSize: isMobile ? 18 : 22, color: colors.gold,
            }}>
              {formatDA(financialStats.totalPaid)}
            </span>
          </div>

          {/* Lignes détail */}
          <div>
            <FinanceRow
              icon={<CheckCircle size={13} />}
              label="Factures payées"
              value={financialStats.paid}
              valueColor="#4caf82"
              colors={colors}
            />
            <FinanceRow
              icon={<Clock size={13} />}
              label="En attente"
              value={financialStats.pending}
              valueColor={colors.gold}
              colors={colors}
            />
            <FinanceRow
              icon={<AlertCircle size={13} />}
              label="Échouées"
              value={financialStats.failed}
              valueColor={financialStats.failed > 0 ? '#e05a5a' : colors.text3}
              colors={colors}
            />
          </div>

          {/* Lien vers Mes Factures */}
          <button
            onClick={() => setActiveTab('invoices')}
            style={{
              marginTop: 24,
              fontFamily: colors.sans, fontSize: 11, fontWeight: 500,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: colors.accent, background: 'none', border: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              padding: 0, width: isMobile ? '100%' : 'auto',
              justifyContent: isMobile ? 'center' : 'flex-start',
            }}
            onMouseEnter={e => e.currentTarget.style.color = colors.dark}
            onMouseLeave={e => e.currentTarget.style.color = colors.accent}
          >
            Voir toutes mes factures <ChevronRight size={12} />
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
          {t('dashboard.quickActions') || 'Actions rapides'}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: isMobile ? 8 : 10,
        }}>
          <ActionBtn icon={<Heart size={16} />}   label={t('dashboard.viewFavorites') || 'Mes favoris'}      onClick={() => setActiveTab('favorites')}       colors={colors} isDark={isDark} />
          <ActionBtn icon={<Receipt size={16} />} label="Mes Factures"                      onClick={() => setActiveTab('invoices')}        colors={colors} isDark={isDark} />
          <ActionBtn icon={<Cpu size={16} />}     label={t('dashboard.myRecommendations') || 'Recommandations'}  onClick={() => setActiveTab('recommendations')} accent colors={colors} isDark={isDark} />
        </div>
      </motion.div>

    </div>
  );
};

export default DashboardContent;
