import React, { useState, useEffect } from 'react';
import api from '../api/client';
import {
  Mail,
  FileText,
  Plus,
  Search,
  Pencil,
  Trash2,
  Printer,
  FileCheck,
  Archive,
  Send,
  Inbox,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  Building,
  Eye,
  X
} from 'lucide-react';

const PersuratanPage = () => {
  const [activeTab, setActiveTab] = useState('surat'); // 'surat', 'generator', 'arsip', 'template'
  const [suratList, setSuratList] = useState([]);
  const [templateList, setTemplateList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [search, setSearch] = useState('');
  const [filterJenis, setFilterJenis] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'add_surat', 'preview_surat'
  const [editItem, setEditItem] = useState(null);
  const [previewSurat, setPreviewSurat] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    jenis: 'Surat Keluar',
    kategori: 'Umum',
    kerahasiaan: 'Biasa',
    no_surat: '',
    perihal: '',
    pengirim_penerima: '',
    tanggal: new Date().toISOString().split('T')[0],
    isi_surat: '',
    lokasi_arsip: 'Box Arsip Utama / Lemari 1',
    status: 'Diarsipkan'
  });

  // Letter Generator Form State (Official Reference: SMA A. Wahid Hasyim Tebuireng)
  const [genData, setGenData] = useState({
    selectedTemplate: 'UND-RESMI',
    layout_type: 'undangan', // 'undangan' (Surat Biasa/Edaran) atau 'tugas' (Surat Tugas Resmi Tabel)
    bidang: 'MN',
    no_surat: '2283/104.13.2/SMA.4/WH/MN/2026',
    tanggal_surat: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    lampiran: '-',
    perihal: 'Undangan Apel Pelantikan MPK OBTP',
    penerima_tujuan: 'Bapak/Ibu Guru & Karyawan',
    nama_subjek: '-',
    nis_nip: '-',
    isi_custom: "Dalam rangka Pelantikan MPK OBTP, kami mengundang seluruh Bapak/Ibu Guru & Karyawan SMA A. Wahid Hasyim Tebuireng untuk mengikuti apel yang akan dilaksanakan pada:\n\nHari : Selasa\nTanggal : 01 September 2026\nPukul : 07.00 WIB\nTempat : Lapangan SMA. A. Wahid Hasyim\nAgenda : Apel Pelantikan MPK OBTP\nKetentuan : Mengenakan Seragam Merah Marron\n\nMengingat pentingnya agenda tersebut, kami mengharapkan kehadiran Bapak/Ibu tepat waktu.\nDemikian undangan ini kami sampaikan. Atas perhatian dan kehadiran Bapak/Ibu, kami ucapkan terima kasih.",
    // Field khusus Surat Tugas (Tabel Resmi)
    tugas_pemberi: 'Kepala SMA A. Wahid Hasyim Tebuireng',
    tugas_nama: "Pengawalan bersama seluruh pimpinan, BK, dan Guru piket yayasan KHM. Hasyim Asy'ari terkait kepulangan/kembalinya santri ke pondok",
    tugas_penerima: 'Tercantum dalam lampiran',
    tugas_waktu: 'Terjadwal dalam lampiran',
    tugas_keterangan: "1. Surat tugas ini diberikan kepada yang bersangkutan untuk dilaksanakan dengan sebaik-baiknya.\n2. Apabila terdapat kekeliruan dalam penetapan surat tugas ini, akan dibetulkan sebagaimana mestinya.",
    // Penandatangan Resmi (Acuan: Ni'maturrohmah, M. Pd)
    penandatangan_nama: "Ni'maturrohmah, M. Pd",
    penandatangan_jabatan: 'Kepala Sekolah'
  });

  useEffect(() => {
    fetchSuratList();
    fetchTemplateList();
    handleGenerateNoSurat('Surat Keluar', 'MN');
  }, [filterJenis]);

  const fetchSuratList = async () => {
    setLoading(true);
    try {
      let url = '/persuratan/surat';
      if (filterJenis) url += `?jenis=${filterJenis}`;
      const res = await api.get(url);
      setSuratList(res.data.data || []);
    } catch (err) {
      console.error('Gagal memuat data persuratan:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplateList = async () => {
    try {
      const res = await api.get('/persuratan/template');
      setTemplateList(res.data.data || []);
    } catch (err) {
      console.error('Gagal memuat template surat:', err);
    }
  };

  const handleGenerateNoSurat = async (jenis = 'Surat Keluar', bidang = 'MN') => {
    try {
      const res = await api.get(`/persuratan/generate-nomor?jenis=${jenis}&bidang=${bidang}`);
      if (res.data && res.data.no_surat) {
        setFormData(prev => ({ ...prev, no_surat: res.data.no_surat }));
        setGenData(prev => ({ ...prev, no_surat: res.data.no_surat }));
      }
    } catch (err) {
      console.error('Gagal generate no surat:', err);
    }
  };

  const handleOpenModal = async (type, item = null) => {
    setModalType(type);
    if (item) {
      setEditItem(item);
      setFormData({
        jenis: item.jenis || 'Surat Keluar',
        kategori: item.kategori || 'Umum',
        kerahasiaan: item.kerahasiaan || 'Biasa',
        no_surat: item.no_surat || '',
        perihal: item.perihal || '',
        pengirim_penerima: item.pengirim_penerima || '',
        tanggal: item.tanggal || new Date().toISOString().split('T')[0],
        isi_surat: item.isi_surat || '',
        lokasi_arsip: item.lokasi_arsip || 'Box Arsip Utama',
        status: item.status || 'Diarsipkan'
      });
    } else {
      setEditItem(null);
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        jenis: 'Surat Keluar',
        kategori: 'Umum',
        kerahasiaan: 'Biasa',
        no_surat: '',
        perihal: '',
        pengirim_penerima: '',
        tanggal: today,
        isi_surat: '',
        lokasi_arsip: 'Box Arsip Utama / Lemari 1',
        status: 'Diarsipkan'
      });
      await handleGenerateNoSurat('Surat Keluar');
    }
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let res;
      if (editItem) {
        res = await api.put(`/persuratan/surat/${editItem.id}`, formData);
      } else {
        res = await api.post('/persuratan/surat', formData);
      }

      setMsg(res.data.message || 'Berhasil menyimpan dokumen persuratan.');
      setShowModal(false);
      setTimeout(() => setMsg(''), 4000);
      fetchSuratList();
    } catch (err) {
      console.error('Error submit form persuratan:', err);
      const errMsg = err.response?.data?.message || 'Gagal menyimpan dokumen surat.';
      setMsg(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus surat ini dari arsip digital?')) return;
    try {
      const res = await api.delete(`/persuratan/surat/${id}`);
      setMsg(res.data.message || 'Surat berhasil dihapus.');
      setTimeout(() => setMsg(''), 4000);
      fetchSuratList();
    } catch (err) {
      console.error('Gagal menghapus dokumen surat:', err);
      setMsg('Gagal menghapus dokumen surat.');
    }
  };

  const handleSaveGeneratedToArchive = async () => {
    setLoading(true);
    try {
      const isTugas = genData.layout_type === 'tugas';
      const payload = {
        jenis: 'Surat Keluar',
        kategori: isTugas ? 'Kepegawaian' : (genData.bidang === 'KS' ? 'Kesiswaan' : 'Umum'),
        kerahasiaan: 'Biasa',
        no_surat: genData.no_surat || '2283/104.13.2/SMA.4/WH/MN/2026',
        perihal: isTugas ? (genData.tugas_nama || genData.perihal) : genData.perihal,
        pengirim_penerima: isTugas ? (genData.tugas_penerima || 'Guru & Karyawan') : genData.penerima_tujuan,
        tanggal: new Date().toISOString().split('T')[0],
        isi_surat: isTugas ? genData.tugas_keterangan : genData.isi_custom,
        lokasi_arsip: 'Digital Archive / Surat Resmi Sekolah',
        status: 'Selesai'
      };
      const res = await api.post('/persuratan/surat', payload);
      setMsg(res.data.message || 'Surat berkop resmi berhasil disimpan ke Arsip Digital!');
      setTimeout(() => setMsg(''), 4000);
      fetchSuratList();
      setActiveTab('surat');
    } catch (err) {
      console.error('Gagal menyimpan surat berkop ke arsip:', err);
      setMsg('Gagal menyimpan ke arsip digital.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = (tpl) => {
    const isTugas = tpl.kode_template === 'ST-JAGA' || tpl.kode_template?.startsWith('ST-');
    const bidang = tpl.kategori === 'Kesiswaan' ? 'KS' : (tpl.kategori === 'Kurikulum' ? 'PP' : 'MN');
    setGenData(prev => ({
      ...prev,
      selectedTemplate: tpl.kode_template,
      layout_type: isTugas ? 'tugas' : 'undangan',
      bidang: bidang,
      perihal: tpl.nama_template,
      isi_custom: tpl.format_konten,
      tugas_nama: isTugas ? tpl.nama_template : prev.tugas_nama,
    }));
    handleGenerateNoSurat('Surat Keluar', bidang);
  };

  // Search Filter
  const filteredSurat = suratList.filter(s =>
    s.no_surat?.toLowerCase().includes(search.toLowerCase()) ||
    s.perihal?.toLowerCase().includes(search.toLowerCase()) ||
    s.pengirim_penerima?.toLowerCase().includes(search.toLowerCase()) ||
    s.kategori?.toLowerCase().includes(search.toLowerCase()) ||
    s.lokasi_arsip?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER SECTION */}
      <div className="print:hidden bg-gradient-to-r from-[#0d281e] via-[#0f3527] to-[#124231] rounded-2xl p-6 text-white shadow-md border border-emerald-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-radial from-[#c8942a]/15 to-transparent rounded-full blur-2xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-white/10 border border-white/10 rounded-2xl text-[#fde047] backdrop-blur-sm shrink-0">
              <Mail className="w-7 h-7" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold backdrop-blur-sm mb-1.5 border border-white/10">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Tata Usaha & Administrasi Persuratan</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Persuratan & Pengarsipan Digital</h1>
              <p className="text-xs text-emerald-100/80 mt-0.5 max-w-2xl font-normal">
                SMA A. Wahid Hasyim Tebuireng • Registrasi Surat Masuk & Keluar, Penomoran Otomatis, Template Berkop Resmi & Pengarsipan Elektronik
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setActiveTab('generator');
                handleGenerateNoSurat('Surat Keluar', genData.bidang || 'MN');
              }}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-[#c8942a] hover:bg-[#b08122] text-[#0d281e] text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>+ Buat Surat Berkop</span>
            </button>
            <button
              onClick={() => handleOpenModal('add_surat')}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Registrasi Surat</span>
            </button>
          </div>
        </div>
      </div>

      {/* ALERT MESSAGE */}
      {msg && (
        <div className={`print:hidden p-4 rounded-xl border text-xs font-medium ${msg.includes('Gagal') || msg.includes('error') ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900'}`}>
          {msg}
        </div>
      )}

      {/* TABS NAVIGATION */}
      <div className="print:hidden bg-white rounded-2xl border border-slate-200/90 shadow-sm p-1.5 flex flex-wrap gap-1.5">
        <button
          onClick={() => setActiveTab('surat')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'surat'
              ? 'bg-[#0d281e] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Inbox className="w-4 h-4 text-emerald-400" />
          <span>1. Registrasi Surat Masuk & Keluar</span>
        </button>

        <button
          onClick={() => setActiveTab('generator')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'generator'
              ? 'bg-[#0d281e] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4 text-blue-400" />
          <span>2. Pembuat Surat Berkop Resmi</span>
        </button>

        <button
          onClick={() => setActiveTab('arsip')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'arsip'
              ? 'bg-[#0d281e] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Archive className="w-4 h-4 text-[#c8942a]" />
          <span>3. Arsip Digital & Metadata</span>
        </button>

        <button
          onClick={() => setActiveTab('template')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'template'
              ? 'bg-[#0d281e] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Building className="w-4 h-4 text-purple-400" />
          <span>4. Master Template Surat</span>
        </button>
      </div>

      {/* FILTER & SEARCH BAR (for tab surat & arsip) */}
      {(activeTab === 'surat' || activeTab === 'arsip') && (
        <div className="print:hidden bg-white p-4 border-x border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <div className="relative w-full max-w-xs">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari No. Surat, Perihal, Pengirim, Arsip..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {activeTab === 'surat' && (
              <select
                value={filterJenis}
                onChange={(e) => setFilterJenis(e.target.value)}
                className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="">Semua Jenis Surat</option>
                <option value="Surat Masuk">Surat Masuk</option>
                <option value="Surat Keluar">Surat Keluar</option>
              </select>
            )}
          </div>

          <span className="text-[11px] text-slate-400 font-semibold">
            Total Terdaftar: {filteredSurat.length} Dokumen Surat
          </span>
        </div>
      )}

      {/* TAB CONTENTS */}
      <div className="bg-white rounded-b-xl border border-slate-200 p-6 shadow-sm">
        {loading ? (
          <div className="text-center py-12 text-xs text-slate-500 font-semibold animate-pulse">
            Memuat data persuratan & pengarsipan...
          </div>
        ) : (
          <>
            {/* TAB 1: REGISTRASI SURAT MASUK & KELUAR */}
            {activeTab === 'surat' && (
              <div>
                {filteredSurat.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300 p-6 space-y-3">
                    <Mail className="w-10 h-10 text-slate-400 mx-auto" />
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-slate-700">Belum Ada Dokumen Surat</h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Belum ada arsip surat masuk atau surat keluar yang terdaftar. Klik tombol untuk mendaftarkan dokumen baru.
                      </p>
                    </div>
                    <button
                      onClick={() => handleOpenModal('add_surat')}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Registrasi Surat Pertama</span>
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                          <th className="px-4 py-2.5">#</th>
                          <th className="px-4 py-2.5">Nomor Surat Official</th>
                          <th className="px-4 py-2.5">Jenis & Kerahasiaan</th>
                          <th className="px-4 py-2.5">Perihal & Ringkasan</th>
                          <th className="px-4 py-2.5">Pengirim / Penerima</th>
                          <th className="px-4 py-2.5">Tanggal</th>
                          <th className="px-4 py-2.5">Lokasi Arsip</th>
                          <th className="px-4 py-2.5 text-center">Status</th>
                          <th className="px-4 py-2.5 text-center">Aksi (CRUD)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {filteredSurat.map((s, idx) => (
                          <tr key={s.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-semibold text-slate-500">{idx + 1}</td>
                            <td className="px-4 py-3 font-mono font-bold text-emerald-800">{s.no_surat}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                s.jenis === 'Surat Masuk' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {s.jenis}
                              </span>
                              <span className="block text-[10px] text-slate-400 mt-0.5">Sifat: {s.kerahasiaan || 'Biasa'}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-bold text-slate-800 block">{s.perihal}</span>
                              <span className="text-slate-500 text-[11px]">Kategori: {s.kategori || 'Umum'}</span>
                            </td>
                            <td className="px-4 py-3 font-semibold text-slate-700">{s.pengirim_penerima}</td>
                            <td className="px-4 py-3 text-slate-600">{s.tanggal}</td>
                            <td className="px-4 py-3 font-medium text-slate-500">{s.lokasi_arsip || 'Box Arsip Main'}</td>
                            <td className="px-4 py-3 text-center">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                                {s.status || 'Diarsipkan'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center space-x-1">
                                <button
                                  onClick={() => handleOpenModal('add_surat', s)}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  title="Edit Surat"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(s.id)}
                                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                  title="Hapus Surat"
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

            {/* TAB 2: PEMBUAT SURAT BERKOP RESMI (LETTER GENERATOR) */}
            {activeTab === 'generator' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* CONTROL PANEL FORM */}
                <div className="print:hidden lg:col-span-5 space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>Form Generator Surat Resmi</span>
                    </h3>
                    <button
                      onClick={() => handleGenerateNoSurat('Surat Keluar', genData.bidang || 'MN')}
                      className="text-[10px] text-emerald-700 font-bold bg-emerald-100 hover:bg-emerald-200 px-2 py-1 rounded"
                      title="Hitung nomor urut otomatis berikutnya"
                    >
                      Auto No. Surat
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    {/* TIPE LAYOUT SURAT */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Format Layout Surat</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setGenData(prev => ({ ...prev, layout_type: 'undangan' }))}
                          className={`py-1.5 px-2 text-xs font-semibold rounded-md border text-center transition-colors ${
                            genData.layout_type === 'undangan'
                              ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          Surat Biasa / Undangan
                        </button>
                        <button
                          type="button"
                          onClick={() => setGenData(prev => ({ ...prev, layout_type: 'tugas' }))}
                          className={`py-1.5 px-2 text-xs font-semibold rounded-md border text-center transition-colors ${
                            genData.layout_type === 'tugas'
                              ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          Surat Tugas (Tabel Resmi)
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Pilih Template Surat Siap Pakai</label>
                      <select
                        value={genData.selectedTemplate}
                        onChange={(e) => {
                          const tpl = templateList.find(t => t.kode_template === e.target.value);
                          if (tpl) handleSelectTemplate(tpl);
                        }}
                        className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                      >
                        {templateList.map(t => (
                          <option key={t.id} value={t.kode_template}>
                            [{t.kategori}] {t.nama_template}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label className="block font-semibold text-slate-700 mb-1">Nomor Surat Baku</label>
                        <input
                          type="text"
                          value={genData.no_surat}
                          onChange={(e) => setGenData({ ...genData, no_surat: e.target.value })}
                          className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono text-[11px] font-bold text-emerald-900"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Bidang</label>
                        <select
                          value={genData.bidang || 'MN'}
                          onChange={(e) => {
                            const newBidang = e.target.value;
                            setGenData(prev => ({ ...prev, bidang: newBidang }));
                            handleGenerateNoSurat('Surat Keluar', newBidang);
                          }}
                          className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                        >
                          <option value="MN">MN (Umum)</option>
                          <option value="KS">KS (Kesiswaan)</option>
                          <option value="PP">PP (Kurikulum)</option>
                          <option value="TU">TU (Tata Usaha)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Tanggal Surat</label>
                        <input
                          type="text"
                          value={genData.tanggal_surat}
                          onChange={(e) => setGenData({ ...genData, tanggal_surat: e.target.value })}
                          className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Lampiran</label>
                        <input
                          type="text"
                          value={genData.lampiran}
                          onChange={(e) => setGenData({ ...genData, lampiran: e.target.value })}
                          placeholder="-"
                          className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    {/* FORM SESUAI TIPE LAYOUT */}
                    {genData.layout_type === 'tugas' ? (
                      <div className="space-y-3 pt-2 border-t border-slate-200">
                        <span className="text-[11px] font-bold text-slate-600 block uppercase">Parameter Surat Tugas (Tabel)</span>
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">1. Yang Memberi Tugas</label>
                          <input
                            type="text"
                            value={genData.tugas_pemberi}
                            onChange={(e) => setGenData({ ...genData, tugas_pemberi: e.target.value })}
                            className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">2. Nama Tugas / Deskripsi</label>
                          <textarea
                            rows={2}
                            value={genData.tugas_nama}
                            onChange={(e) => setGenData({ ...genData, tugas_nama: e.target.value })}
                            className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">3. Nama Yang Diberi Tugas</label>
                            <input
                              type="text"
                              value={genData.tugas_penerima}
                              onChange={(e) => setGenData({ ...genData, tugas_penerima: e.target.value })}
                              className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">4. Waktu Pelaksanaan</label>
                            <input
                              type="text"
                              value={genData.tugas_waktu}
                              onChange={(e) => setGenData({ ...genData, tugas_waktu: e.target.value })}
                              className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">5. Keterangan / Poin Penugasan</label>
                          <textarea
                            rows={3}
                            value={genData.tugas_keterangan}
                            onChange={(e) => setGenData({ ...genData, tugas_keterangan: e.target.value })}
                            className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3 pt-2 border-t border-slate-200">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Perihal / Hal</label>
                          <input
                            type="text"
                            value={genData.perihal}
                            onChange={(e) => setGenData({ ...genData, perihal: e.target.value })}
                            className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Penerima / Tujuan Surat</label>
                          <input
                            type="text"
                            value={genData.penerima_tujuan}
                            onChange={(e) => setGenData({ ...genData, penerima_tujuan: e.target.value })}
                            className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">Nama Subjek / Ybs (Opsional)</label>
                            <input
                              type="text"
                              value={genData.nama_subjek}
                              onChange={(e) => setGenData({ ...genData, nama_subjek: e.target.value })}
                              className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">NIS / NIP / Kelas</label>
                            <input
                              type="text"
                              value={genData.nis_nip}
                              onChange={(e) => setGenData({ ...genData, nis_nip: e.target.value })}
                              className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Isi Konten Surat</label>
                          <textarea
                            rows={4}
                            value={genData.isi_custom}
                            onChange={(e) => setGenData({ ...genData, isi_custom: e.target.value })}
                            className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
                          />
                        </div>
                      </div>
                    )}

                    {/* PENANDATANGAN */}
                    <div className="pt-2 border-t border-slate-200">
                      <label className="block font-semibold text-slate-700 mb-1">Penandatangan Resmi</label>
                      <input
                        type="text"
                        value={genData.penandatangan_nama}
                        onChange={(e) => setGenData({ ...genData, penandatangan_nama: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg shadow flex items-center justify-center space-x-1.5"
                      >
                        <Printer className="w-4 h-4" />
                        <span>Cetak Kop Resmi</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveGeneratedToArchive}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow flex items-center justify-center space-x-1.5"
                      >
                        <Archive className="w-4 h-4" />
                        <span>Simpan ke Arsip</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* PREVIEW KOP SURAT RESMI */}
                <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-xl border border-slate-300 shadow-sm font-serif text-slate-900 space-y-5 print:p-0 print:border-none print:shadow-none print:w-full print:m-0">
                  {/* HEADER KOP RESMI (SESUAI DOKUMEN ASLI) */}
                  <div className="border-b-2 border-slate-900 pb-1">
                    <div className="flex items-center gap-4 pb-2 border-b border-slate-900">
                      {/* Logo Sekolah di Kiri */}
                      <div className="w-20 md:w-24 shrink-0 flex items-center justify-center">
                        <img
                          src="/logo.png"
                          alt="Logo SMA A. Wahid Hasyim"
                          className="w-20 h-auto max-h-24 object-contain"
                        />
                      </div>

                      {/* Teks Kop Resmi */}
                      <div className="flex-1 text-center space-y-0.5">
                        <h3 className="font-serif text-xs md:text-sm font-bold uppercase tracking-widest text-[#1b4b73]">
                          YAYASAN HASYIM ASY'ARI
                        </h3>
                        <h1 className="font-serif text-lg md:text-2xl font-black uppercase tracking-wider text-[#153e61] leading-tight">
                          SMA A. WAHID HASYIM
                        </h1>
                        <h2 className="font-serif text-xs md:text-sm font-bold uppercase tracking-wider text-[#1b4b73]">
                          TEBUIRENG - JOMBANG
                        </h2>
                        <p className="font-sans text-[10px] md:text-[11px] font-bold text-[#14729c] tracking-normal pt-0.5">
                          STATUS : TERAKREDITASI "A" &nbsp;&nbsp; NSS : 304050402007 &nbsp;&nbsp; NPSN : 20540307
                        </p>
                        <p className="font-sans text-[9px] md:text-[10px] text-slate-700 tracking-tight">
                          Tromol Pos 5 Jombang 61471 Telp. (0321) 874289. Fax. 867867, E-mail : smatebuireng@gmail.com
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* SURAT BODY BERDASARKAN LAYOUT */}
                  {genData.layout_type === 'tugas' ? (
                    /* LAYOUT A: SURAT TUGAS RESMI (TABEL) */
                    <div className="space-y-4 text-xs font-sans text-slate-900 pt-2">
                      <div className="text-center py-2 space-y-1">
                        <h2 className="text-base md:text-lg font-bold uppercase tracking-wider underline decoration-1 text-slate-900 font-serif">
                          SURAT TUGAS
                        </h2>
                        <p className="text-xs font-mono font-bold text-slate-800">
                          NO : {genData.no_surat || '2270/104.13.2/SMA.4/WH/MN/2026'}
                        </p>
                      </div>

                      <table className="w-full border-collapse border border-slate-900 text-xs text-slate-900">
                        <tbody>
                          <tr>
                            <td className="w-8 border border-slate-900 p-2 text-center align-top font-semibold">1.</td>
                            <td className="w-44 border border-slate-900 p-2 align-top font-semibold">Yang Memberi Tugas</td>
                            <td className="w-4 border-y border-slate-900 p-2 align-top text-center">:</td>
                            <td className="border border-slate-900 p-2 align-top">{genData.tugas_pemberi}</td>
                          </tr>
                          <tr>
                            <td className="border border-slate-900 p-2 text-center align-top font-semibold">2.</td>
                            <td className="border border-slate-900 p-2 align-top font-semibold">Nama Tugas</td>
                            <td className="border-y border-slate-900 p-2 align-top text-center">:</td>
                            <td className="border border-slate-900 p-2 align-top leading-relaxed">{genData.tugas_nama}</td>
                          </tr>
                          <tr>
                            <td className="border border-slate-900 p-2 text-center align-top font-semibold">3.</td>
                            <td className="border border-slate-900 p-2 align-top font-semibold">Nama Yang Diberi Tugas</td>
                            <td className="border-y border-slate-900 p-2 align-top text-center">:</td>
                            <td className="border border-slate-900 p-2 align-top">{genData.tugas_penerima}</td>
                          </tr>
                          <tr>
                            <td className="border border-slate-900 p-2 text-center align-top font-semibold">4.</td>
                            <td className="border border-slate-900 p-2 align-top font-semibold">Waktu Pelaksanaan</td>
                            <td className="border-y border-slate-900 p-2 align-top text-center">:</td>
                            <td className="border border-slate-900 p-2 align-top">{genData.tugas_waktu}</td>
                          </tr>
                          <tr>
                            <td className="border border-slate-900 p-2 text-center align-top font-semibold">5.</td>
                            <td className="border border-slate-900 p-2 align-top font-semibold">Keterangan</td>
                            <td className="border-y border-slate-900 p-2 align-top text-center">:</td>
                            <td className="border border-slate-900 p-2 align-top leading-relaxed whitespace-pre-line">
                              {genData.tugas_keterangan}
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <p className="pt-2 text-xs leading-relaxed">
                        Demikian surat tugas ini dibuat, atas kerjasamanya disampaikan terima kasih.
                      </p>

                      {/* SIGNATURE BLOCK */}
                      <div className="pt-6 flex justify-end">
                        <div className="text-center w-64 space-y-16">
                          <div>
                            <p className="text-xs">Jombang, {genData.tanggal_surat}</p>
                            <p className="text-xs font-semibold">Kepala Sekolah</p>
                          </div>
                          <div>
                            <p className="font-bold underline text-xs text-slate-900">{genData.penandatangan_nama}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* LAYOUT B: SURAT BIASA / UNDANGAN RESMI */
                    <div className="space-y-4 text-xs font-sans text-slate-900 pt-1">
                      <div className="flex justify-between items-start text-xs pb-1 font-sans">
                        <div className="space-y-0.5">
                          <p className="grid grid-cols-[70px_10px_1fr]">
                            <span className="font-semibold">Nomor</span>
                            <span>:</span>
                            <span className="font-mono font-bold text-slate-900">{genData.no_surat || '2282/104.13.2/SMA.4/WH/MN/2026'}</span>
                          </p>
                          <p className="grid grid-cols-[70px_10px_1fr]">
                            <span className="font-semibold">Lampiran</span>
                            <span>:</span>
                            <span>{genData.lampiran || '-'}</span>
                          </p>
                          <p className="grid grid-cols-[70px_10px_1fr]">
                            <span className="font-semibold">H a l</span>
                            <span>:</span>
                            <span className="font-semibold text-slate-900">{genData.perihal}</span>
                          </p>
                        </div>
                        <div className="text-right font-sans">
                          <p>Jombang, {genData.tanggal_surat}</p>
                        </div>
                      </div>

                      <div className="pt-1 space-y-0.5">
                        <p>Kepada Yth.</p>
                        <p className="font-bold text-slate-900 underline">{genData.penerima_tujuan}</p>
                        <p className="font-semibold text-slate-800">SMA A. Wahid Hasyim Tebuireng</p>
                        <p className="text-slate-600 italic">di Tempat</p>
                      </div>

                      <div className="space-y-3 leading-relaxed text-justify pt-1">
                        <p className="italic font-serif">Assalamu'alaikum Warahmatullahi Wabarakatuh.</p>

                        <div className="whitespace-pre-line leading-relaxed text-slate-900">
                          {genData.isi_custom}
                        </div>

                        {genData.nama_subjek && genData.nama_subjek !== '-' && (
                          <div className="bg-slate-50 p-3 rounded border border-slate-200 text-xs space-y-1 font-mono">
                            <p><strong>Nama</strong> : {genData.nama_subjek}</p>
                            <p><strong>NIS / NIP / Rombel</strong> : {genData.nis_nip}</p>
                          </div>
                        )}

                        <p className="italic font-serif">Wassalamu'alaikum Warahmatullahi Wabarakatuh.</p>
                      </div>

                      {/* SIGNATURE BLOCK */}
                      <div className="pt-6 flex justify-end">
                        <div className="text-center w-64 space-y-16">
                          <div>
                            <p className="text-xs">Jombang, {genData.tanggal_surat}</p>
                            <p className="text-xs font-semibold">Kepala Sekolah</p>
                          </div>
                          <div>
                            <p className="font-bold underline text-xs text-slate-900">{genData.penandatangan_nama}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: ARSIP DIGITAL & METADATA */}
            {activeTab === 'arsip' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {filteredSurat.map(s => (
                    <div key={s.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-emerald-400 transition-colors space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700">
                          <Archive className="w-5 h-5" />
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {s.kategori || 'Umum'}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="font-mono text-xs font-bold text-emerald-800 block">{s.no_surat}</span>
                        <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{s.perihal}</h4>
                        <p className="text-[11px] text-slate-500">{s.pengirim_penerima}</p>
                      </div>

                      <div className="pt-2 border-t text-[11px] text-slate-400 flex justify-between items-center">
                        <span>Tgl: {s.tanggal}</span>
                        <span className="font-semibold text-slate-600">{s.lokasi_arsip || 'Box Arsip Utama'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: MASTER TEMPLATE SURAT */}
            {activeTab === 'template' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templateList.map(t => (
                    <div key={t.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-mono text-[10px] font-bold">
                          {t.kode_template}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500">{t.kategori}</span>
                      </div>
                      <h3 className="text-xs font-bold text-slate-800">{t.nama_template}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded border border-slate-100 italic">
                        "{t.format_konten}"
                      </p>
                      <button
                        onClick={() => {
                          handleSelectTemplate(t);
                          setActiveTab('generator');
                        }}
                        className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-700 hover:underline pt-1"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Gunakan Template Ini</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* REGISTRASI / EDIT SURAT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="text-sm font-bold text-slate-800">
                {editItem ? 'Edit Dokumen Surat Arsip' : 'Registrasi Dokumen Surat Baru'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jenis Surat</label>
                  <select
                    value={formData.jenis}
                    onChange={(e) => {
                      const newJenis = e.target.value;
                      setFormData({ ...formData, jenis: newJenis });
                      handleGenerateNoSurat(newJenis);
                    }}
                    className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                  >
                    <option value="Surat Keluar">Surat Keluar</option>
                    <option value="Surat Masuk">Surat Masuk</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kategori Dokumen</label>
                  <select
                    value={formData.kategori}
                    onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Umum">Umum</option>
                    <option value="Kesiswaan">Kesiswaan</option>
                    <option value="Kurikulum">Kurikulum</option>
                    <option value="Keuangan">Keuangan</option>
                    <option value="Kepegawaian">Kepegawaian</option>
                    <option value="Sarpras">Sarpras</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700">Nomor Surat Official</label>
                  <button
                    type="button"
                    onClick={() => handleGenerateNoSurat(formData.jenis)}
                    className="text-[10px] text-emerald-700 font-bold hover:underline"
                  >
                    Auto Generate
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="001/SMA-AWH/SK/IX/2026"
                  value={formData.no_surat}
                  onChange={(e) => setFormData({ ...formData, no_surat: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono font-bold text-emerald-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Perihal / Hal</label>
                <input
                  type="text"
                  required
                  placeholder="Subjek / judul surat"
                  value={formData.perihal}
                  onChange={(e) => setFormData({ ...formData, perihal: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pengirim / Penerima</label>
                <input
                  type="text"
                  required
                  placeholder="Instansi / Nama Tujuan"
                  value={formData.pengirim_penerima}
                  onChange={(e) => setFormData({ ...formData, pengirim_penerima: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Surat</label>
                  <input
                    type="date"
                    required
                    value={formData.tanggal}
                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kerahasiaan</label>
                  <select
                    value={formData.kerahasiaan}
                    onChange={(e) => setFormData({ ...formData, kerahasiaan: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Biasa">Biasa</option>
                    <option value="Penting">Penting</option>
                    <option value="Rahasia">Rahasia</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lokasi Arsip Digital / Fisik</label>
                <input
                  type="text"
                  placeholder="Box Arsip Utama / Lemari 2 / Folder Kesiswaan"
                  value={formData.lokasi_arsip}
                  onChange={(e) => setFormData({ ...formData, lokasi_arsip: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-white bg-emerald-600 hover:bg-emerald-700 rounded font-semibold shadow"
                >
                  Simpan Dokumen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersuratanPage;
