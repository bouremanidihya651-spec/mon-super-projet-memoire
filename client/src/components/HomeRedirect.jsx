import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Home from '../pages/Home';

const HomeRedirect = ({ openAuthModal, isChatbotOpen, toggleChatbot }) => {
  const { isAuthenticated, loading, isAdmin } = useAuth();

  // LOADING
  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a4a36] flex items-center justify-center">
        <div className="flex flex-col items-center">

          {/* Spinner */}
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e0dcd4]"></div>

          {/* Text */}
          <p className="mt-4 text-lg text-[#e0dcd4] font-medium">
            Chargement...
          </p>

        </div>
      </div>
    );
  }

  // REDIRECT
  if (isAuthenticated) {
    return <Navigate to={isAdmin() ? "/admin" : "/dashboard"} replace />;
  }

  // HOME
  return (
    <Home
      openAuthModal={openAuthModal}
      isChatbotOpen={isChatbotOpen}
      toggleChatbot={toggleChatbot}
    />
  );
};

export default HomeRedirect;
