import React from 'react';
import { User, LogOut, Heart, MapPin, Settings, FileText, Calendar, Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../contexts/ThemeContext';

/**
 * Sidebar item component
 */
const SidebarItem = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
      active ? 'bg-[#2d7a5a] text-white shadow-sm' : 'text-[#6b8f7b] dark:text-dark-text-muted hover:bg-[#f7f5f0] dark:hover:bg-dark-bg hover:text-[#1a4a36] dark:hover:text-dark-text'
    }`}
  >
    {icon}
    <span className="text-[12px] font-[500] tracking-[0.12em] uppercase" style={{ fontFamily: 'var(--font-sans)' }}>{label}</span>
  </button>
);

/**
 * Main Sidebar component
 */
const Sidebar = ({
  sidebarOpen,
  activeTab,
  setActiveTab,
  setSidebarOpen,
  dashboardUser,
  onLogout
}) => {
  const { t } = useTranslation();
  const { isDark, toggleTheme } = useTheme();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-dark-surface border-r border-[#e0dcd4] dark:border-dark-border transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
    >
      <div className="flex flex-col h-full">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-[#2d7a5a] dark:text-surface tracking-tight" style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 700 }}>Afalou</h1>
        </div>

        <div className="px-4 mb-6">
          <div className="flex items-center gap-3 p-3 bg-[#f7f5f0] dark:bg-dark-bg rounded-xl border border-[#e0dcd4] dark:border-dark-border">
            <div className="w-10 h-10 rounded-full bg-[#f7f5f0] dark:bg-dark-surface border-2 border-[#e0dcd4] dark:border-dark-border overflow-hidden flex items-center justify-center flex-shrink-0">
              {dashboardUser.profilePhoto ? (
                <img
                  src={dashboardUser.profilePhoto.startsWith('http') ? dashboardUser.profilePhoto : `http://localhost:3000${dashboardUser.profilePhoto}`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={20} className="text-[#2d7a5a] dark:text-surface" />
              )}
            </div>
            <div className="overflow-hidden">
              <h3 className="text-[16px] leading-tight truncate text-[#1a4a36] dark:text-dark-text" style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 600 }}>{dashboardUser.name}</h3>
              <p className="text-[12px] text-[#6b8f7b] dark:text-dark-text-muted truncate" style={{ fontFamily: 'var(--font-sans)', fontWeight: 300 }}>{dashboardUser.email}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <SidebarItem
            icon={<User size={18} />}
            label={t('dashboard.myProfile')}
            active={activeTab === 'dashboard'}
            onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }}
          />
          <SidebarItem
            icon={<Heart size={18} />}
            label={t('dashboard.favorites')}
            active={activeTab === 'favorites'}
            onClick={() => { setActiveTab('favorites'); setSidebarOpen(false); }}
          />

          {/* ── Destinations (anciennement Mes Recommandations) ── */}
          <SidebarItem
            icon={<MapPin size={18} />}
            label="Explorez l'Algérie"
            active={activeTab === 'recommendations'}
            onClick={() => { setActiveTab('recommendations'); setSidebarOpen(false); }}
          />

          <SidebarItem
            icon={<Calendar size={18} />}
            label="Mes Réservations"
            active={activeTab === 'reservations'}
            onClick={() => { setActiveTab('reservations'); setSidebarOpen(false); }}
          />
          <SidebarItem
            icon={<FileText size={18} />}
            label="Mes Factures"
            active={activeTab === 'invoices'}
            onClick={() => { setActiveTab('invoices'); setSidebarOpen(false); }}
          />
          <SidebarItem
            icon={<Settings size={18} />}
            label={t('dashboard.settings')}
            active={activeTab === 'settings'}
            onClick={() => { setActiveTab('settings'); setSidebarOpen(false); }}
          />

          {/* ── THEME TOGGLE ── */}
          <SidebarItem
            icon={isDark ? <Sun size={18} /> : <Moon size={18} />}
            label={isDark ? 'Mode clair' : 'Mode sombre'}
            active={false}
            onClick={toggleTheme}
          />
        </nav>

        <div className="p-4 border-t border-[#e0dcd4] dark:border-dark-border">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[#6b8f7b] dark:text-dark-text-muted hover:bg-[#fef2f2] dark:hover:bg-red-900/20 hover:text-[#dc2626] dark:hover:text-red-400 transition-all group"
          >
            <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
            <span className="text-[12px] font-[500] tracking-[0.10em] uppercase" style={{ fontFamily: 'var(--font-sans)' }}>{t('nav.logout')}</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

