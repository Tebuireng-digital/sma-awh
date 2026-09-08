import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { 
  MapPin, Clock, CheckCircle, AlertCircle, Sparkles, Send, 
  ShieldAlert, CheckCircle2, BookOpen, Calendar, Compass 
} from 'lucide-react';

const GuruPresensi = () => {
  const [jadwal, setJadwal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJadwal, setSelectedJadwal] = useState(null);
  const [coords, setCoords] = useState({ lat: -7.5878, lng: 112.2345 });
  const [statusMasuk, setStatusMasuk] = useState('hadir');
  const [submitting, setSubmitting] = useState(false);
  const [presensiActive, setPresensiActive] = useState(null);
  const [message, setMessage] = useState(null);

  // Form Jurnal
  const [babMateri, setBabMateri] = useState('');
  const [catatanKelas, setCatatanKelas] = useState('');
  const [tugasMandiri, setTugasMandiri] = useState('');
  const [tpSuggested, setTpSuggested] = useState(null);
  const [statusKetercapaian, setStatusKetercapaian] = useState('tercapai');

  useEffect(() => {
    fetchSchedule();
    captureGps();
  }, []);

  const fetchSchedule = async () => {
    try {
      const res = await client.get('/guru/jadwal-hari-ini');
      const list = res.data.jadwal || [];
      setJadwal(list);
      if (list.length > 0) {
        const item = list[0];
        setSelectedJadwal(item);
        if (item.promes_suggestion) {
          setTpSuggested(item.promes_suggestion);
          setBabMateri(item.promes_suggestion.deskripsi_tp || '');
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const captureGps = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.log('Using default school GPS'),
        { enableHighAccuracy: true }
      );
    }
  };

  const handlePresensiMasuk = async () => {
    if (!selectedJadwal) {
      setMessage({ type: 'error', text: 'Silakan pilih jadwal KBM terlebih dahulu!' });
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await client.post('/guru/presensi-masuk', {
        jadwal_id: selectedJadwal.id || selectedJadwal.jadwal_id,
        latitude: coords.lat,
        longitude: coords.lng,
        status_kehadiran: statusMasuk,
      });

      setPresensiActive(res.data.presensi_guru_id);
      setMessage({ type: 'success', text: 'Presensi Masuk KBM berhasil diverifikasi via GPS Geofencing SMA AWH!' });
    } catch (e) {
      setMessage({ type: 'error', text: e.response?.data?.message || 'Gagal presensi masuk.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSimpanJurnal = async (e) => {
    e.preventDefault();
    if (!presensiActive) {
      setMessage({ type: 'error', text: 'Langkah 1 Terlewat: Silakan klik tombol "Presensi Masuk KBM" di atas terlebih dahulu!' });
      return;
    }

    setSubmitting(true);
    try {
      await client.post('/guru/jurnal-mengajar', {
        presensi_guru_id: presensiActive,
        bab_materi: babMateri,
        catatan_kelas: catatanKelas,
        tugas_mandiri: tugasMandiri,
        tp_id: tpSuggested?.tp_id || null,
        promes_id: tpSuggested?.promes_id || null,
        status_ketercapaian: statusKetercapaian,
      });

      setMessage({ type: 'success', text: 'Jurnal Mengajar & Status Promes Kurikulum Merdeka berhasil disimpan!' });
    } catch (e) {
      setMessage({ type: 'error', text: 'Gagal menyimpan Jurnal Mengajar.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs font-mono text-slate-500 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-emerald-800 border-t-transparent rounded-full animate-spin"></div>
        <p>Memuat Jadwal Mengajar Guru...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Mobile / Web Header Banner */}
      <div className="bg-gradient-to-r from-[#0d281e] via-[#0f3527] to-[#124231] p-5 sm:p-6 rounded-2xl text-white shadow-md border border-emerald-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-[#c8942a]/15 to-transparent rounded-full blur-2xl pointer-events-none -mr-16 -mt-16"></div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold backdrop-blur-sm mb-2 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Portal Guru & Pendidik</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">Presensi KBM & Jurnal Mengajar</h1>
            <p className="text-xs text-emerald-100/80 mt-1 max-w-lg">
              SMA A. Wahid Hasyim Tebuireng • Otomatisasi Target Promes Kurikulum Merdeka & Validasi Geofencing Kampus
            </p>
          </div>

          <div className="flex sm:flex-col items-start sm:items-end gap-1.5 shrink-0">
            <div className="flex items-center gap-1.5 text-xs text-emerald-200 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm font-mono border border-white/10">
              <Clock className="w-3.5 h-3.5 text-[#c8942a]" />
              <span>{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}</span>
            </div>
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

      {/* Step 1: Select Schedule & Checkin */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
            <span className="w-6 h-6 bg-[#0d281e] text-[#fde047] rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0">
              1
            </span>
            <span>Jadwal Mengajar & Presensi GPS</span>
          </h2>
          <div className="flex items-center space-x-1.5 text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-mono">
            <Compass className="w-3.5 h-3.5 text-emerald-700" />
            <span>GPS: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</span>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700">Pilih Jam KBM Hari Ini:</label>
          
          {jadwal.length === 0 ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0" />
              <span>Tidak ada jadwal KBM khusus untuk akun Anda pada hari ini.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2.5">
              {jadwal.map((j) => {
                const jId = j.id || j.jadwal_id;
                const isSelected = (selectedJadwal?.id || selectedJadwal?.jadwal_id) === jId;
                return (
                  <button
                    key={jId}
                    type="button"
                    onClick={() => {
                      setSelectedJadwal(j);
                      if (j.promes_suggestion) {
                        setTpSuggested(j.promes_suggestion);
                        setBabMateri(j.promes_suggestion.deskripsi_tp || '');
                      }
                    }}
                    className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/80 border-emerald-600 ring-2 ring-emerald-500/20 shadow-sm'
                        : 'bg-slate-50/70 border-slate-200 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900">
                        {j.nama_mapel} <span className="text-emerald-700 font-extrabold">({j.nama_kelas})</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        Jam Ke-{j.jam_ke} • Pukul {j.jam_mulai} - {j.jam_selesai} WIB
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-lg transition-colors ${
                      isSelected ? 'bg-[#0d281e] text-white shadow-sm' : 'bg-slate-200/80 text-slate-700'
                    }`}>
                      {isSelected ? 'Terpilih' : 'Pilih Kelas'}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="pt-2">
            {presensiActive ? (
              <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs flex items-center space-x-2.5 font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                <span>Status: Presensi Masuk KBM Berhasil Terverifikasi! Silakan isi Jurnal di bawah.</span>
              </div>
            ) : (
              <button
                onClick={handlePresensiMasuk}
                disabled={submitting || !selectedJadwal}
                className="w-full py-3 bg-[#0d281e] hover:bg-emerald-900 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4 text-[#c8942a]" />
                <span>{submitting ? 'Memproses Presensi GPS...' : '1. KLIK PRESENSI MASUK KBM (GPS)'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Step 2: Smart Jurnal Mengajar & Promes Suggestion */}
      <div className={`bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4 transition-opacity ${!presensiActive ? 'opacity-80' : 'opacity-100'}`}>
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
            <span className="w-6 h-6 bg-indigo-900 text-white rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0">
              2
            </span>
            <span>Jurnal Mengajar & Target Promes</span>
          </h2>
          <span className="text-[11px] bg-indigo-50 text-indigo-800 border border-indigo-200 px-2.5 py-0.5 rounded-lg font-mono font-bold flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Smart Suggestion</span>
          </span>
        </div>

        {!presensiActive && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Harap selesaikan <strong>Langkah 1 (Presensi Masuk)</strong> di atas sebelum menyimpan jurnal.</span>
          </div>
        )}

        {tpSuggested && (
          <div className="p-4 bg-indigo-50/80 border border-indigo-200 rounded-xl text-xs space-y-1.5">
            <div className="font-bold text-indigo-950 flex items-center space-x-1.5">
              <BookOpen className="w-4 h-4 text-indigo-700" />
              <span>Target Promes Minggu Ini ({tpSuggested.kode_tp}):</span>
            </div>
            <p className="text-indigo-900 italic font-medium">"{tpSuggested.deskripsi_tp}"</p>
            {tpSuggested.is_shifted && (
              <span className="inline-block mt-1 text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold">
                Auto-Shift: Pertemuan digeser otomatis akibat libur/agenda pondok sebelumnya.
              </span>
            )}
          </div>
        )}

        <form onSubmit={handleSimpanJurnal} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Materi / Bab Pelajaran</label>
            <textarea
              required
              rows={2}
              value={babMateri}
              onChange={(e) => setBabMateri(e.target.value)}
              placeholder="Isi rincian materi atau topik KBM hari ini..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Catatan Suasana Kelas</label>
              <input
                type="text"
                value={catatanKelas}
                onChange={(e) => setCatatanKelas(e.target.value)}
                placeholder="Misal: Siswa aktif berdiskusi, tertib"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Tugas Mandiri / Pekerjaan Rumah (Opsional)</label>
              <input
                type="text"
                value={tugasMandiri}
                onChange={(e) => setTugasMandiri(e.target.value)}
                placeholder="Isi jika ada penugasan mandiri"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Status Ketercapaian Tujuan Pembelajaran (TP)</label>
            <select
              value={statusKetercapaian}
              onChange={(e) => setStatusKetercapaian(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
            >
              <option value="tercapai">Tercapai (Promes Otomatis Terpenuhi)</option>
              <option value="tertunda">Tertunda (Perlu Sesi Tambahan / Pengulangan)</option>
              <option value="remedial">Remedial (Perlu Asesmen Tambahan Murid)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting || !presensiActive}
            className="w-full py-3 bg-indigo-900 hover:bg-indigo-950 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Menyimpan Jurnal...' : '2. Simpan Jurnal & Update Progres Promes'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default GuruPresensi;
