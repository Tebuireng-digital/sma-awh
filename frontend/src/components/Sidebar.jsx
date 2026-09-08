import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Calendar, 
  BookOpen, 
  Users, 
  UserCheck, 
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
  Globe,
  ExternalLink,
  X,
  Sparkles,
  ClipboardCheck
} from 'lucide-react';

const Sidebar = ({ mobileOpen, onCloseMobile }) => {
  const { user, userRoles } = useAuth();
  if (!user) return null;

  const roles = userRoles && userRoles.length > 0 ? userRoles : (user.role ? [user.role] : ['guru']);
  const primaryRole = user.role || 'guru';

  const navItems = [
    // Executive / Kepsek
    {
      to: '/dashboard-kepsek',
      label: 'Portal Kepala Sekolah',
      icon: BarChart3,
      section: 'Eksekutif & Pimpinan',
      roles: ['admin', 'kepala_sekolah', 'waka'],
    },
    // Admin Dashboard
    {
      to: '/admin',
      label: 'Dashboard Admin Utama',
      icon: LayoutDashboard,
      section: 'Administrasi Utama',
      roles: ['admin', 'kepala_tu'],
    },
    // Kurikulum Dashboard
    {
      to: '/kurikulum',
      label: 'Dashboard Kurikulum',
      icon: BookOpen,
      section: 'Kurikulum & Akademik',
      roles: ['admin', 'kurikulum', 'kepala_sekolah'],
    },
    {
      to: '/admin/mapel',
      label: 'Data Mata Pelajaran',
      icon: BookOpen,
      section: 'Kurikulum & Akademik',
      roles: ['admin', 'kurikulum'],
    },
    {
      to: '/admin/jadwal',
      label: 'Manajemen Jadwal',
      icon: Calendar,
      section: 'Kurikulum & Akademik',
      roles: ['admin', 'kurikulum'],
    },
    {
      to: '/admin/kalender',
      label: 'Kalender Akademik',
      icon: Calendar,
      section: 'Kurikulum & Akademik',
      roles: ['admin', 'kurikulum', 'kepala_sekolah'],
    },

    // Kesiswaan & Rombel
    {
      to: '/admin/kelas',
      label: 'Data Kelas & Rombel',
      icon: School,
      section: 'Kesiswaan & Kelas',
      roles: ['admin', 'kurikulum', 'kesiswaan'],
    },
    {
      to: '/admin/siswa',
      label: 'Master Data Siswa',
      icon: GraduationCap,
      section: 'Kesiswaan & Kelas',
      roles: ['admin', 'kesiswaan', 'kurikulum', 'wali_kelas', 'bk'],
    },

    // Guru & Pengajaran
    {
      to: '/rapor-sts',
      label: 'Input Nilai Rapor',
      icon: FileText,
      section: 'Pembelajaran & Rapor',
      roles: ['admin', 'kepala_sekolah', 'waka', 'kurikulum', 'wali_kelas', 'guru', 'siswa', 'wali_santri'],
    },
    {
      to: '/walikelas/rapor',
      label: user?.wali_kelas ? `Menu Wali Kelas (${user.wali_kelas.nama_kelas})` : 'Menu Wali Kelas',
      icon: ClipboardCheck,
      section: 'Pembelajaran & Rapor',
      badge: 'Validasi',
      condition: () => ['admin', 'kepala_sekolah', 'waka', 'kurikulum'].some(r => roles.includes(r)) || Boolean(user?.is_wali_kelas),
      roles: ['admin', 'kepala_sekolah', 'waka', 'kurikulum', 'guru', 'wali_kelas'],
    },
    {
      to: '/guru/presensi',
      label: 'Presensi & Jurnal Guru',
      icon: Smartphone,
      section: 'Pembelajaran & Rapor',
      roles: ['admin', 'guru', 'wali_kelas', 'kurikulum'],
    },
    {
      to: '/guru/presensi-siswa',
      label: 'Absensi Siswa Kelas',
      icon: UserCheck,
      section: 'Pembelajaran & Rapor',
      roles: ['admin', 'guru', 'wali_kelas', 'kesiswaan', 'bk'],
    },

    // Kepegawaian & HRD
    {
      to: '/admin/guru',
      label: 'Data Guru & PTK',
      icon: Users,
      section: 'Kepegawaian & SDM',
      roles: ['admin', 'kepala_tu', 'kepegawaian'],
    },
    {
      to: '/kepegawaian',
      label: 'Kepegawaian & HRD',
      icon: ShieldCheck,
      section: 'Kepegawaian & SDM',
      roles: ['admin', 'kepala_sekolah', 'kepala_tu', 'kepegawaian'],
    },

    // Layanan Sekolah Khusus
    {
      to: '/bk',
      label: 'BK & Kedisiplinan',
      icon: BookOpen,
      section: 'Layanan & Bimbingan',
      roles: ['admin', 'kepala_sekolah', 'waka', 'kesiswaan', 'bk'],
    },
    {
      to: '/sarana',
      label: 'Sarana & Prasarana',
      icon: Package,
      section: 'Layanan & Bimbingan',
      roles: ['admin', 'kepala_sekolah', 'kepala_tu', 'sarana'],
    },
    {
      to: '/persuratan',
      label: 'Persuratan & Arsip',
      icon: Mail,
      section: 'Layanan & Bimbingan',
      roles: ['admin', 'kepala_sekolah', 'kepala_tu', 'persuratan', 'tu', 'waka', 'staf'],
    },
    {
      to: '/humas',
      label: 'Humas & Branding',
      icon: Share2,
      section: 'Layanan & Bimbingan',
      roles: ['admin', 'kepala_sekolah', 'waka', 'humas'],
    },
    {
      to: '/perpustakaan',
      label: 'Perpustakaan Digital',
      icon: Library,
      section: 'Layanan & Bimbingan',
      roles: ['admin', 'pustakawan', 'kepala_sekolah', 'waka', 'kepala_tu'],
    },
    {
      to: '/portal-siswa',
      label: 'Portal Siswa / Wali',
      icon: User,
      section: 'Portal Mandiri',
      roles: ['siswa', 'wali_santri'],
    },
  ];

  const filteredNav = navItems.filter(item => item.condition ? item.condition() : item.roles.some(r => roles.includes(r)));

  const getRoleDisplayName = (r) => {
    if (r === 'guru' && user?.is_wali_kelas) {
      return `Wali Kelas ${user?.wali_kelas?.nama_kelas || ''}`;
    }
    const map = {
      admin: 'Administrator Sistem',
      kepala_sekolah: 'Kepala Sekolah',
      waka: 'Wakil Kepala Sekolah',
      kepala_tu: 'Kepala Tata Usaha',
      tu: 'Staf Administrasi TU',
      kurikulum: 'Waka Kurikulum',
      kesiswaan: 'Staf Kesiswaan',
      sarana: 'Staf Sarana Prasarana',
      kepegawaian: 'Staf Kepegawaian',
      persuratan: 'Staf Persuratan',
      humas: 'Staf Branding & Humas',
      guru: 'Dewan Guru Pengampu',
      wali_kelas: 'Wali Kelas',
      bk: 'Bimbingan Konseling',
      pustakawan: 'Pengelola Perpustakaan',
      siswa: 'Siswa / Wali Murid',
      wali_santri: 'Siswa / Wali Murid'
    };
    return map[r] || 'Pendidik / Tenaga Kependidikan';
  };

  const content = (
    <div className="w-full flex-1 flex flex-col justify-between p-4 min-h-0 bg-white">
      <div className="overflow-y-auto pr-1 space-y-4">
        {/* Role Identity Card */}
        <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50/50 to-slate-50 border border-emerald-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-extrabold text-emerald-950 truncate uppercase tracking-wider">
                  {getRoleDisplayName(primaryRole)}
                </p>
                <p className="text-[10px] text-emerald-700 truncate font-medium">
                  {user.name || user.username || 'Panel Terpadu SMA AWH'}
                </p>
              </div>
            </div>
            {onCloseMobile && (
              <button 
                onClick={onCloseMobile}
                className="md:hidden text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          {roles.length > 1 && (
            <div className="mt-2.5 pt-2 border-t border-emerald-200/60 flex flex-wrap gap-1">
              <span className="text-[9px] font-bold text-emerald-800 uppercase tracking-wider block w-full mb-0.5">
                Merangkap Tugas:
              </span>
              {roles.map((r) => (
                <span key={r} className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100/90 text-emerald-900 border border-emerald-300/80 shadow-xs">
                  {getRoleDisplayName(r)}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {filteredNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => onCloseMobile && onCloseMobile()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-sm shadow-emerald-800/20 font-bold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-emerald-800'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-300' : 'text-slate-400 group-hover:text-emerald-700'}`} />
                    <span className="truncate">{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Branding & Web Link */}
      <div className="border-t border-slate-100 pt-3 text-[11px] text-slate-400 px-1 shrink-0 mt-3">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3 py-2 mb-2 rounded-xl bg-slate-50 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 font-semibold text-xs border border-slate-200 transition-colors"
          title="Buka Website Sekolah Publik di Tab Baru"
        >
          <span className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-emerald-700" />
            <span>Website Sekolah</span>
          </span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </a>
        <p className="font-bold text-slate-700 text-[11px]">SMA A. WAHID HASYIM</p>
        <p className="text-[10px] text-slate-400">Pesantren Tebuireng Jombang</p>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-slate-200/90 h-[calc(100vh-4rem)] sticky top-16 shrink-0 shadow-sm z-20">
        {content}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
            onClick={onCloseMobile}
          />
          <div className="relative w-64 max-w-[80vw] bg-white h-full shadow-2xl z-10 flex flex-col animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
