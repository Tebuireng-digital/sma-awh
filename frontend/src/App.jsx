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


import SaranaPage from './pages/SaranaPage';
import KepegawaianPage from './pages/KepegawaianPage';
import BKPage from './pages/BKPage';
import PerpustakaanPage from './pages/PerpustakaanPage';
import PersuratanPage from './pages/PersuratanPage';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Layout>{children}</Layout>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Admin */}
      <Route path="/admin" element={
        <ProtectedRoute><AdminDashboard /></ProtectedRoute>
      } />
      <Route path="/admin/guru" element={
        <ProtectedRoute><DataGuru /></ProtectedRoute>
      } />
      <Route path="/admin/kelas" element={
        <ProtectedRoute><DataKelas /></ProtectedRoute>
      } />
      <Route path="/admin/siswa" element={
        <ProtectedRoute><DataSiswa /></ProtectedRoute>
      } />
      <Route path="/admin/mapel" element={
        <ProtectedRoute><AdminMapelPage /></ProtectedRoute>
      } />
      <Route path="/admin/jadwal" element={
        <ProtectedRoute><AdminJadwalPelajaranPage /></ProtectedRoute>
      } />
      <Route path="/admin/pengaturan" element={
        <ProtectedRoute><AdminDashboard /></ProtectedRoute>
      } />
      <Route path="/admin/kalender" element={
        <ProtectedRoute><KalenderAkademikPage /></ProtectedRoute>
      } />

      {/* Rapor STS (RAPOR STS X-1.docx) */}
      <Route path="/rapor-sts" element={
        <ProtectedRoute><RaporSTSPage /></ProtectedRoute>
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
        <ProtectedRoute><KepegawaianPage /></ProtectedRoute>
      } />
      <Route path="/bk" element={
        <ProtectedRoute><BKPage /></ProtectedRoute>
      } />
      <Route path="/sarana" element={
        <ProtectedRoute><SaranaPage /></ProtectedRoute>
      } />
      <Route path="/persuratan" element={
        <ProtectedRoute><PersuratanPage /></ProtectedRoute>
      } />
      <Route path="/humas" element={
        <ProtectedRoute><ModuleRevisiPage type="humas" /></ProtectedRoute>
      } />
      <Route path="/perpustakaan" element={
        <ProtectedRoute><PerpustakaanPage /></ProtectedRoute>
      } />
      <Route path="/portal-siswa" element={
        <ProtectedRoute><ModuleRevisiPage type="portal-siswa" /></ProtectedRoute>
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
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
