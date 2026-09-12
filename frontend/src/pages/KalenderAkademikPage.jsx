import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { Calendar, Plus, RefreshCw, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

const KalenderAkademikPage = () => {
  const [kalender, setKalender] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sumberFilter, setSumberFilter] = useState('all');
  const [showEventForm, setShowEventForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  // Form Event
  const [sumberKalender, setSumberKalender] = useState('sekolah_pondok');
  const [jenisHari, setJenisHari] = useState('kegiatan_pondok');
  const [tanggal, setTanggal] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [isLibur, setIsLibur] = useState(true);

  // Rollover Form
  const [showRolloverModal, setShowRolloverModal] = useState(false);
  const [tahunAjaranBaru, setTahunAjaranBaru] = useState('2027/2028');

  useEffect(() => {
    fetchKalender();
  }, [sumberFilter]);

  const fetchKalender = async () => {
    setLoading(true);
    try {
      const param = sumberFilter !== 'all' ? `?sumber_kalender=${sumberFilter}` : '';
      const res = await client.get(`/admin/kalender-akademik${param}`);
      setKalender(res.data.kalender || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      await client.post('/admin/kalender-akademik', {
        tahun_ajaran_id: 1,
        sumber_kalender: sumberKalender,
        jenis_hari: jenisHari,
        tanggal: tanggal,
        keterangan: keterangan,
        is_libur: isLibur,
        is_acara_pondok: sumberKalender === 'sekolah_pondok',
      });

      setMessage({ type: 'success', text: 'Agenda Kalender Akademik berhasil ditambahkan!' });
      setShowEventForm(false);
      fetchKalender();
    } catch (e) {
      setMessage({ type: 'error', text: 'Gagal menambah agenda kalender.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRunRollover = async () => {
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await client.post('/admin/tahun-ajaran-rollover', {
        tahun_ajaran: tahunAjaranBaru,
        tanggal_mulai: '2027-07-15',
        tanggal_selesai: '2028-06-20',
      });

      setMessage({ type: 'success', text: res.data.message });
      setShowRolloverModal(false);
    } catch (e) {
      const errMsg = e.response?.data?.message || 'Gagal menjalankan Rollover Tahun Ajaran.';
      setMessage({ type: 'error', text: errMsg });
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
            <Calendar className="w-5 h-5 text-emerald-800" />
            <span>Dual-Source Kalender Akademik & Multi-Year Rollover</span>
          </h1>
          <p className="text-xs text-slate-500">
            Kombinasi Kalender Kemenag/Dinas & Acara Pesantren Tebuireng untuk RME & Auto-Shift Promes
          </p>
        </div>

        <div className="mt-2 sm:mt-0 flex items-center space-x-2">
          <button
            onClick={() => setShowEventForm(!showEventForm)}
            className="bg-emerald-800 hover:bg-emerald-900 text-white px-3 py-1.5 rounded text-xs font-semibold shadow-sm transition-colors flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Agenda Kalender</span>
          </button>

          <button
            onClick={() => setShowRolloverModal(true)}
            className="bg-indigo-900 hover:bg-indigo-950 text-white px-3 py-1.5 rounded text-xs font-semibold shadow-sm transition-colors flex items-center space-x-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>1-Click Rollover Tahun Ajaran</span>
          </button>
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

      {/* Rollover Modal */}
      {showRolloverModal && (
        <div className="card-surface p-5 space-y-4 bg-indigo-50/50 border-indigo-200">
          <div className="flex items-center space-x-2 text-indigo-900 border-b border-indigo-200 pb-2">
            <Sparkles className="w-5 h-5 text-indigo-700" />
            <h2 className="text-sm font-bold uppercase tracking-wider">
              1-Click Multi-Year Academic Rollover Engine
            </h2>
          </div>

          <p className="text-xs text-slate-700">
            Fitur ini secara otomatis memigrasikan seluruh struktur master CP, TP, Bank Soal, dan Data Guru/Siswa ke Tahun Ajaran Baru tanpa menghapus histori data lama.
          </p>

          <div className="flex items-center space-x-3">
            <label className="text-xs font-semibold text-slate-700">Nama Tahun Ajaran Baru:</label>
            <input
              type="text"
              value={tahunAjaranBaru}
              onChange={(e) => setTahunAjaranBaru(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded text-xs font-mono font-bold"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowRolloverModal(false)}
              className="px-3 py-1.5 bg-slate-200 text-slate-700 text-xs font-semibold rounded"
            >
              Batal
            </button>
            <button
              onClick={handleRunRollover}
              disabled={submitting}
              className="px-4 py-1.5 bg-indigo-900 text-white text-xs font-semibold rounded hover:bg-indigo-950"
            >
              {submitting ? 'Menjalankan Engine...' : 'Eksekusi Rollover Tahun Ajaran'}
            </button>
          </div>
        </div>
      )}

      {/* Add Event Form */}
      {showEventForm && (
        <div className="card-surface p-5 space-y-3 bg-emerald-50/40 border-emerald-200">
          <h2 className="text-xs font-bold text-emerald-950 uppercase tracking-wider border-b border-emerald-200 pb-2">
            Form Agenda / Libur Kalender Akademik
          </h2>

          <form onSubmit={handleAddEvent} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Sumber Kalender</label>
                <select
                  value={sumberKalender}
                  onChange={(e) => setSumberKalender(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-700"
                >
                  <option value="sekolah_pondok">Sekolah / Pesantren Tebuireng</option>
                  <option value="kemenag_dinas">Kemenag / Dinas Pendidikan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Agenda</label>
                <select
                  value={jenisHari}
                  onChange={(e) => setJenisHari(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-700"
                >
                  <option value="kegiatan_pondok">Acara / Pengajian Pesantren</option>
                  <option value="libur_nasional">Libur Nasional</option>
                  <option value="ujian">Ujian / Asesmen Sumatif</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal</label>
                <input
                  type="date"
                  required
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nama / Keterangan Event</label>
              <input
                type="text"
                required
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                placeholder="Misal: Haul KH. Hasyim Asy'ari / Libur Hari Santri"
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowEventForm(false)}
                className="px-3 py-1.5 bg-slate-200 text-slate-700 text-xs font-semibold rounded"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-1.5 bg-emerald-800 text-white text-xs font-semibold rounded hover:bg-emerald-900"
              >
                Simpan Agenda
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Master Event Table */}
      <div className="card-surface overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-700">Filter Sumber Kalender:</span>
            <select
              value={sumberFilter}
              onChange={(e) => setSumberFilter(e.target.value)}
              className="px-3 py-1 border border-slate-300 rounded text-xs font-medium"
            >
              <option value="all">Semua (Kemenag + Pesantren Tebuireng)</option>
              <option value="sekolah_pondok">Sekolah / Pesantren Tebuireng</option>
              <option value="kemenag_dinas">Kemenag / Dinas</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs font-mono text-slate-500">Memuat Kalender Akademik...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Sumber Kalender</th>
                  <th className="py-3 px-4">Nama Agenda / Event</th>
                  <th className="py-3 px-4">Jenis Hari</th>
                  <th className="py-3 px-4 text-center">Pengaruh Ke Promes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {kalender.map((k) => (
                  <tr key={k.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{k.tanggal}</td>
                    <td className="py-3 px-4">
                      {k.sumber_kalender === 'sekolah_pondok' ? (
                        <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] px-2 py-0.5 rounded font-semibold uppercase">
                          Pesantren Tebuireng
                        </span>
                      ) : (
                        <span className="bg-sky-100 text-sky-900 border border-sky-300 text-[10px] px-2 py-0.5 rounded font-semibold uppercase">
                          Kemenag / Dinas
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{k.keterangan}</td>
                    <td className="py-3 px-4 text-slate-600 uppercase text-[11px] font-mono">{k.jenis_hari}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="bg-amber-100 text-amber-900 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                        Auto-Shift Target Promes
                      </span>
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

export default KalenderAkademikPage;
