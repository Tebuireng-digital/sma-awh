import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { 
  UserCheck, Send, CheckCircle, AlertCircle, PhoneCall, 
  Users, CheckCheck, Clock, ShieldCheck, Filter 
} from 'lucide-react';

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

  const handleMarkAllHadir = () => {
    setAbsensiMap((prev) => {
      const updated = { ...prev };
      siswaList.forEach((s) => {
        updated[s.siswa_id] = { ...updated[s.siswa_id], status: 'Hadir' };
      });
      return updated;
    });
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
      await client.post('/guru/presensi-murid', {
        kelas_id: kelasId,
        presensi_guru_id: 1,
        absensi: payloadAbsensi,
      });

      setMessage({
        type: 'success',
        text: `Presensi ${payloadAbsensi.length} siswa berhasil disimpan. Laporan tersimpan di pangkalan data SIM SMA AWH.`,
      });
    } catch (e) {
      setMessage({ type: 'error', text: 'Gagal menyimpan absensi siswa. Silakan coba lagi.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Compute live count
  const statusCounts = {
    Hadir: 0,
    Sakit: 0,
    Izin: 0,
    Terlambat: 0,
    Alpa: 0,
  };
  Object.values(absensiMap).forEach((val) => {
    if (statusCounts[val.status] !== undefined) {
      statusCounts[val.status]++;
    }
  });

  const activeKelas = kelases.find((k) => k.id === kelasId);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0d281e] via-[#0f3527] to-[#124231] rounded-2xl p-6 sm:p-7 text-white shadow-md border border-emerald-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-radial from-[#c8942a]/15 to-transparent rounded-full blur-2xl pointer-events-none -mr-20 -mt-20"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold backdrop-blur-sm mb-2 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Fast Checklist Presensi Siswa</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Presensi Kelas & Kehadiran Santri
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-2xl font-normal">
              Pencatatan Kehadiran Harian & Jam Pertama • Real-Time Database SMA A. Wahid Hasyim Tebuireng
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <span className="text-xs font-semibold text-emerald-200">Pilih Kelas:</span>
            <select
              value={kelasId}
              onChange={(e) => setKelasId(parseInt(e.target.value))}
              className="px-3 py-2 bg-white text-slate-800 rounded-xl text-xs font-bold shadow-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {kelases.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama_kelas} ({k.jumlah_siswa || 30} Siswa) {k.wali_kelas ? `• Wali: ${k.wali_kelas}` : ''}
                </option>
              ))}
            </select>
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

      {/* Live Attendance Counter Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-emerald-800">Hadir</div>
            <div className="text-xl font-bold font-mono text-emerald-700">{statusCounts.Hadir}</div>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-blue-800">Sakit</div>
            <div className="text-xl font-bold font-mono text-blue-700">{statusCounts.Sakit}</div>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-amber-800">Izin</div>
            <div className="text-xl font-bold font-mono text-amber-700">{statusCounts.Izin}</div>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-purple-800">Terlambat</div>
            <div className="text-xl font-bold font-mono text-purple-700">{statusCounts.Terlambat}</div>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-sm flex items-center justify-between col-span-2 sm:col-span-1">
          <div>
            <div className="text-[10px] uppercase font-bold text-rose-800">Alpa</div>
            <div className="text-xl font-bold font-mono text-rose-700">{statusCounts.Alpa}</div>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
        </div>
      </div>

      {/* Student List Table & Fast Checklist */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-800" />
              <span>Daftar Siswa Kelas {activeKelas?.nama_kelas || ''}</span>
            </h2>
            <p className="text-[11px] text-slate-500">
              Total {siswaList.length} Murid {activeKelas?.wali_kelas ? `• Wali Kelas: ${activeKelas.wali_kelas}` : ''}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleMarkAllHadir}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Tandai Semua Hadir</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs font-mono text-slate-500 flex flex-col items-center justify-center space-y-3">
            <div className="w-7 h-7 border-2 border-emerald-800 border-t-transparent rounded-full animate-spin"></div>
            <p>Memuat daftar murid kelas...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] font-bold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">No</th>
                    <th className="py-3 px-4">Nama Siswa & NIS</th>
                    <th className="py-3 px-4 w-16 text-center">L/P</th>
                    <th className="py-3 px-4 text-center">Pilihan Kehadiran Cepat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {siswaList.map((s, idx) => {
                    const st = absensiMap[s.siswa_id]?.status || 'Hadir';
                    return (
                      <tr key={s.siswa_id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 text-center text-slate-400 font-mono text-xs">{idx + 1}</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 text-xs sm:text-sm">{s.nama}</div>
                          <div className="text-[11px] text-slate-400 font-mono">NIS: {s.nis}</div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            {s.jenis_kelamin || 'L'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex flex-wrap items-center justify-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200">
                            {[
                              { label: 'Hadir', activeBg: 'bg-emerald-700 text-white shadow-sm' },
                              { label: 'Sakit', activeBg: 'bg-blue-600 text-white shadow-sm' },
                              { label: 'Izin', activeBg: 'bg-amber-600 text-white shadow-sm' },
                              { label: 'Terlambat', activeBg: 'bg-purple-600 text-white shadow-sm' },
                              { label: 'Alpa', activeBg: 'bg-rose-600 text-white shadow-sm' },
                            ].map((opt) => (
                              <button
                                key={opt.label}
                                type="button"
                                onClick={() => handleStatusChange(s.siswa_id, opt.label)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                  st === opt.label
                                    ? opt.activeBg
                                    : 'text-slate-600 hover:bg-white hover:text-slate-900'
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                Pencatatan kehadiran tersimpan ke pangkalan data SMA A. Wahid Hasyim & dapat diakses Wali Kelas.
              </div>
              <button
                type="submit"
                disabled={submitting || siswaList.length === 0}
                className="px-6 py-2.5 bg-[#0d281e] hover:bg-emerald-900 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Send className="w-4 h-4 text-[#c8942a]" />
                <span>{submitting ? 'Menyimpan Presensi...' : 'Simpan Presensi Seluruh Siswa'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default GuruPresensiSiswa;
