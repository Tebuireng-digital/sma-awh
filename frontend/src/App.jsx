import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import GuruPresensi from './pages/GuruPresensi';
import GuruPresensiSiswa from './pages/GuruPresensiSiswa';
import GuruPiket from './pages/GuruPiket';
import KurikulumDashboard from './pages/KurikulumDashboard';
import PerangkatAjar from './pages/PerangkatAjar';
import KalenderAkademikPage from './pages/KalenderAkademikPage';
import KepsekDashboard from './pages/KepsekDashboard';

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
      <Route path="/admin/pengaturan" element={
        <ProtectedRoute><AdminDashboard /></ProtectedRoute>
      } />
      <Route path="/admin/kalender" element={
        <ProtectedRoute><KalenderAkademikPage /></ProtectedRoute>
      } />

      {/* Guru / Mobile */}
      <Route path="/guru/presensi" element={
        <ProtectedRoute><GuruPresensi /></ProtectedRoute>
      } />
      <Route path="/guru/presensi-siswa" element={
        <ProtectedRoute><GuruPresensiSiswa /></ProtectedRoute>
      } />

      {/* Guru Piket */}
      <Route path="/piket" element={
        <ProtectedRoute><GuruPiket /></ProtectedRoute>
      } />

      {/* Kurikulum */}
      <Route path="/kurikulum" element={
        <ProtectedRoute><KurikulumDashboard /></ProtectedRoute>
      } />
      <Route path="/kurikulum/perangkat-ajar" element={
        <ProtectedRoute><PerangkatAjar /></ProtectedRoute>
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
