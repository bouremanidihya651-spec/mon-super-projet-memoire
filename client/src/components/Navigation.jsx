import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Globe, Menu, X, Moon, Sun, Plane } from 'lucide-react';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen]         = useState(false);
  const [isLangDropdownOpen, setIsLangOpen] = useState(false);
  const [scrolled, setScrolled]             = useState(false);
  const [isMobile, setIsMobile]             = useState(window.innerWidth <= 768);

  const location                            = useLocation();
  const { isAuthenticated, logout, isAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { i18n, t }                         = useTranslation();

  const languages = [
    { code: 'fr', name: 'Français', icon: 'FR' },
    { code: 'en', name: 'English',  icon: 'EN' },
    { code: 'ar', name: 'العربية',  icon: 'AR' },
  ];

  const navLinks = [
    { to: '/',             label: t('nav.home') },
    { to: '/destinations', label: t('nav.destinations') },
    { to: '/about',        label: t('nav.about') },
    { to: '/contact',      label: t('nav.contact') },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('scroll', onScroll);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const isHome = location.pathname === '/';

  const bgLight = 'rgba(247,245,240,0.97)';
  const bgDark  = 'rgba(15,20,18,0.97)';
  const borderLight = 'rgba(224,220,212,0.8)';
  const borderDark  = 'rgba(45,64,56,0.8)';

  const navStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: isMobile
      ? (scrolled ? '12px 20px' : '18px 20px')
      : (scrolled ? '14px 48px' : '22px 48px'),
    background: scrolled
      ? (isDark ? bgDark : bgLight)
      : isHome ? 'transparent' : (isDark ? bgDark : bgLight),
    borderBottom: scrolled ? `1px solid ${isDark ? borderDark : borderLight}` : 'none',
    backdropFilter: scrolled || !isHome ? 'blur(12px)' : 'none',
    transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
  };

  const logoColor  = scrolled || !isHome ? (isDark ? '#e8ece9' : '#1a4a36') : (isHome && isDark ? '#e8ece9' : '#ffffff');
  const textColor  = scrolled || !isHome ? (isDark ? '#e8ece9' : '#1a4a36') : (isHome && isDark ? '#e8ece9' : '#ffffff');
  const mutedColor = scrolled || !isHome ? (isDark ? '#8fa89e' : '#6b8f7b') : (isHome && isDark ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.75)');
  const accentColor = scrolled || !isHome ? (isDark ? '#3d9a7a' : '#2d7a5a') : (isHome && isDark ? '#e8ece9' : '#ffffff');

  const linkColor = (active) => active ? accentColor : mutedColor;

  return (
    <>
      <nav style={navStyle}>
        {/* LOGO */}
        <Link to="/" style={{ textDecoration: 'none', zIndex: 10, display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 10 }}>
          <Plane style={{
            width: isMobile ? 22 : 28, height: isMobile ? 22 : 28,
            color: logoColor, transition: 'color 0.3s', transform: 'rotate(-45deg)',
          }} />
          <span style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: isMobile ? 18 : 22, fontWeight: 700, fontStyle: 'italic',
            letterSpacing: '0.15em', color: logoColor, transition: 'color 0.3s', lineHeight: 1,
          }}>
            AFALOU TOURS
          </span>
        </Link>

        {/* DESKTOP NAV LINKS */}
        <div style={{
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', alignItems: 'center', gap: 36,
        }} className="hidden-mobile">
          {navLinks.map(({ to, label }) => {
            const active = location.pathname === to;
            return (
              <Link key={to} to={to} style={{ textDecoration: 'none' }}>
                <span
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 12, fontWeight: 500,
                    letterSpacing: '0.12em', textTransform: 'uppercase',
                    color: linkColor(active),
                    borderBottom: active ? `1.5px solid ${accentColor}` : '1.5px solid transparent',
                    paddingBottom: 3,
                    transition: 'color 0.2s, border-color 0.2s',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = accentColor}
                  onMouseLeave={e => e.currentTarget.style.color = linkColor(active)}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* DESKTOP RIGHT ACTIONS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, zIndex: 10 }} className="hidden-mobile">
          {/* THEME TOGGLE */}
          <button onClick={toggleTheme} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 6, borderRadius: '50%', color: mutedColor,
            transition: 'color 0.2s, transform 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* LANG DROPDOWN */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setIsLangOpen(!isLangDropdownOpen)} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif", fontSize: 12,
              fontWeight: 600, letterSpacing: '0.08em', color: mutedColor,
              transition: 'color 0.2s',
            }}>
              <Globe size={15} />
              {languages.find(l => l.code === i18n.language)?.icon || 'FR'}
            </button>
            {isLangDropdownOpen && (
              <div style={{
                position: 'absolute', right: 0, top: 'calc(100% + 12px)',
                background: isDark ? '#1a2320' : '#fff',
                border: `1px solid ${isDark ? '#2d4038' : '#e0dcd4'}`,
                borderRadius: 12, overflow: 'hidden', width: 148,
                boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(26,74,54,0.12)',
              }}>
                {languages.map(lang => (
                  <button key={lang.code}
                    onClick={() => { i18n.changeLanguage(lang.code); setIsLangOpen(false); }}
                    style={{
                      width: '100%', padding: '11px 16px', textAlign: 'left',
                      border: 'none', cursor: 'pointer',
                      fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 400,
                      background: i18n.language === lang.code ? (isDark ? '#243430' : '#f7f5f0') : (isDark ? '#1a2320' : '#fff'),
                      color: i18n.language === lang.code ? (isDark ? '#e8ece9' : '#1a4a36') : (isDark ? '#8fa89e' : '#6b8f7b'),
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = isDark ? '#243430' : '#f7f5f0'}
                    onMouseLeave={e => e.currentTarget.style.background = i18n.language === lang.code ? (isDark ? '#243430' : '#f7f5f0') : (isDark ? '#1a2320' : '#fff')}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* AUTH */}
          {isAuthenticated ? (
            <>
              <Link to={isAdmin() ? '/admin' : '/dashboard'} style={{ textDecoration: 'none' }}>
                <span style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 500,
                  letterSpacing: '0.08em', textTransform: 'uppercase', color: mutedColor,
                }}>
                  {isAdmin() ? t('nav.admin') : t('nav.dashboard')}
                </span>
              </Link>
              <button onClick={logout} style={{
                background: '#2d7a5a', color: '#fff',
                padding: '10px 22px', border: 'none', borderRadius: 999,
                fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 500,
                letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
                transition: 'background 0.2s, transform 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#1a4a36'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#2d7a5a'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {t('nav.logout')}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <span style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 500,
                  letterSpacing: '0.08em', textTransform: 'uppercase', color: mutedColor,
                  transition: 'color 0.2s',
                }}>
                  {t('nav.login')}
                </span>
              </Link>
              <Link to="/register" style={{ textDecoration: 'none' }}>
                <button style={{
                  background: scrolled || !isHome ? '#2d7a5a' : 'rgba(255,255,255,0.15)',
                  color: '#fff', padding: '10px 22px',
                  border: scrolled || !isHome ? 'none' : '1px solid rgba(255,255,255,0.5)',
                  borderRadius: 999,
                  fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 500,
                  letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
                  backdropFilter: 'blur(4px)', transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#1a4a36'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = scrolled || !isHome ? '#2d7a5a' : 'rgba(255,255,255,0.15)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  {t('nav.signup')}
                </button>
              </Link>
            </>
          )}
        </div>

        {/* MOBILE: theme + lang + hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, zIndex: 10 }} className="show-mobile">
          {/* THEME TOGGLE */}
          <button onClick={toggleTheme} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 6, borderRadius: '50%', color: textColor,
            transition: 'color 0.2s',
          }}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* LANG DROPDOWN MOBILE */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setIsLangOpen(!isLangDropdownOpen)} style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif", fontSize: 12,
              fontWeight: 600, color: textColor,
            }}>
              <Globe size={16} />
              {languages.find(l => l.code === i18n.language)?.icon || 'FR'}
            </button>
            {isLangDropdownOpen && (
              <div style={{
                position: 'absolute', right: 0, top: 'calc(100% + 10px)',
                background: isDark ? '#1a2320' : '#fff',
                border: `1px solid ${isDark ? '#2d4038' : '#e0dcd4'}`,
                borderRadius: 12, overflow: 'hidden', width: 140,
                boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(26,74,54,0.12)',
                zIndex: 300,
              }}>
                {languages.map(lang => (
                  <button key={lang.code}
                    onClick={() => { i18n.changeLanguage(lang.code); setIsLangOpen(false); }}
                    style={{
                      width: '100%', padding: '11px 16px', textAlign: 'left',
                      border: 'none', cursor: 'pointer',
                      fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 400,
                      background: i18n.language === lang.code ? (isDark ? '#243430' : '#f7f5f0') : (isDark ? '#1a2320' : '#fff'),
                      color: i18n.language === lang.code ? (isDark ? '#e8ece9' : '#1a4a36') : (isDark ? '#8fa89e' : '#6b8f7b'),
                    }}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* HAMBURGER */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: textColor, display: 'flex', alignItems: 'center',
          }}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* MOBILE MENU OVERLAY */}
      {isMenuOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: isDark ? '#0f1412' : '#f7f5f0',
          zIndex: 200, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 24,
        }}>
          <button onClick={() => setIsMenuOpen(false)} style={{
            position: 'absolute', top: 24, right: 24,
            background: 'none', border: 'none', cursor: 'pointer',
            color: isDark ? '#e8ece9' : '#1a4a36',
          }}>
            <X size={24} />
          </button>

          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to} onClick={() => setIsMenuOpen(false)} style={{ textDecoration: 'none' }}>
              <span style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 22, fontWeight: 600,
                color: location.pathname === to
                  ? (isDark ? '#e8ece9' : '#1a4a36')
                  : (isDark ? '#8fa89e' : '#6b8f7b'),
              }}>
                {label}
              </span>
            </Link>
          ))}

          {/* AUTH in mobile menu */}
          {isAuthenticated ? (
            <>
              <Link to={isAdmin() ? '/admin' : '/dashboard'} onClick={() => setIsMenuOpen(false)} style={{ textDecoration: 'none' }}>
                <span style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: isDark ? '#8fa89e' : '#6b8f7b',
                }}>
                  {isAdmin() ? t('nav.admin') : t('nav.dashboard')}
                </span>
              </Link>
              <button onClick={() => { logout(); setIsMenuOpen(false); }} style={{
                background: isDark ? '#3d9a7a' : '#2d7a5a', color: '#fff',
                padding: '12px 32px', border: 'none', borderRadius: 999,
                fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500,
                letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
              }}>
                {t('nav.logout')}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setIsMenuOpen(false)} style={{ textDecoration: 'none' }}>
                <span style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: isDark ? '#8fa89e' : '#6b8f7b',
                }}>
                  {t('nav.login')}
                </span>
              </Link>
              <Link to="/register" onClick={() => setIsMenuOpen(false)} style={{ textDecoration: 'none', marginTop: 8 }}>
                <button style={{
                  background: isDark ? '#3d9a7a' : '#2d7a5a', color: '#fff',
                  padding: '12px 32px', border: 'none', borderRadius: 999,
                  fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500,
                  letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
                }}>
                  {t('nav.signup')}
                </button>
              </Link>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile   { display: flex !important; }
        }
        @media (min-width: 769px) {
          .show-mobile   { display: none !important; }
        }
      `}</style>
    </>
  );
};

export default Navigation;

