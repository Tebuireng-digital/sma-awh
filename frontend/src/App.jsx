import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import GuruPresensi from './pages/GuruPresensi';
import GuruPresensiSiswa from './pages/GuruPresensiSiswa';
import KurikulumDashboard from './pages/KurikulumDashboard';
import KalenderAkademikPage from './pages/KalenderAkademikPage';
import KepsekDashboard from './pages/KepsekDashboard';
import DataGuru from './pages/DataGuru';
import DataKelas from './pages/DataKelas';
import DataSiswa from './pages/DataSiswa';
import RaporSTSPage from './pages/RaporSTSPage';
import ModuleRevisiPage from './pages/ModuleRevisiPage';
import AdminMapelPage from './pages/AdminMapelPage';
import AdminJadwalPelajaranPage from './pages/AdminJadwalPelajaranPage';
import WaliKelasRaporPage from './pages/WaliKelasRaporPage';


import SaranaPage from './pages/SaranaPage';
import KepegawaianPage from './pages/KepegawaianPage';
import BKPage from './pages/BKPage';
import PerpustakaanPage from './pages/PerpustakaanPage';
import PersuratanPage from './pages/PersuratanPage';
import PublicBerandaPage from './pages/public/PublicBerandaPage';
import PublicSambutanPage from './pages/public/PublicSambutanPage';
import PublicVisiMisiPage from './pages/public/PublicVisiMisiPage';
import PublicSejarahPage from './pages/public/PublicSejarahPage';
import PublicBeritaPage from './pages/public/PublicBeritaPage';
import PublicDetailBeritaPage from './pages/public/PublicDetailBeritaPage';
import PublicAlumniPage from './pages/public/PublicAlumniPage';
import PublicKontakPage from './pages/public/PublicKontakPage';
import PublicFasilitasPage from './pages/public/PublicFasilitasPage';
import PublicKesiswaanPage from './pages/public/PublicKesiswaanPage';
import HumasPage from './pages/HumasPage';
import PortalSiswaPage from './pages/PortalSiswaPage';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';

const ProtectedRoute = ({ children, allowedRoles, noLayout = false }) => {
  const { user, userRoles, hasAnyRole } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && !hasAnyRole(allowedRoles)) {
    if (userRoles.includes('guru')) {
      return <Navigate to="/guru/presensi" replace />;
    }
    if (userRoles.includes('siswa') || userRoles.includes('wali_santri')) {
      return <Navigate to="/portal-siswa" replace />;
    }
    return <Navigate to="/" replace />;
  }
  if (noLayout) {
    return children;
  }
  return <Layout>{children}</Layout>;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Website Sekolah Publik (Stitch Tebuireng Academic Heritage) */}
      <Route path="/" element={<PublicBerandaPage />} />
      <Route path="/website" element={<Navigate to="/" replace />} />
      
      {/* Profil Pages */}
      <Route path="/profil/sambutan" element={<PublicSambutanPage />} />
      <Route path="/sambutan" element={<PublicSambutanPage />} />
      <Route path="/profil/visi-misi" element={<PublicVisiMisiPage />} />
      <Route path="/visi-dan-misi" element={<PublicVisiMisiPage />} />
      <Route path="/profil/sejarah" element={<PublicSejarahPage />} />
      <Route path="/sejarah-sekolah" element={<PublicSejarahPage />} />

      {/* Fasilitas & Kesiswaan Pages */}
      <Route path="/fasilitas" element={<PublicFasilitasPage />} />
      <Route path="/fasilitas-2" element={<PublicFasilitasPage />} />
      <Route path="/kesiswaan" element={<PublicKesiswaanPage />} />

      {/* Berita, Kategori, & Detail Pages */}
      <Route path="/berita" element={<PublicBeritaPage />} />
      <Route path="/category/berita" element={<PublicBeritaPage />} />
      <Route path="/category/:kategoriSlug" element={<PublicBeritaPage />} />
      <Route path="/berita/:id" element={<PublicDetailBeritaPage />} />
      
      {/* Alumni & Kontak */}
      <Route path="/alumni" element={<PublicAlumniPage />} />
      <Route path="/kontak" element={<PublicKontakPage />} />

      <Route path="/login" element={<Login />} />
      
      {/* Admin */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin', 'kepala_sekolah', 'waka']}><AdminDashboard /></ProtectedRoute>
      } />
      <Route path="/admin/guru" element={
        <ProtectedRoute allowedRoles={['admin', 'kepala_sekolah', 'waka']}><DataGuru /></ProtectedRoute>
      } />
      <Route path="/admin/kelas" element={
        <ProtectedRoute allowedRoles={['admin', 'kepala_sekolah', 'waka']}><DataKelas /></ProtectedRoute>
      } />
      <Route path="/admin/siswa" element={
        <ProtectedRoute allowedRoles={['admin', 'kepala_sekolah', 'waka', 'guru']}><DataSiswa /></ProtectedRoute>
      } />
      <Route path="/admin/mapel" element={
        <ProtectedRoute allowedRoles={['admin', 'kurikulum', 'kepala_sekolah']}><AdminMapelPage /></ProtectedRoute>
      } />
      <Route path="/admin/jadwal" element={
        <ProtectedRoute allowedRoles={['admin', 'kurikulum', 'kepala_sekolah']}><AdminJadwalPelajaranPage /></ProtectedRoute>
      } />
      <Route path="/admin/pengaturan" element={
        <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>
      } />
      <Route path="/admin/kalender" element={
        <ProtectedRoute allowedRoles={['admin', 'kurikulum', 'kepala_sekolah']}><KalenderAkademikPage /></ProtectedRoute>
      } />

      {/* Rapor STS (RAPOR STS X-1.docx) */}
      <Route path="/rapor-sts" element={
        <ProtectedRoute><RaporSTSPage /></ProtectedRoute>
      } />

      {/* Menu Wali Kelas (Validasi Rapor 21 Mapel & Catatan Santri) */}
      <Route path="/walikelas/rapor" element={
        <ProtectedRoute allowedRoles={['admin', 'kepala_sekolah', 'waka', 'kurikulum', 'guru', 'wali_kelas']}><WaliKelasRaporPage /></ProtectedRoute>
      } />

      {/* Guru / Mobile */}
      <Route path="/guru/presensi" element={
        <ProtectedRoute><GuruPresensi /></ProtectedRoute>
      } />
      <Route path="/guru/presensi-siswa" element={
        <ProtectedRoute><GuruPresensiSiswa /></ProtectedRoute>
      } />

      {/* Modul Revisi */}
      <Route path="/kepegawaian" element={
        <ProtectedRoute allowedRoles={['admin', 'kepala_sekolah', 'kepala_tu', 'kepegawaian', 'tu']}><KepegawaianPage /></ProtectedRoute>
      } />
      <Route path="/bk" element={
        <ProtectedRoute allowedRoles={['admin', 'kepala_sekolah', 'waka', 'kesiswaan', 'bk']}><BKPage /></ProtectedRoute>
      } />
      <Route path="/sarana" element={
        <ProtectedRoute allowedRoles={['admin', 'kepala_sekolah', 'kepala_tu', 'sarana']}><SaranaPage /></ProtectedRoute>
      } />
      <Route path="/persuratan" element={
        <ProtectedRoute allowedRoles={['admin', 'kepala_sekolah', 'kepala_tu', 'persuratan', 'tu', 'waka', 'staf']}><PersuratanPage /></ProtectedRoute>
      } />
      <Route path="/humas" element={
        <ProtectedRoute allowedRoles={['admin', 'kepala_sekolah', 'waka', 'humas']}><HumasPage /></ProtectedRoute>
      } />
      <Route path="/perpustakaan" element={
        <ProtectedRoute allowedRoles={['admin', 'pustakawan', 'kepala_sekolah', 'waka', 'kepala_tu', 'siswa', 'wali_santri']}><PerpustakaanPage /></ProtectedRoute>
      } />
      <Route path="/portal-siswa" element={
        <ProtectedRoute allowedRoles={['siswa', 'wali_santri', 'admin']} noLayout={true}>
          <PortalSiswaPage />
        </ProtectedRoute>
      } />

      {/* Kurikulum */}
      <Route path="/kurikulum" element={
        <ProtectedRoute><KurikulumDashboard /></ProtectedRoute>
      } />

      {/* Kepsek */}
      <Route path="/dashboard-kepsek" element={
        <ProtectedRoute><KepsekDashboard /></ProtectedRoute>
      } />

      {/* Default Catch-all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}
