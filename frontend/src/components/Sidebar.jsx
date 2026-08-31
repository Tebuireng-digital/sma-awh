import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  MapPin, 
  Calendar, 
  BookOpen, 
  Users, 
  UserCheck, 
  Bell, 
  FileSpreadsheet, 
  ShieldCheck, 
  BarChart3,
  Smartphone
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role || 'guru';

  const navItems = [
    // Executive / Kepsek
    {
      to: '/dashboard-kepsek',
      label: 'Portal Kepala Sekolah',
      icon: BarChart3,
      roles: ['admin', 'kepala_sekolah', 'kurikulum'],
    },
    // Admin Dashboard
    {
      to: '/admin',
      label: 'Dashboard Admin',
      icon: LayoutDashboard,
      roles: ['admin'],
    },
    {
      to: '/admin/pengaturan',
      label: 'Pengaturan GPS & WA Bot',
      icon: MapPin,
      roles: ['admin'],
    },
    {
      to: '/admin/kalender',
      label: 'Dual Kalender Akademik',
      icon: Calendar,
      roles: ['admin', 'kurikulum'],
    },
    // Guru / Mobile Presensi
    {
      to: '/guru/presensi',
      label: 'Mobile Presensi & Jurnal',
      icon: Smartphone,
      roles: ['admin', 'guru', 'piket', 'kurikulum'],
    },
    {
      to: '/guru/presensi-siswa',
      label: 'Absensi Cepat Murid',
      icon: UserCheck,
      roles: ['admin', 'guru', 'piket', 'kurikulum'],
    },
    // Guru Piket
    {
      to: '/piket',
      label: 'Panel Guru Piket (Inval)',
      icon: Bell,
      roles: ['admin', 'piket', 'guru'],
    },
    // Waka Kurikulum
    {
      to: '/kurikulum',
      label: 'Waka Kurikulum Dashboard',
      icon: BookOpen,
      roles: ['admin', 'kurikulum', 'kepala_sekolah'],
    },
    {
      to: '/kurikulum/perangkat-ajar',
      label: 'Perangkat Ajar (CP/TP/Promes)',
      icon: FileSpreadsheet,
      roles: ['admin', 'kurikulum', 'guru'],
    },
  ];

  const filteredNav = navItems.filter(item => item.roles.includes(role));

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-3.5rem)] p-4 flex flex-col justify-between">
      <div>
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">
          Menu Utama ({role})
        </div>
        <nav className="space-y-1">
          {filteredNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center space-x-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Quick Demo Switcher info */}
      <div className="border-t border-slate-100 pt-3 text-[11px] text-slate-400 px-2">
        <p className="font-semibold text-slate-600 mb-1">SMA KH. A. Wahid Hasyim</p>
        <p>Terhubung dengan Layanan API Laravel Sanctum</p>
      </div>
    </aside>
  );
};

export default Sidebar;
