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
  BarChart3,
  Smartphone,
  School,
  GraduationCap,
  X
} from 'lucide-react';

const Sidebar = ({ mobileOpen, onCloseMobile }) => {
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
      to: '/admin/guru',
      label: 'Data Guru',
      icon: Users,
      roles: ['admin'],
    },
    {
      to: '/admin/kelas',
      label: 'Data Kelas',
      icon: School,
      roles: ['admin'],
    },
    {
      to: '/admin/siswa',
      label: 'Data Siswa',
      icon: GraduationCap,
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

  const content = (
    <div className="h-full flex flex-col justify-between p-4">
      <div>
        <div className="flex items-center justify-between mb-3 px-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Menu Utama ({role})
          </span>
          {onCloseMobile && (
            <button 
              onClick={onCloseMobile}
              className="md:hidden text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <nav className="space-y-1">
          {filteredNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => onCloseMobile && onCloseMobile()}
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
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-3.5rem)] shrink-0">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" 
            onClick={onCloseMobile}
          />
          <div className="relative w-64 max-w-[80vw] bg-white h-full shadow-2xl z-10 flex flex-col">
            {content}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
