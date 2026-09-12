import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  Smartphone,
  UserCheck,
  BookOpen,
  BarChart3,
  GraduationCap,
  Globe,
  ClipboardCheck,
} from 'lucide-react';

/**
 * Mobile Bottom Navigation Bar
 * Tampil hanya di layar mobile (md:hidden), memberikan shortcut cepat
 * ke menu-menu utama sesuai role pengguna yang sedang login.
 */
const MobileBottomNav = () => {
  const { user, userRoles } = useAuth();
  const location = useLocation();
  if (!user) return null;

  const roles = userRoles && userRoles.length > 0 ? userRoles : (user.role ? [user.role] : ['guru']);

  // Tentukan shortcut berdasarkan role
  const getShortcuts = () => {
    const items = [];

    // Admin / Kepala Sekolah / Waka
    if (['admin', 'kepala_sekolah', 'waka'].some(r => roles.includes(r))) {
      if (roles.includes('admin') || roles.includes('kepala_tu')) {
        items.push({ to: '/admin', label: 'Dashboard', icon: LayoutDashboard });
      }
      if (['kepala_sekolah', 'waka'].some(r => roles.includes(r))) {
        items.push({ to: '/dashboard-kepsek', label: 'Eksekutif', icon: BarChart3 });
      }
    }

    // Kurikulum
    if (roles.includes('kurikulum')) {
      items.push({ to: '/kurikulum', label: 'Kurikulum', icon: BookOpen });
    }

    // Guru (presensi, absensi siswa, rapor)
    if (['guru', 'wali_kelas'].some(r => roles.includes(r))) {
      items.push({ to: '/guru/presensi', label: 'Presensi', icon: Smartphone });
      items.push({ to: '/guru/presensi-siswa', label: 'Absensi', icon: UserCheck });
    }

    // Rapor — semua role guru/wali kelas/admin
    if (['admin', 'guru', 'wali_kelas', 'kurikulum', 'kepala_sekolah', 'waka'].some(r => roles.includes(r))) {
      items.push({ to: '/rapor-sts', label: 'Rapor', icon: FileText });
    }

    // Wali Kelas
    if (user?.is_wali_kelas || ['admin', 'kepala_sekolah', 'waka', 'kurikulum'].some(r => roles.includes(r))) {
      items.push({ to: '/walikelas/rapor', label: 'Wali Kelas', icon: ClipboardCheck });
    }

    // Siswa/Wali
    if (['siswa', 'wali_santri'].some(r => roles.includes(r))) {
      items.push({ to: '/portal-siswa', label: 'Portal', icon: GraduationCap });
      items.push({ to: '/rapor-sts', label: 'Rapor', icon: FileText });
    }

    // Website shortcut
    items.push({ to: '/', label: 'Website', icon: Globe, external: true });

    // Batasi maks 5 shortcut agar muat di layar mobile
    return items.slice(0, 5);
  };

  const shortcuts = getShortcuts();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/95 backdrop-blur-lg border-t border-slate-200/80 shadow-[0_-2px_12px_rgba(0,0,0,0.06)] safe-area-pb">
      <div className="flex items-stretch justify-around px-1 py-1">
        {shortcuts.map((item) => {
          const Icon = item.icon;
          const isActive = !item.external && location.pathname === item.to;

          if (item.external) {
            return (
              <a
                key={item.to + '-ext'}
                href={item.to}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-0.5 px-1 py-1.5 rounded-xl text-slate-400 hover:text-emerald-700 transition-colors flex-1 min-w-0"
              >
                <Icon className="w-5 h-5" />
                <span className="text-[9px] font-bold truncate leading-none mt-0.5">{item.label}</span>
              </a>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center gap-0.5 px-1 py-1.5 rounded-xl transition-all flex-1 min-w-0 ${
                isActive
                  ? 'text-emerald-700'
                  : 'text-slate-400 hover:text-emerald-700'
              }`}
            >
              <div className={`relative ${isActive ? '' : ''}`}>
                <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-emerald-700' : ''}`} />
                {isActive && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                )}
              </div>
              <span className={`text-[9px] font-bold truncate leading-none mt-0.5 ${isActive ? 'text-emerald-800' : ''}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="w-4 h-0.5 bg-emerald-600 rounded-full mt-0.5"></span>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
