import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Building, Menu } from 'lucide-react';

const Navbar = ({ onToggleMobileMenu }) => {
  const { user, logout } = useAuth();

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span className="bg-emerald-900/60 text-emerald-200 border border-emerald-500/40 text-xs px-2 py-0.5 rounded font-semibold uppercase tracking-wider">Admin Sistem</span>;
      case 'kurikulum':
        return <span className="bg-indigo-900/60 text-indigo-200 border border-indigo-500/40 text-xs px-2 py-0.5 rounded font-semibold uppercase tracking-wider">Waka Kurikulum</span>;
      case 'piket':
        return <span className="bg-amber-900/60 text-amber-200 border border-amber-500/40 text-xs px-2 py-0.5 rounded font-semibold uppercase tracking-wider">Guru Piket</span>;
      case 'kepala_sekolah':
        return <span className="bg-purple-900/60 text-purple-200 border border-purple-500/40 text-xs px-2 py-0.5 rounded font-semibold uppercase tracking-wider">Kepala Sekolah</span>;
      default:
        return <span className="bg-teal-900/60 text-teal-200 border border-teal-500/40 text-xs px-2 py-0.5 rounded font-semibold uppercase tracking-wider">Guru Mapel</span>;
    }
  };

  return (
    <header className="kemenag-header-bg text-white border-b border-emerald-900 shadow-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Left: Hamburger & Brand */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {user && (
            <button
              onClick={onToggleMobileMenu}
              className="md:hidden p-1.5 rounded text-emerald-200 hover:text-white hover:bg-emerald-800/60 focus:outline-none transition-colors"
              title="Buka Menu Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="bg-white/10 p-1.5 rounded border border-white/20 shrink-0">
            <Building className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-xs sm:text-sm tracking-wide text-white">SMA KH. A. WAHID HASYIM</span>
              <span className="text-[10px] bg-emerald-700/80 px-1.5 py-0.5 rounded text-emerald-100 font-mono hidden xs:inline-block">TEBUIRENG</span>
            </div>
            <p className="text-[11px] text-emerald-200/80 hidden sm:block">Portal Presensi Real-Time & Kurikulum Merdeka SIMANTEB</p>
          </div>
        </div>

        {/* Right: User Profile & Actions */}
        {user && (
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="flex items-center space-x-2 border-r border-emerald-800/80 pr-3 sm:pr-4">
              <div className="text-right hidden md:block">
                <div className="text-xs font-semibold text-white leading-tight">{user.name}</div>
                <div className="mt-0.5">{getRoleBadge(user.role)}</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-emerald-800 border border-emerald-600 flex items-center justify-center text-emerald-200 font-bold text-xs shrink-0">
                {user.name ? user.name.substring(0, 2).toUpperCase() : 'U'}
              </div>
            </div>

            <button
              onClick={logout}
              className="flex items-center space-x-1.5 text-xs bg-emerald-900/80 hover:bg-emerald-950 text-emerald-200 px-2.5 py-1.5 sm:px-3 rounded border border-emerald-700/50 transition-colors"
              title="Keluar dari Akun"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
