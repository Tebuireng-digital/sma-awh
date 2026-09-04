import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { BarChart3, ShieldCheck, Users, CheckCircle, Smartphone, BookOpen } from 'lucide-react';

const KepsekDashboard = () => {
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
    return <div className="p-8 text-center text-xs font-mono text-slate-500">Memuat Portal Eksekutif Kepala Sekolah...</div>;
  }

  const ringkasan = stats?.ringkasan || { total_guru: 66, total_kelas: 25, total_siswa: 736 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-emerald-800" />
            <span>Portal Eksekutif Kepala Sekolah</span>
          </h1>
          <p className="text-xs text-slate-500">
            Laporan Real-Time Kedisiplinan Guru/Siswa & Ketercapaian Kurikulum Merdeka SMA KH. A. Wahid Hasyim
          </p>
        </div>

        <div className="mt-2 sm:mt-0 flex items-center space-x-2">
          <span className="text-xs font-bold text-emerald-900 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded">
            Tahun Ajaran 2026/2027
          </span>
        </div>
      </div>

      {/* Top Executive KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-surface p-4">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Persentase Kehadiran Guru</div>
          <div className="text-2xl font-bold text-emerald-800 mt-1 tabular-nums font-mono">98.5%</div>
          <div className="text-[11px] text-slate-500 mt-0.5">65 dari 66 Hadir Hari Ini</div>
        </div>

        <div className="card-surface p-4">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Kehadiran Siswa & Santri</div>
          <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums font-mono">96.8%</div>
          <div className="text-[11px] text-slate-500 mt-0.5">712/736 Siswa Hadir</div>
        </div>

        <div className="card-surface p-4">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ketercapaian Promes</div>
          <div className="text-2xl font-bold text-indigo-900 mt-1 tabular-nums font-mono">92.4%</div>
          <div className="text-[11px] text-indigo-700 mt-0.5">Sesuai Target RME</div>
        </div>

        <div className="card-surface p-4">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Jumlah Guru Inval</div>
          <div className="text-2xl font-bold text-amber-800 mt-1 tabular-nums font-mono">1 Guru</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Menggantikan 2 Sesi Kelas</div>
        </div>
      </div>

      {/* Detailed Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-surface p-5 space-y-3">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            Ringkasan Kedisiplinan Guru per Tingkat
          </h2>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-2 px-3">Tingkat Kelas</th>
                <th className="py-2 px-3">Hadir Tepat Waktu</th>
                <th className="py-2 px-3">Terlambat</th>
                <th className="py-2 px-3">Guru Inval</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              <tr>
                <td className="py-2.5 px-3 font-bold">Tingkat X (Fase E)</td>
                <td className="py-2.5 px-3 font-mono text-emerald-700">99.1%</td>
                <td className="py-2.5 px-3 font-mono text-amber-700">0.9%</td>
                <td className="py-2.5 px-3 font-mono text-slate-500">0 Sesi</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold">Tingkat XI (Fase F)</td>
                <td className="py-2.5 px-3 font-mono text-emerald-700">98.2%</td>
                <td className="py-2.5 px-3 font-mono text-amber-700">1.8%</td>
                <td className="py-2.5 px-3 font-mono text-slate-500">1 Sesi</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold">Tingkat XII (Fase F)</td>
                <td className="py-2.5 px-3 font-mono text-emerald-700">98.0%</td>
                <td className="py-2.5 px-3 font-mono text-amber-700">2.0%</td>
                <td className="py-2.5 px-3 font-mono text-slate-500">0 Sesi</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default KepsekDashboard;
