import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { MapPin, Clock, CheckCircle, AlertCircle, Sparkles, Send, ShieldAlert, CheckCircle2 } from 'lucide-react';

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
      setMessage({ type: 'success', text: '✅ Presensi Masuk KBM berhasil diverifikasi via GPS Geofencing!' });
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

      setMessage({ type: 'success', text: '🎉 Jurnal Mengajar & Status Promes Kurikulum Merdeka berhasil disimpan!' });
    } catch (e) {
      setMessage({ type: 'error', text: 'Gagal menyimpan Jurnal Mengajar.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-xs font-mono text-center text-slate-500">Memuat Jadwal Mengajar...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Mobile Header Banner */}
      <div className="kemenag-header-bg p-5 rounded-lg text-white space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold bg-white/20 px-2 py-0.5 rounded text-emerald-100 uppercase tracking-wider">
            Mobile Presensi Guru
          </span>
          <div className="flex items-center space-x-1 text-xs text-emerald-200">
            <Clock className="w-3.5 h-3.5" />
            <span className="font-mono">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}</span>
          </div>
        </div>
        <h1 className="text-base font-bold">Presensi Kelas & Jurnal Mengajar</h1>
        <p className="text-xs text-emerald-100/90">
          Otomatisasi Target Promes Kurikulum Merdeka & Geofencing GPS SMA AWH.
        </p>
      </div>

      {message && (
        <div className={`p-3.5 rounded-md border text-xs flex items-center space-x-2 font-medium ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-rose-50 text-rose-800 border-rose-300'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Step 1: Select Schedule & Checkin */}
      <div className="card-surface p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
            <span className="w-5 h-5 bg-emerald-800 text-white rounded-full flex items-center justify-center text-[10px] shrink-0">1</span>
            <span>Jadwal Mengajar & Presensi GPS</span>
          </h2>
          <div className="flex items-center space-x-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono">
            <MapPin className="w-3 h-3" />
            <span>GPS: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</span>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-700">Pilih Jam KBM Hari Ini:</label>
          
          {jadwal.length === 0 ? (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800 flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Tidak ada jadwal KBM khusus untuk akun Anda pada hari ini.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
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
                    className={`p-3 rounded-md border text-left flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-semibold shadow-sm'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{j.nama_mapel} ({j.nama_kelas})</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        Jam Ke-{j.jam_ke} ({j.jam_mulai} - {j.jam_selesai})
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded ${
                      isSelected ? 'bg-emerald-800 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {isSelected ? 'Terpilih' : 'Pilih'}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="pt-2">
            {presensiActive ? (
              <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-md text-xs flex items-center space-x-2 font-semibold">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                <span>Status: Presensi Masuk KBM Berhasil Terdaftar!</span>
              </div>
            ) : (
              <button
                onClick={handlePresensiMasuk}
                disabled={submitting || !selectedJadwal}
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 disabled:bg-slate-300 text-white font-semibold text-xs rounded-md shadow-sm transition-colors flex items-center justify-center space-x-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{submitting ? 'Memproses Presensi...' : '1. KLIK PRESENSI MASUK KBM'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Step 2: Smart Jurnal Mengajar & Promes Suggestion */}
      <div className={`card-surface p-5 space-y-4 transition-opacity ${!presensiActive ? 'opacity-90' : 'opacity-100'}`}>
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
            <span className="w-5 h-5 bg-indigo-900 text-white rounded-full flex items-center justify-center text-[10px] shrink-0">2</span>
            <span>Jurnal Mengajar & Target Promes</span>
          </h2>
          <span className="text-[11px] bg-indigo-50 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded font-mono flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-indigo-600" />
            <span>Smart Suggestion</span>
          </span>
        </div>

        {!presensiActive && (
          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Harap selesaikan **Langkah 1 (Presensi Masuk)** di atas sebelum menyimpan jurnal.</span>
          </div>
        )}

        {tpSuggested && (
          <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-md text-xs space-y-1">
            <div className="font-bold text-indigo-900 flex items-center space-x-1">
              <span>Target Promes Minggu Ini ({tpSuggested.kode_tp}):</span>
            </div>
            <p className="text-indigo-800 italic">"{tpSuggested.deskripsi_tp}"</p>
            {tpSuggested.is_shifted && (
              <span className="inline-block mt-1 text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-medium">
                Auto-Shift: Pertemuan digeser akibat libur/acara pondok sebelumnya.
              </span>
            )}
          </div>
        )}

        <form onSubmit={handleSimpanJurnal} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Materi / Bab Pelajaran</label>
            <textarea
              required
              rows={2}
              value={babMateri}
              onChange={(e) => setBabMateri(e.target.value)}
              placeholder="Isi rincian materi KBM..."
              className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-700 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan Suasana Kelas</label>
            <input
              type="text"
              value={catatanKelas}
              onChange={(e) => setCatatanKelas(e.target.value)}
              placeholder="Misal: Siswa kondusif, berdiskusi kelompok"
              className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-700 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tugas Mandiri (Optional)</label>
            <input
              type="text"
              value={tugasMandiri}
              onChange={(e) => setTugasMandiri(e.target.value)}
              placeholder="Isi jika ada tugas rumah"
              className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-700 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Status Ketercapaian TP</label>
            <select
              value={statusKetercapaian}
              onChange={(e) => setStatusKetercapaian(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-700 focus:outline-none"
            >
              <option value="tercapai">Tercapai (Promes Otomatis Selesai)</option>
              <option value="tertunda">Tertunda (Perlu Sesi Pengulangan)</option>
              <option value="remedial">Remedial (Perlu Asesmen Tambahan)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting || !presensiActive}
            className="w-full py-2.5 bg-indigo-900 hover:bg-indigo-950 disabled:bg-slate-300 text-white font-semibold text-xs rounded shadow-sm transition-colors flex items-center justify-center space-x-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>2. Simpan Jurnal & Update Promes</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default GuruPresensi;
