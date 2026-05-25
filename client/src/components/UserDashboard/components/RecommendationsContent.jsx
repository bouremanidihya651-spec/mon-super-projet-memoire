// RecommendationsContent.jsx - VERSION CORRIGÉE
import React, { useState, useEffect } from 'react';
import { Star, MapPin, ChevronRight, Heart, Search } from 'lucide-react';

const RecommendationCard = ({ destination, onViewDetails }) => {
  const imageUrl = destination.image_url || 'https://images.unsplash.com/photo-1567874790230-3acbb51e61dd?auto=format&fit=crop&w=800&q=80';
  const locationBadge = destination.country || destination.location || 'ALGÉRIE';

  return (
    <div className="w-full rounded-xl overflow-hidden border border-stone-200 bg-white hover:shadow-lg transition-shadow">
      <div className="relative aspect-[4/3] overflow-hidden group cursor-pointer" onClick={onViewDetails}>
        <img
          src={imageUrl}
          alt={destination.name || 'Destination'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          loading="lazy"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1567874790230-3acbb51e61dd?auto=format&fit=crop&w=800&q=80'; }}
        />
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 bg-black/60 rounded text-white text-xs uppercase">
          <MapPin size={12} />  {/* ✅ CORRIGÉ : size au lieu de className */}
          {locationBadge}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-xl font-bold text-[#1a4a36] mb-2">{destination.name}</h3>
        <button onClick={onViewDetails} className="flex items-center gap-1 text-[#2d7a5a] text-sm uppercase">
          Découvrir <ChevronRight size={16} />  {/* ✅ CORRIGÉ : size au lieu de className */}
        </button>
      </div>
    </div>
  );
};

const RecommendationsContent = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testData = [
      { id: 1, name: 'Béjaïa', country: 'ALGÉRIE', location: 'Béjaïa', image_url: 'https://images.unsplash.com/photo-1567874790230-3acbb51e61dd?auto=format&fit=crop&w=800&q=80' },
      { id: 2, name: 'Ghardaïa', country: 'ALGÉRIE', location: 'Ghardaïa', image_url: 'https://images.unsplash.com/photo-1567874790230-3acbb51e61dd?auto=format&fit=crop&w=800&q=80' },
      { id: 3, name: 'Skikda', country: 'ALGÉRIE', location: 'Skikda', image_url: 'https://images.unsplash.com/photo-1567874790230-3acbb51e61dd?auto=format&fit=crop&w=800&q=80' }
    ];
    
    setTimeout(() => {
      setItems(testData);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Star size={48} className="mx-auto mb-4 text-[#2d7a5a] opacity-20 animate-pulse" />
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-white">Recommandations</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(dest => (
          <RecommendationCard key={dest.id} destination={dest} onViewDetails={() => console.log('Click:', dest.name)} />
        ))}
      </div>
    </div>
  );
};

export default RecommendationsContent;