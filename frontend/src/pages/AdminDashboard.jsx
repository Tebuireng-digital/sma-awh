import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { Settings, MapPin, Send, CheckCircle, AlertCircle, PhoneCall, QrCode, RefreshCw, Calendar, Smartphone, LogOut } from 'lucide-react';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  // GPS & Settings State
  const [lat, setLat] = useState(-7.5878);
  const [lng, setLng] = useState(112.2345);
  const [radius, setRadius] = useState(100);
  const [terlambat, setTerlambat] = useState(20);

  // WA Bot Settings & Linked Device State
  const [waEnabled, setWaEnabled] = useState(true);
  const [waUrl, setWaUrl] = useState('http://localhost:3000');
  const [waKey, setWaKey] = useState('tebuireng-secret-key-2026');
  const [testPhone, setTestPhone] = useState('081234567890');
  const [waBotStatus, setWaBotStatus] = useState({ is_connected: true, status: 'CONNECTED', device_phone: '081234567890' });
  const [qrCodeData, setQrCodeData] = useState(null);
  const [loadingQr, setLoadingQr] = useState(false);

  // Monthly WA Approval State
  const [kelases, setKelases] = useState([]);
  const [selectedKelas, setSelectedKelas] = useState(1);
  const [selectedBulan, setSelectedBulan] = useState(8);
  const [selectedTahun, setSelectedTahun] = useState(2026);
  const [sendingMonthlyWa, setSendingMonthlyWa] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchKelases();
    fetchWaStatus();
  }, []);

  const fetchKelases = async () => {
    try {
      const res = await client.get('/master/kelas');
      const list = res.data.kelas || [];
      setKelases(list);
      if (list.length > 0) setSelectedKelas(list[0].id);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await client.get('/admin/pengaturan');
      const p = res.data.pengaturan;
      if (p) {
        setLat(p.latitude_sekolah ?? -7.5878);
        setLng(p.longitude_sekolah ?? 112.2345);
        setRadius(p.radius_toleransi_meter ?? 100);
        setTerlambat(p.toleransi_terlambat_menit ?? 20);
        setWaEnabled(p.wa_bot_enabled ? true : false);
        setWaUrl(p.wa_gateway_url ?? 'http://localhost:3000');
        setWaKey(p.wa_gateway_key ?? 'tebuireng-secret-key-2026');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchWaStatus = async () => {
    setLoadingQr(true);
    try {
      const res = await client.get('/admin/wa-status');
      if (res.data.wa_bot) {
        setWaBotStatus(res.data.wa_bot);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingQr(false);
    }
  };

  const handleDisconnectWa = async () => {
    setSubmitting(true);
    setMessage(null);
    try {
      await client.post('/admin/wa-disconnect');
      setMessage({ type: 'success', text: 'Perangkat Tertaut WhatsApp berhasil diputuskan (Unlinked).' });
      fetchWaStatus();
    } catch (e) {
      setMessage({ type: 'error', text: 'Gagal memutuskan Perangkat Tertaut.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await client.post('/admin/pengaturan', {
        latitude_sekolah: parseFloat(lat),
        longitude_sekolah: parseFloat(lng),
        radius_toleransi_meter: parseInt(radius),
        toleransi_terlambat_menit: parseInt(terlambat),
        wa_bot_enabled: waEnabled,
        wa_gateway_url: waUrl,
        wa_gateway_key: waKey,
      });

      setMessage({ type: 'success', text: res.data.message || 'Pengaturan GPS Geofence & Perangkat Tertaut WhatsApp berhasil disimpan.' });
    } catch (e) {
      setMessage({ type: 'error', text: 'Gagal menyimpan pengaturan.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendTestWa = async () => {
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await client.post('/admin/wa-test', {
        phone: testPhone,
        message: 'Tes koneksi Bot WhatsApp Perangkat Tertaut SMA KH. A. Wahid Hasyim Tebuireng.',
      });

      setMessage({ type: 'success', text: res.data.message });
    } catch (e) {
      setMessage({ type: 'error', text: 'Gagal mengirim pesan uji coba WhatsApp. Cek status perangkat tertaut.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveAndSendMonthlyWa = async () => {
    setSendingMonthlyWa(true);
    setMessage(null);

    try {
      const res = await client.post('/admin/wa-rekap-bulanan', {
        kelas_id: parseInt(selectedKelas),
        bulan: parseInt(selectedBulan),
        tahun: parseInt(selectedTahun),
      });

      setMessage({ type: 'success', text: res.data.message });
    } catch (e) {
      setMessage({ type: 'error', text: 'Gagal menyetujui / mengirim rekap bulanan WA.' });
    } finally {
      setSendingMonthlyWa(false);
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
            <span>Pengaturan GPS Geofence & WhatsApp Perangkat Tertaut</span>
          </h1>
          <p className="text-xs text-slate-500">
            Sistem Perangkat Tertaut (Linked Device QR Code SIMANTEB) & Rekapitulasi Presensi 736 Siswa (25 Kelas)
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

      {/* Perangkat Tertaut WhatsApp Web QR Scanner Block (Sama Seperti SIMANTEB) */}
      <div className="card-surface p-5 space-y-4 bg-emerald-50/30 border-emerald-200">
        <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
          <div className="flex items-center space-x-2 text-emerald-950">
            <Smartphone className="w-5 h-5 text-emerald-800" />
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider">
                Status Perangkat Tertaut WhatsApp (WhatsApp Web Linked Device)
              </h2>
              <p className="text-xs text-slate-600">
                Pindai QR Code menggunakan aplikasi WhatsApp di smartphone untuk mentautkan nomor resmi sekolah
              </p>
            </div>
          </div>

          <button
            onClick={fetchWaStatus}
            disabled={loadingQr}
            className="bg-slate-800 hover:bg-slate-900 text-white px-3 py-1 rounded text-xs font-semibold flex items-center space-x-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingQr ? 'animate-spin' : ''}`} />
            <span>Cek Koneksi</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Status Box */}
          <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Status Perangkat</span>
            {waBotStatus?.is_connected ? (
              <div className="space-y-1">
                <span className="inline-flex items-center space-x-1.5 bg-emerald-100 text-emerald-900 text-xs px-2.5 py-1 rounded-full font-bold">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>TERTAUT (CONNECTED)</span>
                </span>
                <p className="text-xs text-slate-600 font-mono pt-1">
                  Nomor: {waBotStatus?.device_phone || '081234567890'} (Official SIMANTEB AWH)
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <span className="inline-flex items-center space-x-1.5 bg-amber-100 text-amber-900 text-xs px-2.5 py-1 rounded-full font-bold">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>BELUM TERTAUT — SILAKAN SCAN QR</span>
                </span>
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={handleDisconnectWa}
                disabled={submitting}
                className="w-full bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 px-3 py-1.5 rounded text-xs font-semibold flex items-center justify-center space-x-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Putuskan Perangkat Tertaut</span>
              </button>
            </div>
          </div>

          {/* QR Code Scan Container */}
          <div className="md:col-span-2 p-4 bg-white rounded-lg border border-slate-200 flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-4">
            <div className="w-32 h-32 bg-slate-100 rounded-lg border border-slate-300 flex items-center justify-center shrink-0 overflow-hidden">
              {waBotStatus?.is_connected ? (
                <div className="text-center p-2">
                  <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                  <span className="text-[10px] font-bold text-emerald-900 block mt-1">Perangkat Siap</span>
                </div>
              ) : (
                <QrCode className="w-20 h-20 text-slate-700" />
              )}
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-900">Cara Tautkan Perangkat WhatsApp:</h4>
              <ol className="list-decimal list-inside text-slate-600 space-y-1">
                <li>Buka aplikasi WhatsApp di HP Sekolah/Admin.</li>
                <li>Buka **Menu (titik 3)** atau **Pengaturan**, pilih **Perangkat Tertaut (Linked Devices)**.</li>
                <li>Ketuk **Tautkan Perangkat (Link a Device)** dan arahkan kamera ke QR Code di atas.</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Settings Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Pengaturan GPS Geofence */}
        <div className="card-surface p-5 space-y-4">
          <div className="flex items-center space-x-2 text-slate-900 border-b border-slate-100 pb-2">
            <MapPin className="w-4 h-4 text-emerald-700" />
            <h2 className="text-xs font-bold uppercase tracking-wider">
              Pengaturan GPS Geofence Presensi Guru (Radius 100m)
            </h2>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Latitude SMA AWH</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs font-mono focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Longitude SMA AWH</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs font-mono focus:ring-1 focus:ring-emerald-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Radius Toleransi (Meter)</label>
                <input
                  type="number"
                  required
                  min={10}
                  value={radius}
                  onChange={(e) => setRadius(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs font-mono focus:ring-1 focus:ring-emerald-700"
                />
              </div>

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
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="bg-emerald-800 hover:bg-emerald-900 text-white px-4 py-2 rounded text-xs font-semibold shadow-sm transition-colors"
              >
                {submitting ? 'Menyimpan...' : 'Simpan Koordinat GPS & Radius'}
              </button>
            </div>
          </form>
        </div>

        {/* 2. Pengaturan Parameter WA Gateway */}
        <div className="card-surface p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center space-x-2 text-slate-900">
              <PhoneCall className="w-4 h-4 text-emerald-700" />
              <h2 className="text-xs font-bold uppercase tracking-wider">
                Parameter Server Gateway WhatsApp
              </h2>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded">
              <span className="text-xs font-semibold text-slate-700">Status Gateway Broadcast:</span>
              <button
                type="button"
                onClick={() => setWaEnabled(!waEnabled)}
                className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                  waEnabled ? 'bg-emerald-700 text-white' : 'bg-slate-300 text-slate-700'
                }`}
              >
                {waEnabled ? 'BOT ACTIVE (ON)' : 'BOT DISABLED (OFF)'}
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">WA Gateway Base URL</label>
              <input
                type="text"
                value={waUrl}
                onChange={(e) => setWaUrl(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs font-mono focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            <div className="pt-2 flex items-center space-x-2">
              <input
                type="text"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="Nomor WA Uji Coba"
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs font-mono"
              />
              <button
                type="button"
                onClick={handleSendTestWa}
                disabled={submitting}
                className="bg-slate-800 hover:bg-slate-900 text-white px-3 py-2 rounded text-xs font-semibold shrink-0"
              >
                Test Kirim WA
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Panel Persetujuan Admin — Rekap Bulanan WA Wali Santri (1 Bulan Sekali) */}
      <div className="card-surface p-5 space-y-4 bg-emerald-50/40 border-emerald-200">
        <div className="flex items-center space-x-2 text-emerald-950 border-b border-emerald-200 pb-2">
          <Calendar className="w-5 h-5 text-emerald-800" />
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider">
              Persetujuan Admin — Pengiriman Rekapitulasi WA Wali Santri (1 Bulan Sekali)
            </h2>
            <p className="text-xs text-slate-600">
              Pengiriman Rekap 736 Siswa (25 Kelas) per bulan ke WhatsApp Wali Santri atas persetujuan Admin
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-1">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Pilih Kelas ({kelases.length} Kelas)</label>
            <select
              value={selectedKelas}
              onChange={(e) => setSelectedKelas(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded text-xs font-medium focus:ring-1 focus:ring-emerald-700"
            >
              {kelases.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama_kelas} ({k.jumlah_siswa} Siswa)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Bulan Laporan</label>
            <select
              value={selectedBulan}
              onChange={(e) => setSelectedBulan(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded text-xs font-medium focus:ring-1 focus:ring-emerald-700"
            >
              <option value={1}>Januari</option>
              <option value={2}>Februari</option>
              <option value={3}>Maret</option>
              <option value={4}>April</option>
              <option value={5}>Mei</option>
              <option value={6}>Juni</option>
              <option value={7}>Juli</option>
              <option value={8}>Agustus</option>
              <option value={9}>September</option>
              <option value={10}>Oktober</option>
              <option value={11}>November</option>
              <option value={12}>Desember</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tahun</label>
            <input
              type="number"
              value={selectedTahun}
              onChange={(e) => setSelectedTahun(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded text-xs font-mono font-semibold"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleApproveAndSendMonthlyWa}
              disabled={sendingMonthlyWa}
              className="w-full bg-emerald-800 hover:bg-emerald-900 text-white px-4 py-2 rounded text-xs font-bold shadow-sm transition-colors flex items-center justify-center space-x-1.5"
            >
              <Send className="w-4 h-4" />
              <span>{sendingMonthlyWa ? 'Mengirim Rekap...' : 'Setujui & Kirim WA Ortu'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
