import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { GoogleOAuthProvider } from '@react-oauth/google';

import HomeRedirect from './components/HomeRedirect';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Destinations from './pages/Destinations';
import DestinationDetail from './pages/DestinationDetail';
import Hotels from './pages/Hotels';
import HotelDetail from './pages/HotelDetail';
import Activities from './pages/Activities';
import ActivityDetail from './pages/ActivityDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PaymentSuccess from './pages/PaymentSuccess';

import UserDashboard from './components/UserDashboard/index';
import Settings from './components/Settings';
import AdminDashboard from './components/AdminDashboard';

import AuthModal from './components/AuthModal';
import Chatbot from './components/Chatbot';
import Navigation from './components/Navigation';

import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';

// --------------------------------
// Wrapper principal (Navbar + Modal + Chatbot)
const AppWrapper = ({ children, showNav = true, isChatbotOpen, toggleChatbot, openAuthModal }) => {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans">
      {showNav && <Navigation openAuthModal={openAuthModal} toggleChatbot={toggleChatbot} />}

      <main>
        {children}
      </main>

      <Chatbot isOpen={isChatbotOpen} onClose={toggleChatbot} />

      {/* Floating Action Button (FAB) for Chatbot - hidden when chat is open */}
      {!isChatbotOpen && (
        <button
          onClick={toggleChatbot}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#c9a844] flex items-center justify-center shadow-lg hover:scale-110 hover:bg-[#b08a30] transition-all duration-200"
          aria-label="Ouvrir le chat"
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </button>
      )}
    </div>
  );
};

// --------------------------------
// Layout conditionnel pour cacher Navbar dans dashboard/admin/settings
const ConditionalLayout = ({ children, isChatbotOpen, toggleChatbot, openAuthModal }) => {
  const location = useLocation();
  const hideNav =
    location.pathname.includes('/dashboard') ||
    location.pathname.includes('/settings') ||
    location.pathname.includes('/admin');

  return (
    <AppWrapper showNav={!hideNav} isChatbotOpen={isChatbotOpen} toggleChatbot={toggleChatbot} openAuthModal={openAuthModal}>
      {children}
    </AppWrapper>
  );
};

// --------------------------------
// Routes principales
const AppContent = () => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const toggleChatbot = () => setIsChatbotOpen(prev => !prev);

  const openAuthModal = (mode = 'login') => {
    console.log('Opening auth modal:', mode);
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    console.log('Closing auth modal');
    setIsAuthModalOpen(false);
  };

  return (
    <>
      <Routes>
        <Route path="/" element={
          <ConditionalLayout isChatbotOpen={isChatbotOpen} toggleChatbot={toggleChatbot} openAuthModal={openAuthModal}>
            <HomeRedirect />
          </ConditionalLayout>
        } />

        <Route path="/destinations" element={
          <ConditionalLayout isChatbotOpen={isChatbotOpen} toggleChatbot={toggleChatbot} openAuthModal={openAuthModal}>
            <Destinations key="destinations" />
          </ConditionalLayout>
        } />

        <Route path="/destinations/:id" element={
          <ConditionalLayout isChatbotOpen={isChatbotOpen} toggleChatbot={toggleChatbot} openAuthModal={openAuthModal}>
            <DestinationDetail />
          </ConditionalLayout>
        } />

        <Route path="/hotels" element={
          <ConditionalLayout isChatbotOpen={isChatbotOpen} toggleChatbot={toggleChatbot} openAuthModal={openAuthModal}>
            <Hotels />
          </ConditionalLayout>
        } />

        <Route path="/hotels/:id" element={
          <ConditionalLayout isChatbotOpen={isChatbotOpen} toggleChatbot={toggleChatbot} openAuthModal={openAuthModal}>
            <HotelDetail />
          </ConditionalLayout>
        } />

        <Route path="/activities" element={
          <ConditionalLayout isChatbotOpen={isChatbotOpen} toggleChatbot={toggleChatbot} openAuthModal={openAuthModal}>
            <Activities />
          </ConditionalLayout>
        } />

        <Route path="/activities/:id" element={
          <ConditionalLayout isChatbotOpen={isChatbotOpen} toggleChatbot={toggleChatbot} openAuthModal={openAuthModal}>
            <ActivityDetail />
          </ConditionalLayout>
        } />

        <Route path="/about" element={
          <ConditionalLayout isChatbotOpen={isChatbotOpen} toggleChatbot={toggleChatbot} openAuthModal={openAuthModal}>
            <About />
          </ConditionalLayout>
        } />

        <Route path="/contact" element={
          <ConditionalLayout isChatbotOpen={isChatbotOpen} toggleChatbot={toggleChatbot} openAuthModal={openAuthModal}>
            <Contact />
          </ConditionalLayout>
        } />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/dashboard" element={
          <ConditionalLayout isChatbotOpen={isChatbotOpen} toggleChatbot={toggleChatbot} openAuthModal={openAuthModal}>
            <ProtectedRoute>
              <UserDashboard isChatbotOpen={isChatbotOpen} toggleChatbot={toggleChatbot} />
            </ProtectedRoute>
          </ConditionalLayout>
        } />

        <Route path="/settings" element={
          <ConditionalLayout isChatbotOpen={isChatbotOpen} toggleChatbot={toggleChatbot} openAuthModal={openAuthModal}>
            <ProtectedRoute>
              <Settings isChatbotOpen={isChatbotOpen} toggleChatbot={toggleChatbot} />
            </ProtectedRoute>
          </ConditionalLayout>
        } />

        <Route path="/admin" element={
          <ConditionalLayout isChatbotOpen={isChatbotOpen} toggleChatbot={toggleChatbot} openAuthModal={openAuthModal}>
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard isChatbotOpen={isChatbotOpen} toggleChatbot={toggleChatbot} />
            </ProtectedRoute>
          </ConditionalLayout>
        } />

        <Route path="/payment/success" element={
          <ConditionalLayout isChatbotOpen={isChatbotOpen} toggleChatbot={toggleChatbot} openAuthModal={openAuthModal}>
            <PaymentSuccess />
          </ConditionalLayout>
        } />

        <Route path="/payment/success/:reservationId" element={
          <ConditionalLayout isChatbotOpen={isChatbotOpen} toggleChatbot={toggleChatbot} openAuthModal={openAuthModal}>
            <PaymentSuccess />
          </ConditionalLayout>
        } />
      </Routes>

      {/* AuthModal rendered outside Routes to maintain state */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        initialView={authMode}
      />
    </>
  );
};

// --------------------------------
// App principal
const App = () => {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <AppContent />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
};

export default App;


