import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { FileSpreadsheet, Plus, Upload, CheckCircle, AlertCircle } from 'lucide-react';

const PerangkatAjar = () => {
  const [dataAjar, setDataAjar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  // Form State
  const [mapelId, setMapelId] = useState(1);
  const [tingkat, setTingkat] = useState('X');
  const [elemen, setElemen] = useState('');
  const [deskripsiCp, setDeskripsiCp] = useState('');
  const [kodeTp, setKodeTp] = useState('');
  const [deskripsiTp, setDeskripsiTp] = useState('');
  const [alokasiJp, setAlokasiJp] = useState(2);

  useEffect(() => {
    fetchPerangkatAjar();
  }, [mapelId, tingkat]);

  const fetchPerangkatAjar = async () => {
    setLoading(true);
    try {
      const res = await client.get(`/kurikulum/perangkat-ajar?mapel_id=${mapelId}&tingkat=${tingkat}`);
      setDataAjar(res.data.perangkat_ajar || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCpTp = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      await client.post('/kurikulum/perangkat-ajar/cp-tp', {
        mapel_id: parseInt(mapelId),
        tingkat: tingkat,
        elemen: elemen,
        deskripsi_cp: deskripsiCp,
        tujuan_pembelajaran: [
          {
            kode_tp: kodeTp,
            deskripsi_tp: deskripsiTp,
            alokasi_jp: parseInt(alokasiJp),
          }
        ]
      });

      setMessage({ type: 'success', text: 'Capaian Pembelajaran & Tujuan Pembelajaran berhasil disimpan!' });
      setShowForm(false);
      fetchPerangkatAjar();
    } catch (e) {
      setMessage({ type: 'error', text: 'Gagal menyimpan CP & TP.' });
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
            <FileSpreadsheet className="w-5 h-5 text-emerald-800" />
            <span>Manajemen Perangkat Ajar (CP, TP, Prota, Promes)</span>
          </h1>
          <p className="text-xs text-slate-500">
            Input Form Web & Import Spreadsheet Excel Standard Kurikulum Merdeka SMA AWH
          </p>
        </div>

        <div className="mt-2 sm:mt-0 flex items-center space-x-2">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-emerald-800 hover:bg-emerald-900 text-white px-3 py-1.5 rounded text-xs font-semibold shadow-sm transition-colors flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah CP / TP Form</span>
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

      {/* Direct Form Modal / Card */}
      {showForm && (
        <div className="card-surface p-5 space-y-4 bg-emerald-50/40 border-emerald-200">
          <h2 className="text-xs font-bold text-emerald-950 uppercase tracking-wider border-b border-emerald-200 pb-2">
            Form Tambah Capaian Pembelajaran & Tujuan Pembelajaran
          </h2>

          <form onSubmit={handleSaveCpTp} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mata Pelajaran</label>
                <select
                  value={mapelId}
                  onChange={(e) => setMapelId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-700"
                >
                  <option value={1}>Pendidikan Agama Islam (PAI)</option>
                  <option value={2}>PPKn</option>
                  <option value={3}>Bahasa Indonesia</option>
                  <option value={5}>Matematika</option>
                  <option value={8}>Biologi</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tingkat Kelas</label>
                <select
                  value={tingkat}
                  onChange={(e) => setTingkat(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-700"
                >
                  <option value="X">Kelas X (Fase E)</option>
                  <option value="XI">Kelas XI (Fase F)</option>
                  <option value="XII">Kelas XII (Fase F)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Elemen CP</label>
              <input
                type="text"
                required
                value={elemen}
                onChange={(e) => setElemen(e.target.value)}
                placeholder="Misal: Pemahaman Konsep Agama / Al-Qur'an Hadis"
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Deskripsi CP (Pemerintah Pusat)</label>
              <textarea
                required
                rows={2}
                value={deskripsiCp}
                onChange={(e) => setDeskripsiCp(e.target.value)}
                placeholder="Deskripsi Capaian Pembelajaran..."
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border-t border-emerald-200 pt-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kode TP</label>
                <input
                  type="text"
                  required
                  value={kodeTp}
                  onChange={(e) => setKodeTp(e.target.value)}
                  placeholder="TP-PAI-10.1"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs font-mono focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Alokasi JP</label>
                <input
                  type="number"
                  required
                  value={alokasiJp}
                  onChange={(e) => setAlokasiJp(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs font-mono focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Deskripsi Tujuan Pembelajaran (TP)</label>
                <input
                  type="text"
                  required
                  value={deskripsiTp}
                  onChange={(e) => setDeskripsiTp(e.target.value)}
                  placeholder="Deskripsi Tujuan Pembelajaran yang ditargetkan..."
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-700"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-3 py-1.5 bg-slate-200 text-slate-700 text-xs font-semibold rounded"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-1.5 bg-emerald-800 text-white text-xs font-semibold rounded hover:bg-emerald-900"
              >
                Simpan CP & TP
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main CP/TP Table */}
      <div className="card-surface overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-700">Filter Mapel:</span>
            <select
              value={mapelId}
              onChange={(e) => setMapelId(e.target.value)}
              className="px-3 py-1 border border-slate-300 rounded text-xs font-medium"
            >
              <option value={1}>PAI</option>
              <option value={2}>PPKn</option>
              <option value={3}>Bahasa Indonesia</option>
              <option value={5}>Matematika</option>
              <option value={8}>Biologi</option>
            </select>
          </div>

          <span className="text-xs font-mono text-slate-500">
            Total Record: {dataAjar.length} CP
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs font-mono text-slate-500">Memuat Data Perangkat Ajar...</div>
        ) : dataAjar.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Belum ada CP/TP tersimpan untuk Mapel ini. Gunakan tombol "Tambah CP / TP Form" di atas.
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {dataAjar.map((cp) => (
              <div key={cp.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded font-mono">
                    Elemen: {cp.elemen}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">Fase {cp.fase} ({cp.tingkat})</span>
                </div>
                <p className="text-xs text-slate-800 font-medium">{cp.deskripsi_cp}</p>

                {/* TP Subtable */}
                <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-2">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Daftar Tujuan Pembelajaran (TP)
                  </div>
                  {cp.tujuan_pembelajaran && cp.tujuan_pembelajaran.map((tp) => (
                    <div key={tp.id} className="flex items-center justify-between text-xs bg-white p-2 rounded border border-slate-200">
                      <div>
                        <span className="font-bold text-slate-900 font-mono mr-2">{tp.kode_tp}</span>
                        <span className="text-slate-700">{tp.deskripsi_tp}</span>
                      </div>
                      <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
                        {tp.alokasi_jp} JP
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PerangkatAjar;
