import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Users, MapPin, Star, Package, Settings, Menu, X } from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar, activeSection, setActiveSection }) => {
  const location = useLocation();

  const menuItems = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
    { id: 'destinations', label: 'Destinations', icon: MapPin },
    { id: 'hotels', label: 'Hôtels', icon: Package },
    { id: 'activities', label: 'Activités', icon: Star },
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#0A0A0A] border-r border-zinc-800 transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div className="text-2xl font-serif font-bold text-[#D4AF37] tracking-tight">
            Afalou Admin
          </div>
          <button 
            onClick={toggleSidebar}
            className="lg:hidden p-1 rounded-md hover:bg-[#1A1A1A]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id || location.pathname.includes(item.id);
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setActiveSection(item.id);
                      if (window.innerWidth < 1024) toggleSidebar(); // Close sidebar on mobile after selection
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      isActive
                        ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20'
                        : 'text-zinc-400 hover:bg-[#1A1A1A] hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-zinc-800">
          <div className="text-xs text-zinc-500">
            Version 1.0.0
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;