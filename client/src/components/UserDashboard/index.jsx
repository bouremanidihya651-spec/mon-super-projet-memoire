import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AuthModal from '../AuthModal';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Sidebar from './components/Sidebar';
import DashboardContent from './components/DashboardContent';
import SettingsContent from './components/SettingsContent';
import FavoritesContent from './components/FavoritesContent';
import RecommendationsContent from './components/RecommendationsContent';
import ReservationsContent from './components/ReservationsContent';
import MesFactures from './components/MesFactures';
import InvoiceModal from './components/InvoiceModal';
import usePreventNavigation from '../../hooks/usePreventNavigation';

/**
 * Main UserDashboard component - Fully Responsive
 */
const UserDashboard = ({ isChatbotOpen, toggleChatbot }) => {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();

  // Prevent navigation and logout if back button is pressed
  usePreventNavigation(logout);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [reservationId, setReservationId] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  const openAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => setIsAuthModalOpen(false);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check for reservation query param on mount (after payment redirect)
  useEffect(() => {
    const reservationParam = searchParams.get('reservation');
    if (reservationParam) {
      setReservationId(reservationParam);
      setShowInvoiceModal(true);
      navigate('/dashboard', { replace: true });
    }
  }, [searchParams, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f7f5f0] dark:bg-dark-bg text-[#1a4a36] dark:text-dark-text flex items-center justify-center px-4">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-[#2d7a5a]"></div>
          <p className="mt-4 text-base sm:text-lg text-center">{t('dashboard.loading')}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f7f5f0] dark:bg-dark-bg text-[#1a4a36] dark:text-dark-text flex items-center justify-center px-4">
        <div className="text-center p-6 sm:p-8 max-w-md w-full">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">{t('dashboard.accessDenied')}</h2>
          <p className="text-[#6b8f7b] dark:text-dark-text-muted mb-6 text-sm sm:text-base">
            {t('dashboard.loginToAccess')}
          </p>
          <button
            onClick={() => openAuthModal('login')}
            className="w-full sm:w-auto bg-[#2d7a5a] text-white px-6 py-3 rounded-full font-medium hover:bg-[#1a4a36] transition-colors"
          >
            {t('dashboard.login')}
          </button>
        </div>
      </div>
    );
  }

  const dashboardUser = {
    name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : (user?.firstName || user?.first_name || user?.email?.split('@')[0] || "Voyageur"),
    firstName: user?.firstName || user?.first_name,
    lastName: user?.lastName || user?.last_name,
    email: user?.email || "email@exemple.com",
    isPremium: user?.role === 'admin',
    profilePhoto: user?.profilePhoto
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#f7f5f0] dark:bg-dark-bg text-[#1a4a36] dark:text-dark-text relative font-sans overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && isMobile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        setSidebarOpen={setSidebarOpen}
        dashboardUser={dashboardUser}
        onLogout={logout}
        isMobile={isMobile}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative min-w-0">
        
        {/* Mobile Header */}
        <header className="lg:hidden flex-shrink-0 p-3 sm:p-4 border-b border-[#e0dcd4] dark:border-dark-border flex items-center justify-between bg-white dark:bg-dark-surface shadow-sm">
          <button 
            onClick={() => setSidebarOpen(true)} 
            className="p-2 text-[#6b8f7b] dark:text-dark-text-muted hover:bg-[#f0ede8] dark:hover:bg-dark-border rounded-lg transition-colors"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <h1 className="text-lg sm:text-xl font-serif font-bold text-[#2d7a5a] dark:text-surface truncate px-2">
            Afalou
          </h1>
          <div className="w-10"></div>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 md:p-8 lg:p-10 scroll-smooth">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="max-w-7xl mx-auto"
          >
            {activeTab === 'dashboard' && (
              <DashboardContent 
                dashboardUser={dashboardUser} 
                setActiveTab={handleTabChange} 
              />
            )}
            {activeTab === 'favorites' && (
              <FavoritesContent openAuthModal={openAuthModal} t={t} />
            )}
            {activeTab === 'recommendations' && (
              <RecommendationsContent openAuthModal={openAuthModal} t={t} />
            )}
            {activeTab === 'reservations' && (
              <ReservationsContent openAuthModal={openAuthModal} t={t} />
            )}
            {activeTab === 'invoices' && <MesFactures />}
            {activeTab === 'settings' && <SettingsContent t={t} />}
          </motion.div>
        </main>
      </div>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        initialView={authModalMode}
      />

      <InvoiceModal
        isOpen={showInvoiceModal}
        reservationId={reservationId}
        onClose={() => setShowInvoiceModal(false)}
      />
    </div>
  );
};

export default UserDashboard;