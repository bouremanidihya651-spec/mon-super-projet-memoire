import React, { useState } from 'react';
import { User, Globe, Plane, MapPin, Bell, Lock, Save } from 'lucide-react';

const Settings = () => {
  const [formData, setFormData] = useState({
    // Personal Information
    fullName: 'dihya',
    email: 'dihya@example.com',
    phone: '+1234567890',
    language: 'French',
    
    // Travel Preferences
    travelStyle: 'Luxury & Relaxation',
    budget: 'High',
    favoriteContinent: 'Europe',
    
    // Notifications
    emailNotifications: true,
    pushNotifications: false,
    newsletter: true,
    
    // Security
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white p-8">
      <header className="mb-10">
        <h1 className="text-3xl font-serif font-bold mb-2">Paramètres</h1>
        <p className="text-gray-400">Gérez vos préférences et paramètres de sécurité.</p>
      </header>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        {/* Personal Information Section */}
        <section className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800 mb-8">
          <div className="flex items-center gap-3 mb-6 text-yellow-500">
            <User size={20} />
            <h2 className="font-semibold uppercase tracking-wider text-sm">Informations Personnelles</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Nom complet</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full bg-transparent border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full bg-transparent border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Téléphone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full bg-transparent border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Langue</label>
              <select
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                className="w-full bg-transparent border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="French">Français</option>
                <option value="English">Anglais</option>
                <option value="Spanish">Espagnol</option>
                <option value="German">Allemand</option>
              </select>
            </div>
          </div>
        </section>

        {/* Travel Preferences Section */}
        <section className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800 mb-8">
          <div className="flex items-center gap-3 mb-6 text-yellow-500">
            <Plane size={20} />
            <h2 className="font-semibold uppercase tracking-wider text-sm">Préférences de Voyage</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Style de voyage</label>
              <select
                name="travelStyle"
                value={formData.travelStyle}
                onChange={handleInputChange}
                className="w-full bg-transparent border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="Luxury & Relaxation">Luxe & Détente</option>
                <option value="Adventure">Aventure</option>
                <option value="Cultural">Culturel</option>
                <option value="Business">Affaires</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Budget</label>
              <select
                name="budget"
                value={formData.budget}
                onChange={handleInputChange}
                className="w-full bg-transparent border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="Low">Faible</option>
                <option value="Medium">Moyen</option>
                <option value="High">Élevé</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Continent préféré</label>
              <select
                name="favoriteContinent"
                value={formData.favoriteContinent}
                onChange={handleInputChange}
                className="w-full bg-transparent border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="Europe">Europe</option>
                <option value="Asia">Asie</option>
                <option value="North America">Amérique du Nord</option>
                <option value="South America">Amérique du Sud</option>
                <option value="Africa">Afrique</option>
                <option value="Oceania">Océanie</option>
              </select>
            </div>
          </div>
        </section>

        {/* Notifications Section */}
        <section className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800 mb-8">
          <div className="flex items-center gap-3 mb-6 text-yellow-500">
            <Bell size={20} />
            <h2 className="font-semibold uppercase tracking-wider text-sm">Notifications</h2>
          </div>
          
          <div className="space-y-4">
            <NotificationItem
              title="Notifications par email"
              description="Recevez des mises à jour importantes par email"
              enabled={formData.emailNotifications}
              name="emailNotifications"
              onChange={handleInputChange}
            />
            
            <NotificationItem
              title="Notifications push"
              description="Recevez des alertes directement sur votre appareil"
              enabled={formData.pushNotifications}
              name="pushNotifications"
              onChange={handleInputChange}
            />
            
            <NotificationItem
              title="Newsletter"
              description="Recevez nos offres spéciales et nouveautés"
              enabled={formData.newsletter}
              name="newsletter"
              onChange={handleInputChange}
            />
          </div>
        </section>

        {/* Security Section */}
        <section className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800 mb-8">
          <div className="flex items-center gap-3 mb-6 text-yellow-500">
            <Lock size={20} />
            <h2 className="font-semibold uppercase tracking-wider text-sm">Sécurité</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Mot de passe actuel</label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                className="w-full bg-transparent border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Nouveau mot de passe</label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                className="w-full bg-transparent border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Confirmer le nouveau mot de passe</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full bg-transparent border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
          </div>
        </section>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-yellow-500 text-black px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-widest hover:bg-yellow-600 transition flex items-center gap-2"
          >
            <Save size={16} />
            Enregistrer les modifications
          </button>
        </div>
      </form>
    </div>
  );
};

const NotificationItem = ({ title, description, enabled, name, onChange }) => (
  <div className="flex justify-between items-center py-3 border-b border-gray-800 last:border-0">
    <div>
      <h3 className="font-medium">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        name={name}
        checked={enabled}
        onChange={onChange}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
    </label>
  </div>
);

export default Settings;

