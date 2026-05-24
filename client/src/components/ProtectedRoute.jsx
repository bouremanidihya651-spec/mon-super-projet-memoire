import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, loading, isAdmin } = useAuth();

  if (loading) {
    // You could return a loading spinner here
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]"></div>
          <p className="mt-4 text-lg">Chargement...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to home page
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If a specific role is required, check if user has that role
  if (requiredRole === 'admin' && !isAdmin()) {
    // Redirect non-admin users to user dashboard instead of home
    return <Navigate to="/dashboard" replace />;
  }

  // If authenticated, render the protected component
  return children;
};

export default ProtectedRoute;

