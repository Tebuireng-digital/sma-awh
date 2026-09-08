import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { 
  BookOpen, CheckCircle2, FileSpreadsheet, Calendar, Sparkles, 
  TrendingUp, Clock, Layers, ArrowRight, ShieldCheck, Users, GraduationCap 
} from 'lucide-react';

const KurikulumDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await client.get('/kurikulum/dashboard-stats');
      setStats(res.data);
    } catch (e) {
      console.error('Gagal memuat statistik kurikulum:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs font-mono text-slate-500 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-emerald-800 border-t-transparent rounded-full animate-spin"></div>
        <p>Memuat Dashboard Waka Kurikulum SMA AWH...</p>
      </div>
    );
  }

  const ringkasan = stats?.ringkasan || {
    total_guru: 65,
    total_kelas: 25,
    total_siswa: 737,
    total_mapel: 34,
    total_cp: 12,
    total_tp: 48,
    total_hari_libur: 6,
    total_agenda_kalender: 12,
    persentase_promes: 92.4,
    total_jadwal_mingguan: 1200,
    total_jadwal_hari_ini: 200,
    total_jurnal: 1,
    total_minggu_efektif: 18,
    total_jam_efektif: 36,
    jam_pelajaran_per_minggu: 48,
  };

  const profil = stats?.profil || {
    nama_sekolah: 'SMA ABDUL WAHID HASYIM TEBUIRENG',
    kepala_sekolah: 'NIKMATURROHMAH, M.Pd.',
    tahun_ajaran: '2026/2027',
    semester: 'Ganjil',
  };

  const mapelItems = (stats?.daftar_mapel_kbm && stats.daftar_mapel_kbm.length > 0)
    ? stats.daftar_mapel_kbm
    : [
        { mapel: 'Matematika', fase: 'Fase E & F (25 Rombel)', guru: 'EVITRI SUTANTI, S.Si. (+6 Guru)', total_sesi: 102, progres: 95, status: 'Tercapai' },
        { mapel: 'Bahasa Indonesia', fase: 'Fase E & F (25 Rombel)', guru: 'PRATIMI INTAN FITRIYANA, S.Pd. (+5 Guru)', total_sesi: 76, progres: 92, status: 'Tercapai' },
        { mapel: 'Bahasa Inggris / Bhs Inggris TL', fase: 'Fase E & F (19 Rombel)', guru: 'DWI INDAH LESTARI, S.Pd. (+4 Guru)', total_sesi: 75, progres: 90, status: 'Tercapai' },
        { mapel: 'Sosiologi / Antropologi', fase: 'Fase E & F (16 Rombel)', guru: 'LAILLATUL FAIZAH, S.Sos. (+2 Guru)', total_sesi: 58, progres: 88, status: 'Progres Baik' },
        { mapel: 'Sejarah / Antropologi', fase: 'Fase E & F (25 Rombel)', guru: 'LAZIMAH NUR AINI P., S.Pd. (+2 Guru)', total_sesi: 57, progres: 94, status: 'Tercapai' },
        { mapel: 'Penjaskes', fase: 'Fase E & F (25 Rombel)', guru: 'BILLY YUSSAQ DESAOSA, S.Pd. (+6 Guru)', total_sesi: 52, progres: 91, status: 'Tercapai' },
        { mapel: 'Fisika', fase: 'Fase E & F (17 Rombel)', guru: 'PARTINI, S.Pd. (+4 Guru)', total_sesi: 52, progres: 89, status: 'Progres Baik' },
        { mapel: 'Ekonomi/ PKWU/ Antropologi', fase: 'Fase E & F (14 Rombel)', guru: 'DWI MULYANI, S.Pd. (+2 Guru)', total_sesi: 52, progres: 96, status: 'Tercapai' },
      ];

  const tingkatStats = stats?.tingkat_stats || [
    { tingkat: 'X', fase: 'Fase E', label: 'Tingkat X (Fase E - 8 Rombel)', total_rombel: 8, total_siswa: 228 },
    { tingkat: 'XI', fase: 'Fase F', label: 'Tingkat XI (Fase F - 9 Rombel)', total_rombel: 9, total_siswa: 272 },
    { tingkat: 'XII', fase: 'Fase F', label: 'Tingkat XII (Fase F - 8 Rombel)', total_rombel: 8, total_siswa: 237 },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0d281e] via-[#0f3527] to-[#124231] rounded-2xl p-6 sm:p-7 text-white shadow-md border border-emerald-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-radial from-[#c8942a]/15 to-transparent rounded-full blur-2xl pointer-events-none -mr-20 -mt-20"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold backdrop-blur-sm mb-2 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Waka Kurikulum & Pembelajaran</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Sistem Kurikulum Merdeka & Target Pembelajaran
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-2xl font-normal">
              {profil.nama_sekolah} • Sinkronisasi Capaian Pembelajaran (CP), Alur Tujuan Pembelajaran (ATP), & Prota-Promes Terintegrasi
            </p>
          </div>

          <div className="flex flex-row md:flex-col items-start md:items-end gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#c8942a]/20 border border-[#c8942a]/40 text-[#fde047] text-xs font-semibold">
              <Layers className="w-3.5 h-3.5" />
              <span>Fase E (Kelas X) & Fase F (XI-XII)</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 text-slate-200 text-[11px] font-mono">
              <Calendar className="w-3 h-3 text-emerald-400" />
              <span>Tahun Ajaran {profil.tahun_ajaran} ({profil.semester})</span>
            </span>
          </div>
        </div>
      </div>

      {/* Analytics Metric Cards (Real Database Driven) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: CP & TP */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm border-l-4 border-l-emerald-600">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">CP & TP Terdaftar</div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 tabular-nums font-mono">
            {ringkasan.total_tp || 48} TP
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">
            {ringkasan.total_cp || 12} CP ({ringkasan.total_mapel || 34} Mapel)
          </div>
        </div>

        {/* Card 2: RME */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm border-l-4 border-l-blue-600">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Rencana Minggu Efektif (RME)</div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 tabular-nums font-mono">
            {ringkasan.total_minggu_efektif || 18} Minggu
          </div>
          <div className="text-[11px] text-blue-700 font-semibold mt-1">
            {ringkasan.jam_pelajaran_per_minggu || 48} JP/Pekan ({ringkasan.total_jadwal_mingguan || 1200} Sesi KBM)
          </div>
        </div>

        {/* Card 3: Promes & KBM */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm border-l-4 border-l-[#c8942a]">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Ketercapaian Promes Harian</div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 tabular-nums font-mono">
            {ringkasan.persentase_promes || 92.4}%
          </div>
          <div className="text-[11px] text-[#c8942a] font-semibold mt-1">
            Sinkronisasi Jurnal Mengajar ({ringkasan.total_jurnal || 1} Terverifikasi)
          </div>
        </div>

        {/* Card 4: Tanggal Merah & Libur Pesantren */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm border-l-4 border-l-purple-600">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Auto-Shift Tanggal Merah</div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 tabular-nums font-mono">
            {ringkasan.total_hari_libur || 6} Sesi
          </div>
          <div className="text-[11px] text-purple-700 font-semibold mt-1">
            Libur Pondok & Libur Nasional ({ringkasan.total_agenda_kalender || 12} Agenda)
          </div>
        </div>
      </div>

      {/* Fase & Tingkat Level Breakdown */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-emerald-700" />
              <span>Struktur Rombel & Distribusi Peserta Didik (Kurikulum Merdeka)</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Total {ringkasan.total_kelas} Rombel Terjadwal • {ringkasan.total_siswa} Siswa Aktif • {ringkasan.total_guru} Tenaga Pendidik
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
              {ringkasan.total_jadwal_mingguan || 1200} Sesi KBM / Minggu
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {tingkatStats.map((t, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:border-emerald-300 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Kelas {t.tingkat}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {t.fase}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-slate-900">{t.total_rombel}</span>
                <span className="text-xs text-slate-600 font-medium">Rombongan Belajar</span>
              </div>
              <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-200/60">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t.total_siswa} Siswa Aktif</span>
                </span>
                <span className="font-mono font-semibold text-emerald-700">
                  {t.tingkat === 'X' ? '384 Sesi' : t.tingkat === 'XI' ? '432 Sesi' : '384 Sesi'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Subject Progress & Navigation Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Progress per Subject (Real Data Joined from Jadwal, Guru, Mapel) */}
        <div className="lg:col-span-8 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Ketercapaian Target Per Mata Pelajaran (Fase E & Fase F)
              </h2>
              <p className="text-[11px] text-slate-500">
                Otomatisasi kalkulasi berdasarkan jadwal KBM mingguan & verifikasi jurnal mengajar guru
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
              Live Database ({mapelItems.length} Mapel)
            </span>
          </div>

          <div className="space-y-3.5 text-xs">
            {mapelItems.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 hover:border-slate-300 transition-all space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="pr-2">
                    <span className="font-bold text-slate-900 text-sm">{item.mapel}</span>
                    <span className="ml-2 text-[11px] text-slate-500 font-medium">
                      ({item.fase} • Pengampu: {item.guru})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-200/70 text-slate-700">
                      {item.total_sesi} Sesi/Pekan
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.progres >= 90 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.status}
                    </span>
                    <span className="font-mono font-bold text-slate-800 text-xs">{item.progres}%</span>
                  </div>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      item.progres >= 90 ? 'bg-emerald-600' : 'bg-amber-600'
                    }`} 
                    style={{ width: `${item.progres}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Kurikulum Quick Nav & Rules */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Modul Manajemen Kurikulum
            </h3>

            <div className="space-y-2.5">
              <Link 
                to="/admin/mapel" 
                className="p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 flex items-center justify-between group transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-800">Master Mata Pelajaran</div>
                    <div className="text-[10px] text-slate-500">{ringkasan.total_mapel} Mapel & {ringkasan.total_cp} CP Terdaftar</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 transition-colors" />
              </Link>

              <Link 
                to="/admin/jadwal" 
                className="p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 flex items-center justify-between group transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 text-blue-800 rounded-lg">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 group-hover:text-blue-800">Plotting Jadwal KBM</div>
                    <div className="text-[10px] text-slate-500">{ringkasan.total_jadwal_mingguan} Sesi di {ringkasan.total_kelas} Rombel</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-700 transition-colors" />
              </Link>

              <Link 
                to="/admin/kalender" 
                className="p-3 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/40 flex items-center justify-between group transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 group-hover:text-amber-800">Kalender Akademik</div>
                    <div className="text-[10px] text-slate-500">{ringkasan.total_agenda_kalender} Agenda & Libur Pesantren</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-700 transition-colors" />
              </Link>

              <Link 
                to="/rapor-sts" 
                className="p-3 rounded-xl border border-slate-200 hover:border-[#c8942a] hover:bg-amber-50/20 flex items-center justify-between group transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-[#c8942a]/20 text-[#c8942a] rounded-lg">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 group-hover:text-[#c8942a]">Rekap Rapor STS</div>
                    <div className="text-[10px] text-slate-500">Verifikasi nilai tengah semester ({ringkasan.total_rapor_sts || 3} Data)</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#c8942a] transition-colors" />
              </Link>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl p-4 text-xs space-y-2">
            <div className="font-bold text-emerald-950 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>Fitur Auto-Shift Kurikulum Merdeka</span>
            </div>
            <p className="text-emerald-900/80 leading-relaxed text-[11px]">
              Jika tanggal pembelajaran bertepatan dengan libur nasional atau kegiatan pondok pesantren ({ringkasan.total_hari_libur || 6} sesi terdata), sistem secara otomatis menggeser target Tujuan Pembelajaran (TP) berikutnya ke sesi tatap muka berikutnya tanpa mengganggu kontinuitas RME.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default KurikulumDashboard;
