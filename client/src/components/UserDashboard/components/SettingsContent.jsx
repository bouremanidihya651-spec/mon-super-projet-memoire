import React, { useState } from 'react';
import {
  User, Star, Shield, Globe, ChevronDown, Settings, Camera,
  Crown, Mountain, Plane, Landmark, Waves, Utensils,
  Check, AlertCircle, Loader2, Lock, Mail, Save,
  Backpack, Heart, Users, Briefcase, ChevronLeft,
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../contexts/ThemeContext';

const API_BASE = import.meta.env.VITE_API_URL;

const LEVELS = [
  { label: 'Peu',      value: 0,   color: '#9db8aa' },
  { label: 'Moyen',    value: 0.5, color: '#c9a844' },
  { label: 'Beaucoup', value: 1,   color: '#2d7a5a' },
];

const PREFERENCES = [
  { key: 'luxury_score',    label: 'Luxe',        Icon: Crown    },
  { key: 'nature_score',    label: 'Nature',       Icon: Mountain },
  { key: 'adventure_score', label: 'Aventure',     Icon: Plane    },
  { key: 'culture_score',   label: 'Culture',      Icon: Landmark },
  { key: 'beach_score',     label: 'Plage',        Icon: Waves    },
  { key: 'food_score',      label: 'Gastronomie',  Icon: Utensils },
];

// Carte cliquable — clic sur la carte entiere cycle Peu > Moyen > Beaucoup > Peu
const PrefCard = ({ pref, value, onChange, isDark }) => {
  const { key, label, Icon } = pref;
  const activeIndex = LEVELS.findIndex(l => l.value === value);
  const safeIndex = activeIndex === -1 ? 1 : activeIndex;
  const activeColor = LEVELS[safeIndex].color;

  const handleClick = () => {
    const next = (safeIndex + 1) % LEVELS.length;
    onChange(key, LEVELS[next].value);
  };

  return (
    <div
      onClick={handleClick}
      style={{
        background: isDark ? '#1a2320' : '#fff',
        border: '1.5px solid ' + activeColor,
        borderRadius: 14,
        padding: '14px 10px 10px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        transition: 'all 0.2s',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: isDark ? 'rgba(255,255,255,0.06)' : '#f7f5f0',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s',
      }}>
        <Icon size={18} style={{ color: activeColor, transition: 'color 0.2s' }} />
      </div>

      <span style={{
        fontSize: 11, fontWeight: 500,
        color: isDark ? '#e8ece9' : '#1a4a36',
        fontFamily: "'DM Sans', sans-serif",
        letterSpacing: '0.02em',
      }}>
        {label}
      </span>

      <div style={{ display: 'flex', gap: 4, width: '100%' }}>
        {LEVELS.map((_, idx) => (
          <div key={idx} style={{
            flex: 1, height: 5, borderRadius: 3,
            background: idx <= safeIndex ? activeColor : (isDark ? '#2d3a36' : '#e0dcd4'),
            transition: 'background 0.2s',
          }} />
        ))}
      </div>

      <span style={{
        fontSize: 10, fontWeight: 600,
        color: activeColor,
        fontFamily: "'DM Sans', sans-serif",
        letterSpacing: '0.06em',
        minHeight: 14,
      }}>
        {LEVELS[safeIndex].label.toUpperCase()} — {Math.round(value * 100)}
      </span>
    </div>
  );
};

/* ── Palette cohérente ── */
const getColors = (isDark) => ({
  bg:      isDark ? '#0f1412' : '#f7f5f0',
  white:   isDark ? '#1a2320' : '#ffffff',
  border:  isDark ? '#2d3a36' : '#e0dcd4',
  text:    isDark ? '#e8ece9' : '#1a4a36',
  text2:   isDark ? '#b5e4ca' : '#2d7a5a',
  text3:   isDark ? '#9db8aa' : '#6b8f7b',
  accent:  '#2d7a5a',
  dark:    isDark ? '#0f1f17' : '#1a4a36',
  gold:    '#c9a844',
  serif:   "'Playfair Display', Georgia, serif",
  sans:    "'DM Sans', sans-serif",
});

/* ─── shared input style ─── */
const inputSt = (colors, focus = false, error = false) => ({
  width: '100%', boxSizing: 'border-box',
  background: colors.white,
  border: `1px solid ${error ? '#e8874a' : focus ? colors.accent : colors.border}`,
  borderRadius: 12, padding: '12px 16px',
  fontSize: 14, color: colors.text, outline: 'none',
  fontFamily: colors.sans, transition: 'border-color 0.2s',
});

/* ─── Section card ─── */
const Card = ({ icon: Icon, title, accent = false, children, colors, isDark }) => (
  <div style={{
    background: colors.white, border: `1px solid ${colors.border}`,
    borderRadius: 20, overflow: 'hidden',
    boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
  }}>
    {/* Card header */}
    <div style={{
      padding: '20px 28px',
      borderBottom: `1px solid ${colors.border}`,
      display: 'flex', alignItems: 'center', gap: 10,
      background: accent ? (isDark ? 'rgba(45,122,90,0.15)' : 'rgba(45,122,90,0.08)') : colors.bg,
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: 10,
        background: accent ? 'rgba(45,122,90,0.15)' : 'rgba(201,168,68,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={16} style={{ color: accent ? colors.accent : colors.gold }} />
      </div>
      <span style={{
        fontFamily: colors.sans, fontSize: 11, fontWeight: 600,
        letterSpacing: '0.14em', textTransform: 'uppercase', color: colors.text,
      }}>
        {title}
      </span>
    </div>
    <div style={{ padding: '28px' }}>{children}</div>
  </div>
);

/* ─── Labeled input ─── */
const Field = ({ label, name, type = 'text', value, onChange, placeholder, icon: Icon, colors }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{
        display: 'block', fontSize: 11, fontWeight: 600,
        letterSpacing: '0.1em', textTransform: 'uppercase',
        color: colors.text3, marginBottom: 8,
      }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        {Icon && <Icon size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: focused ? colors.accent : colors.text3 }} />}
        <input
          type={type} name={name} value={value}
          onChange={onChange} placeholder={placeholder}
          style={{ ...inputSt(colors, focused), paddingLeft: Icon ? 42 : 16 }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </div>
    </div>
  );
};

/* ─── Alert banner ─── */
const Alert = ({ type, text, colors }) => {
  if (!text) return null;
  const ok = type === 'success';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '12px 16px', borderRadius: 12, marginTop: 16,
      background: ok ? 'rgba(22,163,74,0.15)' : 'rgba(232,135,74,0.15)',
      border: `1px solid ${ok ? '#16a34a' : '#e8874a'}`,
    }}>
      {ok
        ? <Check size={15} style={{ color: '#16a34a', flexShrink: 0 }} />
        : <AlertCircle size={15} style={{ color: '#e8874a', flexShrink: 0 }} />
      }
      <p style={{ fontSize: 13, color: ok ? '#16a34a' : '#e8874a', margin: 0, fontFamily: colors.sans }}>
        {text}
      </p>
    </div>
  );
};

/* ─── Save button ─── */
const SaveBtn = ({ loading, label, icon: Icon = Save, onClick, type = 'button', colors }) => (
  <button
    type={type} onClick={onClick} disabled={loading}
    style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      background: colors.accent, color: '#fff',
      border: 'none', borderRadius: 12,
      padding: '12px 24px', cursor: loading ? 'not-allowed' : 'pointer',
      fontSize: 12, fontWeight: 600, letterSpacing: '0.08em',
      textTransform: 'uppercase', opacity: loading ? 0.65 : 1,
      transition: 'all 0.2s',
      fontFamily: colors.sans,
    }}
    onMouseEnter={e => { if (!loading) e.currentTarget.style.background = colors.dark; }}
    onMouseLeave={e => { e.currentTarget.style.background = colors.accent; }}
  >
    {loading
      ? <><Loader2 size={14} className="animate-spin" /> Enregistrement...</>
      : <><Icon size={14} /> {label}</>
    }
  </button>
);

/* ══════════════════════════════════════
   MAIN SETTINGS COMPONENT
══════════════════════════════════════ */
const SettingsContent = () => {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const { t, i18n } = useTranslation();
  const { user, updateAuth } = useAuth();

  const [isLangOpen, setIsLangOpen]       = useState(false);
  const [isSaving, setIsSaving]           = useState(false);
  const [isPwSaving, setIsPwSaving]       = useState(false);
  const [isPrefSaving, setIsPrefSaving]   = useState(false);
  const [message, setMessage]             = useState({ type: '', text: '' });
  const [pwMessage, setPwMessage]         = useState({ type: '', text: '' });
  const [prefMessage, setPrefMessage]     = useState({ type: '', text: '' });
  const [photoPreview, setPhotoPreview]   = useState(null);
  const [photoLoading, setPhotoLoading]   = useState(false);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName:  user?.lastName  || '',
    email:     user?.email     || '',
  });

  const [pwData, setPwData] = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
  });

  const [scores, setScores] = useState({
    luxury_score:    user?.luxury_score    ?? 0.5,
    nature_score:    user?.nature_score    ?? 0.5,
    adventure_score: user?.adventure_score ?? 0.5,
    culture_score:   user?.culture_score   ?? 0.5,
    beach_score:     user?.beach_score     ?? 0.5,
    food_score:      user?.food_score      ?? 0.5,
    travelerType:    user?.travelerType    || 'solo',
  });

  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English',  flag: '🇬🇧' },
    { code: 'ar', name: 'العربية',  flag: '🇩🇿' },
  ];

  const travelerTypes = [
    { value: 'solo',     label: 'Voyageur Solo',    icon: <Backpack  size={18} /> },
    { value: 'couple',   label: 'En Couple',         icon: <Heart     size={18} /> },
    { value: 'family',   label: 'En Famille',        icon: <Users     size={18} /> },
    { value: 'group',    label: 'Entre Amis',        icon: <Users     size={18} /> },
    { value: 'business', label: "Voyage d'Affaires", icon: <Briefcase size={18} /> },
  ];

  /* handlers */
  const handleFormChange  = e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
  const handlePwChange    = e => setPwData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handlePrefChange = (key, value) => {
    setScores(prev => ({ ...prev, [key]: value }));
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setMessage({ type: 'error', text: 'Photo max 5 Mo' }); return; }
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
    const token = localStorage.getItem('token');
    if (!token) return;
    const fd = new FormData();
    fd.append('avatar', file);
    setPhotoLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/api/users/upload-avatar`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Photo mise à jour' });
        updateAuth({ ...user, profilePhoto: data.user?.profilePhoto || data.profilePhoto });
      } else {
        setMessage({ type: 'error', text: data.message || 'Erreur upload' });
        setPhotoPreview(null);
      }
    } catch { setMessage({ type: 'error', text: 'Erreur serveur' }); setPhotoPreview(null); }
    finally { setPhotoLoading(false); }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setIsSaving(true); setMessage({ type: '', text: '' });
    const token = localStorage.getItem('token');
    if (!token) { setMessage({ type: 'error', text: 'Non connecté' }); setIsSaving(false); return; }
    try {
      const res  = await fetch(`${API_BASE}/api/users/profile`, { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ firstName: formData.firstName.trim(), lastName: formData.lastName.trim(), email: formData.email.trim() }) });
      const data = await res.json();
      if (res.ok) { 
        setMessage({ type: 'success', text: 'Profil enregistré' }); 
        updateAuth(data.user, data.token); 
      }
      else setMessage({ type: 'error', text: data.message || 'Erreur' });
    } catch { setMessage({ type: 'error', text: 'Erreur serveur' }); }
    finally { setIsSaving(false); }
  };

  const handlePrefSave = async () => {
    setIsPrefSaving(true); setPrefMessage({ type: '', text: '' });
    const token = localStorage.getItem('token');
    try {
      const res  = await fetch(`${API_BASE}/api/users/preferences`, { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(scores) });
      const data = await res.json();
      if (res.ok) { 
        setPrefMessage({ type: 'success', text: 'Préférences enregistrées' }); 
        updateAuth(data.user, data.token); 
      }
      else setPrefMessage({ type: 'error', text: data.message || 'Erreur' });
    } catch { setPrefMessage({ type: 'error', text: 'Erreur serveur' }); }
    finally { setIsPrefSaving(false); }
  };

  const handlePwSave = async () => {
    setIsPwSaving(true); setPwMessage({ type: '', text: '' });
    if (!pwData.currentPassword || !pwData.newPassword) { setPwMessage({ type: 'error', text: 'Champs requis' }); setIsPwSaving(false); return; }
    if (pwData.newPassword.length < 6) { setPwMessage({ type: 'error', text: 'Min 6 caractères' }); setIsPwSaving(false); return; }
    if (pwData.newPassword !== pwData.confirmPassword) { setPwMessage({ type: 'error', text: 'Mots de passe différents' }); setIsPwSaving(false); return; }
    const token = localStorage.getItem('token');
    try {
      const res  = await fetch(`${API_BASE}/api/users/change-password`, { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword: pwData.currentPassword, newPassword: pwData.newPassword }) });
      const data = await res.json();
      if (res.ok) { setPwMessage({ type: 'success', text: 'Mot de passe modifié' }); setPwData({ currentPassword: '', newPassword: '', confirmPassword: '' }); }
      else setPwMessage({ type: 'error', text: data.message || 'Mot de passe actuel incorrect' });
    } catch { setPwMessage({ type: 'error', text: 'Erreur serveur' }); }
    finally { setIsPwSaving(false); }
  };

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', fontFamily: colors.sans }}>

      {/* Page title */}
      <div style={{ marginBottom: 36 }}>
        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: colors.text3, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 20, height: 1, background: colors.text3, display: 'inline-block' }} />
          Compte
        </p>
        <h1 style={{ fontFamily: colors.serif, fontSize: 32, fontWeight: 700, fontStyle: 'italic', color: colors.text, marginBottom: 6 }}>
          {t('settings.title')}
        </h1>
        <p style={{ fontSize: 14, color: colors.text3, fontWeight: 300 }}>{t('settings.description')}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ══ PROFIL ══ */}
        <Card icon={User} title="Informations personnelles" accent colors={colors} isDark={isDark}>
          <form onSubmit={handleProfileSave}>

            {/* Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: 88, height: 88, borderRadius: '50%',
                  background: colors.bg, border: `2px solid ${colors.border}`,
                  overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {photoPreview || user?.profilePhoto ? (
                    <img
                      src={photoPreview || `${API_BASE}${user.profilePhoto}`}
                      alt="Profile"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <User size={36} style={{ color: colors.text3 }} />
                  )}
                </div>
                <label htmlFor="profilePhoto" style={{
                  position: 'absolute', bottom: 0, right: 0,
                  width: 28, height: 28, borderRadius: '50%',
                  background: colors.accent, border: `2px solid ${colors.white}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = colors.dark}
                onMouseLeave={e => e.currentTarget.style.background = colors.accent}
                >
                  {photoLoading
                    ? <Loader2 size={13} className="animate-spin" style={{ color: '#fff' }} />
                    : <Camera size={13} style={{ color: '#fff' }} />
                  }
                </label>
                <input type="file" id="profilePhoto" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: colors.text, marginBottom: 3 }}>
                  {formData.firstName} {formData.lastName}
                </div>
                <div style={{ fontSize: 13, color: colors.text3, marginBottom: 8 }}>{formData.email}</div>
                <div style={{ fontSize: 11, color: colors.text3, fontWeight: 300 }}>
                  Cliquez sur l'icône pour changer la photo · Max 5 Mo
                </div>
              </div>
            </div>

            {/* Fields grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <Field label="Prénom" name="firstName" value={formData.firstName} onChange={handleFormChange} placeholder="Jean" colors={colors} />
              <Field label="Nom" name="lastName" value={formData.lastName} onChange={handleFormChange} placeholder="Dupont" colors={colors} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <Field label="Adresse email" name="email" type="email" value={formData.email} onChange={handleFormChange} placeholder="jean@exemple.com" icon={Mail} colors={colors} />
            </div>

            {/* Langue */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: colors.text3, marginBottom: 8 }}>
                Langue
              </label>
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  style={{
                    width: '100%', background: colors.white,
                    border: `1px solid ${isLangOpen ? colors.accent : colors.border}`,
                    borderRadius: 12, padding: '12px 16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    cursor: 'pointer', fontSize: 14, color: colors.text,
                    fontFamily: colors.sans, transition: 'border-color 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Globe size={15} style={{ color: colors.text3 }} />
                    <span>{languages.find(l => l.code === i18n.language)?.flag}</span>
                    <span>{languages.find(l => l.code === i18n.language)?.name || 'Français'}</span>
                  </div>
                  <ChevronDown size={15} style={{ color: colors.text3, transform: isLangOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
                {isLangOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 50,
                    background: colors.white, border: `1px solid ${colors.border}`,
                    borderRadius: 12, overflow: 'hidden',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                  }}>
                    {languages.map(lang => (
                      <button
                        key={lang.code} type="button"
                        onClick={() => { i18n.changeLanguage(lang.code); setIsLangOpen(false); }}
                        style={{
                          width: '100%', padding: '11px 16px',
                          display: 'flex', alignItems: 'center', gap: 10,
                          background: i18n.language === lang.code ? (isDark ? 'rgba(45,122,90,0.15)' : 'rgba(45,122,90,0.05)') : colors.white,
                          border: 'none', cursor: 'pointer', fontSize: 14,
                          color: i18n.language === lang.code ? colors.accent : colors.text,
                          fontFamily: colors.sans, fontWeight: i18n.language === lang.code ? 600 : 400,
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(45,122,90,0.1)' : 'rgba(45,122,90,0.03)'}
                        onMouseLeave={e => e.currentTarget.style.background = i18n.language === lang.code ? (isDark ? 'rgba(45,122,90,0.15)' : 'rgba(45,122,90,0.05)') : colors.white}
                      >
                        <span>{lang.flag}</span> {lang.name}
                        {i18n.language === lang.code && <Check size={13} style={{ marginLeft: 'auto', color: colors.accent }} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Alert type={message.type} text={message.text} colors={colors} />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <SaveBtn loading={isSaving} label="Enregistrer le profil" type="submit" colors={colors} />
            </div>
          </form>
        </Card>

        {/* ══ PRÉFÉRENCES ══ */}
        <Card icon={Star} title="Préférences de voyage" colors={colors} isDark={isDark}>

          {/* Type voyageur */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: colors.text3, marginBottom: 12 }}>
              Type de voyageur
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {travelerTypes.map(type => {
                const active = scores.travelerType === type.value;
                return (
                  <button key={type.value} type="button" onClick={() => setScores(p => ({ ...p, travelerType: type.value }))} style={{ padding: '10px 8px', borderRadius: 12, border: `1.5px solid ${active ? '#c9a844' : (isDark ? '#2d3a36' : '#e0dcd4')}`, background: active ? (isDark ? 'rgba(201,168,68,0.15)' : 'rgba(201,168,68,0.08)') : (isDark ? '#1a2320' : '#fff'), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, cursor: 'pointer', transition: 'all 0.2s', color: active ? (isDark ? '#e8ece9' : '#1a4a36') : (isDark ? '#9db8aa' : '#6b8f7b') }}>
                    <span style={{ color: active ? '#c9a844' : '#9db8aa' }}>{type.icon}</span>
                    <span style={{ fontSize: 10, fontWeight: 500, textAlign: 'center', letterSpacing: '0.03em' }}>{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Préférences — Cartes */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: colors.text3 }}>
                Préférences de voyage
              </label>
              <div style={{ display: 'flex', gap: 10, fontSize: 10, color: isDark ? '#6b8f7b' : '#9db8aa' }}>
                {LEVELS.map((l, i) => (
                  <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: l.color, display: 'inline-block' }} />
                    {l.label}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {PREFERENCES.map(pref => (
                <PrefCard
                  key={pref.key}
                  pref={pref}
                  value={scores[pref.key]}
                  onChange={handlePrefChange}
                  isDark={isDark}
                />
              ))}
            </div>
          </div>

          <Alert type={prefMessage.type} text={prefMessage.text} colors={colors} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
            <SaveBtn loading={isPrefSaving} label="Enregistrer les préférences" onClick={handlePrefSave} colors={colors} />
          </div>
        </Card>

        {/* ══ SÉCURITÉ ══ */}
        <Card icon={Shield} title="Sécurité & mot de passe" colors={colors} isDark={isDark}>
          <div style={{ marginBottom: 16 }}>
            <Field
              label="Mot de passe actuel" name="currentPassword" type="password"
              value={pwData.currentPassword} onChange={handlePwChange}
              placeholder="••••••••" icon={Lock} colors={colors}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 8 }}>
            <Field
              label="Nouveau mot de passe" name="newPassword" type="password"
              value={pwData.newPassword} onChange={handlePwChange}
              placeholder="Min. 6 caractères" icon={Lock} colors={colors}
            />
            <Field
              label="Confirmer le mot de passe" name="confirmPassword" type="password"
              value={pwData.confirmPassword} onChange={handlePwChange}
              placeholder="Répétez le mot de passe" icon={Lock} colors={colors}
            />
          </div>

          <Alert type={pwMessage.type} text={pwMessage.text} colors={colors} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
            <SaveBtn loading={isPwSaving} label="Modifier le mot de passe" icon={Shield} onClick={handlePwSave} colors={colors} />
          </div>
        </Card>

      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input[type=range] { -webkit-appearance: none; appearance: none; background: transparent; }
        input[type=number]::-webkit-inner-spin-button { opacity: 0.4; }
        input::placeholder { color: #9db8aa; }
      `}</style>
    </div>
  );
};

export default SettingsContent;
