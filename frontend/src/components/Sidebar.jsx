import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Calendar, 
  BookOpen, 
  Users, 
  UserCheck, 
  FileSpreadsheet, 
  BarChart3,
  Smartphone,
  School,
  GraduationCap,
  FileText,
  ShieldCheck,
  Package,
  Mail,
  Share2,
  Library,
  User,
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
      roles: ['admin', 'kepala_sekolah', 'waka'],
    },
    // Admin Dashboard
    {
      to: '/admin',
      label: 'Dashboard Admin Utama',
      icon: LayoutDashboard,
      roles: ['admin', 'kepala_tu'],
    },
    {
      to: '/admin/guru',
      label: 'Data Guru & Pegawai',
      icon: Users,
      roles: ['admin', 'kepala_tu', 'kepegawaian'],
    },
    {
      to: '/admin/kelas',
      label: 'Data Kelas',
      icon: School,
      roles: ['admin', 'kurikulum', 'kesiswaan'],
    },
    {
      to: '/admin/siswa',
      label: 'Master Data Siswa',
      icon: GraduationCap,
      roles: ['admin', 'kesiswaan', 'kurikulum', 'wali_kelas', 'bk'],
    },
    {
      to: '/admin/mapel',
      label: 'Data Mata Pelajaran',
      icon: BookOpen,
      roles: ['admin', 'kurikulum'],
    },
    {
      to: '/admin/jadwal',
      label: 'Manajemen Jadwal',
      icon: Calendar,
      roles: ['admin', 'kurikulum'],
    },

    // Rapor STS & Jadwal (Core Docs)
    {
      to: '/rapor-sts',
      label: 'Rapor STS',
      icon: FileText,
      roles: ['admin', 'kepala_sekolah', 'waka', 'kurikulum', 'wali_kelas', 'guru', 'siswa', 'wali_santri'],
    },
    // Guru / Presensi
    {
      to: '/guru/presensi',
      label: 'Presensi & Jurnal Guru',
      icon: Smartphone,
      roles: ['admin', 'guru', 'wali_kelas', 'kurikulum'],
    },
    {
      to: '/guru/presensi-siswa',
      label: 'Absensi Murid',
      icon: UserCheck,
      roles: ['admin', 'guru', 'wali_kelas', 'kesiswaan', 'bk'],
    },

    // Specific Revised Modules
    {
      to: '/kepegawaian',
      label: 'Kepegawaian & HRD',
      icon: ShieldCheck,
      roles: ['admin', 'kepala_sekolah', 'kepala_tu', 'kepegawaian'],
    },
    {
      to: '/bk',
      label: 'BK & Catatan Rahasia',
      icon: BookOpen,
      roles: ['admin', 'kepala_sekolah', 'waka', 'kesiswaan', 'bk'],
    },
    {
      to: '/sarana',
      label: 'Sarana & Prasarana',
      icon: Package,
      roles: ['admin', 'kepala_sekolah', 'kepala_tu', 'sarana'],
    },
    {
      to: '/persuratan',
      label: 'Persuratan & Archiving',
      icon: Mail,
      roles: ['admin', 'kepala_sekolah', 'kepala_tu', 'persuratan', 'tu', 'guru', 'waka', 'staf'],
    },
    {
      to: '/humas',
      label: 'Humas & Branding',
      icon: Share2,
      roles: ['admin', 'kepala_sekolah', 'humas'],
    },
    {
      to: '/perpustakaan',
      label: 'Perpustakaan Digital',
      icon: Library,
      roles: ['admin', 'pustakawan', 'guru', 'kepala_sekolah', 'waka', 'kepala_tu', 'siswa', 'wali_santri'],
    },
    {
      to: '/portal-siswa',
      label: 'Portal Self-Service',
      icon: User,
      roles: ['siswa', 'wali_santri'],
    },
  ];

  const filteredNav = navItems.filter(item => item.roles.includes(role));

  const content = (
    <div className="w-full flex-1 flex flex-col justify-between p-4 min-h-0">
      <div className="overflow-y-auto pr-1">
        <div className="flex items-center justify-between mb-3 px-2">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
            Menu ({role.replace('_', ' ')})
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

      <div className="border-t border-slate-100 pt-3 text-[11px] text-slate-400 px-2 shrink-0 mt-4">
        <p className="font-semibold text-slate-700 mb-0.5">SMA KH. A. WAHID HASYIM</p>
        <p className="text-[10px]">Portal System - Tebuireng Jombang</p>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-slate-200 h-[calc(100vh-3.5rem)] sticky top-14 shrink-0">
        {content}
      </aside>

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
