import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const LuxuryAuthModal = ({ isOpen, onClose, initialView = 'login' }) => {
  const [currentView, setCurrentView] = useState(initialView); // 'login' or 'signup'

  // Mettre à jour la vue quand initialView change
  useEffect(() => {
    setCurrentView(initialView);
  }, [initialView]);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { login, signup } = useAuth();

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    if (!formData.password) {
      newErrors.password = 'Mot de passe requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mot de passe doit contenir au moins 6 caractères';
    }

    if (currentView === 'signup') {
      if (!formData.firstName) {
        newErrors.firstName = 'Prénom requis';
      }

      if (!formData.lastName) {
        newErrors.lastName = 'Nom requis';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      let result;
      if (currentView === 'login') {
        result = await login(formData.email, formData.password);
      } else {
        result = await signup(
          formData.firstName,
          formData.lastName,
          formData.email,
          formData.password
        );
      }

      if (result.success) {
        // Show success message if in simulation mode
        if (result.message) {
          setErrors({ submit: result.message });
          // Close modal after a short delay to show the message
          setTimeout(() => {
            onClose();
          }, 2000);
        } else {
          // Close modal after successful authentication
          onClose();
        }
      } else {
        setErrors({ submit: result.message || 'Une erreur est survenue' });
      }
    } catch (error) {
      console.error(`${currentView} error:`, error);
      setErrors({ submit: error.message || 'Une erreur est survenue lors de l\'authentification' });
    } finally {
      setIsLoading(false);
    }
  };

  const switchView = () => {
    setCurrentView(currentView === 'login' ? 'signup' : 'login');
    setErrors({});
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 w-full max-w-6xl h-[600px] relative overflow-hidden flex">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex h-full overflow-hidden">
          {/* Section Image - Visible uniquement sur desktop */}
          <div className="hidden lg:block w-1/2 relative">
            <div className={`absolute inset-0 ${currentView === 'login' ? 'bg-gradient-to-br from-gray-900 via-yellow-900/20 to-gray-900' : 'bg-gradient-to-br from-gray-900 via-yellow-900/20 to-gray-900'}`}></div>
            <div className="absolute bottom-12 left-12 text-white">
              <p className="uppercase tracking-[0.3em] text-xs mb-2">{currentView === 'login' ? 'Rejoignez-nous' : 'Bienvenue'}</p>
              <h2 className="text-4xl font-serif italic">{currentView === 'login' ? 'Découvrez un Monde...' : 'Vivez une Expérience...'}</h2>
            </div>
          </div>

          {/* Section Formulaire */}
          <div className="w-full lg:w-1/2 bg-[#0A0A0A] flex flex-col justify-center px-8 lg:px-16">
            <h2 className="text-2xl font-bold mb-8 text-center text-white">
              {currentView === 'login' ? 'Connexion' : 'Créer un compte'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {currentView === 'signup' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Prénom</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className={`w-full bg-[#2a2a2a] border ${errors.firstName ? 'border-red-500' : 'border-gray-700'} rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      placeholder="Votre prénom"
                    />
                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Nom</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className={`w-full bg-[#2a2a2a] border ${errors.lastName ? 'border-red-500' : 'border-gray-700'} rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      placeholder="Votre nom"
                    />
                    {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm text-gray-400 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={`w-full bg-[#2a2a2a] border ${errors.email ? 'border-red-500' : 'border-gray-700'} rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  placeholder="votre@email.com"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Mot de passe</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className={`w-full bg-[#2a2a2a] border ${errors.password ? 'border-red-500' : 'border-gray-700'} rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 pr-12 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              {currentView === 'signup' && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Confirmer le mot de passe</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className={`w-full bg-[#2a2a2a] border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-700'} rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 pr-12 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>
              )}

              {errors.submit && (
                <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-md">
                  <p className="text-red-400 text-sm">{errors.submit}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-[#D4AF37] text-black py-3 rounded-lg font-bold text-sm uppercase tracking-widest hover:bg-yellow-600 transition disabled:opacity-50 ${isLoading ? 'opacity-70' : ''}`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Chargement...
                  </span>
                ) : (
                  currentView === 'login' ? 'Se connecter' : 'Créer mon compte'
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-400">
                {currentView === 'login' ? "Vous n'avez pas de compte ? " : "Vous avez déjà un compte ? "}
                <button
                  onClick={switchView}
                  disabled={isLoading}
                  className="text-[#D4AF37] hover:underline ml-1"
                >
                  {currentView === 'login' ? 'S\'inscrire' : 'Se connecter'}
                </button>
              </p>
            </div>
            
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-[#0A0A0A] text-zinc-500 text-sm">Ou continuer avec</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="w-full inline-flex justify-center py-3 px-4 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  disabled={isLoading}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span className="ml-2">Google</span>
                </button>

                <button
                  type="button"
                  className="w-full inline-flex justify-center py-3 px-4 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  disabled={isLoading}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span className="ml-2">Facebook</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LuxuryAuthModal;

