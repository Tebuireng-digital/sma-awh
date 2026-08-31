import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { Bell, ShieldCheck, CheckCircle, AlertTriangle, UserPlus } from 'lucide-react';

const GuruPiket = () => {
  const [kelaskosong, setKelaskosong] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchEmptyClasses();
  }, []);

  const fetchEmptyClasses = async () => {
    try {
      const res = await client.get('/piket/kelas-kosong');
      setKelaskosong(res.data.kelas_kosong || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleKlaimInval = async (presensiId) => {
    setSubmitting(true);
    setMessage(null);
    try {
      await client.post('/piket/klaim-inval', {
        presensi_guru_id: presensiId,
      });

      setMessage({ type: 'success', text: 'Kelas inval berhasil diklaim! Status jam pelajaran diubah menjadi terisi Guru Piket.' });
      fetchEmptyClasses();
    } catch (e) {
      setMessage({ type: 'error', text: 'Gagal mengklaim kelas inval.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Bell className="w-5 h-5 text-amber-600 animate-bounce" />
            <span>Panel Guru Piket — Monitoring Kelas Kosong</span>
          </h1>
          <p className="text-xs text-slate-500">
            Deteksi Real-Time Guru Mapel Berhalangan Hadir & Penugasan Inval Sesuai Aturan Yayasan
          </p>
        </div>

        <button
          onClick={fetchEmptyClasses}
          className="mt-2 sm:mt-0 bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5 rounded text-xs font-semibold"
        >
          Refresh Kelas Kosong
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded border text-xs flex items-center space-x-2 ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Main Table */}
      <div className="card-surface overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs font-mono text-slate-500">Memeriksa Data Kelas Kosong...</div>
        ) : kelaskosong.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <ShieldCheck className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">Semua KBM Berjalan Lancar</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Tidak ada kelas kosong saat ini. Seluruh Guru Mapel telah hadir di kelas masing-masing.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Kelas & Jam Ke</th>
                  <th className="py-3 px-4">Mata Pelajaran</th>
                  <th className="py-3 px-4">Guru Utama & Alasan</th>
                  <th className="py-3 px-4">Tugas Mandiri</th>
                  <th className="py-3 px-4 text-right">Aksi Klaim Inval</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {kelaskosong.map((k) => (
                  <tr key={k.id} className="hover:bg-amber-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{k.nama_kelas}</div>
                      <div className="text-[11px] text-amber-800 font-mono">Jam Ke-{k.jam_ke}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{k.nama_mapel}</td>
                    <td className="py-3 px-4">
                      <div className="text-slate-900">{k.guru_utama}</div>
                      <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-mono uppercase">
                        {k.status_kehadiran}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 italic">
                      {k.tugas_mandiri || 'Tidak ada catatan tugas'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleKlaimInval(k.id)}
                        disabled={submitting}
                        className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded text-xs font-semibold shadow-sm transition-colors inline-flex items-center space-x-1"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Klaim Inval Kelas</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuruPiket;
