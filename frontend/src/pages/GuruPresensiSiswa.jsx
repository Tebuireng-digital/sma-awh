import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { UserCheck, Send, CheckCircle, AlertCircle, PhoneCall } from 'lucide-react';

const GuruPresensiSiswa = () => {
  const [kelases, setKelases] = useState([]);
  const [kelasId, setKelasId] = useState(1);
  const [siswaList, setSiswaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [absensiMap, setAbsensiMap] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchKelases();
  }, []);

  useEffect(() => {
    if (kelasId) {
      fetchSiswa();
    }
  }, [kelasId]);

  const fetchKelases = async () => {
    try {
      const res = await client.get('/master/kelas');
      const list = res.data.kelas || [];
      setKelases(list);
      if (list.length > 0) {
        setKelasId(list[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSiswa = async () => {
    setLoading(true);
    try {
      const res = await client.get(`/guru/siswa-kelas/${kelasId}`);
      const data = res.data.siswa || [];
      setSiswaList(data);

      // Default status to Hadir for fast checklist
      const defaultMap = {};
      data.forEach((s) => {
        defaultMap[s.siswa_id] = { status: 'Hadir', keterangan: '' };
      });
      setAbsensiMap(defaultMap);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (siswaId, newStatus) => {
    setAbsensiMap((prev) => ({
      ...prev,
      [siswaId]: { ...prev[siswaId], status: newStatus },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const payloadAbsensi = Object.keys(absensiMap).map((sId) => ({
      siswa_id: parseInt(sId),
      status: absensiMap[sId].status,
      keterangan: absensiMap[sId].keterangan || null,
    }));

    try {
      const res = await client.post('/guru/presensi-murid', {
        kelas_id: kelasId,
        presensi_guru_id: 1,
        absensi: payloadAbsensi,
      });

      setMessage({
        type: 'success',
        text: `Absensi ${payloadAbsensi.length} siswa kelas ini berhasil disimpan ke database! Rekap WA Wali Santri akan dikirim 1 bulan sekali setelah disetujui Admin.`,
      });
    } catch (e) {
      setMessage({ type: 'error', text: 'Gagal menyimpan absensi siswa. Silakan coba lagi.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Absensi Cepat Murid (Fast Checklist)
          </h1>
          <p className="text-xs text-slate-500">
            Jam Ke-1 & Harian — Presensi 736 Siswa per Kelas Sesuai Database SMA AWH
          </p>
        </div>

        <div className="mt-2 sm:mt-0 flex items-center space-x-2">
          <label className="text-xs font-semibold text-slate-700">Pilih Kelas ({kelases.length} Kelas):</label>
          <select
            value={kelasId}
            onChange={(e) => setKelasId(parseInt(e.target.value))}
            className="px-3 py-1.5 border border-slate-300 rounded text-xs font-medium focus:ring-1 focus:ring-emerald-700"
          >
            {kelases.map((k) => (
              <option key={k.id} value={k.id}>
                {k.nama_kelas} ({k.jumlah_siswa} Siswa) {k.wali_kelas ? `— Wali: ${k.wali_kelas}` : ''}
              </option>
            ))}
          </select>
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

      {/* Student List Table */}
      <div className="card-surface overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs font-mono text-slate-500">Memuat Daftar Murid Kelas...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">No</th>
                    <th className="py-3 px-4">NIS & Nama Siswa</th>
                    <th className="py-3 px-4">L/P</th>
                    <th className="py-3 px-4 text-center">Status Kehadiran</th>
                    <th className="py-3 px-4 font-mono text-[11px]">Rekap Bulanan WA Ortu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {siswaList.map((s, idx) => {
                    const st = absensiMap[s.siswa_id]?.status || 'Hadir';
                    return (
                      <tr key={s.siswa_id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-4 text-center text-slate-500 tabular-nums">{idx + 1}</td>
                        <td className="py-2.5 px-4">
                          <div className="font-bold text-slate-900">{s.nama}</div>
                          <div className="text-[11px] text-slate-400 font-mono">NIS: {s.nis}</div>
                        </td>
                        <td className="py-2.5 px-4">{s.jenis_kelamin}</td>
                        <td className="py-2.5 px-4 text-center">
                          <div className="inline-flex space-x-1 bg-slate-100 p-1 rounded-md border border-slate-200">
                            {['Hadir', 'Sakit', 'Izin', 'Terlambat', 'Alpa'].map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => handleStatusChange(s.siswa_id, opt)}
                                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                                  st === opt
                                    ? opt === 'Hadir' ? 'bg-emerald-700 text-white'
                                      : opt === 'Alpa' ? 'bg-rose-700 text-white'
                                      : opt === 'Terlambat' ? 'bg-amber-600 text-white'
                                      : 'bg-sky-700 text-white'
                                    : 'text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="inline-flex items-center space-x-1 text-[11px] text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-mono">
                            <span>Rekap 1 Bln (Admin)</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="bg-emerald-800 hover:bg-emerald-900 text-white px-5 py-2 rounded text-xs font-semibold shadow-sm transition-colors flex items-center space-x-1.5"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Menyimpan Absensi...' : 'Simpan Presensi Murid'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default GuruPresensiSiswa;
