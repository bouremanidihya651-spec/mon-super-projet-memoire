import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useGoogleLogin } from '@react-oauth/google';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useTranslation } from 'react-i18next';

const LoginPage = () => {
  const { isDark } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, isAdmin, googleAuth } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockedMessage, setBlockedMessage] = useState('');

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
        email: userInfo.email || '',
        firstName: userInfo.given_name || '',
        lastName: userInfo.family_name || '',
        travelerType: 'solo', minBudget: 0, maxBudget: 10000,
        luxury_score: 0.5, nature_score: 0.5, adventure_score: 0.5,
        culture_score: 0.5, beach_score: 0.5, food_score: 0.5, preferredTags: []
      });
      if (result?.success) {
        const userData = JSON.parse(localStorage.getItem('userData'));
        navigate(userData?.role === 'admin' ? '/admin' : '/dashboard');
      } else {
        setSubmitError(result?.message || 'Erreur lors de la connexion Google');
      }
    } catch (error) {
      setSubmitError(error.message || 'Erreur lors de la connexion Google');
    } finally {
      setIsLoading(false);
    }
  };

  const googleLoginHook = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => setSubmitError('Échec de la connexion Google'),
    flow: 'implicit'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (submitError) setSubmitError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const loginErrors = {};
    if (!formData.email) loginErrors.email = 'Email requis';
    if (!formData.password) loginErrors.password = 'Mot de passe requis';
    if (Object.keys(loginErrors).length > 0) { setErrors(loginErrors); return; }
    setIsLoading(true);
    setSubmitError('');
    setIsBlocked(false);
    try {
      const result = await login(formData.email, formData.password);
      if (result?.success) {
        const userData = JSON.parse(localStorage.getItem('userData'));
        navigate(userData?.role === 'admin' ? '/admin' : '/dashboard');
      } else if (result?.code === 'ACCOUNT_BLOCKED') {
        setIsBlocked(true);
        setBlockedMessage(result.message);
      } else {
        setSubmitError(result?.message || 'Échec de la connexion');
      }
    } catch (error) {
      setSubmitError(error.message || "Une erreur est survenue lors de la connexion");
    } finally {
      setIsLoading(false);
    }
  };

  /* ─── styles partagés ─── */
  const inputClass = (err) =>
    `w-full ${isDark ? 'bg-dark-surface border-dark-border text-dark-text' : 'bg-white border-[#e0dcd4] text-[#1a4a36]'} border ${err ? 'border-red-400' : ''} rounded-2xl py-3.5 px-4 pl-12 placeholder-[#9db8aa] focus:outline-none focus:ring-2 focus:ring-[#2d7a5a]/30 focus:border-[#2d7a5a] transition text-sm`;

  return (
    <div style={{ minHeight: '100vh', background: isDark ? '#0f1412' : '#f7f5f0', fontFamily: "'DM Sans', sans-serif" }}>
      <Navigation openAuthModal={() => {}} />

      {/* ── conteneur principal — pt-[80px] compense la navbar fixe ── */}
      <div style={{
        display: 'flex', minHeight: '100vh',
        paddingTop: 80,           /* hauteur navbar */
      }}>

        {/* ══ COLONNE GAUCHE — formulaire ══ */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '48px 32px', background: isDark ? '#0f1412' : '#f7f5f0', overflowY: 'auto',
        }}>
          <div style={{ width: '100%', maxWidth: 420 }}>

            {/* En-tête */}
            <div style={{ marginBottom: 36 }}>
              <p style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 500,
                letterSpacing: '0.22em', textTransform: 'uppercase', color: isDark ? '#9db8aa' : '#6b8f7b', marginBottom: 10,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ width: 24, height: 1, background: isDark ? '#2d3a36' : '#6b8f7b', display: 'inline-block' }} />
                Bienvenue
              </p>
              <h1 style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 38, fontWeight: 700, fontStyle: 'italic',
                color: isDark ? '#e8ece9' : '#1a4a36', lineHeight: 1.1, marginBottom: 10,
              }}>
                {t('loginPage.welcome')}
              </h1>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: isDark ? '#9db8aa' : '#6b8f7b', fontWeight: 300 }}>
                {t('loginPage.subtitle')}
              </p>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleLogin}>
              {/* Email */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: isDark ? '#b5e4ca' : '#2d7a5a', marginBottom: 7, letterSpacing: '0.04em' }}>
                  {t('loginPage.emailLabel')}
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9db8aa' }} />
                  <input
                    type="email" name="email" value={formData.email}
                    onChange={handleInputChange}
                    placeholder={t('loginPage.emailPlaceholder')}
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      background: isDark ? '#1a2320' : '#fff', border: `1px solid ${errors.email ? '#e8874a' : (isDark ? '#2d3a36' : '#e0dcd4')}`,
                      borderRadius: 14, padding: '13px 16px 13px 42px',
                      fontSize: 14, color: isDark ? '#e8ece9' : '#1a4a36', outline: 'none',
                      transition: 'border-color 0.2s',
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                    onFocus={e => e.target.style.borderColor = '#2d7a5a'}
                    onBlur={e => e.target.style.borderColor = errors.email ? '#e8874a' : (isDark ? '#2d3a36' : '#e0dcd4')}
                  />
                </div>
                {errors.email && <p style={{ marginTop: 5, fontSize: 12, color: '#e8874a' }}>{errors.email}</p>}
              </div>

              {/* Mot de passe */}
              <div style={{ marginBottom: 10 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: isDark ? '#b5e4ca' : '#2d7a5a', marginBottom: 7, letterSpacing: '0.04em' }}>
                  {t('loginPage.passwordLabel')}
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9db8aa' }} />
                  <input
                    type="password" name="password" value={formData.password}
                    onChange={handleInputChange}
                    placeholder={t('loginPage.passwordPlaceholder')}
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      background: isDark ? '#1a2320' : '#fff', border: `1px solid ${errors.password ? '#e8874a' : (isDark ? '#2d3a36' : '#e0dcd4')}`,
                      borderRadius: 14, padding: '13px 16px 13px 42px',
                      fontSize: 14, color: isDark ? '#e8ece9' : '#1a4a36', outline: 'none',
                      transition: 'border-color 0.2s',
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                    onFocus={e => e.target.style.borderColor = '#2d7a5a'}
                    onBlur={e => e.target.style.borderColor = errors.password ? '#e8874a' : (isDark ? '#2d3a36' : '#e0dcd4')}
                  />
                </div>
                {errors.password && <p style={{ marginTop: 5, fontSize: 12, color: '#e8874a' }}>{errors.password}</p>}
              </div>

              {/* Mot de passe oublié */}
              <div style={{ textAlign: 'right', marginBottom: 22 }}>
                <Link to="/forgot-password" style={{
                  fontSize: 12, color: isDark ? '#9db8aa' : '#6b8f7b', textDecoration: 'none', fontWeight: 500,
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => e.target.style.color = '#2d7a5a'}
                onMouseLeave={e => e.target.style.color = isDark ? '#9db8aa' : '#6b8f7b'}
                >
                  {t('loginPage.forgotPassword')}
                </Link>
              </div>

              {/* Erreur globale */}
              {isBlocked && (
                <div style={{
                  background: isDark ? 'rgba(220,38,38,0.12)' : '#fef2f2',
                  border: '2px solid #dc2626',
                  borderRadius: 12, padding: '14px 16px', marginBottom: 18,
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: '#dc2626', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, fontSize: 18, fontWeight: 700,
                  }}>⛔</div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#dc2626', margin: 0 }}>
                    {blockedMessage || 'Votre compte a été bloqué.'}
                  </p>
                </div>
              )}
              {submitError && (
                <div style={{
                  background: isDark ? 'rgba(232,135,74,0.1)' : '#fff8f5', border: '1px solid #e8874a',
                  borderRadius: 12, padding: '12px 16px', marginBottom: 18,
                }}>
                  <p style={{ fontSize: 13, color: '#e8874a', margin: 0 }}>{submitError}</p>
                </div>
              )}

              {/* Bouton connexion */}
              <button
                type="submit" disabled={isLoading}
                style={{
                  width: '100%', background: '#c9a844', color: '#fff',
                  border: 'none', borderRadius: 14, padding: '15px 24px',
                  fontSize: 13, fontWeight: 600, letterSpacing: '0.08em',
                  textTransform: 'uppercase', cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  opacity: isLoading ? 0.7 : 1, transition: 'background 0.2s, transform 0.15s',
                  fontFamily: "'DM Sans', sans-serif",
                  marginBottom: 20,
                }}
                onMouseEnter={e => { if (!isLoading) e.currentTarget.style.background = '#b08a30'; }}
                onMouseLeave={e => e.currentTarget.style.background = '#c9a844'}
              >
                {isLoading ? <><Loader2 size={16} className="animate-spin" /> {t('loginPage.signingIn')}</> : <>{t('loginPage.signIn')} <ArrowRight size={15} /></>}
              </button>

              {/* Séparateur */}
              <div style={{ position: 'relative', margin: '4px 0 20px', textAlign: 'center' }}>
                <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: isDark ? '#2d3a36' : '#e0dcd4' }} />
                <span style={{
                  position: 'relative', background: isDark ? '#0f1412' : '#f7f5f0',
                  padding: '0 14px', fontSize: 12, color: '#9db8aa',
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                  {t('loginPage.or')}
                </span>
              </div>

              {/* Google */}
              <button
                type="button" onClick={() => googleLoginHook()} disabled={isLoading}
                style={{
                  width: '100%', background: isDark ? '#1a2320' : '#fff', color: isDark ? '#e8ece9' : '#1a4a36',
                  border: `1px solid ${isDark ? '#2d3a36' : '#e0dcd4'}`, borderRadius: 14, padding: '13px 24px',
                  fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  transition: 'background 0.2s, border-color 0.2s',
                  fontFamily: "'DM Sans', sans-serif", marginBottom: 24,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = isDark ? '#242d2a' : '#f7f5f0'; e.currentTarget.style.borderColor = '#c9a844'; }}
                onMouseLeave={e => { e.currentTarget.style.background = isDark ? '#1a2320' : '#fff'; e.currentTarget.style.borderColor = isDark ? '#2d3a36' : '#e0dcd4'; }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                {t('loginPage.continueWithGoogle')}
              </button>

              {/* Lien inscription */}
              <p style={{ textAlign: 'center', fontSize: 13, color: '#6b8f7b', fontFamily: "'DM Sans', sans-serif" }}>
                {t('loginPage.noAccount')}{' '}
                <Link to="/register" style={{ color: '#2d7a5a', fontWeight: 600, textDecoration: 'none' }}>
                  {t('loginPage.createAccount')}
                </Link>
              </p>
            </form>
          </div>
        </div>

        {/* ══ COLONNE DROITE — image (desktop only) ══ */}
        <div style={{
          flex: 1, position: 'relative', display: 'none',
        }} className="login-image-col">
          <img
            src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1920&q=80"
            alt="Luxury travel destination"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(20,48,34,0.82) 0%, rgba(20,48,34,0.15) 55%, transparent 100%)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '48px 52px' }}>
            <p style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 600,
              letterSpacing: '0.22em', textTransform: 'uppercase', color: '#c9a844', marginBottom: 14,
            }}>
              {t('loginPage.heroSubtitle')}
            </p>
            <h2 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 42, fontWeight: 700, fontStyle: 'italic',
              color: '#fff', lineHeight: 1.1, marginBottom: 14,
            }}>
              {t('loginPage.heroTitle')}
            </h2>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.75)', lineHeight: 1.75, maxWidth: 400, fontWeight: 300 }}>
              {t('loginPage.heroDescription')}
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .login-image-col { display: block !important; }
        }
        input::placeholder { color: #9db8aa; }
      `}</style>
      <Footer />
    </div>
  );
};

export default LoginPage;

