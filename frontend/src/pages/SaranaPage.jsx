import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { 
  Package, 
  Plus, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Wrench, 
  Trash2, 
  ArrowLeftRight, 
  Laptop, 
  FileText,
  Search,
  Filter
} from 'lucide-react';

const SaranaPage = () => {
  const { user } = useAuth();
  const role = user?.role || 'sarana';

  const [activeTab, setActiveTab] = useState('inventaris'); // inventaris, mutasi, peminjaman, perawatan, penghapusan
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  // Data States
  const [inventaris, setInventaris] = useState([]);
  const [mutasi, setMutasi] = useState([]);
  const [peminjaman, setPeminjaman] = useState([]);
  const [perawatan, setPerawatan] = useState([]);
  const [penghapusan, setPenghapusan] = useState([]);

  // Form Modal States
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // add_barang, add_mutasi, add_peminjaman, add_perawatan, add_penghapusan
  const [formData, setFormData] = useState({});

  // Search & Filter
  const [search, setSearch] = useState('');
  const [kategoriFilter, setKategoriFilter] = useState('Semua');

  useEffect(() => {
    fetchTabContent();
  }, [activeTab]);

  const fetchTabContent = async () => {
    setLoading(true);
    try {
      if (activeTab === 'inventaris') {
        const res = await api.get('/sarana/inventaris');
        setInventaris(res.data.data || []);
      } else if (activeTab === 'mutasi') {
        const res = await api.get('/sarana/mutasi');
        setMutasi(res.data.data || []);
      } else if (activeTab === 'peminjaman') {
        const res = await api.get('/sarana/peminjaman');
        setPeminjaman(res.data.data || []);
      } else if (activeTab === 'perawatan') {
        const res = await api.get('/sarana/perawatan');
        setPerawatan(res.data.data || []);
      } else if (activeTab === 'penghapusan') {
        const res = await api.get('/sarana/penghapusan');
        setPenghapusan(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching sarana data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (type, extraData = {}) => {
    setModalType(type);
    setFormData({ ...extraData });
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let endpoint = '';
      if (modalType === 'add_barang') endpoint = '/sarana/inventaris';
      else if (modalType === 'add_mutasi') endpoint = '/sarana/mutasi';
      else if (modalType === 'add_peminjaman') endpoint = '/sarana/peminjaman';
      else if (modalType === 'add_perawatan') endpoint = '/sarana/perawatan';
      else if (modalType === 'add_penghapusan') endpoint = '/sarana/penghapusan';

      const res = await api.post(endpoint, formData);
      setMsg(res.data.message || 'Berhasil menyimpan data.');
      setShowModal(false);
      setFormData({});
      setTimeout(() => setMsg(''), 4000);
      fetchTabContent();
    } catch (err) {
      console.error('Error submitting form:', err);
      setMsg('Gagal menyimpan data.');
    } finally {
      setLoading(false);
    }
  };

  const handleKembalikan = async (peminjamanId) => {
    try {
      const res = await api.post(`/sarana/peminjaman/${peminjamanId}/kembali`);
      setMsg(res.data.message || 'Barang berhasil dikembalikan.');
      setTimeout(() => setMsg(''), 3000);
      fetchTabContent();
    } catch (err) {
      console.error('Error kembalikan:', err);
    }
  };

  const handleApprovalPenghapusan = async (penghapusanId, status) => {
    try {
      const res = await api.post(`/sarana/penghapusan/${penghapusanId}/approval`, { status });
      setMsg(res.data.message || 'Approval berhasil diperbarui.');
      setTimeout(() => setMsg(''), 3000);
      fetchTabContent();
    } catch (err) {
      console.error('Error approval:', err);
    }
  };

  const handleFinishPerawatan = async (perawatanId) => {
    try {
      const res = await api.post(`/sarana/perawatan/${perawatanId}/status`, { status: 'Selesai' });
      setMsg(res.data.message || 'Status perawatan selesai.');
      setTimeout(() => setMsg(''), 3000);
      fetchTabContent();
    } catch (err) {
      console.error('Error finish perawatan:', err);
    }
  };

  const filteredInventaris = inventaris.filter(item => {
    const matchSearch = item.nama_barang.toLowerCase().includes(search.toLowerCase()) || 
                        item.kode_barang.toLowerCase().includes(search.toLowerCase());
    const matchKat = kategoriFilter === 'Semua' || item.kategori === kategoriFilter;
    return matchSearch && matchKat;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0d281e] via-[#0f3527] to-[#124231] rounded-2xl p-6 text-white shadow-md border border-emerald-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-radial from-[#c8942a]/15 to-transparent rounded-full blur-2xl pointer-events-none -mr-20 -mt-20"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold backdrop-blur-sm mb-2 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Staf Sarana & Prasarana</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Manajemen Sarana, Prasarana & Aset Sekolah
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-2xl font-normal">
              SMA A. Wahid Hasyim • Inventaris Barang, Mutasi Stok, Peminjaman Laptop/Lab IT, Perawatan & Penghapusan Aset
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {activeTab === 'inventaris' && (
              <button
                onClick={() => handleOpenModal('add_barang')}
                className="flex items-center space-x-1.5 px-4 py-2 bg-[#c8942a] hover:bg-[#b08122] text-[#0d281e] rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Aset / Laptop</span>
              </button>
            )}
            {activeTab === 'mutasi' && (
              <button
                onClick={() => handleOpenModal('add_mutasi')}
                className="flex items-center space-x-1.5 px-4 py-2 bg-[#c8942a] hover:bg-[#b08122] text-[#0d281e] rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Catat Mutasi Stok</span>
              </button>
            )}
            {activeTab === 'peminjaman' && (
              <button
                onClick={() => handleOpenModal('add_peminjaman')}
                className="flex items-center space-x-1.5 px-4 py-2 bg-[#c8942a] hover:bg-[#b08122] text-[#0d281e] rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Pinjam Laptop / Aset IT</span>
              </button>
            )}
            {activeTab === 'perawatan' && (
              <button
                onClick={() => handleOpenModal('add_perawatan')}
                className="flex items-center space-x-1.5 px-4 py-2 bg-[#c8942a] hover:bg-[#b08122] text-[#0d281e] rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Log Perawatan / Servis</span>
              </button>
            )}
            {activeTab === 'penghapusan' && (
              <button
                onClick={() => handleOpenModal('add_penghapusan')}
                className="flex items-center space-x-1.5 px-4 py-2 bg-[#c8942a] hover:bg-[#b08122] text-[#0d281e] rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Ajukan Penghapusan Aset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {msg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl flex items-center space-x-2 font-medium">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-1.5 flex flex-wrap gap-1.5">
        <button
          onClick={() => setActiveTab('inventaris')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'inventaris' ? 'bg-[#0d281e] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Laptop className="w-4 h-4 text-emerald-400" />
          <span>1. Inventaris & Laptop Aset</span>
        </button>

        <button
          onClick={() => setActiveTab('mutasi')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'mutasi' ? 'bg-[#0d281e] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <ArrowLeftRight className="w-4 h-4 text-blue-400" />
          <span>2. Barang Masuk - Keluar</span>
        </button>

        <button
          onClick={() => setActiveTab('peminjaman')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'peminjaman' ? 'bg-[#0d281e] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4 text-teal-400" />
          <span>3. Peminjaman Inventaris</span>
        </button>

        <button
          onClick={() => setActiveTab('perawatan')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'perawatan' ? 'bg-[#0d281e] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Wrench className="w-4 h-4 text-[#c8942a]" />
          <span>4. Perawatan & Maintenance</span>
        </button>

        <button
          onClick={() => setActiveTab('penghapusan')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'penghapusan' ? 'bg-[#0d281e] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Trash2 className="w-4 h-4 text-rose-400" />
          <span>5. Penghapusan Aset</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        {loading ? (
          <div className="text-center py-10 text-slate-500 text-xs">Memuat data Sarana & Prasarana...</div>
        ) : (
          <>
            {/* TAB 1: INVENTARIS BARANG */}
            {activeTab === 'inventaris' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari kode atau nama barang..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <Filter className="w-4 h-4 text-slate-500" />
                    <select
                      value={kategoriFilter}
                      onChange={(e) => setKategoriFilter(e.target.value)}
                      className="px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="Semua">Semua Kategori</option>
                      <option value="Laptop & Aset IT">Laptop & Aset IT</option>
                      <option value="Elektronik & Multimedia">Elektronik & Multimedia</option>
                      <option value="Audio & Fasilitas">Audio & Fasilitas</option>
                      <option value="Fasilitas Ruang">Fasilitas Ruang</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                        <th className="px-4 py-2.5">Kode</th>
                        <th className="px-4 py-2.5">Nama Barang / Aset</th>
                        <th className="px-4 py-2.5">Kategori</th>
                        <th className="px-4 py-2.5 text-center">Jumlah Stok</th>
                        <th className="px-4 py-2.5 text-center">Kondisi</th>
                        <th className="px-4 py-2.5">Lokasi Penempatan</th>
                        <th className="px-4 py-2.5 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredInventaris.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-mono font-bold text-slate-800">{item.kode_barang}</td>
                          <td className="px-4 py-3 font-semibold text-slate-800">{item.nama_barang}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              {item.kategori}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-emerald-800 font-mono text-sm">{item.jumlah}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.kondisi === 'Baik' ? 'bg-emerald-100 text-emerald-800' :
                              item.kondisi === 'Rusak Ringan' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {item.kondisi}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{item.lokasi}</td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleOpenModal('add_peminjaman', { inventaris_id: item.id })}
                              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded text-[11px] font-semibold transition-colors"
                            >
                              Pinjam
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 2: BARANG MASUK - KELUAR */}
            {activeTab === 'mutasi' && (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                        <th className="px-4 py-2.5">#</th>
                        <th className="px-4 py-2.5">Tanggal Mutasi</th>
                        <th className="px-4 py-2.5">Kode & Nama Barang</th>
                        <th className="px-4 py-2.5 text-center">Jenis Mutasi</th>
                        <th className="px-4 py-2.5 text-center">Jumlah</th>
                        <th className="px-4 py-2.5">Keterangan / Sumber</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {mutasi.map((m, idx) => (
                        <tr key={m.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-semibold text-slate-500">{idx + 1}</td>
                          <td className="px-4 py-3 font-mono text-slate-600">{m.tanggal}</td>
                          <td className="px-4 py-3">
                            <span className="font-mono font-bold text-slate-800 block">{m.kode_barang}</span>
                            <span className="text-slate-600">{m.nama_barang}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              m.jenis === 'Masuk' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              Barang {m.jenis}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center font-mono font-bold text-slate-800">{m.jumlah}</td>
                          <td className="px-4 py-3 text-slate-600">{m.keterangan}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: PEMINJAMAN INVENTARIS */}
            {activeTab === 'peminjaman' && (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                        <th className="px-4 py-2.5">#</th>
                        <th className="px-4 py-2.5">Barang / Aset</th>
                        <th className="px-4 py-2.5">Nama Peminjam</th>
                        <th className="px-4 py-2.5">Jabatan / Role</th>
                        <th className="px-4 py-2.5">Tgl Pinjam</th>
                        <th className="px-4 py-2.5">Tgl Kembali</th>
                        <th className="px-4 py-2.5 text-center">Status</th>
                        <th className="px-4 py-2.5 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {peminjaman.map((p, idx) => (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-semibold text-slate-500">{idx + 1}</td>
                          <td className="px-4 py-3">
                            <span className="font-mono font-bold text-slate-800 block">{p.kode_barang}</span>
                            <span className="text-slate-600 font-medium">{p.nama_barang}</span>
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-800">{p.peminjam_nama}</td>
                          <td className="px-4 py-3 text-slate-600">{p.peminjam_role}</td>
                          <td className="px-4 py-3 font-mono text-slate-600">{p.tgl_pinjam}</td>
                          <td className="px-4 py-3 font-mono text-slate-600">{p.tgl_kembali || '-'}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              p.status === 'Dipinjam' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {p.status === 'Dipinjam' && (
                              <button
                                onClick={() => handleKembalikan(p.id)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold transition-colors shadow-sm"
                              >
                                Kembalikan
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4: PERAWATAN & MAINTENANCE */}
            {activeTab === 'perawatan' && (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                        <th className="px-4 py-2.5">#</th>
                        <th className="px-4 py-2.5">Kode & Barang</th>
                        <th className="px-4 py-2.5">Deskripsi Perawatan / Servis</th>
                        <th className="px-4 py-2.5">Teknisi / Bengkel</th>
                        <th className="px-4 py-2.5">Biaya (Rp)</th>
                        <th className="px-4 py-2.5 text-center">Status</th>
                        <th className="px-4 py-2.5 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {perawatan.map((pw, idx) => (
                        <tr key={pw.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-semibold text-slate-500">{idx + 1}</td>
                          <td className="px-4 py-3">
                            <span className="font-mono font-bold text-slate-800 block">{pw.kode_barang}</span>
                            <span className="text-slate-600">{pw.nama_barang}</span>
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-800">{pw.jenis_perawatan}</td>
                          <td className="px-4 py-3 text-slate-600">{pw.teknisi}</td>
                          <td className="px-4 py-3 font-mono font-bold text-slate-800">
                            Rp {Number(pw.biaya).toLocaleString('id-ID')}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              pw.status === 'Proses' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {pw.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {pw.status === 'Proses' && (
                              <button
                                onClick={() => handleFinishPerawatan(pw.id)}
                                className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded text-[11px] font-semibold border border-emerald-300 transition-colors"
                              >
                                Selesai Servis
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 5: PENGHAPUSAN ASET (WRITE-OFF) */}
            {activeTab === 'penghapusan' && (
              <div className="space-y-4">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    Penghapusan Barang/Write-Off Aset memerlukan alur persetujuan berjenjang: 
                    <strong className="ml-1">Staf Sarana &rarr; Kepala TU &rarr; Kepala Sekolah</strong>.
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                        <th className="px-4 py-2.5">#</th>
                        <th className="px-4 py-2.5">Kode & Nama Aset</th>
                        <th className="px-4 py-2.5 text-center">Jumlah</th>
                        <th className="px-4 py-2.5">Alasan Penghapusan</th>
                        <th className="px-4 py-2.5 text-center">Status Kepala TU</th>
                        <th className="px-4 py-2.5 text-center">Status Kepsek</th>
                        <th className="px-4 py-2.5 text-center">Aksi Approval</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {penghapusan.map((ph, idx) => (
                        <tr key={ph.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-semibold text-slate-500">{idx + 1}</td>
                          <td className="px-4 py-3">
                            <span className="font-mono font-bold text-slate-800 block">{ph.kode_barang}</span>
                            <span className="text-slate-600">{ph.nama_barang}</span>
                          </td>
                          <td className="px-4 py-3 text-center font-bold font-mono text-slate-800">{ph.jumlah}</td>
                          <td className="px-4 py-3 text-slate-700">{ph.alasan}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              ph.status_ktu === 'Disetujui' ? 'bg-emerald-100 text-emerald-800' :
                              ph.status_ktu === 'Ditolak' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              K.TU: {ph.status_ktu}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              ph.status_kepsek === 'Disetujui' ? 'bg-emerald-100 text-emerald-800' :
                              ph.status_kepsek === 'Ditolak' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              Kepsek: {ph.status_kepsek}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {(role === 'kepala_tu' || role === 'kepala_sekolah' || role === 'admin' || role === 'sarana') && (
                              <button
                                onClick={() => handleApprovalPenghapusan(ph.id, 'Disetujui')}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold transition-colors"
                              >
                                Approve
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* FORM MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-800 border-b pb-2">
              {modalType === 'add_barang' && 'Tambah Inventaris / Laptop Aset'}
              {modalType === 'add_mutasi' && 'Catat Mutasi Barang (Masuk / Keluar)'}
              {modalType === 'add_peminjaman' && 'Form Peminjaman Inventaris'}
              {modalType === 'add_perawatan' && 'Catat Servis / Perawatan Barang'}
              {modalType === 'add_penghapusan' && 'Pengajuan Penghapusan Aset'}
            </h2>

            <form onSubmit={handleFormSubmit} className="space-y-3 text-xs">
              {modalType === 'add_barang' && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nama Barang / Aset</label>
                    <input
                      type="text"
                      required
                      placeholder="misal: Laptop Lenovo ThinkPad X1"
                      value={formData.nama_barang || ''}
                      onChange={(e) => setFormData({ ...formData, nama_barang: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Kategori</label>
                      <select
                        value={formData.kategori || 'Laptop & Aset IT'}
                        onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="Laptop & Aset IT">Laptop & Aset IT</option>
                        <option value="Elektronik & Multimedia">Elektronik & Multimedia</option>
                        <option value="Audio & Fasilitas">Audio & Fasilitas</option>
                        <option value="Fasilitas Ruang">Fasilitas Ruang</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Jumlah</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.jumlah || 1}
                        onChange={(e) => setFormData({ ...formData, jumlah: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Lokasi Penempatan</label>
                    <input
                      type="text"
                      placeholder="misal: Lab Komputer 2"
                      value={formData.lokasi || ''}
                      onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </>
              )}

              {modalType === 'add_peminjaman' && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Pilih Barang</label>
                    <select
                      required
                      value={formData.inventaris_id || ''}
                      onChange={(e) => setFormData({ ...formData, inventaris_id: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="">-- Pilih Barang Inventaris --</option>
                      {inventaris.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.kode_barang} - {b.nama_barang} (Stok: {b.jumlah})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nama Peminjam</label>
                    <input
                      type="text"
                      required
                      placeholder="misal: M. UMAR ABDUL AZIZ, S.Ag."
                      value={formData.peminjam_nama || ''}
                      onChange={(e) => setFormData({ ...formData, peminjam_nama: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Peran / Jabatan Peminjam</label>
                    <input
                      type="text"
                      placeholder="misal: Guru PAI / Staf"
                      value={formData.peminjam_role || 'Guru'}
                      onChange={(e) => setFormData({ ...formData, peminjam_role: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </>
              )}

              {modalType === 'add_mutasi' && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Pilih Barang</label>
                    <select
                      required
                      value={formData.inventaris_id || ''}
                      onChange={(e) => setFormData({ ...formData, inventaris_id: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="">-- Pilih Barang Inventaris --</option>
                      {inventaris.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.kode_barang} - {b.nama_barang}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Jenis Mutasi</label>
                      <select
                        value={formData.jenis || 'Masuk'}
                        onChange={(e) => setFormData({ ...formData, jenis: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="Masuk">Barang Masuk (Tambah)</option>
                        <option value="Keluar">Barang Keluar (Pakai)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Jumlah</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.jumlah || 1}
                        onChange={(e) => setFormData({ ...formData, jumlah: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Keterangan / Sumber</label>
                    <input
                      type="text"
                      placeholder="misal: Pengadaan hibah alumni 2026"
                      value={formData.keterangan || ''}
                      onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </>
              )}

              {modalType === 'add_perawatan' && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Pilih Barang</label>
                    <select
                      required
                      value={formData.inventaris_id || ''}
                      onChange={(e) => setFormData({ ...formData, inventaris_id: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="">-- Pilih Barang Inventaris --</option>
                      {inventaris.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.kode_barang} - {b.nama_barang}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Jenis Perawatan / Servis</label>
                    <input
                      type="text"
                      required
                      placeholder="misal: Ganti Baterai & Pembersihan Kipas Laptop"
                      value={formData.jenis_perawatan || ''}
                      onChange={(e) => setFormData({ ...formData, jenis_perawatan: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Biaya (Rp)</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={formData.biaya || ''}
                        onChange={(e) => setFormData({ ...formData, biaya: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Teknisi / Bengkel</label>
                      <input
                        type="text"
                        placeholder="Teknisi Sekolah"
                        value={formData.teknisi || ''}
                        onChange={(e) => setFormData({ ...formData, teknisi: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {modalType === 'add_penghapusan' && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Pilih Barang Rusak Heavy</label>
                    <select
                      required
                      value={formData.inventaris_id || ''}
                      onChange={(e) => setFormData({ ...formData, inventaris_id: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="">-- Pilih Aset --</option>
                      {inventaris.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.kode_barang} - {b.nama_barang} ({b.kondisi})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Alasan Penghapusan (Write-Off)</label>
                    <textarea
                      required
                      rows="3"
                      placeholder="Jelaskan kondisi fisik & umur aset..."
                      value={formData.alasan || ''}
                      onChange={(e) => setFormData({ ...formData, alasan: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center justify-end space-x-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-semibold shadow"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SaranaPage;
