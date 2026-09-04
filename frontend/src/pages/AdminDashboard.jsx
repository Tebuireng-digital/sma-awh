import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { Settings, CheckCircle, AlertCircle, Clock } from 'lucide-react';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  // Settings State
  const [terlambat, setTerlambat] = useState(20);

  useEffect(() => {
    fetchSettings();
  }, []);

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

      setMessage({ type: 'success', text: res.data.message || 'Pengaturan berhasil disimpan.' });
    } catch (e) {
      setMessage({ type: 'error', text: 'Gagal menyimpan pengaturan.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs font-mono text-slate-500">Memuat Pengaturan Sistem...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Settings className="w-5 h-5 text-emerald-800" />
            <span>Pengaturan Sistem</span>
          </h1>
          <p className="text-xs text-slate-500">
            Pengaturan Parameter Utama & Batas Terlambat
          </p>
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded border text-xs flex items-center space-x-2 ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Pengaturan Batas Terlambat */}
        <div className="card-surface p-5 space-y-4 border border-slate-200 bg-white rounded-xl shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center space-x-2 text-slate-900">
              <Clock className="w-4 h-4 text-emerald-700" />
              <h2 className="text-xs font-bold uppercase tracking-wider">
                Parameter Batas Terlambat Presensi
              </h2>
            </div>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Batas Terlambat (Menit)</label>
              <input
                type="number"
                required
                min={0}
                value={terlambat}
                onChange={(e) => setTerlambat(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs font-mono focus:ring-1 focus:ring-emerald-700"
              />
              <p className="text-[10px] text-slate-500 mt-1">Siswa/Guru yang hadir setelah batas ini akan ditandai Terlambat otomatis.</p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="bg-emerald-800 hover:bg-emerald-900 text-white px-4 py-2 rounded text-xs font-semibold shadow-sm transition-colors"
              >
                {submitting ? 'Menyimpan...' : 'Simpan Pengaturan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
