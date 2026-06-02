import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import Navigation from '../components/Navigation';
import { Lock, ArrowLeft, ArrowRight, Loader2, CheckCircle2, Eye, EyeOff, ShieldCheck } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const ResetPasswordPage = () => {
  const { isDark } = useTheme();
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Lien de réinitialisation invalide.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) { setError('Lien invalide.'); return; }
    if (!newPassword) { setError('Veuillez saisir un nouveau mot de passe.'); return; }
    if (newPassword.length < 6) { setError('Le mot de passe doit contenir au moins 6 caractères.'); return; }
    if (newPassword !== confirmPassword) { setError('Les deux mots de passe ne correspondent pas.'); return; }

    setIsLoading(true);
    try {
      const r = await fetch(`${API}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      });
      const data = await r.json().catch(() => ({}));
      if (r.ok) {
        setDone(true);
        setTimeout(() => navigate('/login'), 3500);
      } else {
        setError(data.message || 'Une erreur est survenue. Le lien est peut-être expiré.');
      }
    } catch (err) {
      setError('Une erreur réseau est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = (err) =>
    `w-full ${isDark ? 'bg-dark-surface border-dark-border text-dark-text' : 'bg-white border-[#e0dcd4] text-[#1a4a36]'} border ${err ? 'border-red-400' : ''} rounded-2xl py-3.5 px-4 pl-12 pr-12 placeholder-[#9db8aa] focus:outline-none focus:ring-2 focus:ring-[#2d7a5a]/30 focus:border-[#2d7a5a] transition text-sm`;

  return (
    <div style={{ minHeight: '100vh', background: isDark ? '#0f1412' : '#f7f5f0', fontFamily: "'DM Sans', sans-serif" }}>
      <Navigation openAuthModal={() => {}} />

      <div style={{ display: 'flex', minHeight: '100vh', paddingTop: 80 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 32px', overflowY: 'auto' }}>
          <div style={{ width: '100%', maxWidth: 460 }}>

            <div style={{ marginBottom: 36 }}>
              <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: isDark ? '#9db8aa' : '#6b8f7b', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 24, height: 1, background: isDark ? '#2d3a36' : '#6b8f7b', display: 'inline-block' }} />
                Nouveau mot de passe
              </p>
              <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 34, fontWeight: 700, fontStyle: 'italic', color: isDark ? '#e8ece9' : '#1a4a36', marginBottom: 8, lineHeight: 1.2 }}>
                Définir un nouveau mot de passe
              </h1>
              <p style={{ fontSize: 14, color: isDark ? '#9db8aa' : '#6b8f7b', fontWeight: 300, lineHeight: 1.5 }}>
                Choisissez un mot de passe solide que vous n'utilisez pas ailleurs.
              </p>
            </div>

            {done ? (
              <div style={{ background: isDark ? 'rgba(22,163,74,0.12)' : '#f0fdf4', border: '2px solid #16a34a', borderRadius: 16, padding: '24px', textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#16a34a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <CheckCircle2 size={28} />
                </div>
                <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 600, fontStyle: 'italic', color: isDark ? '#e8ece9' : '#1a4a36', marginBottom: 8 }}>
                  Mot de passe réinitialisé
                </h2>
                <p style={{ fontSize: 14, color: isDark ? '#9db8aa' : '#6b8f7b', lineHeight: 1.5, marginBottom: 12 }}>
                  Votre mot de passe a été mis à jour. Vous allez être redirigé vers la page de connexion…
                </p>
                <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#2d7a5a', fontSize: 13, fontWeight: 600, textDecoration: 'none', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Se connecter maintenant <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {error && (
                  <div style={{ background: isDark ? 'rgba(220,38,38,0.12)' : '#fef2f2', border: '1px solid #dc2626', borderRadius: 12, padding: '12px 16px', marginBottom: 18 }}>
                    <p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>{error}</p>
                  </div>
                )}

                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: isDark ? '#9db8aa' : '#6b8f7b', marginBottom: 8 }}>
                    Nouveau mot de passe
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: isDark ? '#9db8aa' : '#6b8f7b' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => { setNewPassword(e.target.value); if (error) setError(''); }}
                      placeholder="Au moins 6 caractères"
                      className={inputClass(false)}
                      autoComplete="new-password"
                      autoFocus
                    />
                    <button type="button" onClick={() => setShowPassword(s => !s)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: isDark ? '#9db8aa' : '#6b8f7b' }}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: isDark ? '#9db8aa' : '#6b8f7b', marginBottom: 8 }}>
                    Confirmer le mot de passe
                  </label>
                  <div style={{ position: 'relative' }}>
                    <ShieldCheck size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: isDark ? '#9db8aa' : '#6b8f7b' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); if (error) setError(''); }}
                      placeholder="Retapez le mot de passe"
                      className={inputClass(false)}
                      autoComplete="new-password"
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
                  {isLoading ? (<><Loader2 size={16} className="animate-spin" /> Mise à jour…</>) : (<>Réinitialiser le mot de passe <ArrowRight size={15} /></>)}
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

export default ResetPasswordPage;
