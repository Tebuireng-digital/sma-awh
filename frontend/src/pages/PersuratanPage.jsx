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

  // Letter Generator Form State
  const [genData, setGenData] = useState({
    selectedTemplate: 'SK-AKTIF',
    no_surat: '',
    tanggal_surat: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    lampiran: '-',
    perihal: 'Surat Keterangan Siswa Aktif',
    penerima_tujuan: 'Siswa / Orang Tua Wali',
    nama_subjek: 'Ahmad Subagyo',
    nis_nip: '2026001 / Class X-1',
    isi_custom: 'Yang bertanda tangan di bawah ini Kepala SMA KH. A. Wahid Hasyim Tebuireng menerangkan bahwa nama yang tercantum di atas adalah benar-benar siswa aktif tahun ajaran 2026/2027 dan berkelakuan baik.',
    penandatangan_nama: 'Dr. H. Ahmad Zaki, M.Pd.',
    penandatangan_jabatan: 'Kepala Sekolah'
  });

  useEffect(() => {
    fetchSuratList();
    fetchTemplateList();
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

  const handleGenerateNoSurat = async (jenis = 'Surat Keluar') => {
    try {
      const res = await api.get(`/persuratan/generate-nomor?jenis=${jenis}`);
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
      const payload = {
        jenis: 'Surat Keluar',
        kategori: 'Kesiswaan',
        kerahasiaan: 'Biasa',
        no_surat: genData.no_surat || '001/SMA-AWH/SK/IX/2026',
        perihal: genData.perihal,
        pengirim_penerima: genData.penerima_tujuan,
        tanggal: new Date().toISOString().split('T')[0],
        isi_surat: genData.isi_custom,
        lokasi_arsip: 'Digital Archive / Generated Letters',
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
    setGenData(prev => ({
      ...prev,
      selectedTemplate: tpl.kode_template,
      perihal: tpl.nama_template,
      isi_custom: tpl.format_konten
    }));
    handleGenerateNoSurat('Surat Keluar');
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
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700">
            <Mail className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Persuratan & Pengarsipan Digital</h1>
            <p className="text-xs text-slate-500">
              Pengelolaan Surat Masuk & Keluar, Penomoran Otomatis, Pembuat Surat Berkop Resmi Sekolah, & Arsip Digital Searchable.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setActiveTab('generator');
              handleGenerateNoSurat('Surat Keluar');
            }}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>+ Pembuat Surat Berkop</span>
          </button>
          <button
            onClick={() => handleOpenModal('add_surat')}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Registrasi Surat</span>
          </button>
        </div>
      </div>

      {/* ALERT MESSAGE */}
      {msg && (
        <div className={`p-4 rounded-xl border text-xs font-semibold ${msg.includes('Gagal') || msg.includes('error') ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
          {msg}
        </div>
      )}

      {/* TABS NAVIGATION */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-3 space-x-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('surat')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-t-lg transition-colors border-b-2 ${
            activeTab === 'surat'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>1. Registrasi Surat Masuk & Keluar</span>
        </button>

        <button
          onClick={() => setActiveTab('generator')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-t-lg transition-colors border-b-2 ${
            activeTab === 'generator'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>2. Pembuat Surat Berkop Resmi</span>
        </button>

        <button
          onClick={() => setActiveTab('arsip')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-t-lg transition-colors border-b-2 ${
            activeTab === 'arsip'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Archive className="w-4 h-4" />
          <span>3. Arsip Digital & Metadata</span>
        </button>

        <button
          onClick={() => setActiveTab('template')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-t-lg transition-colors border-b-2 ${
            activeTab === 'template'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>4. Master Template Surat</span>
        </button>
      </div>

      {/* FILTER & SEARCH BAR (for tab surat & arsip) */}
      {(activeTab === 'surat' || activeTab === 'arsip') && (
        <div className="bg-white p-4 border-x border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
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
                <div className="lg:col-span-5 space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>Form Generator Surat Resmi</span>
                    </h3>
                    <button
                      onClick={() => handleGenerateNoSurat('Surat Keluar')}
                      className="text-[10px] text-emerald-700 font-bold bg-emerald-100 hover:bg-emerald-200 px-2 py-1 rounded"
                    >
                      Auto No. Surat
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Pilih Template Surat</label>
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

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Nomor Surat Official</label>
                        <input
                          type="text"
                          value={genData.no_surat}
                          onChange={(e) => setGenData({ ...genData, no_surat: e.target.value })}
                          className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono text-[11px] font-bold text-emerald-900"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Tanggal Surat</label>
                        <input
                          type="text"
                          value={genData.tanggal_surat}
                          onChange={(e) => setGenData({ ...genData, tanggal_surat: e.target.value })}
                          className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

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
                        <label className="block font-semibold text-slate-700 mb-1">Nama Subjek / Ybs</label>
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
                        className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t">
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
                <div className="lg:col-span-7 bg-white p-8 rounded-xl border border-slate-300 shadow-md font-serif text-slate-900 space-y-6">
                  {/* HEADER KOP RESMI */}
                  <div className="text-center border-b-4 border-double border-slate-900 pb-3 relative">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-slate-700">YAYASAN BODRI TEBUIRENG</h4>
                      <h2 className="text-lg font-black uppercase tracking-wider text-emerald-900">SMA KH. A. WAHID HASYIM</h2>
                      <p className="text-[10px] font-bold text-slate-600 uppercase">STATUS: TERAKREDITASI A (UNGGUL) | NSS: 302050401001 NPSN: 20504001</p>
                      <p className="text-[9px] italic text-slate-500">Jl. Irian Jaya No. 55 Tebuireng, Cukir, Diwek, Jombang 61471 | Telp: (0321) 861123</p>
                    </div>
                  </div>

                  {/* SURAT BODY */}
                  <div className="space-y-4 text-xs font-sans">
                    <div className="flex justify-between items-start text-xs border-b border-slate-100 pb-2 font-mono">
                      <div>
                        <p><strong>Nomor</strong> : {genData.no_surat || '001/SMA-AWH/SK/IX/2026'}</p>
                        <p><strong>Lamp.</strong> : {genData.lampiran}</p>
                        <p><strong>Hal</strong> : {genData.perihal}</p>
                      </div>
                      <div className="text-right">
                        <p>Jombang, {genData.tanggal_surat}</p>
                      </div>
                    </div>

                    <div className="pt-2">
                      <p>Kepada Yth,</p>
                      <p className="font-bold text-slate-800">{genData.penerima_tujuan}</p>
                      <p className="text-slate-500 italic">di Tempat</p>
                    </div>

                    <div className="space-y-3 leading-relaxed text-justify pt-2">
                      <p><em>Assalamu'alaikum Wr. Wb.</em></p>
                      <p>{genData.isi_custom}</p>
                      <div className="bg-slate-50 p-3 rounded border border-slate-200 text-xs font-mono space-y-1">
                        <p><strong>Nama</strong> : {genData.nama_subjek}</p>
                        <p><strong>NIS/NIP/Identitas</strong> : {genData.nis_nip}</p>
                      </div>
                      <p>Demikian surat resmi ini diterbitkan untuk dipergunakan sebagaimana mestinya.</p>
                      <p><em>Wassalamu'alaikum Wr. Wb.</em></p>
                    </div>

                    {/* SIGNATURE BLOCK */}
                    <div className="pt-8 flex justify-end">
                      <div className="text-center w-56 space-y-12">
                        <div>
                          <p className="text-[11px]">Kepala SMA KH. A. Wahid Hasyim</p>
                        </div>
                        <div>
                          <p className="font-bold underline text-xs">{genData.penandatangan_nama}</p>
                          <p className="text-[10px] text-slate-500 font-mono">NIP. 197808122005011002</p>
                        </div>
                      </div>
                    </div>
                  </div>
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
