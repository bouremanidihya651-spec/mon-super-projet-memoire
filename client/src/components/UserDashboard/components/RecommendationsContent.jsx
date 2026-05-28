import React, { useState, useEffect } from 'react';
import { Star, MapPin, ChevronRight } from 'lucide-react';
import DestinationDetailPage from './DestinationDetailPage';

const RecommendationsContent = ({ openAuthModal, onViewDestination }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem('token');
      try {
        const url = token
          ? `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/recommendations/hybrid?limit=15`
          : `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/recommendations/popular?limit=15`;
        const headers = token
          ? { Authorization: `Bearer ${token}` }
          : {};
        const res = await fetch(url, { headers });
        const data = await res.json();
        setItems(data.recommendations || []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (selectedItem) {
    return (
      <DestinationDetailPage
        item={selectedItem}
        onBack={() => setSelectedItem(null)}
        openAuthModal={openAuthModal}
      />
    );
  }

  if (loading) {
    return (
      <div style={{ padding: '80px 16px', textAlign: 'center' }}>
        <Star size={40} style={{ margin: '0 auto 16px', color: '#2d7a5a', opacity: 0.3 }} />
        <p style={{ color: '#78716c' }}>Chargement...</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', padding: '0' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontFamily: 'serif', fontWeight: 700, color: '#1a4a36', margin: '0 0 6px' }}>
          Explorez l'Algérie
        </h1>
        <p style={{ fontSize: 14, color: '#78716c', margin: 0 }}>
          Sélection personnalisée pour vous
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 24
      }}>
        {items.map(dest => (
          <div
            key={dest.id}
            onClick={() => setSelectedItem(dest)}
            style={{
              borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
              border: '1px solid #e5e7eb', background: 'white',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            }}
          >
            <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden' }}>
              <img
                src={dest.image_url || 'https://images.unsplash.com/photo-1567874790230-3acbb51e61dd?w=800'}
                alt={dest.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                loading="lazy"
              />
              <div style={{
                position: 'absolute', top: 12, left: 12,
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 10px', background: 'rgba(0,0,0,0.55)',
                borderRadius: 6, color: 'white', fontSize: 11, textTransform: 'uppercase'
              }}>
                <MapPin size={11} />
                {dest.country || dest.location || 'ALGÉRIE'}
              </div>
              {(dest.matchPercentage || 0) > 0 && (
                <div style={{
                  position: 'absolute', top: 12, right: 12,
                  padding: '5px 10px', borderRadius: 6,
                  background: '#2d7a5a', color: 'white',
                  fontSize: 10, fontWeight: 700, textTransform: 'uppercase'
                }}>
                  {dest.matchPercentage}% Match
                </div>
              )}
            </div>
            <div style={{ padding: '16px 20px' }}>
              <h3 style={{ fontSize: 20, fontFamily: 'serif', fontWeight: 700, color: '#1a4a36', margin: '0 0 8px' }}>
                {dest.name}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#2d7a5a', fontSize: 13, fontWeight: 600 }}>
                Découvrir <ChevronRight size={14} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendationsContent;
