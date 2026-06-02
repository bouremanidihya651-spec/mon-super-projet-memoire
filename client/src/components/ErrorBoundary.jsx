import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Component stack:', info?.componentStack);
    this.setState({ info });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, info: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const isDark = document.documentElement.classList.contains('dark');
    const bg = isDark ? '#0f1412' : '#f7f5f0';
    const text = isDark ? '#e8ece9' : '#1a4a36';
    const muted = isDark ? '#9db8aa' : '#6b8f7b';
    const panel = isDark ? '#1a2320' : '#ffffff';
    const border = isDark ? '#2d3a36' : '#e0dcd4';

    return (
      <div style={{ minHeight: '100vh', background: bg, color: text, fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 560, width: '100%', background: panel, border: `1px solid ${border}`, borderRadius: 16, padding: 32 }}>
          <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#dc2626', marginBottom: 12 }}>
            Erreur d'affichage
          </p>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 28, fontWeight: 700, fontStyle: 'italic', marginBottom: 12, lineHeight: 1.2 }}>
            Une erreur est survenue
          </h1>
          <p style={{ fontSize: 14, color: muted, marginBottom: 16, lineHeight: 1.5 }}>
            La page n'a pas pu s'afficher correctement. Détail technique :
          </p>
          <pre style={{ background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: 12, fontSize: 12, color: '#dc2626', overflow: 'auto', maxHeight: 200, marginBottom: 20, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {String(this.state.error?.message || this.state.error || 'Erreur inconnue')}
          </pre>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={this.handleReload} style={{ background: '#2d7a5a', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 20px', fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>
              Recharger la page
            </button>
            <button onClick={this.handleReset} style={{ background: 'transparent', color: muted, border: `1px solid ${border}`, borderRadius: 10, padding: '12px 20px', fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>
              Réessayer
            </button>
            <a href="/" style={{ background: 'transparent', color: muted, border: `1px solid ${border}`, borderRadius: 10, padding: '12px 20px', fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
              Retour à l'accueil
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
