import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import Navigation from '../components/Navigation';
import { Mail, ArrowLeft, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const ForgotPasswordPage = () => {
  const { isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email) {
      setError('Veuillez saisir votre adresse e-mail.');
      return;
    }
    setIsLoading(true);
    try {
      await fetch(`${API}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      // Always show the success state (no email enumeration)
      setSubmitted(true);
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = (err) =>
    `w-full ${isDark ? 'bg-dark-surface border-dark-border text-dark-text' : 'bg-white border-[#e0dcd4] text-[#1a4a36]'} border ${err ? 'border-red-400' : ''} rounded-2xl py-3.5 px-4 pl-12 placeholder-[#9db8aa] focus:outline-none focus:ring-2 focus:ring-[#2d7a5a]/30 focus:border-[#2d7a5a] transition text-sm`;

  return (
    <div style={{ minHeight: '100vh', background: isDark ? '#0f1412' : '#f7f5f0', fontFamily: "'DM Sans', sans-serif" }}>
      <Navigation openAuthModal={() => {}} />

      <div style={{ display: 'flex', minHeight: '100vh', paddingTop: 80 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 32px', overflowY: 'auto' }}>
          <div style={{ width: '100%', maxWidth: 460 }}>

            {/* En-tête */}
            <div style={{ marginBottom: 36 }}>
              <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: isDark ? '#9db8aa' : '#6b8f7b', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 24, height: 1, background: isDark ? '#2d3a36' : '#6b8f7b', display: 'inline-block' }} />
                Réinitialisation
              </p>
              <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 34, fontWeight: 700, fontStyle: 'italic', color: isDark ? '#e8ece9' : '#1a4a36', marginBottom: 8, lineHeight: 1.2 }}>
                Mot de passe oublié ?
              </h1>
              <p style={{ fontSize: 14, color: isDark ? '#9db8aa' : '#6b8f7b', fontWeight: 300, lineHeight: 1.5 }}>
                Saisissez l'adresse e-mail liée à votre compte. Nous vous enverrons un lien sécurisé pour réinitialiser votre mot de passe.
              </p>
            </div>

            {submitted ? (
              <div style={{ background: isDark ? 'rgba(22,163,74,0.12)' : '#f0fdf4', border: '2px solid #16a34a', borderRadius: 16, padding: '24px', textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#16a34a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <CheckCircle2 size={28} />
                </div>
                <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 600, fontStyle: 'italic', color: isDark ? '#e8ece9' : '#1a4a36', marginBottom: 8 }}>
                  E-mail envoyé
                </h2>
                <p style={{ fontSize: 14, color: isDark ? '#9db8aa' : '#6b8f7b', lineHeight: 1.5, marginBottom: 20 }}>
                  Si un compte existe pour <strong>{email}</strong>, un lien de réinitialisation vient d'y être envoyé. Pensez à vérifier vos courriers indésirables.
                </p>
                <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#2d7a5a', fontSize: 13, fontWeight: 600, textDecoration: 'none', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  <ArrowLeft size={14} /> Retour à la connexion
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {error && (
                  <div style={{ background: isDark ? 'rgba(220,38,38,0.12)' : '#fef2f2', border: '1px solid #dc2626', borderRadius: 12, padding: '12px 16px', marginBottom: 18 }}>
                    <p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>{error}</p>
                  </div>
                )}

                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: isDark ? '#9db8aa' : '#6b8f7b', marginBottom: 8 }}>
                    Adresse e-mail
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: isDark ? '#9db8aa' : '#6b8f7b' }} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
                      placeholder="vous@exemple.com"
                      className={inputClass(false)}
                      autoComplete="email"
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    width: '100%', background: '#2d7a5a', color: '#fff', border: 'none',
                    borderRadius: 12, padding: '14px 24px', fontSize: 13, fontWeight: 600,
                    letterSpacing: '0.08em', textTransform: 'uppercase', cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.7 : 1, transition: 'background 0.2s, transform 0.15s',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                  onMouseEnter={e => { if (!isLoading) e.currentTarget.style.background = '#1a4a36'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#2d7a5a'; }}
                >
                  {isLoading ? (<><Loader2 size={16} className="animate-spin" /> Envoi en cours…</>) : (<>Envoyer le lien <ArrowRight size={15} /></>)}
                </button>

                <div style={{ textAlign: 'center', marginTop: 24 }}>
                  <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: isDark ? '#9db8aa' : '#6b8f7b', fontSize: 13, textDecoration: 'none', fontWeight: 500 }}>
                    <ArrowLeft size={13} /> Retour à la connexion
                  </Link>
                </div>
              </form>
            )}

          </div>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default ForgotPasswordPage;
