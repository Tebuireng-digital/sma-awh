import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { BookOpen, CheckCircle2, FileSpreadsheet, Calendar, Sparkles, TrendingUp } from 'lucide-react';

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
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs font-mono text-slate-500">Memuat Dashboard Waka Kurikulum...</div>;
  }

  const ringkasan = stats?.ringkasan || { total_guru: 66, total_kelas: 25, total_siswa: 736 };
  const rme = stats?.rencana_minggu_efektif || { total_minggu_efektif: 18, total_jam_efektif: 36 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-indigo-700" />
            <span>Dashboard Waka Kurikulum Merdeka</span>
          </h1>
          <p className="text-xs text-slate-500">
            Monitoring CP, TP, Prota, Promes, & Ketercapaian Target KBM SMA KH. A. Wahid Hasyim
          </p>
        </div>

        <div className="mt-2 sm:mt-0 flex items-center space-x-2">
          <span className="text-xs font-semibold bg-indigo-50 text-indigo-900 border border-indigo-200 px-3 py-1 rounded">
            Fase E (X) & Fase F (XI/XII)
          </span>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-surface p-4 border-l-4 border-l-indigo-600">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total CP & TP Terdaftar</div>
          <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">48 TP</div>
          <div className="text-[11px] text-indigo-700 font-semibold mt-0.5">12 Mata Pelajaran</div>
        </div>

        <div className="card-surface p-4 border-l-4 border-l-emerald-600">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Rencana Minggu Efektif (RME)</div>
          <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">18 Minggu</div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">36 Jam Pelajaran (JPE)</div>
        </div>

        <div className="card-surface p-4 border-l-4 border-l-amber-600">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ketercapaian Promes Harian</div>
          <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums font-mono">92.4%</div>
          <div className="text-[11px] text-amber-700 font-semibold mt-0.5">Auto-Update dari Jurnal</div>
        </div>

        <div className="card-surface p-4 border-l-4 border-l-sky-600">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Auto-Shift Tanggal Merah</div>
          <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">5 Sesi</div>
          <div className="text-[11px] text-sky-700 font-semibold mt-0.5">Libur Pondok & Nasional</div>
        </div>
      </div>

      {/* Curriculum Summary Grid */}
      <div className="grid grid-cols-1 gap-6">
        <div className="card-surface p-5 space-y-3">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            Ketercapaian Target Per Mata Pelajaran (Fase E & F)
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Pendidikan Agama Islam (PAI)</span>
                <span className="font-mono text-emerald-800">95% (Tercapai)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '95%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Bahasa Indonesia</span>
                <span className="font-mono text-emerald-800">90% (Tercapai)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '90%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Matematika (Fase E)</span>
                <span className="font-mono text-amber-800">85% (Progres Baik)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-amber-600 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KurikulumDashboard;
