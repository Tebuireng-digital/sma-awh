import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { 
  Library, 
  BookOpen, 
  RotateCcw, 
  DollarSign, 
  UserCheck, 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Bookmark,
  FileText
} from 'lucide-react';

const PerpustakaanPage = () => {
  const [activeTab, setActiveTab] = useState('katalog');
  const [bukuList, setBukuList] = useState([]);
  const [peminjamanList, setPeminjamanList] = useState([]);
  const [dendaList, setDendaList] = useState([]);
  const [kunjunganList, setKunjunganList] = useState([]);
  const [siswaList, setSiswaList] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [search, setSearch] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'add_buku', 'add_pinjam', 'add_kunjungan'
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchSiswaList();
  }, []);

  useEffect(() => {
    fetchTabContent();
  }, [activeTab]);

  const fetchSiswaList = async () => {
    try {
      const res = await api.get('/perpustakaan/siswa-list');
      const rawData = res.data.data || res.data || [];
      if (Array.isArray(rawData)) {
        setSiswaList(rawData);
      } else if (rawData.data && Array.isArray(rawData.data)) {
        setSiswaList(rawData.data);
      }
    } catch (err) {
      console.error('Gagal memuat list siswa via /perpustakaan/siswa-list, mencoba fallback:', err);
      try {
        const resFallback = await api.get('/bk/siswa-list');
        setSiswaList(resFallback.data.data || resFallback.data || []);
      } catch (err2) {
        console.error('Gagal fallback list siswa:', err2);
      }
    }
  };

  const fetchTabContent = async () => {
    setLoading(true);
    try {
      if (activeTab === 'katalog') {
        const res = await api.get('/perpustakaan/buku');
        setBukuList(res.data.data || []);
      } else if (activeTab === 'sirkulasi') {
        const res = await api.get('/perpustakaan/peminjaman');
        setPeminjamanList(res.data.data || []);
        // Juga load list buku untuk pilihan dropdown peminjaman
        const resBuku = await api.get('/perpustakaan/buku');
        setBukuList(resBuku.data.data || []);
      } else if (activeTab === 'denda') {
        const res = await api.get('/perpustakaan/denda');
        setDendaList(res.data.data || []);
      } else if (activeTab === 'kunjungan') {
        const res = await api.get('/perpustakaan/kunjungan');
        setKunjunganList(res.data.data || []);
      }
    } catch (err) {
      console.error('Gagal memuat data tab perpustakaan:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (type, item = null) => {
    fetchSiswaList();
    setModalType(type);
    if (item) {
      setEditItem(item);
      setFormData({ ...item });
    } else {
      setEditItem(null);
      if (type === 'add_buku') {
        setFormData({
          kategori: 'Pelajaran & Umum',
          lokasi_rak: 'Rak A-1',
          stok: 5,
          penerbit: 'Erlangga / Tebuireng Press'
        });
      } else if (type === 'add_pinjam') {
        const today = new Date().toISOString().split('T')[0];
        const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        setFormData({
          tgl_pinjam: today,
          tgl_tenggat: nextWeek,
          catatan: 'Peminjaman rutin perpustakaan'
        });
      } else if (type === 'add_kunjungan') {
        const today = new Date().toISOString().split('T')[0];
        const timeNow = new Date().toTimeString().split(' ')[0].substring(0, 5);
        setFormData({
          tanggal: today,
          jam_masuk: timeNow,
          tujuan: 'Membaca & Referensi Tugas',
          catatan: 'Kunjungan mandiri'
        });
      } else {
        setFormData({});
      }
    }
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let endpoint = '';
      if (modalType.includes('buku')) endpoint = '/perpustakaan/buku';
      else if (modalType.includes('pinjam')) endpoint = '/perpustakaan/peminjaman';
      else if (modalType.includes('kunjungan')) endpoint = '/perpustakaan/kunjungan';

      let res;
      if (editItem) {
        res = await api.put(`${endpoint}/${editItem.id}`, formData);
      } else {
        res = await api.post(endpoint, formData);
      }

      setMsg(res.data.message || 'Berhasil menyimpan data perpustakaan.');
      setShowModal(false);
      setFormData({});
      setEditItem(null);
      setTimeout(() => setMsg(''), 4000);
      fetchTabContent();
    } catch (err) {
      console.error('Error submit form perpustakaan:', err);
      const errMsg = err.response?.data?.message || (err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(', ') : 'Gagal menyimpan data.');
      setMsg(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (type, id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data ini?')) return;
    try {
      const res = await api.delete(`/perpustakaan/${type}/${id}`);
      setMsg(res.data.message || 'Data berhasil dihapus.');
      setTimeout(() => setMsg(''), 4000);
      fetchTabContent();
    } catch (err) {
      console.error('Gagal menghapus data:', err);
      setMsg('Gagal menghapus data perpustakaan.');
    }
  };

  const handleKembalikanBuku = async (id) => {
    if (!window.confirm('Proses pengembalian buku? Stok buku akan bertambah otomatis.')) return;
    try {
      const res = await api.post(`/perpustakaan/peminjaman/${id}/kembali`);
      setMsg(res.data.message || 'Buku berhasil dikembalikan.');
      setTimeout(() => setMsg(''), 4000);
      fetchTabContent();
    } catch (err) {
      console.error('Gagal mengembalikan buku:', err);
      setMsg('Gagal memproses pengembalian buku.');
    }
  };

  const handleBayarDenda = async (id) => {
    if (!window.confirm('Konfirmasi pelunasan denda ini?')) return;
    try {
      const res = await api.post(`/perpustakaan/denda/${id}/bayar`);
      setMsg(res.data.message || 'Denda berhasil dilunasi.');
      setTimeout(() => setMsg(''), 4000);
      fetchTabContent();
    } catch (err) {
      console.error('Gagal melunasi denda:', err);
      setMsg('Gagal memperbarui status denda.');
    }
  };

  // Search Filter
  const filteredBuku = bukuList.filter(b => 
    b.judul?.toLowerCase().includes(search.toLowerCase()) || 
    b.kode_buku?.toLowerCase().includes(search.toLowerCase()) ||
    b.pengarang?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredPeminjaman = peminjamanList.filter(p =>
    p.nama_siswa?.toLowerCase().includes(search.toLowerCase()) ||
    p.judul_buku?.toLowerCase().includes(search.toLowerCase()) ||
    p.kode_buku?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredKunjungan = kunjunganList.filter(k =>
    k.nama_siswa?.toLowerCase().includes(search.toLowerCase()) ||
    k.tujuan?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER SECTION */}
      <div className="bg-gradient-to-r from-[#0d281e] via-[#0f3527] to-[#124231] rounded-2xl p-6 text-white shadow-md border border-emerald-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-radial from-[#c8942a]/15 to-transparent rounded-full blur-2xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-white/10 border border-white/10 rounded-2xl text-[#fde047] backdrop-blur-sm shrink-0">
              <Library className="w-7 h-7" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold backdrop-blur-sm mb-1.5 border border-white/10">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Pustakawan & Sirkulasi Literasi</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Perpustakaan Digital & Sirkulasi Literasi
              </h1>
              <p className="text-xs text-emerald-100/80 mt-0.5 max-w-2xl font-normal">
                SMA A. Wahid Hasyim Tebuireng • Katalog Buku, Sirkulasi Peminjaman-Pengembalian, Denda Keterlambatan & Log Kunjungan Siswa
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {activeTab === 'katalog' && (
              <button
                onClick={() => handleOpenModal('add_buku')}
                className="inline-flex items-center space-x-2 px-4 py-2.5 bg-[#c8942a] hover:bg-[#b08122] text-[#0d281e] text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tambah Buku Baru</span>
              </button>
            )}
            {activeTab === 'sirkulasi' && (
              <button
                onClick={() => handleOpenModal('add_pinjam')}
                className="inline-flex items-center space-x-2 px-4 py-2.5 bg-[#c8942a] hover:bg-[#b08122] text-[#0d281e] text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Transaksi Peminjaman</span>
              </button>
            )}
            {activeTab === 'kunjungan' && (
              <button
                onClick={() => handleOpenModal('add_kunjungan')}
                className="inline-flex items-center space-x-2 px-4 py-2.5 bg-[#c8942a] hover:bg-[#b08122] text-[#0d281e] text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Catat Kunjungan Siswa</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ALERT MESSAGE */}
      {msg && (
        <div className={`p-4 rounded-xl border text-xs font-medium ${msg.includes('Gagal') || msg.includes('error') ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900'}`}>
          {msg}
        </div>
      )}

      {/* TABS NAVIGATION */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-1.5 flex flex-wrap gap-1.5">
        <button
          onClick={() => setActiveTab('katalog')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'katalog' 
              ? 'bg-[#0d281e] text-white shadow-sm' 
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <span>1. Katalog & Stok Buku</span>
        </button>

        <button
          onClick={() => setActiveTab('sirkulasi')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'sirkulasi' 
              ? 'bg-[#0d281e] text-white shadow-sm' 
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <RotateCcw className="w-4 h-4 text-blue-400" />
          <span>2. Sirkulasi Pinjam-Kembali</span>
        </button>

        <button
          onClick={() => setActiveTab('denda')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'denda' 
              ? 'bg-[#0d281e] text-white shadow-sm' 
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <DollarSign className="w-4 h-4 text-[#c8942a]" />
          <span>3. Rekap Denda Keterlambatan</span>
        </button>

        <button
          onClick={() => setActiveTab('kunjungan')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'kunjungan' 
              ? 'bg-[#0d281e] text-white shadow-sm' 
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <UserCheck className="w-4 h-4 text-purple-400" />
          <span>4. Data Kunjungan Perpustakaan</span>
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white p-4 border-x border-b border-slate-200 flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan judul, nama siswa, atau kode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>
        <span className="text-[11px] text-slate-400 font-semibold">
          Total Terdata: {
            activeTab === 'katalog' ? filteredBuku.length :
            activeTab === 'sirkulasi' ? filteredPeminjaman.length :
            activeTab === 'denda' ? dendaList.length : filteredKunjungan.length
          } Record
        </span>
      </div>

      {/* TAB CONTENTS */}
      <div className="bg-white rounded-b-xl border border-slate-200 p-6 shadow-sm">
        {loading ? (
          <div className="text-center py-12 text-xs text-slate-500 font-semibold animate-pulse">
            Memuat data perpustakaan...
          </div>
        ) : (
          <>
            {/* TAB 1: KATALOG BUKU */}
            {activeTab === 'katalog' && (
              <div>
                {filteredBuku.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300 p-6 space-y-3">
                    <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-slate-700">Katalog Buku Masih Kosong</h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Belum ada koleksi buku perpustakaan yang terdaftar. Klik tombol di bawah untuk menambahkan buku baru.
                      </p>
                    </div>
                    <button
                      onClick={() => handleOpenModal('add_buku')}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Tambah Buku Pertama</span>
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                          <th className="px-4 py-2.5">#</th>
                          <th className="px-4 py-2.5">Kode Buku</th>
                          <th className="px-4 py-2.5">Judul & Pengarang</th>
                          <th className="px-4 py-2.5">Penerbit & ISBN</th>
                          <th className="px-4 py-2.5">Kategori</th>
                          <th className="px-4 py-2.5">Lokasi Rak</th>
                          <th className="px-4 py-2.5 text-center">Stok Tersedia</th>
                          <th className="px-4 py-2.5 text-center">Aksi (CRUD)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {filteredBuku.map((b, idx) => (
                          <tr key={b.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-semibold text-slate-500">{idx + 1}</td>
                            <td className="px-4 py-3 font-mono font-bold text-teal-800">{b.kode_buku}</td>
                            <td className="px-4 py-3">
                              <span className="font-bold text-slate-800 block">{b.judul}</span>
                              <span className="text-slate-500 text-[11px]">Pengarang: {b.pengarang}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-slate-700 block">{b.penerbit || '-'}</span>
                              <span className="text-slate-400 text-[11px]">ISBN: {b.isbn || '-'}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                                {b.kategori || 'Umum'}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-semibold text-slate-700">{b.lokasi_rak || 'Rak Utama'}</td>
                            <td className="px-4 py-3 text-center font-bold">
                              <span className={`px-2.5 py-0.5 rounded-full text-[11px] ${b.stok > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                {b.stok} Eksemplar
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center space-x-1">
                                <button
                                  onClick={() => handleOpenModal('add_buku', b)}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  title="Edit Buku"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteItem('buku', b.id)}
                                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                  title="Hapus Buku"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: SIRKULASI PEMINJAMAN */}
            {activeTab === 'sirkulasi' && (
              <div>
                {filteredPeminjaman.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300 p-6 space-y-3">
                    <RotateCcw className="w-10 h-10 text-slate-400 mx-auto" />
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-slate-700">Belum Ada Transaksi Peminjaman</h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Belum ada sirkulasi peminjaman buku aktif. Klik tombol di bawah untuk mencatat peminjaman siswa.
                      </p>
                    </div>
                    <button
                      onClick={() => handleOpenModal('add_pinjam')}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Catat Peminjaman Pertama</span>
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                          <th className="px-4 py-2.5">#</th>
                          <th className="px-4 py-2.5">Identitas Peminjam (Siswa)</th>
                          <th className="px-4 py-2.5">Buku Yang Dipinjam</th>
                          <th className="px-4 py-2.5">Tgl Pinjam</th>
                          <th className="px-4 py-2.5">Tenggat Kembali</th>
                          <th className="px-4 py-2.5 text-center">Status</th>
                          <th className="px-4 py-2.5">Denda / Sanksi</th>
                          <th className="px-4 py-2.5 text-center">Aksi (CRUD & Kembalikan)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {filteredPeminjaman.map((p, idx) => (
                          <tr key={p.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-semibold text-slate-500">{idx + 1}</td>
                            <td className="px-4 py-3">
                              <span className="font-bold text-slate-800 block">{p.nama_siswa}</span>
                              <span className="text-slate-500 text-[11px]">NIS: {p.nis} | Kelas: {p.kelas || '-'}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-bold text-teal-900 block">{p.judul_buku}</span>
                              <span className="text-slate-500 font-mono text-[11px]">[{p.kode_buku}]</span>
                            </td>
                            <td className="px-4 py-3 text-slate-700">{p.tgl_pinjam}</td>
                            <td className="px-4 py-3 font-bold text-rose-700">{p.tgl_tenggat}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                p.status === 'Dipinjam' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {p.status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {p.denda > 0 ? (
                                <span className="font-bold text-rose-600">Rp {Number(p.denda).toLocaleString()} ({p.status_denda})</span>
                              ) : (
                                <span className="text-slate-400 text-[11px]">- (Nihil)</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center space-x-1">
                                {p.status === 'Dipinjam' && (
                                  <button
                                    onClick={() => handleKembalikanBuku(p.id)}
                                    className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold shadow flex items-center space-x-1"
                                    title="Proses Pengembalian"
                                  >
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Kembalikan</span>
                                  </button>
                                )}
                                <button
                                  onClick={() => handleOpenModal('add_pinjam', p)}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  title="Edit Peminjaman"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteItem('peminjaman', p.id)}
                                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                  title="Hapus Sirkulasi"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: REKAP DENDA */}
            {activeTab === 'denda' && (
              <div>
                {dendaList.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300 p-6 space-y-3">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-slate-700">Tidak Ada Tunggakan Denda</h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Semua peminjaman buku berjalan tepat waktu. Tidak ada sanksi denda keterlambatan saat ini.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                          <th className="px-4 py-2.5">#</th>
                          <th className="px-4 py-2.5">Siswa Peminjam</th>
                          <th className="px-4 py-2.5">Buku Dipinjam</th>
                          <th className="px-4 py-2.5">Tenggat Kembali</th>
                          <th className="px-4 py-2.5">Tanggal Ditinggalkan/Kembali</th>
                          <th className="px-4 py-2.5">Total Denda</th>
                          <th className="px-4 py-2.5 text-center">Status Pembayaran</th>
                          <th className="px-4 py-2.5 text-center">Aksi Pelunasan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {dendaList.map((d, idx) => (
                          <tr key={d.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-semibold text-slate-500">{idx + 1}</td>
                            <td className="px-4 py-3">
                              <span className="font-bold text-slate-800 block">{d.nama_siswa}</span>
                              <span className="text-slate-500 text-[11px]">NIS: {d.nis} | Kelas: {d.kelas || '-'}</span>
                            </td>
                            <td className="px-4 py-3 font-bold text-teal-900">{d.judul_buku}</td>
                            <td className="px-4 py-3 text-slate-700">{d.tgl_tenggat}</td>
                            <td className="px-4 py-3 text-slate-700">{d.tgl_kembali || 'Belum Dikembalikan'}</td>
                            <td className="px-4 py-3 font-bold text-rose-700">Rp {Number(d.denda).toLocaleString()}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                d.status_denda === 'Lunas' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}>
                                {d.status_denda}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {d.status_denda !== 'Lunas' && (
                                <button
                                  onClick={() => handleBayarDenda(d.id)}
                                  className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-[11px] font-semibold shadow"
                                >
                                  Pelunasan Denda
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: DATA KUNJUNGAN */}
            {activeTab === 'kunjungan' && (
              <div>
                {filteredKunjungan.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300 p-6 space-y-3">
                    <UserCheck className="w-10 h-10 text-slate-400 mx-auto" />
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-slate-700">Belum Ada Presensi Kunjungan</h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Belum ada log kunjungan harian siswa ke perpustakaan. Klik tombol di bawah untuk mencatat kunjungan baru.
                      </p>
                    </div>
                    <button
                      onClick={() => handleOpenModal('add_kunjungan')}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Catat Kunjungan Baru</span>
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                          <th className="px-4 py-2.5">#</th>
                          <th className="px-4 py-2.5">Tanggal & Jam</th>
                          <th className="px-4 py-2.5">Identitas Siswa (Pengunjung)</th>
                          <th className="px-4 py-2.5">Tujuan Kunjungan</th>
                          <th className="px-4 py-2.5">Catatan / Aktivitas</th>
                          <th className="px-4 py-2.5 text-center">Aksi (CRUD)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {filteredKunjungan.map((k, idx) => (
                          <tr key={k.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-semibold text-slate-500">{idx + 1}</td>
                            <td className="px-4 py-3">
                              <span className="font-bold text-slate-800 block">{k.tanggal}</span>
                              <span className="text-slate-500 text-[11px]">Jam: {k.jam_masuk} WIB</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-bold text-teal-900 block">{k.nama_siswa}</span>
                              <span className="text-slate-500 text-[11px]">NIS: {k.nis} | Kelas: {k.kelas || '-'}</span>
                            </td>
                            <td className="px-4 py-3 font-semibold text-slate-800">{k.tujuan}</td>
                            <td className="px-4 py-3 text-slate-600">{k.catatan || '-'}</td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center space-x-1">
                                <button
                                  onClick={() => handleOpenModal('add_kunjungan', k)}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  title="Edit Kunjungan"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteItem('kunjungan', k.id)}
                                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                  title="Hapus Kunjungan"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
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
              {modalType === 'add_buku' && (editItem ? 'Edit Data Buku Katalog' : 'Tambah Buku Baru ke Katalog')}
              {modalType === 'add_pinjam' && (editItem ? 'Edit Transaksi Peminjaman' : 'Catat Transaksi Peminjaman Buku')}
              {modalType === 'add_kunjungan' && (editItem ? 'Edit Log Kunjungan' : 'Catat Presensi Kunjungan Perpustakaan')}
            </h2>

            <form onSubmit={handleFormSubmit} className="space-y-3 text-xs">
              {/* KATALOG BUKU FORM */}
              {modalType === 'add_buku' && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Judul Buku</label>
                    <input
                      type="text"
                      required
                      placeholder="misal: Laskar Pelangi / Biologi SMA Kelas 11"
                      value={formData.judul || ''}
                      onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Pengarang</label>
                      <input
                        type="text"
                        required
                        placeholder="Nama Penulis"
                        value={formData.pengarang || ''}
                        onChange={(e) => setFormData({ ...formData, pengarang: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Penerbit</label>
                      <input
                        type="text"
                        placeholder="Penerbit"
                        value={formData.penerbit || ''}
                        onChange={(e) => setFormData({ ...formData, penerbit: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Kategori Buku</label>
                      <select
                        value={formData.kategori || 'Pelajaran'}
                        onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                      >
                        <option value="Pelajaran">Pelajaran & Kurikulum</option>
                        <option value="Fiksi">Fiksi & Novel</option>
                        <option value="Agama">Agama & Keislaman</option>
                        <option value="Sains">Sains & Teknologi</option>
                        <option value="Sejarah">Sejarah & Sosial</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Lokasi Rak</label>
                      <input
                        type="text"
                        placeholder="Rak A-1"
                        value={formData.lokasi_rak || ''}
                        onChange={(e) => setFormData({ ...formData, lokasi_rak: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">ISBN</label>
                      <input
                        type="text"
                        placeholder="978-602-xxx-xxx"
                        value={formData.isbn || ''}
                        onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Stok Eksemplar</label>
                      <input
                        type="number"
                        min="0"
                        required
                        placeholder="Jumlah"
                        value={formData.stok ?? 5}
                        onChange={(e) => setFormData({ ...formData, stok: parseInt(e.target.value) || 0 })}
                        className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* TRANSAKSI PEMINJAMAN FORM */}
              {modalType === 'add_pinjam' && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Pilih Siswa Peminjam</label>
                    <select
                      required
                      value={formData.siswa_id || ''}
                      onChange={(e) => setFormData({ ...formData, siswa_id: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                    >
                      <option value="">-- Pilih Siswa --</option>
                      {siswaList.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nama} {s.kelas ? `(${s.kelas})` : ''} - NIS: {s.nis}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Pilih Buku Dipinjam</label>
                    <select
                      required
                      value={formData.buku_id || ''}
                      onChange={(e) => setFormData({ ...formData, buku_id: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                    >
                      <option value="">-- Pilih Buku --</option>
                      {bukuList.map((b) => (
                        <option key={b.id} value={b.id} disabled={b.stok <= 0}>
                          [{b.kode_buku}] {b.judul} (Stok: {b.stok})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Tanggal Pinjam</label>
                      <input
                        type="date"
                        required
                        value={formData.tgl_pinjam || ''}
                        onChange={(e) => setFormData({ ...formData, tgl_pinjam: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Tenggat Kembali</label>
                      <input
                        type="date"
                        required
                        value={formData.tgl_tenggat || ''}
                        onChange={(e) => setFormData({ ...formData, tgl_tenggat: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Catatan Peminjaman</label>
                    <input
                      type="text"
                      placeholder="Catatan tambahan"
                      value={formData.catatan || ''}
                      onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                </>
              )}

              {/* DATA KUNJUNGAN FORM */}
              {modalType === 'add_kunjungan' && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Pilih Siswa Pengunjung</label>
                    <select
                      required
                      value={formData.siswa_id || ''}
                      onChange={(e) => setFormData({ ...formData, siswa_id: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                    >
                      <option value="">-- Pilih Siswa --</option>
                      {siswaList.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nama} {s.kelas ? `(${s.kelas})` : ''} - NIS: {s.nis}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Tanggal</label>
                      <input
                        type="date"
                        required
                        value={formData.tanggal || ''}
                        onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Jam Masuk</label>
                      <input
                        type="time"
                        required
                        value={formData.jam_masuk || ''}
                        onChange={(e) => setFormData({ ...formData, jam_masuk: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tujuan Kunjungan</label>
                    <select
                      value={formData.tujuan || 'Membaca Buku'}
                      onChange={(e) => setFormData({ ...formData, tujuan: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                    >
                      <option value="Membaca Buku">Membaca Buku</option>
                      <option value="Meminjam Buku">Meminjam / Mengembalikan Buku</option>
                      <option value="Diskusi & Tugas Kelompok">Diskusi & Tugas Kelompok</option>
                      <option value="Akses Komputer & Internet">Akses Komputer & Digital</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Catatan</label>
                    <input
                      type="text"
                      placeholder="Catatan aktivitas"
                      value={formData.catatan || ''}
                      onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
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
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded font-semibold shadow"
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

export default PerpustakaanPage;
