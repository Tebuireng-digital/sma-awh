import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Menu, Globe, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = ({ onToggleMobileMenu }) => {
  const { user, logout } = useAuth();

  const getRoleBadge = (role) => {
    switch (role) {
      case 'kepala_sekolah':
        return <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Kepala Sekolah</span>;
      case 'waka':
        return <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Wakil Kepala Sekolah</span>;
      case 'admin':
        return <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Admin Sistem</span>;
      case 'kepala_tu':
        return <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Kepala Tata Usaha</span>;
      case 'tu':
        return <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Staf Administrasi</span>;
      case 'kurikulum':
        return <span className="bg-indigo-400/20 text-indigo-300 border border-indigo-400/40 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Waka Kurikulum</span>;
      case 'kesiswaan':
        return <span className="bg-sky-400/20 text-sky-300 border border-sky-400/40 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Staf Kesiswaan</span>;
      case 'sarana':
        return <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Staf Sarana</span>;
      case 'kepegawaian':
        return <span className="bg-purple-400/20 text-purple-300 border border-purple-400/40 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Staf Kepegawaian</span>;
      case 'persuratan':
        return <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Staf Persuratan</span>;
      case 'humas':
        return <span className="bg-rose-400/20 text-rose-300 border border-rose-400/40 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Staf Branding</span>;
      case 'guru':
        if (user?.is_wali_kelas) {
          return (
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Wali Kelas {user?.wali_kelas?.nama_kelas || ''}
            </span>
          );
        }
        return <span className="bg-teal-500/20 text-teal-300 border border-teal-500/40 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Guru Pengampu</span>;
      case 'wali_kelas':
        return <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Wali Kelas {user?.wali_kelas?.nama_kelas || ''}</span>;
      case 'bk':
        return <span className="bg-sky-400/20 text-sky-300 border border-sky-400/40 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Guru BK</span>;
      case 'pustakawan':
        return <span className="bg-teal-400/20 text-teal-300 border border-teal-400/40 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Pustakawan</span>;
      case 'siswa':
      case 'wali_santri':
        return <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Siswa / Wali Murid</span>;
      default:
        return <span className="bg-teal-500/20 text-teal-300 border border-teal-500/40 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Pendidik</span>;
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  return (
    <header className="bg-[#0d281e] text-white border-b border-emerald-900/60 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Hamburger & Brand */}
        <div className="flex items-center gap-3">
          {user && (
            <button
              onClick={onToggleMobileMenu}
              className="md:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-200 hover:text-white transition-colors focus:outline-none"
              title="Buka Navigasi"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src="/logo.png" 
              alt="Logo Tebuireng" 
              className="h-9 sm:h-10 w-auto drop-shadow transition-transform group-hover:scale-105" 
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xs sm:text-sm tracking-wider uppercase text-white leading-tight">
                  SMA A. Wahid Hasyim
                </span>
                <span className="text-[9px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-1.5 py-0.5 rounded hidden sm:inline-block">
                  TEBUIRENG
                </span>
              </div>
              <p className="text-[11px] text-emerald-300 font-medium hidden xs:block">
                Pesantren Tebuireng Jombang
              </p>
            </div>
          </Link>
        </div>

        {/* Right: User Profile, Web Shortcut, & Logout */}
        {user && (
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2.5 border-r border-emerald-800/80 pr-3 sm:pr-4">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-white leading-tight truncate max-w-[160px] md:max-w-[220px]">
                  {user.name}
                </div>
                <div className="mt-0.5">{getRoleBadge(user.role)}</div>
              </div>
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white border-2 border-emerald-400/40 flex items-center justify-center font-black text-xs shadow-sm shrink-0">
                {getInitials(user.name)}
              </div>
            </div>

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 text-emerald-100 px-3 py-1.5 rounded-xl border border-white/15 transition-all hover:scale-105 shadow-sm"
              title="Buka Website Sekolah Publik di Tab Baru"
            >
              <Globe className="w-3.5 h-3.5 text-amber-300" />
              <span>Web Sekolah</span>
            </a>

            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 px-3 py-1.5 rounded-xl border border-rose-500/30 transition-all hover:scale-105"
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
