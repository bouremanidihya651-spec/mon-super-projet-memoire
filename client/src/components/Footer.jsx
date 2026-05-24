import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';

const Footer = () => {
  const { t } = useTranslation();
  const { isDark } = useTheme();

  const colors = {
    bg:     isDark ? '#1a2f26' : '#f7f5f0',
    card:   isDark ? '#24342c' : '#ffffff',
    border: isDark ? '#2d4038' : '#e0dcd4',
    text:   isDark ? '#b5e4ca' : '#1a4a36',
    text2:  isDark ? '#8fa89e' : '#2d7a5a',
    text3:  isDark ? '#6b8f7b' : '#6b8f7b',
    accent: '#2d7a5a',
    dark:   isDark ? '#0f1f17' : '#1a4a36',
    white:  '#ffffff',
    serif:  "'Playfair Display', Georgia, serif",
    sans:   "'DM Sans', sans-serif",
  };

  const footerDarkBg = '#0f1a15';
  const footerLightBg = '#1a4a36'; // C.dark in Home.jsx

  return (
    <footer style={{ background: isDark ? footerDarkBg : footerLightBg, padding: '72px 48px 36px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 44, marginBottom: 52 }}>
          <div>
            <div style={{ fontFamily: colors.serif, fontSize: 26, fontWeight: 600, fontStyle: 'italic', color: isDark ? colors.text : 'rgba(181,228,202,0.85)', marginBottom: 6 }}>Afalou Tours</div>
            <p style={{ fontFamily: colors.sans, fontSize: 13, color: isDark ? colors.text3 : 'rgba(216,243,220,0.55)', lineHeight: 1.8, fontWeight: 300 }}>{t('footer.description')}</p>
          </div>
          {[
            { title: t('footer.explorer'), links: [
              { label: t('footer.destinations'), to: '/destinations' },
              { label: t('footer.about'), to: '/about' },
              { label: t('nav.contact'), to: '/contact' },
            ]},
          ].map(col => (
            <div key={col.title}>
              <h4 style={{ fontFamily: colors.sans, fontSize: 10, fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: isDark ? colors.text3 : 'rgba(181,228,202,0.55)', marginBottom: 20 }}>{col.title}</h4>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 11 }}>
                {col.links.map(l => (
                  <li key={l.label}>
                    <Link to={l.to} style={{ fontFamily: colors.sans, fontSize: 13, color: isDark ? colors.text3 : 'rgba(216,243,220,0.55)', textDecoration: 'none', fontWeight: 300 }}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h4 style={{ fontFamily: colors.sans, fontSize: 10, fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: isDark ? colors.text3 : 'rgba(216,243,220,0.55)', marginBottom: 20 }}>{t('footer.contact')}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              <div style={{ display: 'flex', gap: 8, fontSize: 13, color: isDark ? colors.text3 : 'rgba(216,243,220,0.55)', fontWeight: 300 }}><MapPin size={13}/> {t('footer.address')}</div>
              <div style={{ display: 'flex', gap: 8, fontSize: 13, color: isDark ? colors.text3 : 'rgba(216,243,220,0.55)', fontWeight: 300 }}><Phone size={13}/> +213 34 12 04 84</div>
              <div style={{ display: 'flex', gap: 8, fontSize: 13, color: isDark ? colors.text3 : 'rgba(216,243,220,0.55)', fontWeight: 300 }}><Mail size={13}/> afaloutours@gmail.com</div>
            </div>
          </div>
        </div>
        <div style={{ borderTop: `1px solid ${isDark ? colors.border : 'rgba(181,228,202,0.12)'}`, paddingTop: 28, textAlign: 'center' }}>
          <p style={{ fontFamily: colors.sans, fontSize: 12, color: isDark ? colors.text3 : 'rgba(216,243,220,0.35)', fontWeight: 300 }}>{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


