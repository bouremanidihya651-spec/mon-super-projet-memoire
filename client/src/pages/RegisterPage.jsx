import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useGoogleLogin } from '@react-oauth/google';
import {
  Mail, Lock, User, ArrowRight, Loader2,
  Plane, Mountain, Waves, Utensils, Crown, Landmark,
  Backpack, Heart, Users, Briefcase, ChevronLeft,
} from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useTranslation } from 'react-i18next';

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

const RegisterPage = () => {
  const { isDark } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signup, googleAuth } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '', password: '', confirmPassword: '',
    firstName: '', lastName: '', age: '', gender: '', travelerType: '',
    minBudget: '', maxBudget: '',
    luxury_score:    0.5,
    nature_score:    0.5,
    adventure_score: 0.5,
    culture_score:   0.5,
    beach_score:     0.5,
    food_score:      0.5,
    preferredTags: [],
  });
  const [errors, setErrors]           = useState({});
  const [isLoading, setIsLoading]     = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleGoogleSuccess = async (tokenResponse) => {
    setIsLoading(true);
    try {
      const accessToken = tokenResponse.access_token;
      if (!accessToken) throw new Error('Access token non reçu de Google');
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const userInfo = await userInfoResponse.json();
      const result = await googleAuth({
        email: userInfo.email || '', firstName: userInfo.given_name || '', lastName: userInfo.family_name || '',
        travelerType: 'solo', minBudget: 0, maxBudget: 10000,
        luxury_score: 0.5, nature_score: 0.5, adventure_score: 0.5,
        culture_score: 0.5, beach_score: 0.5, food_score: 0.5, preferredTags: [],
      });
      if (result?.success) navigate('/dashboard');
      else setSubmitError(result?.message || 'Erreur lors de la connexion Google');
    } catch (error) {
      setSubmitError(error.message || 'Erreur lors de la connexion Google');
    } finally { setIsLoading(false); }
  };

  const googleLoginHook = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => setSubmitError('Échec de la connexion Google'),
    flow: 'implicit',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (submitError) setSubmitError('');
  };

  // ─── Changement niveau carte préférence ───
  const handlePrefChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const validateStep1 = () => {
    const e = {};
    if (!formData.email) e.email = 'Email requis';
    else if (!formData.email.toLowerCase().endsWith('@gmail.com')) e.email = "L'email doit être une adresse Gmail (ex: nom@gmail.com)";
    if (!formData.password) e.password = 'Mot de passe requis';
    else if (formData.password.length < 6) e.password = 'Au moins 6 caractères';
    if (formData.password !== formData.confirmPassword) e.confirmPassword = 'Les mots de passe ne correspondent pas';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    if (!formData.firstName)   e.firstName   = 'Prénom requis';
    if (!formData.lastName)    e.lastName    = 'Nom requis';
    if (!formData.travelerType) e.travelerType = 'Type de voyageur requis';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;
    setIsLoading(true);
    setSubmitError('');
    try {
      const result = await signup(formData.email, formData.password, {
        username: formData.email, email: formData.email, password: formData.password,
        firstName: formData.firstName, lastName: formData.lastName,
        age: formData.age ? parseInt(formData.age) : undefined,
        gender: formData.gender || undefined, travelerType: formData.travelerType,
        minBudget: formData.minBudget ? parseFloat(formData.minBudget) : 0,
        maxBudget: formData.maxBudget ? parseFloat(formData.maxBudget) : 10000,
        luxury_score:    formData.luxury_score,
        nature_score:    formData.nature_score,
        adventure_score: formData.adventure_score,
        culture_score:   formData.culture_score,
        beach_score:     formData.beach_score,
        food_score:      formData.food_score,
        preferredTags: [],
      });
      if (result?.success) navigate('/dashboard');
      else setSubmitError(result?.message || "Une erreur est survenue lors de l'inscription");
    } catch (error) {
      setSubmitError(error.message || "Une erreur est survenue lors de l'inscription");
    } finally { setIsLoading(false); }
  };

  const travelerTypes = [
    { value: 'solo',     label: 'Voyageur Solo',    icon: <Backpack  size={18} /> },
    { value: 'couple',   label: 'En Couple',         icon: <Heart     size={18} /> },
    { value: 'family',   label: 'En Famille',        icon: <Users     size={18} /> },
    { value: 'group',    label: 'Entre Amis',        icon: <Users     size={18} /> },
    { value: 'business', label: "Voyage d'Affaires", icon: <Briefcase size={18} /> },
  ];

  const inputStyle = (err) => ({
    width: '100%', boxSizing: 'border-box',
    background: isDark ? '#1a2320' : '#fff',
    border: `1px solid ${err ? '#e8874a' : (isDark ? '#2d3a36' : '#e0dcd4')}`,
    borderRadius: 14, padding: '13px 16px 13px 42px',
    fontSize: 14, color: isDark ? '#e8ece9' : '#1a4a36', outline: 'none',
    transition: 'border-color 0.2s', fontFamily: "'DM Sans', sans-serif",
  });

  return (
    <div style={{ minHeight: '100vh', background: isDark ? '#0f1412' : '#f7f5f0', fontFamily: "'DM Sans', sans-serif" }}>
      <Navigation openAuthModal={() => {}} />
      <div style={{ display: 'flex', minHeight: '100vh', paddingTop: 80 }}>

        {/* Colonne image */}
        <div style={{ flex: 1, position: 'relative', display: 'none' }} className="register-image-col">
          <img
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1920&q=80"
            alt="Travel adventure"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,28,20,0.97) 0%, rgba(10,28,20,0.6) 45%, rgba(10,28,20,0.1) 100%)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '48px 52px' }}>

            {/* Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(201,168,68,0.18)', border: '1px solid rgba(201,168,68,0.4)', borderRadius: 99, padding: '5px 14px', marginBottom: 20 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#c9a844', display: 'inline-block' }} />
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#c9a844' }}>Rejoignez-nous</span>
            </div>

            {/* Titre */}
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 36, fontWeight: 700, fontStyle: 'italic', color: '#fff', lineHeight: 1.2, marginBottom: 14, maxWidth: 420 }}>
              Voyagez sur mesure,{' '}
              <span style={{ color: '#c9a844' }}>selon vos envies</span>
            </h2>

            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.75, maxWidth: 400, fontWeight: 300, marginBottom: 26 }}>
              Inscrivez-vous et accedez a un univers de voyage entierement personnalise selon vos gouts et votre style.
            </p>

            {/* Avantages */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 30 }}>
              {[
                { icon: '✦', title: 'Destinations recommandees pour vous', desc: "Notre IA analyse vos preferences et vous propose les destinations qui vous correspondent vraiment." },
                { icon: '✦', title: 'Fiches completes & detaillees', desc: "Photos, scores nature / culture / plage, descriptions... tout pour choisir en toute confiance." },
                { icon: '✦', title: 'Hotels & activites inclus', desc: "Trouvez les meilleurs hotels et activites lies a chaque destination." },
                { icon: '✦', title: 'Reservez en quelques clics', desc: "Gerez vos reservations et suivez vos voyages depuis votre espace personnel." },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ color: '#c9a844', fontSize: 10, marginTop: 3, flexShrink: 0 }}>{item.icon}</span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', margin: '0 0 2px' }}>{item.title}</p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.6 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Temoignage */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex' }}>
                {['S','A','M'].map((l, i) => (
                  <div key={i} style={{ width: 30, height: 30, borderRadius: '50%', background: ['#2d7a5a','#c9a844','#6b8f7b'][i], border: '2px solid rgba(10,28,20,0.9)', marginLeft: i > 0 ? -8 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#fff' }}>
                    {l}
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: 0 }}>
                <strong style={{ color: '#fff', fontWeight: 500 }}>+1 200 voyageurs</strong> ont deja rejoint Afalou
              </p>
            </div>

          </div>
        </div>

        {/* ── Colonne formulaire ── */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          padding: '48px 32px', background: isDark ? '#0f1412' : '#f7f5f0', overflowY: 'auto',
        }}>
          <div style={{ width: '100%', maxWidth: 440 }}>

            {/* En-tête */}
            <div style={{ marginBottom: 28 }}>
              <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: isDark ? '#9db8aa' : '#6b8f7b', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 24, height: 1, background: isDark ? '#2d3a36' : '#6b8f7b', display: 'inline-block' }} />
                {step === 1 ? 'Créez votre compte' : 'Vos préférences'}
              </p>
              <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 34, fontWeight: 700, fontStyle: 'italic', color: isDark ? '#e8ece9' : '#1a4a36', lineHeight: 1.1, marginBottom: 8 }}>
                {t('registerPage.title')}
              </h1>
              <p style={{ fontSize: 13, color: isDark ? '#9db8aa' : '#6b8f7b', fontWeight: 300 }}>
                {t('registerPage.subtitle')}
              </p>
            </div>

            {/* Progress bar */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                {[t('registerPage.stepAccount'), t('registerPage.stepPreferences')].map((label, i) => (
                  <span key={i} style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: step >= i + 1 ? '#b5e4ca' : (isDark ? '#2d3a36' : '#c8c4bb') }}>
                    {label}
                  </span>
                ))}
              </div>
              <div style={{ height: 3, background: isDark ? '#2d3a36' : '#e0dcd4', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: '#c9a844', width: step === 1 ? '50%' : '100%', transition: 'width 0.4s cubic-bezier(0.4,0,0.2,1)', borderRadius: 99 }} />
              </div>
            </div>

            {/* ─── STEP 1 ─── */}
            {step === 1 && (
              <div>
                {/* Email */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: isDark ? '#b5e4ca' : '#2d7a5a', marginBottom: 7, letterSpacing: '0.04em' }}>
                    {t('registerPage.emailLabel')}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9db8aa' }} />
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder={t('registerPage.emailPlaceholder')} style={inputStyle(errors.email)} onFocus={e => e.target.style.borderColor = '#2d7a5a'} onBlur={e => e.target.style.borderColor = errors.email ? '#e8874a' : (isDark ? '#2d3a36' : '#e0dcd4')} />
                  </div>
                  {errors.email && <p style={{ marginTop: 5, fontSize: 12, color: '#e8874a' }}>{errors.email}</p>}
                </div>

                {/* Mot de passe */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: isDark ? '#b5e4ca' : '#2d7a5a', marginBottom: 7, letterSpacing: '0.04em' }}>
                    {t('registerPage.passwordLabel')}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9db8aa' }} />
                    <input type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder={t('registerPage.passwordPlaceholder')} style={inputStyle(errors.password)} onFocus={e => e.target.style.borderColor = '#2d7a5a'} onBlur={e => e.target.style.borderColor = errors.password ? '#e8874a' : (isDark ? '#2d3a36' : '#e0dcd4')} />
                  </div>
                  {errors.password && <p style={{ marginTop: 5, fontSize: 12, color: '#e8874a' }}>{errors.password}</p>}
                </div>

                {/* Confirmer */}
                <div style={{ marginBottom: 22 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: isDark ? '#b5e4ca' : '#2d7a5a', marginBottom: 7, letterSpacing: '0.04em' }}>
                    {t('registerPage.confirmPasswordLabel')}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9db8aa' }} />
                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} placeholder={t('registerPage.confirmPasswordPlaceholder')} style={inputStyle(errors.confirmPassword)} onFocus={e => e.target.style.borderColor = '#2d7a5a'} onBlur={e => e.target.style.borderColor = errors.confirmPassword ? '#e8874a' : (isDark ? '#2d3a36' : '#e0dcd4')} />
                  </div>
                  {errors.confirmPassword && <p style={{ marginTop: 5, fontSize: 12, color: '#e8874a' }}>{errors.confirmPassword}</p>}
                </div>

                {submitError && (
                  <div style={{ background: isDark ? 'rgba(232,135,74,0.1)' : '#fff8f5', border: '1px solid #e8874a', borderRadius: 12, padding: '12px 16px', marginBottom: 18 }}>
                    <p style={{ fontSize: 13, color: '#e8874a', margin: 0 }}>{submitError}</p>
                  </div>
                )}

                <button type="button" onClick={() => validateStep1() && setStep(2)} style={{ width: '100%', background: '#c9a844', color: '#fff', border: 'none', borderRadius: 14, padding: '15px 24px', fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.2s', marginBottom: 20, fontFamily: "'DM Sans', sans-serif" }} onMouseEnter={e => e.currentTarget.style.background = '#b08a30'} onMouseLeave={e => e.currentTarget.style.background = '#c9a844'}>
                  {t('registerPage.next')} <ArrowRight size={15} />
                </button>

                <div style={{ position: 'relative', margin: '4px 0 20px', textAlign: 'center' }}>
                  <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: isDark ? '#2d3a36' : '#e0dcd4' }} />
                  <span style={{ position: 'relative', background: isDark ? '#0f1412' : '#f7f5f0', padding: '0 14px', fontSize: 12, color: '#9db8aa' }}>{t('registerPage.or')}</span>
                </div>

                <button type="button" onClick={() => googleLoginHook()} style={{ width: '100%', background: isDark ? '#1a2320' : '#fff', color: isDark ? '#e8ece9' : '#1a4a36', border: `1px solid ${isDark ? '#2d3a36' : '#e0dcd4'}`, borderRadius: 14, padding: '13px 24px', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all 0.2s', marginBottom: 22, fontFamily: "'DM Sans', sans-serif" }} onMouseEnter={e => { e.currentTarget.style.background = isDark ? '#242d2a' : '#f7f5f0'; e.currentTarget.style.borderColor = '#c9a844'; }} onMouseLeave={e => { e.currentTarget.style.background = isDark ? '#1a2320' : '#fff'; e.currentTarget.style.borderColor = isDark ? '#2d3a36' : '#e0dcd4'; }}>
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  {t('registerPage.continueWithGoogle')}
                </button>

                <p style={{ textAlign: 'center', fontSize: 13, color: isDark ? '#9db8aa' : '#6b8f7b' }}>
                  {t('registerPage.alreadyHaveAccount')}{' '}
                  <Link to="/login" style={{ color: isDark ? '#b5e4ca' : '#2d7a5a', fontWeight: 600, textDecoration: 'none' }}>
                    {t('registerPage.login')}
                  </Link>
                </p>
              </div>
            )}

            {/* ─── STEP 2 ─── */}
            {step === 2 && (
              <form onSubmit={handleSubmit}>
                {/* Prénom / Nom */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  {[
                    { name: 'firstName', placeholder: 'Jean',   label: 'Prénom' },
                    { name: 'lastName',  placeholder: 'Dupont', label: 'Nom' },
                  ].map(f => (
                    <div key={f.name}>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: isDark ? '#b5e4ca' : '#2d7a5a', marginBottom: 7, letterSpacing: '0.04em' }}>
                        {f.label}
                      </label>
                      <div style={{ position: 'relative' }}>
                        <User size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9db8aa' }} />
                        <input type="text" name={f.name} value={formData[f.name]} onChange={handleInputChange} placeholder={f.placeholder} style={{ ...inputStyle(errors[f.name]), padding: '12px 14px 12px 36px' }} onFocus={e => e.target.style.borderColor = '#2d7a5a'} onBlur={e => e.target.style.borderColor = errors[f.name] ? '#e8874a' : (isDark ? '#2d3a36' : '#e0dcd4')} />
                      </div>
                      {errors[f.name] && <p style={{ marginTop: 4, fontSize: 11, color: '#e8874a' }}>{errors[f.name]}</p>}
                    </div>
                  ))}
                </div>

                {/* Âge */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: isDark ? '#b5e4ca' : '#2d7a5a', marginBottom: 7, letterSpacing: '0.04em' }}>Âge</label>
                  <div style={{ position: 'relative' }}>
                    <User size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9db8aa' }} />
                    <input type="number" name="age" value={formData.age} onChange={handleInputChange} placeholder="Ex: 25" style={inputStyle(errors.age)} onFocus={e => e.target.style.borderColor = '#2d7a5a'} onBlur={e => e.target.style.borderColor = isDark ? '#2d3a36' : '#e0dcd4'} />
                  </div>
                </div>

                {/* Type de voyageur */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: isDark ? '#b5e4ca' : '#2d7a5a', marginBottom: 10, letterSpacing: '0.04em' }}>
                    Type de voyageur
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {travelerTypes.map(type => {
                      const active = formData.travelerType === type.value;
                      return (
                        <button key={type.value} type="button" onClick={() => handleInputChange({ target: { name: 'travelerType', value: type.value } })} style={{ padding: '10px 8px', borderRadius: 12, border: `1.5px solid ${active ? '#c9a844' : (isDark ? '#2d3a36' : '#e0dcd4')}`, background: active ? (isDark ? 'rgba(201,168,68,0.15)' : 'rgba(201,168,68,0.08)') : (isDark ? '#1a2320' : '#fff'), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, cursor: 'pointer', transition: 'all 0.2s', color: active ? (isDark ? '#e8ece9' : '#1a4a36') : (isDark ? '#9db8aa' : '#6b8f7b') }}>
                          <span style={{ color: active ? '#c9a844' : '#9db8aa' }}>{type.icon}</span>
                          <span style={{ fontSize: 10, fontWeight: 500, textAlign: 'center', letterSpacing: '0.03em' }}>{type.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  {errors.travelerType && <p style={{ marginTop: 5, fontSize: 12, color: '#e8874a' }}>{errors.travelerType}</p>}
                </div>

                {/* ─── PRÉFÉRENCES — Cartes A ─── */}
                <div style={{ marginBottom: 22 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <label style={{ fontSize: 12, fontWeight: 500, color: isDark ? '#b5e4ca' : '#2d7a5a', letterSpacing: '0.04em' }}>
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
                        value={formData[pref.key]}
                        onChange={handlePrefChange}
                        isDark={isDark}
                      />
                    ))}
                  </div>

                  {/* Résumé scores */}
                  <div style={{ marginTop: 12, padding: '10px 14px', background: isDark ? '#1a2320' : '#f7f5f0', borderRadius: 10, border: `1px solid ${isDark ? '#2d3a36' : '#e0dcd4'}` }}>
                    <p style={{ fontSize: 10, color: isDark ? '#6b8f7b' : '#9db8aa', marginBottom: 6, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Scores envoyés</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px' }}>
                      {PREFERENCES.map(p => (
                        <span key={p.key} style={{ fontSize: 11, color: isDark ? '#e8ece9' : '#1a4a36' }}>
                          {p.label}: <strong style={{ color: '#c9a844' }}>{Math.round(formData[p.key] * 100)}</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {submitError && (
                  <div style={{ background: isDark ? 'rgba(232,135,74,0.1)' : '#fff8f5', border: '1px solid #e8874a', borderRadius: 12, padding: '12px 16px', marginBottom: 18 }}>
                    <p style={{ fontSize: 13, color: '#e8874a', margin: 0 }}>{submitError}</p>
                  </div>
                )}

                {/* Boutons */}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" onClick={() => setStep(1)} style={{ flex: 1, background: isDark ? '#1a2320' : '#fff', color: isDark ? '#e8ece9' : '#2d7a5a', border: `1px solid ${isDark ? '#2d3a36' : '#e0dcd4'}`, borderRadius: 14, padding: '14px 20px', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif" }} onMouseEnter={e => { e.currentTarget.style.background = isDark ? '#242d2a' : '#f7f5f0'; e.currentTarget.style.borderColor = '#2d7a5a'; }} onMouseLeave={e => { e.currentTarget.style.background = isDark ? '#1a2320' : '#fff'; e.currentTarget.style.borderColor = isDark ? '#2d3a36' : '#e0dcd4'; }}>
                    <ChevronLeft size={14} /> Retour
                  </button>
                  <button type="submit" disabled={isLoading} style={{ flex: 2, background: '#c9a844', color: '#fff', border: 'none', borderRadius: 14, padding: '14px 20px', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: isLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: isLoading ? 0.7 : 1, transition: 'background 0.2s', fontFamily: "'DM Sans', sans-serif" }} onMouseEnter={e => { if (!isLoading) e.currentTarget.style.background = '#b08a30'; }} onMouseLeave={e => e.currentTarget.style.background = '#c9a844'}>
                    {isLoading ? <><Loader2 size={15} className="animate-spin" /> Inscription...</> : <>S'inscrire <ArrowRight size={15} /></>}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) { .register-image-col { display: block !important; } }
        input::placeholder { color: #9db8aa; }
      `}</style>
      <Footer />
    </div>
  );
};

export default RegisterPage;