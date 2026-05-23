import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
 * Main UserDashboard component
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

  const openAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => setIsAuthModalOpen(false);

  // Check for reservation query param on mount (after payment redirect)
  useEffect(() => {
    const reservationParam = searchParams.get('reservation');
    if (reservationParam) {
      setReservationId(reservationParam);
      setShowInvoiceModal(true);
      // Clean up the URL after showing the modal
      navigate('/dashboard', { replace: true });
    }
  }, [searchParams, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f7f5f0] dark:bg-dark-bg text-[#1a4a36] dark:text-dark-text flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2d7a5a]"></div>
          <p className="mt-4 text-lg">{t('dashboard.loading')}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f7f5f0] dark:bg-dark-bg text-[#1a4a36] dark:text-dark-text flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">{t('dashboard.accessDenied')}</h2>
          <p className="text-[#6b8f7b] dark:text-dark-text-muted mb-6">{t('dashboard.loginToAccess')}</p>
          <button
            onClick={() => openAuthModal('login')}
            className="bg-[#2d7a5a] text-white px-6 py-3 rounded-full font-medium hover:bg-[#1a4a36] transition-colors"
          >
            {t('dashboard.login')}
          </button>
        </div>
      </div>
    );
  }

  const dashboardUser = {
    name: user?.firstName || user?.first_name || user?.email?.split('@')[0] || "Voyageur",
    email: user?.email || "email@exemple.com",
    isPremium: true,
    profilePhoto: user?.profilePhoto
  };

  return (
    <div className="flex h-screen bg-[#f7f5f0] dark:bg-dark-bg text-[#1a4a36] dark:text-dark-text relative font-sans">
      <Sidebar
        sidebarOpen={sidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setSidebarOpen={setSidebarOpen}
        dashboardUser={dashboardUser}
        onLogout={logout}
      />

      <div className="flex-1 flex flex-col h-full relative">
        <header className="lg:hidden p-4 border-b border-[#e0dcd4] dark:border-dark-border flex items-center justify-between bg-white dark:bg-dark-surface">
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-[#6b8f7b] dark:text-dark-text-muted"><Menu size={24} /></button>
          <h1 className="text-xl font-serif font-bold text-[#2d7a5a] dark:text-surface">Afalou</h1>
          <div className="w-8"></div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          {activeTab === 'dashboard' && <DashboardContent dashboardUser={dashboardUser} setActiveTab={setActiveTab} />}
          {activeTab === 'favorites' && <FavoritesContent openAuthModal={openAuthModal} t={t} />}
          {activeTab === 'recommendations' && <RecommendationsContent openAuthModal={openAuthModal} t={t} />}
          {activeTab === 'reservations' && <ReservationsContent openAuthModal={openAuthModal} t={t} />}
          {activeTab === 'invoices' && <MesFactures />}
          {activeTab === 'settings' && <SettingsContent t={t} />}
        </main>
      </div>

      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setSidebarOpen(false)}></div>}

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
