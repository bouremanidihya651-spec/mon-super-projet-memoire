import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart, Star, MapPin, X, ChevronRight, Search,
  Calendar, DollarSign, Info, Send
} from 'lucide-react';
import { motion } from 'framer-motion';

const BrowseDestinations = () => {
  const [activeTab, setActiveTab] = useState('destinations');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/${activeTab}`);
      const data = await res.json();
      setItems(data[activeTab] || data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = items.filter(item =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-6 bg-background min-h-screen">

      {/* HEADER */}
      <h1 className="text-3xl font-bold mb-2 text-primaryDark">
        Explorer
      </h1>
      <p className="text-textMuted mb-6">
        Découvrez nos destinations, hôtels et activités
      </p>

      {/* SEARCH */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Rechercher..."
          className="w-full bg-white border border-borderSoft rounded-xl py-3 px-4 pl-12 text-textMain focus:outline-none focus:border-primary"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted" />
      </div>

      {/* TABS */}
      <div className="bg-white rounded-xl border border-borderSoft overflow-hidden mb-8 shadow-sm">
        <div className="flex">
          {['destinations', 'hotels', 'activities'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 font-semibold ${
                activeTab === tab
                  ? 'bg-primary text-white'
                  : 'text-textMuted hover:text-primary hover:bg-primary/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <p className="text-center">Chargement...</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {filtered.map(item => (
            <ItemCard key={item.id} item={item} onClick={() => setSelectedItem(item)} />
          ))}
        </div>
      )}

      {/* MODAL */}
      {selectedItem && (
        <ItemModal item={selectedItem} onClose={() => setSelectedItem(null)} navigate={navigate} />
      )}
    </div>
  );
};

/* ================= CARD ================= */

const ItemCard = ({ item, onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-2xl border border-borderSoft overflow-hidden hover:shadow-lg cursor-pointer"
      onClick={onClick}
    >
      <div className="relative h-48">
        <img src={item.image_url} className="w-full h-full object-cover" />

        <div className="absolute bottom-3 left-3 bg-primaryDark/80 px-3 py-1 rounded-md">
          <span className="text-white font-bold text-sm">
            {item.price}DA
          </span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-bold text-lg text-primaryDark">{item.name}</h3>
        <p className="text-sm text-textMuted line-clamp-2">
          {item.description}
        </p>

        <button className="mt-4 w-full bg-primary text-white py-2 rounded-lg hover:bg-primaryDark transition">
          Détails
        </button>
      </div>
    </motion.div>
  );
};

/* ================= MODAL ================= */

const ItemModal = ({ item, onClose, navigate }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">

      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-xl overflow-hidden">

        {/* HEADER */}
        <div className="flex justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-primaryDark">{item.name}</h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* IMAGE */}
        <img src={item.image_url} className="w-full h-64 object-cover" />

        {/* CONTENT */}
        <div className="p-6">
          <p className="text-textMuted mb-4">{item.description}</p>

          <div className="flex gap-4 mb-6">
            <div className="bg-primaryDark text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <Star size={16} /> {item.rating}
            </div>

            <div className="bg-primaryDark text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <MapPin size={16} /> {item.location}
            </div>

            <div className="bg-primaryDark text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <DollarSign size={16} /> {item.price}DA
            </div>
          </div>

          <button
            onClick={() => navigate(`/details/${item.id}`)}
            className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primaryDark transition flex items-center justify-center gap-2"
          >
            Voir plus <ChevronRight size={18} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default BrowseDestinations;

