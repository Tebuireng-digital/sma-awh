import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { 
  Settings, CheckCircle, AlertCircle, Clock, Users, GraduationCap, 
  BookOpen, Building2, Calendar, FileText, ArrowRight, Server, ShieldCheck,
  RotateCcw, ShieldAlert
} from 'lucide-react';
import UnvalidationQueueModal from '../components/UnvalidationQueueModal';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  // Settings State
  const [terlambat, setTerlambat] = useState(20);
  const [pendingUnvalidationCount, setPendingUnvalidationCount] = useState(0);
  const [isQueueModalOpen, setIsQueueModalOpen] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchUnvalidationCount();
  }, []);

  const fetchUnvalidationCount = async () => {
    try {
      const res = await client.get('/rapor-sts/unvalidation-requests?status=pending');
      if (res.data?.status === 'success') {
        setPendingUnvalidationCount(res.data.pending_count || 0);
      }
    } catch (e) {
      console.error('Gagal mengambil permohonan pembatalan validasi:', e);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await client.get('/admin/pengaturan');
      const p = res.data.pengaturan;
      if (p) {
        setTerlambat(p.toleransi_terlambat_menit ?? 20);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await client.post('/admin/pengaturan', {
        toleransi_terlambat_menit: parseInt(terlambat),
      });

      setMessage({ type: 'success', text: res.data.message || 'Pengaturan berhasil disimpan ke sistem.' });
    } catch (e) {
      setMessage({ type: 'error', text: 'Gagal menyimpan pengaturan ke server.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs font-mono text-slate-500 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-emerald-800 border-t-transparent rounded-full animate-spin"></div>
        <p>Memuat Pusat Kendali Administrasi SMA AWH...</p>
      </div>
    );
  }

  const quickLinks = [
    { title: 'Data Siswa & Santri', desc: '737 siswa aktif, rombel & biodata', path: '/admin/siswa', icon: Users, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    { title: 'Data Guru & Pegawai', desc: '64 pendidik & tenaga kependidikan', path: '/admin/guru', icon: GraduationCap, color: 'text-amber-700 bg-amber-50 border-amber-200' },
    { title: 'Rombongan Belajar (Kelas)', desc: '25 rombel Fase E, F & Wali Kelas', path: '/admin/kelas', icon: Building2, color: 'text-blue-700 bg-blue-50 border-blue-200' },
    { title: 'Mata Pelajaran & CP', desc: 'Struktur kurikulum nasional & pesantren', path: '/admin/mapel', icon: BookOpen, color: 'text-teal-700 bg-teal-50 border-teal-200' },
    { title: 'Jadwal KBM Harian', desc: 'Plotting jam ke-1 s/d jam ke-8', path: '/admin/jadwal', icon: Calendar, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
    { title: 'Rapor STS & Validasi', desc: 'Audit validasi rapor, cetak PDF & antrean pembatalan', path: '/walikelas/rapor', icon: RotateCcw, color: 'text-amber-800 bg-amber-50 border-amber-200' },
    { title: 'Tata Usaha & Persuratan', desc: 'Surat masuk/keluar, SK, & disposisi', path: '/persuratan', icon: FileText, color: 'text-rose-700 bg-rose-50 border-rose-200' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Identity Banner */}
      <div className="bg-gradient-to-r from-[#0d281e] via-[#0f3527] to-[#124231] rounded-2xl p-6 sm:p-7 text-white shadow-md border border-emerald-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-radial from-[#c8942a]/15 to-transparent rounded-full blur-2xl pointer-events-none -mr-20 -mt-20"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold backdrop-blur-sm mb-2 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Pusat Kendali Administrasi & Kepala Tata Usaha</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Sistem Informasi Manajemen SMA A. Wahid Hasyim
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-2xl font-normal">
              Pesantren Tebuireng Jombang • Konfigurasi Parameter Presensi, Manajemen Master Data & Pemantauan Operasional Sekolah
            </p>
          </div>

          <div className="flex flex-row md:flex-col items-start md:items-end gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#c8942a]/20 border border-[#c8942a]/40 text-[#fde047] text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Tahun Ajaran 2026/2027 (Ganjil)</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 text-slate-200 text-[11px] font-mono">
              <Server className="w-3 h-3 text-emerald-400" />
              <span>Status Server: Normal (WIB)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Siswa Aktif</div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5 font-mono">737</div>
            <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">25 Rombel Terdaftar</div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-800 shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pendidik & Staf</div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5 font-mono">64</div>
            <div className="text-[10px] text-amber-700 font-semibold mt-0.5">Guru & Tenaga Kependidikan</div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-800 shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Rombel & Kelas</div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5 font-mono">25</div>
            <div className="text-[10px] text-teal-700 font-semibold mt-0.5">Fase E (X) & Fase F (XI-XII)</div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-800 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Toleransi Terlambat</div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5 font-mono">{terlambat} Menit</div>
            <div className="text-[10px] text-indigo-700 font-semibold mt-0.5">Parameter Presensi Otomatis</div>
          </div>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border text-xs flex items-center space-x-3 font-medium transition-all ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-rose-50 text-rose-900 border-rose-200'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Pending Unvalidation Alert Banner */}
      {pendingUnvalidationCount > 0 && (
        <div className="bg-amber-50 border border-amber-300/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-amber-600 text-white rounded-xl shrink-0 shadow-xs">
              <RotateCcw className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-amber-950">
                  Permohonan Pembatalan Validasi Rapor Menunggu Persetujuan
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-mono font-bold text-[10px]">
                  {pendingUnvalidationCount} Permohonan
                </span>
              </div>
              <p className="text-xs text-amber-900/80 mt-0.5 max-w-2xl leading-relaxed">
                Wali kelas telah mengajukan permohonan pembatalan validasi lembar rapor untuk perbaikan nilai. Rapor tetap berstatus divalidasi hingga Anda menyetujui pembatalan.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsQueueModalOpen(true)}
            className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0 justify-center"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Tinjau Antrean ({pendingUnvalidationCount})</span>
          </button>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Parameter Presensi & System Config */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-emerald-50 text-emerald-800 rounded-lg">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Parameter Batas Terlambat Presensi
                  </h2>
                  <p className="text-[11px] text-slate-500">Konfigurasi kedisiplinan guru & murid</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Batas Toleransi Keterlambatan (Menit)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min={0}
                    max={180}
                    value={terlambat}
                    onChange={(e) => setTerlambat(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-medium">menit</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                  Guru dan siswa yang melakukan presensi melebihi batas waktu toleransi ini setelah jam KBM dimulai akan otomatis berstatus <span className="font-semibold text-amber-700">"Terlambat"</span> pada rekap jurnal & kehadiran.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#0d281e] hover:bg-emerald-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center justify-center space-x-2 disabled:bg-slate-300"
                >
                  <Settings className="w-4 h-4" />
                  <span>{submitting ? 'Menyimpan Pengaturan...' : 'Simpan Perubahan Parameter'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* System Environment Information */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
              <Server className="w-3.5 h-3.5 text-emerald-700" />
              <span>Informasi Lingkungan Sistem</span>
            </h3>
            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Versi Portal SIM</span>
                <span className="font-mono font-bold text-slate-800">v2.4 (Kurikulum Merdeka)</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Zona Waktu Sekolah</span>
                <span className="font-mono font-bold text-slate-800">WIB (UTC+07:00)</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Geofencing Presensi</span>
                <span className="font-semibold text-emerald-700">Aktif (Radius Kampus AWH)</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Pemberitahuan Ortu</span>
                <span className="font-semibold text-slate-700">Rekap Bulanan Terjadwal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Quick Portals for Master Data & Administration */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Akses Cepat Master Data & Administrasi
                </h2>
                <p className="text-[11px] text-slate-500">
                  Navigasi langsung untuk pengelolaan data akademik dan kelembagaan
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {quickLinks.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={idx}
                    to={item.path}
                    className="p-4 rounded-xl border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition-all group bg-slate-50/50 hover:bg-white flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between">
                      <div className={`p-2.5 rounded-lg border ${item.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-700 group-hover:translate-x-1 transition-all" />
                    </div>
                    <div className="mt-3">
                      <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                        {item.desc}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Guidelines Note for TU */}
          <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
            <div className="p-2 bg-emerald-800 text-white rounded-lg shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="text-xs space-y-1">
              <div className="font-bold text-emerald-950">
                Panduan Tata Usaha & Staf Administrasi
              </div>
              <p className="text-emerald-900/80 leading-relaxed">
                Setiap awal tahun ajaran baru, pastikan data siswa, plot wali kelas, dan pembagian mata pelajaran diisi secara berurutan. Format penulisan nomor surat dan agenda persuratan dapat dikelola melalui modul Tata Naskah Persuratan.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Modal Antrean Pembatalan Validasi (Admin) */}
      <UnvalidationQueueModal
        isOpen={isQueueModalOpen}
        onClose={() => setIsQueueModalOpen(false)}
        isAdmin={true}
        onActionComplete={fetchUnvalidationCount}
      />
    </div>
  );
};

export default AdminDashboard;
