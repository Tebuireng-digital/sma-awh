import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import {
  GraduationCap,
  Calendar,
  BookOpen,
  Award,
  AlertTriangle,
  Library,
  LogOut,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Printer,
  Sparkles,
  KeyRound,
  Eye,
  EyeOff,
  X,
  Lock
} from 'lucide-react';

export default function PortalSiswaPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('ringkasan');
  const [loading, setLoading] = useState(true);

  // States Data
  const [ringkasan, setRingkasan] = useState(null);
  const [nilaiData, setNilaiData] = useState(null);
  const [presensiData, setPresensiData] = useState(null);
  const [jadwalList, setJadwalList] = useState([]);
  const [bkData, setBkData] = useState({ prestasi: [], pelanggaran: [], total_poin_pelanggaran: 0 });
  const [perpusList, setPerpusList] = useState([]);

  // States Ganti Sandi Modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    fetchPortalData();
  }, []);

  const fetchPortalData = async () => {
    setLoading(true);
    try {
      const [resRingkasan, resNilai, resPresensi, resJadwal, resBk, resPerpus] = await Promise.allSettled([
        api.get('/portal-siswa/ringkasan'),
        api.get('/portal-siswa/nilai'),
        api.get('/portal-siswa/presensi'),
        api.get('/portal-siswa/jadwal'),
        api.get('/portal-siswa/kedisiplinan-prestasi'),
        api.get('/portal-siswa/perpustakaan')
      ]);

      if (resRingkasan.status === 'fulfilled' && resRingkasan.value.data.data) {
        setRingkasan(resRingkasan.value.data.data);
      }
      if (resNilai.status === 'fulfilled' && resNilai.value.data.data) {
        setNilaiData(resNilai.value.data.data);
      }
      if (resPresensi.status === 'fulfilled' && resPresensi.value.data.data) {
        setPresensiData(resPresensi.value.data.data);
      }
      if (resJadwal.status === 'fulfilled' && resJadwal.value.data.data) {
        setJadwalList(resJadwal.value.data.data);
      }
      if (resBk.status === 'fulfilled' && resBk.value.data.data) {
        setBkData(resBk.value.data.data);
      }
      if (resPerpus.status === 'fulfilled' && resPerpus.value.data.data) {
        setPerpusList(resPerpus.value.data.data);
      }
    } catch (err) {
      console.error('Error fetching portal siswa:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < 6) {
      setPasswordError('Kata sandi baru minimal 6 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi kata sandi baru tidak cocok.');
      return;
    }

    setSavingPassword(true);
    try {
      await api.post('/auth/change-password', {
        old_password: oldPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      });

      setPasswordSuccess('Kata sandi berhasil diperbarui! Silakan gunakan kata sandi baru untuk login berikutnya.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess(null);
      }, 2000);
    } catch (err) {
      const msg = err.response?.data?.message || 
        (err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(' ') : 'Gagal memperbarui kata sandi. Pastikan kata sandi lama sudah benar.');
      setPasswordError(msg);
    } finally {
      setSavingPassword(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'SW';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const siswa = ringkasan?.siswa || user?.siswa || {
    nama: user?.name || 'Siswa SMA AWH',
    nisn: '0081234567',
    nis: '16383',
    kelas: 'X.8',
    tingkat: 'X',
    wali_kelas: 'Wali Kelas SMA AWH',
    nama_wali: 'Orang Tua / Wali Murid'
  };

  const metrik = ringkasan?.metrik || {
    persentase_kehadiran: 100,
    rata_rata_sts: 86.33,
    kktp_standar: 75,
    pinjaman_buku_aktif: 0,
    total_prestasi: 0,
    total_poin_pelanggaran: 0
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-emerald-600 selection:text-white pb-16">
      
      {/* 1. TOP HEADER APP BAR */}
      <header className="bg-[#0d281e] text-white border-b border-emerald-900/40 sticky top-0 z-30 shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo Tebuireng" className="h-9 w-auto drop-shadow" />
            <div>
              <h1 className="text-sm font-extrabold uppercase tracking-wide text-white leading-tight">
                Portal Siswa / Wali Murid
              </h1>
              <p className="text-[11px] text-emerald-300 font-medium">SMA A. Wahid Hasyim Tebuireng</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-800/60 text-emerald-200 border border-emerald-700/50">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
              <span>Akses Mandiri Terverifikasi</span>
            </span>

            {/* Tombol Ganti Sandi */}
            <button
              onClick={() => {
                setPasswordError(null);
                setPasswordSuccess(null);
                setShowPasswordModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 text-xs font-semibold border border-emerald-600/50 transition-all hover:scale-105 shadow-sm"
              title="Ganti Kata Sandi Akun"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-300" />
              <span>Ganti Sandi</span>
            </button>

            {/* Tombol Keluar */}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-semibold border border-rose-500/30 transition-all hover:scale-105"
              title="Keluar dari Portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. PROFILE HERO BANNER (TANPA FOTO - SESUAI INSTRUKSI RESMI) */}
      <div className="bg-gradient-to-r from-[#0d281e] via-[#143d2f] to-[#0d281e] text-white border-b border-emerald-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            
            {/* Identitas Siswa Menggunakan Badge Inisial (Tanpa Foto) */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-black text-xl sm:text-2xl flex items-center justify-center shadow-lg border-2 border-emerald-400/40 shrink-0">
                {getInitials(siswa.nama)}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Siswa Aktif
                  </span>
                  <span className="text-xs text-emerald-200/80">
                    Kelas {siswa.kelas}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
                  {siswa.nama}
                </h2>
                <p className="text-xs text-emerald-200/90 mt-1">
                  NISN: <span className="font-semibold text-white">{siswa.nisn}</span> • NIS: <span className="font-semibold text-white">{siswa.nis}</span>
                </p>
                <p className="text-[11px] text-emerald-200/75 mt-0.5">
                  Wali Kelas: <span className="text-emerald-300 font-medium">{siswa.wali_kelas}</span> • Wali Murid: <span className="text-white font-medium">{siswa.nama_wali}</span>
                </p>
              </div>
            </div>

            {/* Print/Download Rapor STS Shortcut & Ganti Sandi */}
            <div className="shrink-0 self-stretch sm:self-auto flex items-center gap-2.5">
              <button
                onClick={() => {
                  setActiveTab('nilai');
                  setTimeout(() => window.print(), 300);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 shadow transition-all hover:scale-[1.02]"
              >
                <Printer className="w-4 h-4 text-amber-300" />
                <span>Cetak Ringkasan Siswa</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* 3. QUICK STATS SUMMARY BAR */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {/* Metrik 1: Kehadiran */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Presensi</p>
              <p className="text-lg font-bold text-slate-800">{metrik.persentase_kehadiran}%</p>
            </div>
          </div>

          {/* Metrik 2: Rata-rata STS */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Rata-Rata STS</p>
              <p className="text-lg font-bold text-slate-800">
                {metrik.rata_rata_sts > 0 ? metrik.rata_rata_sts : '-'}
              </p>
              <p className="text-[10px] text-slate-400">
                {metrik.mapel_dinilai_count > 0 ? `${metrik.mapel_dinilai_count} / ${metrik.total_mapel || 21} Mapel Dinilai` : 'Belum ada nilai'}
              </p>
            </div>
          </div>

          {/* Metrik 3: Prestasi */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Prestasi</p>
              <p className="text-lg font-bold text-slate-800">{metrik.total_prestasi} Penghargaan</p>
            </div>
          </div>

          {/* Metrik 4: Pinjaman Perpustakaan */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
              <Library className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Perpustakaan</p>
              <p className="text-lg font-bold text-slate-800">{metrik.pinjaman_buku_aktif} Buku Aktif</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. NAVIGATION TABS */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-6">
        <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-slate-200 flex items-center gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'ringkasan', label: 'Ringkasan', icon: GraduationCap },
            { id: 'nilai', label: 'Rapor & Nilai', icon: BookOpen },
            { id: 'presensi', label: 'Presensi', icon: Calendar },
            { id: 'jadwal', label: 'Jadwal Pelajaran', icon: Clock },
            { id: 'bk', label: 'Prestasi & Disiplin', icon: Award },
            { id: 'perpustakaan', label: 'Perpustakaan', icon: Library }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-emerald-800 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. TAB CONTENT PANELS */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 mt-6">
        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm font-medium text-slate-600">Memuat data siswa terverifikasi...</p>
          </div>
        ) : (
          <div>
            
            {/* ============================================================ */}
            {/* TAB 1: RINGKASAN & OVERVIEW                                  */}
            {/* ============================================================ */}
            {activeTab === 'ringkasan' && (
              <div className="space-y-6">
                {/* Catatan Khusus Wali Kelas */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-emerald-950 uppercase tracking-wide">
                        Amanat & Catatan Wali Kelas
                      </h4>
                      <p className="text-xs sm:text-sm text-emerald-900 mt-1.5 leading-relaxed font-normal">
                        {nilaiData?.catatan_wali_kelas ? (
                          `"${nilaiData.catatan_wali_kelas}"`
                        ) : (
                          <span className="italic text-slate-600">Belum ada catatan khusus dari wali kelas untuk semester berjalan.</span>
                        )}
                      </p>
                      <p className="text-[11px] text-emerald-700 font-semibold mt-2">
                        — {siswa.wali_kelas} (Wali Kelas {siswa.kelas})
                      </p>
                    </div>
                  </div>
                </div>

                {/* Profil Lengkap Siswa */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Data Pokok Siswa</h3>
                      <p className="text-xs text-slate-500">Informasi identitas resmi peserta didik</p>
                    </div>
                    <button
                      onClick={() => {
                        setPasswordError(null);
                        setPasswordSuccess(null);
                        setShowPasswordModal(true);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Ganti Kata Sandi</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 text-sm">
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase">Nama Lengkap</p>
                      <p className="font-bold text-slate-800 mt-0.5">{siswa.nama}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase">NISN</p>
                      <p className="font-bold text-slate-800 mt-0.5">{siswa.nisn}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase">Nomor Induk Siswa (NIS)</p>
                      <p className="font-bold text-slate-800 mt-0.5">{siswa.nis}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase">Kelas / Tingkat</p>
                      <p className="font-bold text-slate-800 mt-0.5">Kelas {siswa.kelas} ({siswa.tingkat})</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase">Tanggal Lahir</p>
                      <p className="font-bold text-slate-800 mt-0.5">{siswa.tanggal_lahir}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase">Jenis Kelamin</p>
                      <p className="font-bold text-slate-800 mt-0.5">{siswa.jenis_kelamin === 'L' ? 'Laki-Laki' : 'Perempuan'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase">Wali Murid / Orang Tua</p>
                      <p className="font-bold text-slate-800 mt-0.5">{siswa.nama_wali}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase">No. Kontak Terdaftar</p>
                      <p className="font-bold text-slate-800 mt-0.5">{siswa.no_hp_ortu || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase">Sekolah / Lembaga</p>
                      <p className="font-bold text-emerald-800 mt-0.5">SMA A. Wahid Hasyim Tebuireng</p>
                    </div>
                  </div>
                </div>

                {/* Ringkasan Top Nilai & Jadwal */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Kartu Nilai Tertinggi */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                        <h4 className="font-bold text-slate-800 text-sm">Capaian Unggulan Nilai STS</h4>
                        <button onClick={() => setActiveTab('nilai')} className="text-xs text-emerald-700 font-semibold hover:underline">
                          Lihat Rapor Lengkap &rarr;
                        </button>
                      </div>
                      {(() => {
                        const topGrades = (nilaiData?.daftar_nilai || [])
                          .filter(n => n.is_dinilai && n.nilai > 0)
                          .sort((a, b) => b.nilai - a.nilai)
                          .slice(0, 4);

                        if (topGrades.length === 0) {
                          return (
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center text-xs text-slate-500">
                              Nilai tengah semester sedang dalam proses penginputan oleh dewan guru mata pelajaran.
                            </div>
                          );
                        }

                        return (
                          <div className="space-y-3">
                            {topGrades.map((n, idx) => (
                              <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                                <div>
                                  <p className="text-xs font-semibold text-slate-800">{n.mapel}</p>
                                  <p className="text-[10px] text-slate-500">{n.kategori}</p>
                                </div>
                                <span className="text-sm font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
                                  {n.nilai}
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span>Kriteria Ketuntasan (KKTP): <strong className="text-slate-700">75</strong></span>
                      <span>Rata-Rata Saat Ini: <strong className="text-emerald-700">{metrik.rata_rata_sts > 0 ? metrik.rata_rata_sts : '-'}</strong></span>
                    </div>
                  </div>

                  {/* Kartu Presensi Semester Ini */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                        <h4 className="font-bold text-slate-800 text-sm">Kedisiplinan & Presensi</h4>
                        <button onClick={() => setActiveTab('presensi')} className="text-xs text-emerald-700 font-semibold hover:underline">
                          Riwayat Harian &rarr;
                        </button>
                      </div>
                      <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-emerald-900">Tingkat Kehadiran</span>
                          <span className="text-sm font-bold text-emerald-800">{metrik.persentase_kehadiran}%</span>
                        </div>
                        <div className="w-full bg-emerald-200 rounded-full h-2.5 overflow-hidden">
                          <div 
                            className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500" 
                            style={{ width: `${metrik.persentase_kehadiran}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-center text-xs">
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                          <p className="text-slate-400 text-[10px]">HADIR</p>
                          <p className="font-bold text-emerald-700 mt-0.5">{presensiData?.rekap?.hadir || 0}</p>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                          <p className="text-slate-400 text-[10px]">SAKIT</p>
                          <p className="font-bold text-amber-700 mt-0.5">{presensiData?.rekap?.sakit || 0}</p>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                          <p className="text-slate-400 text-[10px]">IZIN</p>
                          <p className="font-bold text-blue-700 mt-0.5">{presensiData?.rekap?.izin || 0}</p>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                          <p className="text-slate-400 text-[10px]">ALPA</p>
                          <p className="font-bold text-rose-700 mt-0.5">{presensiData?.rekap?.alpa || 0}</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 text-center mt-4">
                      *Presensi terekam otomatis oleh wali kelas dan guru pengampu setiap jam pelajaran.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* TAB 2: RAPOR & NILAI DIGITAL                                 */}
            {/* ============================================================ */}
            {activeTab === 'nilai' && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                  <div>
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                      Tahun Ajaran {nilaiData?.tahun_ajaran || '2026/2027'} • Semester {nilaiData?.semester || 'Ganjil'}
                    </span>
                    <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
                      Rapor Sumatif Tengah Semester (STS)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Evaluasi Kurikulum Merdeka Terintegrasi Pesantren Tebuireng
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Cetak / Unduh PDF</span>
                    </button>
                  </div>
                </div>

                {/* Score Stats Banner */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-center sm:text-left">
                  <div className="p-2">
                    <p className="text-xs text-emerald-800 font-semibold">Kriteria Ketercapaian (KKTP)</p>
                    <p className="text-2xl font-black text-emerald-950 mt-1">75</p>
                  </div>
                  <div className="p-2">
                    <p className="text-xs text-emerald-800 font-semibold">Rata-Rata Nilai (Mapel Dinilai)</p>
                    <p className="text-2xl font-black text-emerald-700 mt-1">
                      {nilaiData?.rata_rata > 0 ? nilaiData.rata_rata : '-'}
                    </p>
                  </div>
                  <div className="p-2">
                    <p className="text-xs text-emerald-800 font-semibold">Progres Penilaian</p>
                    <p className="text-lg font-bold text-emerald-900 mt-1 flex items-center justify-center sm:justify-start gap-1.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>{nilaiData?.mapel_dinilai_count || 0} dari {nilaiData?.total_mapel || 21} Mapel Dinilai</span>
                    </p>
                  </div>
                </div>

                {/* Table of Subjects */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-100/80 text-slate-700 font-bold border-y border-slate-200 uppercase text-[11px] tracking-wider">
                        <th className="py-3 px-4 w-12 text-center">No</th>
                        <th className="py-3 px-4">Mata Pelajaran</th>
                        <th className="py-3 px-4 hidden md:table-cell">Kelompok Kurikulum</th>
                        <th className="py-3 px-4 text-center w-24">KKTP</th>
                        <th className="py-3 px-4 text-center w-24">Nilai STS</th>
                        <th className="py-3 px-4 text-center w-28">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(nilaiData?.daftar_nilai || []).map((n, idx) => {
                        const isGraded = n.is_dinilai && n.nilai !== null && n.nilai > 0;
                        const isPass = isGraded && n.nilai >= 75;
                        return (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-4 text-center text-slate-400 font-semibold">{idx + 1}</td>
                            <td className="py-3 px-4 font-semibold text-slate-800">{n.mapel}</td>
                            <td className="py-3 px-4 text-slate-500 text-xs hidden md:table-cell">{n.kategori}</td>
                            <td className="py-3 px-4 text-center text-slate-500 font-medium">75</td>
                            <td className="py-3 px-4 text-center font-bold text-slate-900">
                              {isGraded ? (
                                <span className={`px-2.5 py-1 rounded-lg ${isPass ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                  {n.nilai}
                                </span>
                              ) : (
                                <span className="text-slate-400 font-normal italic">-</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {isGraded ? (
                                <span className={`inline-flex items-center gap-1 text-xs font-bold ${isPass ? 'text-emerald-700' : 'text-rose-700'}`}>
                                  {isPass ? (
                                    <>
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>Tuntas</span>
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="w-3.5 h-3.5" />
                                      <span>Remedial</span>
                                    </>
                                  )}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                  Belum Diinput
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Validation Footer */}
                <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
                  <p>Dokumen ini adalah data resmi sekolah yang dapat diakses mandiri oleh siswa dan wali murid.</p>
                  <p className="font-semibold text-slate-700">Tercatat di Pangkalan Data SMA A. Wahid Hasyim Tebuireng</p>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* TAB 3: PRESENSI & ABSENSI                                    */}
            {/* ============================================================ */}
            {activeTab === 'presensi' && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Rekap Presensi Harian Siswa</h3>
                    <p className="text-xs text-slate-500">Catatan kehadiran kelas siswa semester berjalan</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                    Tingkat Kehadiran: {metrik.persentase_kehadiran}%
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                    <p className="text-xs font-bold text-emerald-800">HADIR</p>
                    <p className="text-2xl font-black text-emerald-900 mt-1">{presensiData?.rekap?.hadir || 0} Hari</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                    <p className="text-xs font-bold text-amber-800">SAKIT</p>
                    <p className="text-2xl font-black text-amber-900 mt-1">{presensiData?.rekap?.sakit || 0} Hari</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200">
                    <p className="text-xs font-bold text-sky-800">IZIN</p>
                    <p className="text-2xl font-black text-sky-900 mt-1">{presensiData?.rekap?.izin || 0} Hari</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
                    <p className="text-xs font-bold text-rose-800">ALPA / TANPA KETERANGAN</p>
                    <p className="text-2xl font-black text-rose-900 mt-1">{presensiData?.rekap?.alpa || 0} Hari</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                  <p className="font-semibold text-slate-800 mb-1">Kebijakan Kehadiran SMA AWH Tebuireng:</p>
                  <p>Siswa diwajibkan memenuhi minimal 85% kehadiran efektif per semester untuk memenuhi syarat kenaikan kelas dan kelulusan.</p>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* TAB 4: JADWAL PELAJARAN MINGGUAN                             */}
            {/* ============================================================ */}
            {activeTab === 'jadwal' && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Jadwal Pelajaran Kelas {siswa.kelas}</h3>
                    <p className="text-xs text-slate-500">Jadwal resmi pembelajaran kelas SMA A. Wahid Hasyim</p>
                  </div>
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                    Senin s/d Ahad
                  </span>
                </div>

                {jadwalList.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm">
                    Jadwal pelajaran kelas ini sedang disinkronisasikan oleh tim kurikulum.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Sabtu', 'Ahad'].map((hari) => {
                      const items = jadwalList.filter((j) => j.hari === hari);
                      if (items.length === 0) return null;
                      return (
                        <div key={hari} className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                          <h4 className="font-bold text-emerald-900 text-sm pb-2 mb-3 border-b border-slate-200 flex items-center justify-between">
                            <span>Hari {hari}</span>
                            <span className="text-xs font-normal text-slate-500">{items.length} Jam Pelajaran</span>
                          </h4>
                          <div className="space-y-2.5">
                            {items.map((item, i) => (
                              <div key={i} className="p-2.5 rounded-xl bg-white border border-slate-100 flex items-center justify-between text-xs">
                                <div>
                                  <span className="font-bold text-slate-800 block">{item.nama_mapel}</span>
                                  <span className="text-slate-500 text-[11px]">{item.nama_guru}</span>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                                    Jam ke-{item.jam_ke}
                                  </span>
                                  <span className="text-[10px] text-slate-400 block mt-0.5">{item.jam_mulai.slice(0, 5)} - {item.jam_selesai.slice(0, 5)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ============================================================ */}
            {/* TAB 5: PRESTASI & DISIPLIN (BK)                              */}
            {/* ============================================================ */}
            {activeTab === 'bk' && (
              <div className="space-y-6">
                {/* Bagian 1: Prestasi Siswa */}
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Award className="w-5 h-5 text-indigo-600" />
                      <span>Catatan Prestasi & Penghargaan Siswa</span>
                    </h3>
                  </div>

                  {bkData.prestasi.length === 0 ? (
                    <div className="p-6 rounded-xl bg-slate-50 border border-slate-100 text-center text-xs text-slate-500">
                      Belum ada catatan kejuaraan / penghargaan resmi yang dicatatkan semester ini.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {bkData.prestasi.map((p, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 flex items-start justify-between">
                          <div>
                            <span className="text-xs font-bold text-indigo-800">{p.nama_prestasi}</span>
                            <p className="text-xs text-slate-600 mt-0.5">{p.peringkat} • Tingkat {p.tingkat}</p>
                            <p className="text-[11px] text-slate-400 mt-1">Penyelenggara: {p.penyelenggara || 'Kementerian / Lembaga Mitra'}</p>
                          </div>
                          <span className="text-xs text-indigo-600 font-semibold">{p.tanggal}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bagian 2: Kedisiplinan & Bimbingan Konseling */}
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                      <span>Catatan Kedisiplinan & Poin BK</span>
                    </h3>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                      Poin Pelanggaran: {bkData.total_poin_pelanggaran} Poin
                    </span>
                  </div>

                  {bkData.pelanggaran.length === 0 ? (
                    <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-100 text-center text-xs text-emerald-800 flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Alhamdulillah, tidak ada catatan pelanggaran disiplin. Perilaku siswa sangat baik dan terpuji.</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {bkData.pelanggaran.map((pl, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-amber-50/50 border border-amber-100 flex items-start justify-between">
                          <div>
                            <span className="text-xs font-bold text-amber-900">{pl.jenis_pelanggaran}</span>
                            <p className="text-xs text-slate-600 mt-0.5">{pl.kategori_bobot} ({pl.poin} Poin)</p>
                            <p className="text-[11px] text-slate-400 mt-1">Tindakan: {pl.tindakan_penanganan || pl.status_publik}</p>
                          </div>
                          <span className="text-xs text-slate-500">{pl.tanggal}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* TAB 6: PERPUSTAKAAN DIGITAL                                  */}
            {/* ============================================================ */}
            {activeTab === 'perpustakaan' && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Perpustakaan Terakreditasi "A"</h3>
                    <p className="text-xs text-slate-500">Status peminjaman buku siswa di perpustakaan sekolah</p>
                  </div>
                  <span className="text-xs font-bold text-sky-800 bg-sky-100 px-3 py-1 rounded-full">
                    Pinjaman Aktif: {metrik.pinjaman_buku_aktif} Buku
                  </span>
                </div>

                {perpusList.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm bg-slate-50 rounded-xl border border-slate-100">
                    Saat ini tidak ada buku yang sedang dipinjam siswa.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {perpusList.map((item, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{item.judul_buku}</p>
                          <p className="text-xs text-slate-500">Penulis: {item.penulis} • Kategori: {item.kategori}</p>
                          <p className="text-[11px] text-slate-400 mt-1">Tgl Pinjam: {item.tanggal_pinjam} • Jatuh Tempo: {item.tanggal_jatuh_tempo}</p>
                        </div>
                        <span className={`text-xs font-bold px-3 py-1 rounded-lg ${
                          item.tanggal_kembali ? 'bg-slate-200 text-slate-700' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {item.tanggal_kembali ? 'Sudah Kembali' : 'Dipinjam'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        )}
      </main>

      {/* ============================================================ */}
      {/* 6. MODAL GANTI KATA SANDI SISWA / WALI MURID                */}
      {/* ============================================================ */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Ganti Kata Sandi</h3>
                  <p className="text-xs text-slate-500">Perbarui kata sandi akun Siswa / Wali Murid</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Feedback Alerts */}
            {passwordError && (
              <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Kata Sandi Lama
                </label>
                <div className="relative">
                  <input
                    type={showOldPassword ? "text" : "password"}
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Kata sandi saat ini (default: siswa123)"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Kata Sandi Baru
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Konfirmasi Kata Sandi Baru
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi baru"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Petunjuk Keamanan:</span>
                </p>
                <p>Gunakan kombinasi kata sandi yang mudah diingat oleh ananda dan orang tua/wali murid.</p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md shadow-emerald-800/20 transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  <span>{savingPassword ? 'Menyimpan...' : 'Simpan Kata Sandi Baru'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
