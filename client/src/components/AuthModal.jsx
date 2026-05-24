import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import { Plane, Mountain, Waves, Utensils, Crown, Landmark, X, Mail, Lock, User, ArrowRight, Loader2, Backpack, Heart, Users, Briefcase } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AuthModal = ({ isOpen, onClose, initialView = 'login' }) => {
  const { t } = useTranslation();
  const [currentView, setCurrentView] = useState(initialView);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    age: '',
    gender: '',
    travelerType: '',
    minBudget: '',
    maxBudget: '',
    luxury_score: 0.5,
    nature_score: 0.5,
    adventure_score: 0.5,
    culture_score: 0.5,
    beach_score: 0.5,
    food_score: 0.5,
    preferredTags: []
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { login, signup, googleAuth } = useAuth();

  const handleGoogleSuccess = async (tokenResponse) => {
    setIsLoading(true);
    try {
      const accessToken = tokenResponse.access_token;
      if (!accessToken) throw new Error('Access token non reçu de Google');
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const userInfo = await userInfoResponse.json();
      const email = userInfo.email || '';
      const firstName = userInfo.given_name || '';
      const lastName = userInfo.family_name || '';
      
      // Utiliser le nouvel endpoint Google auth qui gère automatiquement login/inscription
      const result = await googleAuth({
        email,
        firstName,
        lastName,
        travelerType: 'solo',
        minBudget: 0,
        maxBudget: 10000,
        luxury_score: 0.5,
        nature_score: 0.5,
        adventure_score: 0.5,
        culture_score: 0.5,
        beach_score: 0.5,
        food_score: 0.5,
        preferredTags: []
      });
      
      if (result && result.success) {
        onClose();
      } else {
        setErrors({ submit: result?.message || 'Erreur lors de la connexion Google' });
      }
    } catch (error) {
      setErrors({ submit: error.message || 'Erreur lors de la connexion Google' });
    } finally { setIsLoading(false); }
  };

  const handleGoogleError = () => setErrors({ submit: 'Échec de la connexion Google' });

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: handleGoogleError,
    flow: 'implicit'
  });

  useEffect(() => {
    if (isOpen) {
      setCurrentView(initialView);
      setStep(1);
      setErrors({});
      setFormData({
        email: '', password: '', confirmPassword: '', firstName: '', lastName: '',
        age: '', gender: '', travelerType: '', minBudget: '', maxBudget: '',
        luxury_score: 0.5, nature_score: 0.5, adventure_score: 0.5,
        culture_score: 0.5, beach_score: 0.5, food_score: 0.5, preferredTags: []
      });
    }
  }, [initialView, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSliderChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: parseFloat(value) }));
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email requis';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email invalide';
    if (!formData.password) newErrors.password = 'Mot de passe requis';
    else if (formData.password.length < 6) newErrors.password = 'Au moins 6 caractères';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = 'Prénom requis';
    if (!formData.lastName) newErrors.lastName = 'Nom requis';
    if (!formData.travelerType) newErrors.travelerType = 'Type de voyageur requis';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const loginErrors = {};
    if (!formData.email) loginErrors.email = 'Email requis';
    if (!formData.password) loginErrors.password = 'Mot de passe requis';
    if (Object.keys(loginErrors).length > 0) { setErrors(loginErrors); return; }
    setIsLoading(true);
    try {
      const result = await login(formData.email, formData.password);
      if (result && result.success) { onClose(); }
      else { setErrors({ submit: result?.message || 'Échec de la connexion' }); }
    } catch (error) {
      setErrors({ submit: error.message || "Une erreur est survenue" });
    } finally { setIsLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;
    setIsLoading(true);
    try {
      const signupData = {
        username: formData.email, email: formData.email,
        password: formData.password || `google_${Date.now()}`,
        firstName: formData.firstName, lastName: formData.lastName,
        age: formData.age ? parseInt(formData.age) : undefined,
        gender: formData.gender || undefined,
        travelerType: formData.travelerType,
        minBudget: formData.minBudget ? parseFloat(formData.minBudget) : 0,
        maxBudget: formData.maxBudget ? parseFloat(formData.maxBudget) : 10000,
        luxury_score: formData.luxury_score, nature_score: formData.nature_score,
        adventure_score: formData.adventure_score, culture_score: formData.culture_score,
        beach_score: formData.beach_score, food_score: formData.food_score, preferredTags: []
      };
      const result = await signup(formData.email, formData.password || signupData.password, signupData);
      if (result && result.success) { onClose(); }
      else { setErrors({ submit: result?.message || 'Une erreur est survenue' }); }
    } catch (error) {
      setErrors({ submit: error.message || "Une erreur est survenue lors de l'inscription" });
    } finally { setIsLoading(false); }
  };

  const switchView = () => {
    setCurrentView(currentView === 'login' ? 'signup' : 'login');
    setStep(1);
    setErrors({});
  };

  const preferenceIcons = {
    luxury_score: Crown, nature_score: Mountain, adventure_score: Plane,
    culture_score: Landmark, beach_score: Waves, food_score: Utensils
  };

  const preferenceLabels = {
    luxury_score: 'Luxe', nature_score: 'Nature', adventure_score: 'Aventure',
    culture_score: 'Culture', beach_score: 'Plage', food_score: 'Gastronomie'
  };

  const travelerTypes = [
    { value: 'solo', label: 'Voyageur Solo', icon: <Backpack size={20} /> },
    { value: 'couple', label: 'En Couple', icon: <Heart size={20} /> },
    { value: 'family', label: 'En Famille', icon: <Users size={20} /> },
    { value: 'group', label: 'Entre Amis', icon: <Users size={20} /> },
    { value: 'business', label: "Voyage d'Affaires", icon: <Briefcase size={20} /> }
  ];

  const inputClass = (field) =>
    `w-full bg-surface border ${errors[field] ? 'border-red-500' : 'border-border-light'} rounded-md py-3 px-4 pl-11 text-text-primary placeholder-text-secondary/50 focus:outline-none focus:ring-1 focus:ring-nature-accent focus:border-nature-accent transition`;

  const GoogleButton = ({ label }) => (
    <button
      type="button"
      onClick={() => googleLogin()}
      disabled={isLoading}
      className="w-full bg-zinc-900 border border-zinc-700 text-white py-3 rounded-md font-bold text-sm tracking-widest transition hover:bg-zinc-800 flex items-center justify-center gap-3"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
      {label}
    </button>
  );

  const Divider = () => (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-zinc-800" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-[#111111] px-4 text-zinc-500 text-sm">ou</span>
      </div>
    </div>
  );

  // ========== LOGIN VIEW ==========
  if (currentView === 'login') {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-[#111111] border border-zinc-800 rounded-2xl w-full max-w-4xl overflow-hidden flex" style={{ minHeight: '580px' }}>

          {/* Bouton fermer */}
          <button
            onClick={onClose}
            disabled={isLoading}
            className="absolute top-4 right-4 z-10 text-zinc-500 hover:text-white bg-black/50 rounded-full p-1.5 transition-colors"
          >
            <X size={18} />
          </button>

          {/* Gauche — Formulaire */}
          <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-10">
            <div className="w-full max-w-sm">
              <div className="mb-8">
                <h1 className="font-serif text-3xl text-white mb-3">Bienvenue</h1>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Connectez-vous pour accéder à votre espace personnel et gérer vos voyages.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                {errors.submit && (
                  <div className="p-3 bg-red-900/30 border border-red-700 rounded-md">
                    <p className="text-red-400 text-sm">{errors.submit}</p>
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="block text-sm text-zinc-400 mb-1.5">{t('auth.email')}</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className={inputClass('email')}
                      placeholder="votre@email.com"
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-red-500 text-xs">{errors.email}</p>}
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm text-zinc-400">{t('auth.password')}</label>
                    <button type="button" className="text-xs text-[#D4AF37] hover:underline">
                      Mot de passe oublié ?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className={inputClass('password')}
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.password && <p className="mt-1 text-red-500 text-xs">{errors.password}</p>}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full bg-[#D4AF37] text-black py-3 rounded-md font-bold uppercase tracking-widest transition flex items-center justify-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-yellow-500'}`}
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Se Connecter <ArrowRight className="w-4 h-4" /></>}
                </button>

                <Divider />
                <GoogleButton label={t('auth.googleLogin')} />

                <p className="text-center text-zinc-500 text-sm pt-2">
                  {t('auth.noAccount')}{' '}
                  <button type="button" onClick={switchView} disabled={isLoading} className="text-[#D4AF37] hover:underline font-medium">
                    {t('auth.signup')}
                  </button>
                </p>
              </form>
            </div>
          </div>

          {/* Droite — Image */}
          <div
            className="hidden lg:block lg:w-1/2 bg-cover bg-center relative"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80')" }}
          >
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute bottom-0 left-0 right-0 p-10">
              <p className="text-[#D4AF37] uppercase tracking-[0.3em] text-xs mb-3">Voyagez avec Style</p>
              <h2 className="font-serif text-3xl text-white leading-tight">
                Votre Prochaine Aventure Commence Ici
              </h2>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========== SIGNUP VIEW ==========
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#111111] border border-zinc-800 rounded-2xl w-full max-w-4xl overflow-hidden flex" style={{ minHeight: '580px' }}>

        {/* Bouton fermer */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 z-10 text-zinc-500 hover:text-white bg-black/50 rounded-full p-1.5 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Gauche — Image (inversé vs login) */}
        <div
          className="hidden lg:block lg:w-1/2 bg-cover bg-center relative"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1200&q=80')" }}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute bottom-0 left-0 right-0 p-10">
            <p className="text-[#D4AF37] uppercase tracking-[0.3em] text-xs mb-3">Rejoignez-Nous</p>
            <h2 className="font-serif text-3xl text-white leading-tight">
              Découvrez un Monde d'Expériences Exclusives
            </h2>
          </div>        </div>

        {/* Droite — Formulaire */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-10 overflow-y-auto">
          <div className="w-full max-w-sm">

            {/* Header */}
            <div className="mb-6">
              <h1 className="font-serif text-3xl text-white mb-2">
                {step === 1 ? "Créer un Compte" : "Vos Préférences"}
              </h1>
              <p className="text-zinc-400 text-sm">
                {step === 1
                  ? "Inscrivez-vous pour accéder à des destinations et expériences exclusives."
                  : "Personnalisez votre expérience de voyage."
                }
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-xs text-zinc-500 mb-2">
                <span className={step >= 1 ? 'text-[#D4AF37]' : ''}>{t('auth.account')}</span>
                <span className={step >= 2 ? 'text-[#D4AF37]' : ''}>{t('auth.preferences')}</span>
              </div>
              <div className="h-0.5 bg-zinc-800 rounded-full">
                <div
                  className="h-full bg-[#D4AF37] rounded-full transition-all duration-300"
                  style={{ width: step === 1 ? '50%' : '100%' }}
                />
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {/* ── STEP 1 ── */}
              {step === 1 && (
                <div className="space-y-4">
                  {errors.submit && (
                    <div className="p-3 bg-red-900/30 border border-red-700 rounded-md">
                      <p className="text-red-400 text-sm">{errors.submit}</p>
                    </div>
                  )}

                  {/* Email */}
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1.5">{t('auth.email')}</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} disabled={isLoading}
                        className={inputClass('email')} placeholder="votre@email.com" />
                    </div>
                    {errors.email && <p className="mt-1 text-red-500 text-xs">{errors.email}</p>}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1.5">{t('auth.password')}</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input type="password" name="password" value={formData.password} onChange={handleInputChange} disabled={isLoading}
                        className={inputClass('password')} placeholder="••••••••" />
                    </div>
                    {errors.password && <p className="mt-1 text-red-500 text-xs">{errors.password}</p>}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1.5">{t('auth.confirmPassword')}</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} disabled={isLoading}
                        className={inputClass('confirmPassword')} placeholder="••••••••" />
                    </div>
                    {errors.confirmPassword && <p className="mt-1 text-red-500 text-xs">{errors.confirmPassword}</p>}
                  </div>

                  <button
                    type="button"
                    onClick={() => { if (validateStep1()) setStep(2); }}
                    disabled={isLoading}
                    className="w-full bg-[#D4AF37] text-black py-3 rounded-md font-bold uppercase tracking-widest transition hover:bg-yellow-500 flex items-center justify-center gap-2"
                  >
                    Suivant <ArrowRight className="w-4 h-4" />
                  </button>

                  <Divider />
                  <GoogleButton label={t('auth.googleLogin')} />

                  <p className="text-center text-zinc-500 text-sm">
                    {t('auth.hasAccount')}{' '}
                    <button type="button" onClick={switchView} className="text-[#D4AF37] hover:underline font-medium">
                      {t('auth.login')}
                    </button>
                  </p>
                </div>
              )}

              {/* ── STEP 2 ── */}
              {step === 2 && (
                <div className="space-y-5">
                  {errors.submit && (
                    <div className="p-3 bg-red-900/30 border border-red-700 rounded-md">
                      <p className="text-red-400 text-sm">{errors.submit}</p>
                    </div>
                  )}

                  {/* Prénom / Nom */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-zinc-400 mb-1.5">{t('auth.firstName')}</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} disabled={isLoading}
                          className={inputClass('firstName')} placeholder="Prénom" />
                      </div>
                      {errors.firstName && <p className="mt-1 text-red-500 text-xs">{errors.firstName}</p>}
                    </div>
                    <div>
                      <label className="block text-sm text-zinc-400 mb-1.5">{t('auth.lastName')}</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} disabled={isLoading}
                          className={inputClass('lastName')} placeholder="Nom" />
                      </div>
                      {errors.lastName && <p className="mt-1 text-red-500 text-xs">{errors.lastName}</p>}
                    </div>
                  </div>

                  {/* Type de voyageur */}
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">{t('auth.travelerType')}</label>
                    <div className="grid grid-cols-2 gap-2">
                      {travelerTypes.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => handleInputChange({ target: { name: 'travelerType', value: type.value } })}
                          className={`p-2.5 rounded-md border text-center transition flex flex-col items-center gap-1 ${
                            formData.travelerType === type.value
                              ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-white'
                              : 'border-zinc-700 bg-[#0A0A0A] text-zinc-400 hover:border-zinc-500'
                          }`}
                        >
                          <span className="text-[#D4AF37]">{type.icon}</span>
                          <span className="block text-xs">{type.label}</span>
                        </button>
                      ))}
                    </div>
                    {errors.travelerType && <p className="mt-1 text-red-500 text-xs">{errors.travelerType}</p>}
                  </div>

                  {/* Budget */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-zinc-400 mb-1.5">{t('auth.budgetMin')}</label>
                      <input type="number" name="minBudget" value={formData.minBudget} onChange={handleInputChange} disabled={isLoading}
                        className="w-full bg-[#0A0A0A] border border-zinc-700 rounded-md py-3 px-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition"
                        placeholder="0" />
                    </div>
                    <div>
                      <label className="block text-sm text-zinc-400 mb-1.5">{t('auth.budgetMax')}</label>
                      <input type="number" name="maxBudget" value={formData.maxBudget} onChange={handleInputChange} disabled={isLoading}
                        className="w-full bg-[#0A0A0A] border border-zinc-700 rounded-md py-3 px-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition"
                        placeholder="10000" />
                    </div>
                  </div>

                  {/* Préférences */}
                  <div>
                    <label className="block text-sm text-zinc-400 mb-3">{t('auth.travelPreferences')}</label>
                    <div className="space-y-3">
                      {Object.entries(preferenceLabels).map(([key, label]) => {
                        const Icon = preferenceIcons[key];
                        return (
                          <div key={key}>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2 text-sm text-zinc-300">
                                <Icon size={14} className="text-[#D4AF37]" />
                                <span>{label}</span>
                              </div>
                              <span className="text-xs text-zinc-500">{Math.round(formData[key] * 100)}%</span>
                            </div>
                            <input
                              type="range" min="0" max="1" step="0.1"
                              value={formData[key]}
                              onChange={(e) => handleSliderChange(key, e.target.value)}
                              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Boutons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      disabled={isLoading}
                      className="flex-1 bg-zinc-800 text-white py-3 rounded-md font-bold uppercase tracking-widest transition hover:bg-zinc-700"
                    >
                      {t('auth.back')}
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`flex-1 bg-[#D4AF37] text-black py-3 rounded-md font-bold uppercase tracking-widest transition flex items-center justify-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-yellow-500'}`}
                    >
                      {isLoading
                        ? <Loader2 className="w-5 h-5 animate-spin" />
                        : <>{t('auth.createAccount')} <ArrowRight className="w-4 h-4" /></>
                      }
                    </button>
                  </div>

                  <p className="text-center text-zinc-500 text-sm">
                    {t('auth.hasAccount')}{' '}
                    <button type="button" onClick={switchView} className="text-[#D4AF37] hover:underline font-medium">
                      {t('auth.login')}
                    </button>
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;

