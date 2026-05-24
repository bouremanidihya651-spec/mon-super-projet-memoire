import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

const Navigation = ({ openAuthModal, toggleChatbot }) => {
  const location = useLocation();
  const { isAuthenticated, logout, isAdmin } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="flex justify-between items-center px-12 py-5 bg-black border-b border-zinc-800 sticky top-0 z-50">
      <Link to="/">
        <div className="text-2xl font-serif font-bold text-[#D4AF37] tracking-tight">
          Afalou
        </div>
      </Link>

      <div className="hidden md:flex space-x-8 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400">
        <Link
          to="/"
          className={`${location.pathname === '/' ? 'text-[#D4AF37] border-b-2 border-[#D4AF37] pb-1' : 'hover:text-white'} transition-colors`}
        >
          Accueil
        </Link>
        <Link
          to="/destinations"
          className={`${location.pathname === '/destinations' ? 'text-[#D4AF37] border-b-2 border-[#D4AF37] pb-1' : 'hover:text-white'} transition-colors`}
        >
          Destinations
        </Link>
        <Link
          to="/hotels"
          className={`${location.pathname === '/hotels' ? 'text-[#D4AF37] border-b-2 border-[#D4AF37] pb-1' : 'hover:text-white'} transition-colors`}
        >
          Hôtels
        </Link>
        <Link
          to="/activities"
          className={`${location.pathname === '/activities' ? 'text-[#D4AF37] border-b-2 border-[#D4AF37] pb-1' : 'hover:text-white'} transition-colors`}
        >
          Activités
        </Link>
        <Link
          to="/about"
          className={`${location.pathname === '/about' ? 'text-[#D4AF37] border-b-2 border-[#D4AF37] pb-1' : 'hover:text-white'} transition-colors`}
        >
          À Propos
        </Link>
      </div>

      <div className="flex items-center space-x-6">
        <button
          onClick={toggleChatbot}
          className="p-2 hover:bg-[#D4AF37]/10 rounded-full transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
        
        {isAuthenticated ? (
          <div className="flex items-center space-x-4">
            {isAdmin() ? (
              <Link
                to="/admin"
                className="text-[11px] font-bold uppercase tracking-widest hover:text-[#D4AF37] transition-colors"
              >
                Admin
              </Link>
            ) : (
              <Link
                to="/dashboard"
                className="text-[11px] font-bold uppercase tracking-widest hover:text-[#D4AF37] transition-colors"
              >
                Mon Compte
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="bg-[#D4AF37] text-black px-6 py-2.5 rounded-md font-bold text-[11px] uppercase tracking-widest hover:bg-yellow-500 transition"
            >
              Déconnexion
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => openAuthModal('login')}
              className="text-[11px] font-bold uppercase tracking-widest hover:text-[#D4AF37] transition-colors"
            >
              Connexion
            </button>
            <button
              onClick={() => openAuthModal('signup')}
              className="bg-[#D4AF37] text-black px-6 py-2.5 rounded-md font-bold text-[11px] uppercase tracking-widest hover:bg-yellow-500 transition"
            >
              S'inscrire
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navigation;

