import React, { useState, useEffect } from 'react';
import {
  Download, FileText, Calendar, CreditCard, Euro,
  CheckCircle, Clock, XCircle, Receipt, TrendingUp,
} from 'lucide-react';
import { generateAndDownloadInvoice } from '../../../utils/generateFacture';
import { generateAndDownloadBonReservation } from '../../../utils/generateBonReservation';
import axios from 'axios';
import { useTheme } from '../../../contexts/ThemeContext';

/* ── Palette cohérente ── */
const getColors = (isDark) => ({
  bg:     isDark ? '#0f1412' : '#f7f5f0',
  white:  isDark ? '#1a2320' : '#ffffff',
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

/* ── reusable pill badge ── */
const Pill = ({ label, bg, color, colors }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center',
    padding: '3px 10px', borderRadius: 999,
    background: bg, color, fontSize: 11, fontWeight: 600,
    fontFamily: colors.sans, letterSpacing: '0.04em', whiteSpace: 'nowrap',
  }}>
    {label}
  </span>
);

/* ── stat card ── */
const StatCard = ({ icon: Icon, label, value, accent = false, colors }) => (
  <div style={{
    background: colors.white, border: `1px solid ${colors.border}`,
    borderRadius: 16, padding: '20px 24px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
    display: 'flex', alignItems: 'center', gap: 16,
  }}>
    <div style={{
      width: 44, height: 44, borderRadius: 12, flexShrink: 0,
      background: accent ? `${colors.gold}18` : `${colors.accent}10`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Icon size={20} style={{ color: accent ? colors.gold : colors.accent }} />
    </div>
    <div>
      <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: colors.text3, marginBottom: 4, fontFamily: colors.sans }}>
        {label}
      </div>
      <div style={{ fontFamily: colors.serif, fontSize: 26, fontWeight: 600, fontStyle: 'italic', color: accent ? colors.gold : colors.text, lineHeight: 1 }}>
        {value}
      </div>
    </div>
  </div>
);

/* ── filter button ── */
const FilterBtn = ({ label, active, count, onClick, colors }) => (
  <button
    onClick={onClick}
    style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      padding: '8px 18px', borderRadius: 999, cursor: 'pointer',
      border: `1.5px solid ${active ? colors.accent : colors.border}`,
      background: active ? colors.accent : colors.white,
      color: active ? '#fff' : colors.text3,
      fontSize: 12, fontWeight: 500, letterSpacing: '0.06em',
      fontFamily: colors.sans, transition: 'all 0.2s',
    }}
    onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = colors.accent; e.currentTarget.style.color = colors.accent; }}}
    onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.color = colors.text3; }}}
  >
    {label}
    {count !== undefined && (
      <span style={{
        minWidth: 20, height: 20, borderRadius: 999, padding: '0 5px',
        background: active ? 'rgba(255,255,255,0.25)' : colors.bg,
        color: active ? '#fff' : colors.text2,
        fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {count}
      </span>
    )}
  </button>
);

/* ── invoice row card ── */
const InvoiceCard = ({ invoice, onDownload, colors, isDark }) => {
  const [hov, setHov] = useState(false);
  
  const statusConfig = {
    paid:    { icon: CheckCircle, label: 'Payé',       bg: isDark ? 'rgba(22,163,74,0.15)' : '#f0fdf4', color: '#16a34a', border: isDark ? 'rgba(22,163,74,0.3)' : '#bbf7d0' },
    pending: { icon: Clock,       label: 'En attente', bg: isDark ? 'rgba(201,168,68,0.15)' : '#fffbeb', color: '#c9a844', border: isDark ? 'rgba(201,168,68,0.3)' : '#fde68a' },
    failed:  { icon: XCircle,     label: 'Échoué',     bg: isDark ? 'rgba(225,29,72,0.15)' : '#fff1f2', color: '#e11d48', border: isDark ? 'rgba(225,29,72,0.3)' : '#fecdd3' },
  };

  const paymentConfig = {
    chargily:   { label: 'Edahabia / CIB', bg: isDark ? 'rgba(59,130,246,0.15)' : '#eff6ff', color: '#3b82f6' },
    stripe:     { label: 'Stripe',          bg: isDark ? 'rgba(139,92,246,0.15)' : '#f5f3ff', color: '#8b5cf6' },
    on_arrival: { label: 'À l\'arrivée',    bg: isDark ? 'rgba(201,168,68,0.15)' : '#fff7ed', color: '#c9a844' },
  };

  const st  = statusConfig[invoice.payment_status]  || { label: 'Inconnu', bg: colors.bg, color: colors.text3, border: colors.border };
  const pay = paymentConfig[invoice.payment_method] || { label: invoice.payment_method, bg: colors.bg, color: colors.text3 };
  const isArrival  = invoice.payment_method === 'on_arrival';
  const docLabel   = isArrival ? 'Bon de réservation' : 'Facture';
  const StatusIcon = st.icon || FileText;

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: colors.white, border: `1px solid ${hov ? colors.accent : colors.border}`,
        borderRadius: 18, padding: '22px 24px',
        boxShadow: hov ? '0 8px 28px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.03)',
        transform: hov ? 'translateY(-2px)' : 'none',
        transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Invoice number */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: isArrival ? (isDark ? 'rgba(201,168,68,0.15)' : '#fff7ed') : (isDark ? 'rgba(22,163,74,0.15)' : '#f0fdf4'),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Receipt size={16} style={{ color: isArrival ? colors.gold : colors.accent }} />
            </div>
            <div>
              <div style={{ fontFamily: colors.serif, fontSize: 15, fontWeight: 600, fontStyle: 'italic', color: colors.text, lineHeight: 1 }}>
                {invoice.invoice_number}
              </div>
              <div style={{ fontFamily: colors.sans, fontSize: 10, color: colors.text3, marginTop: 2 }}>{docLabel}</div>
            </div>
          </div>

          {/* Status badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '4px 12px', borderRadius: 999,
            background: st.bg, border: `1px solid ${st.border}`,
            fontSize: 12, fontWeight: 600, color: st.color, fontFamily: colors.sans,
          }}>
            <StatusIcon size={12} />
            {st.label}
          </div>

          {/* Payment method */}
          <Pill label={pay.label} bg={pay.bg} color={pay.color} colors={colors} />
        </div>

        {/* Amount */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: colors.serif, fontSize: 22, fontWeight: 600, fontStyle: 'italic', color: colors.accent, lineHeight: 1 }}>
            {parseFloat(invoice.amount).toFixed(2)} DA
          </div>
          <div style={{ fontFamily: colors.sans, fontSize: 11, color: colors.text3, marginTop: 3 }}>
            {invoice.currency?.toUpperCase() || 'DZD'}
          </div>
        </div>
      </div>

      {/* Meta grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: 12, padding: '14px 0', borderTop: `1px solid ${colors.border}`, borderBottom: `1px solid ${colors.border}`,
        marginBottom: 16,
      }}>
        {[
          { icon: Calendar, label: 'Date', value: new Date(invoice.invoice_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) },
          { icon: CreditCard, label: 'Référence', value: invoice.reservation_id ? `#${invoice.reservation_id}` : '—' },
          { icon: FileText, label: 'Client', value: invoice.customer_name || '—' },
        ].map((m, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <m.icon size={14} style={{ color: colors.text3, flexShrink: 0 }} />
            <div>
              <div style={{ fontFamily: colors.sans, fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: colors.text3, marginBottom: 2 }}>
                {m.label}
              </div>
              <div style={{ fontFamily: colors.sans, fontSize: 13, color: colors.text, fontWeight: 400 }}>
                {m.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reservation detail */}
      {invoice.reservation && (
        <div style={{
          background: colors.bg, borderRadius: 10, padding: '10px 14px',
          marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: colors.accent, flexShrink: 0 }} />
          <span style={{ fontFamily: colors.sans, fontSize: 13, color: colors.text2, fontWeight: 300 }}>
            {invoice.reservation.transport?.name || 'Transport'}
            {' '}
            <span style={{ color: colors.text3 }}>→</span>
            {' '}
            {invoice.invoice_details?.destination || 'Destination'}
          </span>
        </div>
      )}

      {/* Download button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={() => onDownload(invoice)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: colors.accent, color: '#fff',
            border: 'none', borderRadius: 10,
            padding: '10px 20px', cursor: 'pointer',
            fontFamily: colors.sans, fontSize: 12, fontWeight: 600,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            transition: 'background 0.2s, transform 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = colors.dark; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = colors.accent; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <Download size={14} />
          Télécharger {invoice.payment_method === 'on_arrival' ? 'le bon' : 'la facture'}
        </button>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════ */
const MesFactures = () => {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [filter, setFilter]     = useState('all');

  useEffect(() => { fetchInvoices(); }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res   = await axios.get('http://localhost:3000/api/invoices', { headers: { Authorization: `Bearer ${token}` } });
      setInvoices(res.data.invoices || []);
    } catch { setError('Erreur lors du chargement des factures'); }
    finally { setLoading(false); }
  };

  const handleDownload = (invoice) => {
    try {
      const isArrival = invoice.payment_method === 'on_arrival';
      const invoiceData = {
        invoice_number: invoice.invoice_number, reservation_id: invoice.reservation_id,
        amount: invoice.amount, currency: invoice.currency, payment_method: invoice.payment_method,
        payment_status: invoice.payment_status, customer_name: invoice.customer_name,
        customer_email: invoice.customer_email, customer_phone: invoice.customer_phone,
        invoice_details: invoice.invoice_details, invoice_date: invoice.invoice_date,
      };
      isArrival
        ? generateAndDownloadBonReservation(invoice.reservation, invoiceData)
        : generateAndDownloadInvoice(invoice.reservation, invoiceData);
    } catch { alert('Erreur lors du téléchargement'); }
  };

  const counts = {
    all:     invoices.length,
    paid:    invoices.filter(i => i.payment_status === 'paid').length,
    pending: invoices.filter(i => i.payment_status === 'pending').length,
    failed:  invoices.filter(i => i.payment_status === 'failed').length,
  };

  const filtered     = filter === 'all' ? invoices : invoices.filter(i => i.payment_status === filter);
  const totalPaid    = invoices.filter(i => i.payment_status === 'paid').reduce((s, i) => s + parseFloat(i.amount || 0), 0);

  /* ── loading ── */
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          border: `3px solid ${colors.border}`, borderTopColor: colors.accent,
          animation: 'spin 0.8s linear infinite', margin: '0 auto 14px',
        }} />
        <p style={{ fontFamily: colors.sans, fontSize: 14, color: colors.text3, fontWeight: 300 }}>Chargement des factures...</p>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: colors.sans, maxWidth: 860, margin: '0 auto' }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 32 }}>
        <p style={{
          fontSize: 10, fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase',
          color: colors.text3, marginBottom: 8,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ width: 20, height: 1, background: colors.text3, display: 'inline-block' }} />
          Documents
        </p>
        <h1 style={{ fontFamily: colors.serif, fontSize: 32, fontWeight: 700, fontStyle: 'italic', color: colors.text, marginBottom: 6 }}>
          Mes Factures & Réservations
        </h1>
        <p style={{ fontSize: 14, color: colors.text3, fontWeight: 300 }}>
          Consultez et téléchargez vos factures et bons de réservation
        </p>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 28 }}>
        <StatCard icon={FileText}    label="Total documents"  value={invoices.length} colors={colors} />
        <StatCard icon={TrendingUp}  label="Total payé"       value={`${totalPaid.toFixed(2)} DA`} accent colors={colors} />
        <StatCard icon={CheckCircle} label="Factures payées"  value={counts.paid} colors={colors} />
      </div>

      {/* ── Filters ── */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {[
          { key: 'all',     label: 'Tous' },
          { key: 'paid',    label: 'Payées' },
          { key: 'pending', label: 'En attente' },
          { key: 'failed',  label: 'Échouées' },
        ].map(f => (
          <FilterBtn
            key={f.key} label={f.label} count={counts[f.key]}
            active={filter === f.key}
            onClick={() => setFilter(f.key)}
            colors={colors}
          />
        ))}
      </div>

      {/* ── List ── */}
      {filtered.length === 0 ? (
        <div style={{
          background: colors.white, border: `2px dashed ${colors.border}`,
          borderRadius: 18, padding: '64px 24px', textAlign: 'center',
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <FileText size={24} style={{ color: colors.text3 }} />
          </div>
          <p style={{ fontFamily: colors.serif, fontStyle: 'italic', fontSize: 18, color: colors.text, marginBottom: 6 }}>
            Aucun document trouvé
          </p>
          <p style={{ fontSize: 13, color: colors.text3, fontWeight: 300 }}>
            {filter !== 'all' ? 'Essayez un autre filtre' : 'Vos factures apparaîtront ici après vos réservations'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map(invoice => (
            <InvoiceCard key={invoice.id} invoice={invoice} onDownload={handleDownload} colors={colors} isDark={isDark} />
          ))}
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div style={{
          marginTop: 16, background: isDark ? 'rgba(225,29,72,0.15)' : '#fff1f2',
          border: `1px solid ${isDark ? 'rgba(225,29,72,0.3)' : '#fecdd3'}`, borderRadius: 12,
          padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <XCircle size={15} style={{ color: '#e11d48', flexShrink: 0 }} />
          <p style={{ fontSize: 13, color: '#e11d48', margin: 0 }}>{error}</p>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default MesFactures;