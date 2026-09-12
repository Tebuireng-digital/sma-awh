import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { 
  Users, Plus, Search, Edit3, Trash2, CheckCircle, AlertCircle, RefreshCw, X, 
  PhoneCall, KeyRound, Lock, Eye, EyeOff, GraduationCap, FileSpreadsheet, 
  Upload, Download, ArrowRight, ChevronRight, CheckCheck, Archive, BookOpen, FileText, UserMinus 
} from 'lucide-react';

const DataSiswa = () => {
  const [activeTab, setActiveTab] = useState('aktif'); // 'aktif' | 'alumni'

  // Data State Siswa Aktif
  const [siswaList, setSiswaList] = useState([]);
  const [kelases, setKelases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedKelasFilter, setSelectedKelasFilter] = useState('');
  const [message, setMessage] = useState(null);

  // Modal Siswa Manual State
  const [showModal, setShowModal] = useState(false);
  const [editingSiswa, setEditingSiswa] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nis: '',
    nisn: '',
    nama: '',
    jenis_kelamin: 'L',
    no_hp_ortu: '',
    kelas_id: '',
    status_aktif: true,
  });
  const [deletingId, setDeletingId] = useState(null);

  // Modal Mutasi / Keluarkan Siswa dari Master Data
  const [showMutasiModal, setShowMutasiModal] = useState(false);
  const [targetMutasiSiswa, setTargetMutasiSiswa] = useState(null);
  const [mutasiData, setMutasiData] = useState({
    alasan_keluar: '',
    sekolah_tujuan: '',
    tahun_keluar: new Date().getFullYear().toString(),
    catatan: '',
  });
  const [mutasiSubmitting, setMutasiSubmitting] = useState(false);

  // Reset Password Modal State
  const [showResetModal, setShowResetModal] = useState(false);
  const [targetSiswa, setTargetSiswa] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  // Modal Kenaikan Kelas & Kelulusan (Wizard) State
  const [showKenaikanModal, setShowKenaikanModal] = useState(false);
  const [kenaikanStep, setKenaikanStep] = useState(1); // 1: Lulus XII, 2: Naik XI->XII, 3: Naik X->XI, 4: Selesai & Import
  const [kenaikanStatus, setKenaikanStatus] = useState(null);
  const [siswaXiiList, setSiswaXiiList] = useState([]);
  const [siswaXiiIjazah, setSiswaXiiIjazah] = useState({});
  const [tahunKeluar, setTahunKeluar] = useState(new Date().getFullYear().toString());
  const [namaAngkatan, setNamaAngkatan] = useState(`Angkatan ${new Date().getFullYear() - 1991}`);
  const [mapKelasXi, setMapKelasXi] = useState({});
  const [mapKelasX, setMapKelasX] = useState({});
  const [processingKenaikan, setProcessingKenaikan] = useState(false);

  // State Import Excel di Step 4 Kenaikan
  const [importFile, setImportFile] = useState(null);
  const [importDefaultKelas, setImportDefaultKelas] = useState('');
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);

  // Data State Alumni
  const [alumniList, setAlumniList] = useState([]);
  const [alumniLoading, setAlumniLoading] = useState(false);
  const [alumniSearch, setAlumniSearch] = useState('');
  const [selectedTahunAlumni, setSelectedTahunAlumni] = useState('');
  const [selectedKategoriAlumni, setSelectedKategoriAlumni] = useState('');
  const [availableYears, setAvailableYears] = useState([]);
  const [alumniPagination, setAlumniPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [selectedSnapshot, setSelectedSnapshot] = useState(null);
  const [showSnapshotModal, setShowSnapshotModal] = useState(false);

  // ----------------------------------------------------
  // Initial Effects
  // ----------------------------------------------------
  useEffect(() => {
    fetchInitial();
  }, [selectedKelasFilter]);

  useEffect(() => {
    if (activeTab === 'alumni') {
      fetchAlumni(1, alumniSearch, selectedTahunAlumni, selectedKategoriAlumni);
    }
  }, [activeTab, selectedTahunAlumni, selectedKategoriAlumni]);

  const fetchInitial = async () => {
    try {
      const resK = await client.get('/admin/kelas');
      const kList = resK.data.kelas || [];
      setKelases(kList);
      fetchSiswa(search, selectedKelasFilter);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSiswa = async (searchQuery = search, kelasFilter = selectedKelasFilter) => {
    setLoading(true);
    try {
      let params = [];
      if (searchQuery) params.push(`search=${encodeURIComponent(searchQuery)}`);
      if (kelasFilter) params.push(`kelas_id=${kelasFilter}`);
      const queryStr = params.length > 0 ? `?${params.join('&')}` : '';

      const res = await client.get(`/admin/siswa${queryStr}`);
      setSiswaList(res.data.siswa || []);
    } catch (e) {
      console.error(e);
      setMessage({ type: 'error', text: 'Gagal mengambil data siswa.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchSiswa(search, selectedKelasFilter);
  };

  // ----------------------------------------------------
  // CRUD Siswa Manual Handlers
  // ----------------------------------------------------
  const openAddModal = () => {
    setEditingSiswa(null);
    setFormData({
      nis: '',
      nisn: '',
      nama: '',
      jenis_kelamin: 'L',
      no_hp_ortu: '',
      kelas_id: kelases.length > 0 ? kelases[0].id : '',
      status_aktif: true,
    });
    setShowModal(true);
  };

  const openEditModal = (siswa) => {
    setEditingSiswa(siswa);
    setFormData({
      nis: siswa.nis,
      nisn: siswa.nisn || '',
      nama: siswa.nama,
      jenis_kelamin: siswa.jenis_kelamin || 'L',
      no_hp_ortu: siswa.no_hp_ortu || '',
      kelas_id: siswa.kelas_id || (kelases.length > 0 ? kelases[0].id : ''),
      status_aktif: Boolean(siswa.status_aktif),
    });
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      if (editingSiswa) {
        const res = await client.put(`/admin/siswa/${editingSiswa.id}`, formData);
        setMessage({ type: 'success', text: res.data.message });
      } else {
        const res = await client.post('/admin/siswa', formData);
        setMessage({ type: 'success', text: res.data.message });
      }
      setShowModal(false);
      fetchSiswa();
    } catch (e) {
      const errText = e.response?.data?.message || 'Gagal menyimpan data siswa.';
      setMessage({ type: 'error', text: errText });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus permanen data siswa ini? Jika siswa pindah sekolah / keluar, gunakan tombol "Mutasi / Keluarkan".')) return;
    
    setDeletingId(id);
    setMessage(null);
    try {
      const res = await client.delete(`/admin/siswa/${id}`);
      setMessage({ type: 'success', text: res.data.message });
      fetchSiswa();
    } catch (e) {
      setMessage({ type: 'error', text: 'Gagal menghapus data siswa.' });
    } finally {
      setDeletingId(null);
    }
  };

  // ----------------------------------------------------
  // Mutasi / Keluarkan Siswa Handlers
  // ----------------------------------------------------
  const openMutasiModal = (siswa) => {
    setTargetMutasiSiswa(siswa);
    setMutasiData({
      alasan_keluar: '',
      sekolah_tujuan: '',
      tahun_keluar: new Date().getFullYear().toString(),
      catatan: '',
    });
    setShowMutasiModal(true);
  };

  const handleMutasiSubmit = async (e) => {
    e.preventDefault();
    if (!targetMutasiSiswa) return;

    if (!mutasiData.alasan_keluar.trim()) {
      alert('Alasan keluar / mutasi wajib diisi.');
      return;
    }

    setMutasiSubmitting(true);
    try {
      const res = await client.post(`/admin/siswa/${targetMutasiSiswa.id}/keluarkan-mutasi`, mutasiData);
      setMessage({ type: 'success', text: res.data.message });
      setShowMutasiModal(false);
      fetchSiswa();
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal memproses mutasi siswa.';
      alert(msg);
    } finally {
      setMutasiSubmitting(false);
    }
  };

  // ----------------------------------------------------
  // Reset Password Handlers
  // ----------------------------------------------------
  const openResetModal = (siswa) => {
    setTargetSiswa(siswa);
    setNewPassword('');
    setNewPasswordConfirmation('');
    setShowPassword(false);
    setResetError('');
    setResetSuccess('');
    setShowResetModal(true);
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');

    if (newPassword.length < 6) {
      setResetError('Kata sandi baru minimal 6 karakter.');
      return;
    }

    if (newPassword !== newPasswordConfirmation) {
      setResetError('Konfirmasi kata sandi baru tidak sesuai.');
      return;
    }

    setResetSubmitting(true);
    try {
      const res = await client.post(`/admin/siswa/${targetSiswa.id}/reset-password`, {
        new_password: newPassword,
        new_password_confirmation: newPasswordConfirmation,
      });

      setResetSuccess(res.data.message || 'Kata sandi berhasil diperbarui.');
      setMessage({ type: 'success', text: res.data.message });
      setTimeout(() => {
        setShowResetModal(false);
        setResetSuccess('');
      }, 1500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal mereset kata sandi siswa.';
      setResetError(msg);
    } finally {
      setResetSubmitting(false);
    }
  };

  // ----------------------------------------------------
  // Template & Import Excel Handlers (Di Step 4)
  // ----------------------------------------------------
  const handleDownloadTemplate = async () => {
    setDownloadingTemplate(true);
    try {
      const response = await client.get('/admin/siswa/template-excel', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Template_Import_Siswa_SMA_AWH_${new Date().toISOString().slice(0,10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Gagal mengunduh template: ' + (err.response?.data?.message || err.message));
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!importFile) {
      alert('Silakan pilih file Excel (.xlsx / .xls) terlebih dahulu.');
      return;
    }

    const formDataUpload = new FormData();
    formDataUpload.append('file', importFile);
    if (importDefaultKelas) {
      formDataUpload.append('default_kelas_id', importDefaultKelas);
    }

    setImportLoading(true);
    setImportResult(null);

    try {
      const res = await client.post('/admin/siswa/import-excel', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImportResult(res.data);
      fetchSiswa();
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Gagal mengimpor file Excel.';
      setImportResult({ status: 'error', message: errMsg });
    } finally {
      setImportLoading(false);
    }
  };

  // ----------------------------------------------------
  // Kenaikan Kelas & Kelulusan Handlers
  // ----------------------------------------------------
  const openKenaikanWizard = async () => {
    setKenaikanStep(1);
    setProcessingKenaikan(true);
    setImportResult(null);
    setImportFile(null);
    try {
      const [resStatus, resXii] = await Promise.all([
        client.get('/admin/kenaikan-kelas/status'),
        client.get('/admin/kenaikan-kelas/siswa-xii'),
      ]);

      setKenaikanStatus(resStatus.data.data);
      const xiiList = resXii.data.data || [];
      setSiswaXiiList(xiiList);

      const initIjazah = {};
      xiiList.forEach((s) => {
        initIjazah[s.id] = '';
      });
      setSiswaXiiIjazah(initIjazah);

      const kelasXData = resStatus.data.data.kelas_x || [];
      const kelasXiData = resStatus.data.data.kelas_xi || [];
      const kelasXiiData = resStatus.data.data.kelas_xii || [];

      const initialMapXi = {};
      kelasXiData.forEach((kXi, idx) => {
        const matchXii = kelasXiiData.find(k => k.nama_kelas.replace('XII', '').trim() === kXi.nama_kelas.replace('XI', '').trim())
          || (kelasXiiData[idx] ? kelasXiiData[idx] : (kelasXiiData[0] || null));
        if (matchXii) initialMapXi[kXi.id] = matchXii.id;
      });
      setMapKelasXi(initialMapXi);

      const initialMapX = {};
      kelasXData.forEach((kX, idx) => {
        const matchXi = kelasXiData.find(k => k.nama_kelas.replace('XI', '').trim() === kX.nama_kelas.replace('X', '').trim())
          || (kelasXiData[idx] ? kelasXiData[idx] : (kelasXiData[0] || null));
        if (matchXi) initialMapX[kX.id] = matchXi.id;
      });
      setMapKelasX(initialMapX);

      setShowKenaikanModal(true);
    } catch (err) {
      alert('Gagal memuat data kenaikan kelas: ' + (err.response?.data?.message || err.message));
    } finally {
      setProcessingKenaikan(false);
    }
  };

  const handleExecuteLulusXii = async () => {
    if (siswaXiiList.length === 0) {
      setKenaikanStep(2);
      return;
    }

    if (!window.confirm(`Yakin ingin meluluskan dan mengarsipkan ${siswaXiiList.length} siswa Kelas XII ke Buku Induk Alumni? Nilai rapor 6 semester akan dibekukan.`)) {
      return;
    }

    setProcessingKenaikan(true);
    try {
      const payloadSiswaList = siswaXiiList.map((s) => ({
        id: s.id,
        no_ijazah: siswaXiiIjazah[s.id] || null,
      }));

      const res = await client.post('/admin/kenaikan-kelas/luluskan-keluarkan-xii', {
        tahun_keluar: tahunKeluar,
        angkatan: namaAngkatan,
        siswa_list: payloadSiswaList,
      });

      alert(res.data.message);
      const resStatus = await client.get('/admin/kenaikan-kelas/status');
      setKenaikanStatus(resStatus.data.data);
      setKenaikanStep(2);
    } catch (err) {
      alert('Gagal memproses kelulusan: ' + (err.response?.data?.message || err.message));
    } finally {
      setProcessingKenaikan(false);
    }
  };

  const handleExecutePromosiXiToXii = async () => {
    const pemetaan = Object.entries(mapKelasXi).map(([asalId, tujuanId]) => ({
      kelas_asal_id: parseInt(asalId),
      kelas_tujuan_id: parseInt(tujuanId),
    }));

    if (pemetaan.length === 0) {
      setKenaikanStep(3);
      return;
    }

    if (!window.confirm('Yakin ingin mempromosikan seluruh siswa Kelas XI ke Kelas XII sesuai pemetaan kelas yang dipilih?')) {
      return;
    }

    setProcessingKenaikan(true);
    try {
      const res = await client.post('/admin/kenaikan-kelas/promosikan-kelas', {
        tingkat_asal: 'XI',
        pemetaan_kelas: pemetaan,
      });
      alert(res.data.message);
      const resStatus = await client.get('/admin/kenaikan-kelas/status');
      setKenaikanStatus(resStatus.data.data);
      setKenaikanStep(3);
    } catch (err) {
      alert('Gagal mempromosikan Kelas XI: ' + (err.response?.data?.message || err.message));
    } finally {
      setProcessingKenaikan(false);
    }
  };

  const handleExecutePromosiXToXi = async () => {
    const pemetaan = Object.entries(mapKelasX).map(([asalId, tujuanId]) => ({
      kelas_asal_id: parseInt(asalId),
      kelas_tujuan_id: parseInt(tujuanId),
    }));

    if (pemetaan.length === 0) {
      setKenaikanStep(4);
      return;
    }

    if (!window.confirm('Yakin ingin mempromosikan seluruh siswa Kelas X ke Kelas XI sesuai pemetaan kelas yang dipilih?')) {
      return;
    }

    setProcessingKenaikan(true);
    try {
      const res = await client.post('/admin/kenaikan-kelas/promosikan-kelas', {
        tingkat_asal: 'X',
        pemetaan_kelas: pemetaan,
      });
      alert(res.data.message);
      const resStatus = await client.get('/admin/kenaikan-kelas/status');
      setKenaikanStatus(resStatus.data.data);
      setKenaikanStep(4);
      fetchSiswa();
    } catch (err) {
      alert('Gagal mempromosikan Kelas X: ' + (err.response?.data?.message || err.message));
    } finally {
      setProcessingKenaikan(false);
    }
  };

  // ----------------------------------------------------
  // Alumni Handlers
  // ----------------------------------------------------
  const fetchAlumni = async (page = 1, searchQuery = alumniSearch, tahunFilter = selectedTahunAlumni, katFilter = selectedKategoriAlumni) => {
    setAlumniLoading(true);
    try {
      let params = [`page=${page}`];
      if (searchQuery) params.push(`search=${encodeURIComponent(searchQuery)}`);
      if (tahunFilter) params.push(`tahun_keluar=${tahunFilter}`);
      if (katFilter) params.push(`kategori_keluar=${encodeURIComponent(katFilter)}`);

      const res = await client.get(`/admin/alumni?${params.join('&')}`);
      setAlumniList(res.data.data || []);
      setAlumniPagination(res.data.meta || { current_page: 1, last_page: 1, total: 0 });
      if (res.data.available_years) {
        setAvailableYears(res.data.available_years);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAlumniLoading(false);
    }
  };

  const handleAlumniSearchSubmit = (e) => {
    e.preventDefault();
    fetchAlumni(1, alumniSearch, selectedTahunAlumni, selectedKategoriAlumni);
  };

  const openAlumniSnapshotModal = async (alumniId) => {
    try {
      const res = await client.get(`/admin/alumni/${alumniId}`);
      setSelectedSnapshot(res.data.data);
      setShowSnapshotModal(true);
    } catch (err) {
      alert('Gagal memuat snapshot nilai rapor alumni: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Navigation Tabs (HANYA TAMBAH MANUAL & KENAIKAN KELAS DI HEADER) */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between border-b border-slate-200 pb-4 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="w-6 h-6 text-emerald-800" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Manajemen Data Siswa & Kesiswaan
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pengelolaan Peserta Didik Aktif, Siklus Kenaikan Kelas Berjenjang, & Buku Induk Alumni Abadi
          </p>
        </div>

        {/* Tab Selector & Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-lg flex space-x-1 border border-slate-200">
            <button
              onClick={() => setActiveTab('aktif')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors flex items-center space-x-1.5 ${
                activeTab === 'aktif'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Siswa Aktif</span>
            </button>
            <button
              onClick={() => setActiveTab('alumni')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors flex items-center space-x-1.5 ${
                activeTab === 'alumni'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Buku Induk Alumni</span>
            </button>
          </div>

          {activeTab === 'aktif' && (
            <>
              <button
                onClick={openAddModal}
                className="bg-emerald-800 hover:bg-emerald-900 text-white px-3.5 py-2 rounded-md text-xs font-bold shadow-sm transition-colors flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Manual</span>
              </button>

              <button
                onClick={openKenaikanWizard}
                className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-3.5 py-2 rounded-md text-xs font-bold shadow-sm transition-colors flex items-center space-x-1.5"
                title="Siklus Kenaikan Kelas, Kelulusan & Import Siswa Baru"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Kenaikan & Kelulusan</span>
              </button>
            </>
          )}
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded-lg border text-xs flex items-center justify-between shadow-sm ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          <div className="flex items-center space-x-2">
            {message.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
            <span className="font-medium">{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 1: DATA SISWA AKTIF */}
      {/* ======================================================== */}
      {activeTab === 'aktif' && (
        <>
          {/* Filter & Search Bar */}
          <div className="card-surface p-4 bg-slate-50 border-slate-200 rounded-xl flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
            <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2 w-full md:w-auto flex-1">
              <div className="relative w-full md:w-80">
                <input
                  type="text"
                  placeholder="Cari Nama, NIS, NISN, atau No HP Ortu..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-700 bg-white"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2" />
              </div>
              <button
                type="submit"
                className="bg-slate-800 hover:bg-slate-900 text-white px-3.5 py-1.5 rounded text-xs font-semibold shrink-0"
              >
                Cari
              </button>
            </form>

            <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
              <div className="flex items-center space-x-2">
                <label className="text-xs font-medium text-slate-600">Filter Rombel:</label>
                <select
                  value={selectedKelasFilter}
                  onChange={(e) => setSelectedKelasFilter(e.target.value)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-xs font-medium bg-white"
                >
                  <option value="">Semua Kelas ({kelases.length})</option>
                  {kelases.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.nama_kelas} ({k.jumlah_siswa} Siswa)
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => { setSearch(''); setSelectedKelasFilter(''); fetchSiswa('', ''); }}
                className="p-1.5 border border-slate-300 rounded hover:bg-slate-100 text-slate-600 bg-white"
                title="Reset Filter"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Table Siswa Aktif */}
          <div className="card-surface overflow-hidden rounded-xl shadow-sm border border-slate-200">
            {loading ? (
              <div className="p-12 text-center text-xs font-mono text-slate-500 flex items-center justify-center space-x-2">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-700" />
                <span>Memuat Data Siswa Aktif...</span>
              </div>
            ) : siswaList.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">
                Tidak ada data siswa aktif yang cocok dengan filter atau pencarian.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">NIS / NISN</th>
                      <th className="py-3 px-4">Nama Lengkap Siswa</th>
                      <th className="py-3 px-4 text-center">L/P</th>
                      <th className="py-3 px-4">Kelas / Rombel</th>
                      <th className="py-3 px-4">No. HP Orang Tua</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-center">Aksi & Mutasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {siswaList.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-mono">
                          <span className="font-bold text-slate-900 block">{s.nis}</span>
                          {s.nisn && <span className="text-[10px] text-slate-500 font-mono">NISN: {s.nisn}</span>}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">{s.nama}</td>
                        <td className="py-3 px-4 text-center font-mono">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            s.jenis_kelamin === 'L' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                          }`}>
                            {s.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-emerald-100 text-emerald-900 font-bold px-2.5 py-0.5 rounded text-[11px] font-mono">
                            {s.nama_kelas || 'Belum Masuk Kelas'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-700">
                          {s.no_hp_ortu ? (
                            <div className="flex items-center space-x-1">
                              <PhoneCall className="w-3 h-3 text-emerald-600" />
                              <span>{s.no_hp_ortu}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {s.status_aktif ? (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-semibold uppercase">
                              Aktif
                            </span>
                          ) : (
                            <span className="bg-rose-100 text-rose-800 text-[10px] px-2 py-0.5 rounded font-semibold uppercase">
                              Non-Aktif
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center space-x-1.5">
                            {/* Tombol Mutasi / Keluarkan ke Alumni */}
                            <button
                              onClick={() => openMutasiModal(s)}
                              className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded transition-colors"
                              title="Keluarkan / Mutasi Siswa (Pindah ke Alumni)"
                            >
                              <UserMinus className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => openResetModal(s)}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
                              title="Ganti / Reset Kata Sandi Siswa"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => openEditModal(s)}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
                              title="Edit Data Siswa"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(s.id)}
                              disabled={deletingId === s.id}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded transition-colors"
                              title="Hapus Permanen Siswa"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
        </>
      )}

      {/* ======================================================== */}
      {/* TAB 2: BUKU INDUK ALUMNI */}
      {/* ======================================================== */}
      {activeTab === 'alumni' && (
        <div className="space-y-4">
          {/* Filter & Search Bar Alumni */}
          <div className="card-surface p-4 bg-slate-50 border-slate-200 rounded-xl flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
            <form onSubmit={handleAlumniSearchSubmit} className="flex items-center space-x-2 w-full md:w-auto flex-1">
              <div className="relative w-full md:w-80">
                <input
                  type="text"
                  placeholder="Cari Nama, NIS, NISN, atau No Ijazah..."
                  value={alumniSearch}
                  onChange={(e) => setAlumniSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-700 bg-white"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2" />
              </div>
              <button
                type="submit"
                className="bg-slate-800 hover:bg-slate-900 text-white px-3.5 py-1.5 rounded text-xs font-semibold shrink-0"
              >
                Cari
              </button>
            </form>

            <div className="flex flex-wrap items-center space-x-3 w-full md:w-auto justify-end">
              <div className="flex items-center space-x-2">
                <label className="text-xs font-medium text-slate-600">Tahun Keluar:</label>
                <select
                  value={selectedTahunAlumni}
                  onChange={(e) => setSelectedTahunAlumni(e.target.value)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-xs font-medium bg-white"
                >
                  <option value="">Semua Tahun</option>
                  {availableYears.map((yr) => (
                    <option key={yr} value={yr}>
                      Tahun {yr}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <label className="text-xs font-medium text-slate-600">Kategori:</label>
                <select
                  value={selectedKategoriAlumni}
                  onChange={(e) => setSelectedKategoriAlumni(e.target.value)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-xs font-medium bg-white"
                >
                  <option value="">Semua Status</option>
                  <option value="LULUS">LULUS</option>
                  <option value="KELUAR / PINDAH">KELUAR / PINDAH</option>
                </select>
              </div>

              <button
                onClick={() => { setAlumniSearch(''); setSelectedTahunAlumni(''); setSelectedKategoriAlumni(''); fetchAlumni(1, '', '', ''); }}
                className="p-1.5 border border-slate-300 rounded hover:bg-slate-100 text-slate-600 bg-white"
                title="Reset Filter"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Table Alumni */}
          <div className="card-surface overflow-hidden rounded-xl shadow-sm border border-slate-200">
            {alumniLoading ? (
              <div className="p-12 text-center text-xs font-mono text-slate-500 flex items-center justify-center space-x-2">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-700" />
                <span>Memuat Data Buku Induk Alumni...</span>
              </div>
            ) : alumniList.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">
                Belum ada data alumni di sistem.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">NIS / NISN</th>
                      <th className="py-3 px-4">Nama Alumni</th>
                      <th className="py-3 px-4 text-center">L/P</th>
                      <th className="py-3 px-4">Angkatan / Tahun</th>
                      <th className="py-3 px-4">Kelas Terakhir</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4">No. Ijazah / Keterangan</th>
                      <th className="py-3 px-4 text-center">Snapshot Rapor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {alumniList.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-mono">
                          <span className="font-bold text-slate-900 block">{a.nis}</span>
                          {a.nisn && <span className="text-[10px] text-slate-500">NISN: {a.nisn}</span>}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">{a.nama}</td>
                        <td className="py-3 px-4 text-center font-mono">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            a.jenis_kelamin === 'L' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                          }`}>
                            {a.jenis_kelamin}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 block">{a.angkatan || `Lulus ${a.tahun_keluar}`}</span>
                          <span className="text-[10px] text-slate-500 font-mono">Tahun: {a.tahun_keluar}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded text-[11px] font-mono">
                            {a.kelas_terakhir || 'XII'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            a.kategori_keluar === 'LULUS'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {a.kategori_keluar}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          {a.kategori_keluar === 'LULUS' ? (
                            <span className="font-mono text-xs">{a.no_ijazah || '-'}</span>
                          ) : (
                            <span className="text-xs text-amber-900 italic">
                              {a.sekolah_tujuan ? `Pindah ke: ${a.sekolah_tujuan}` : (a.alasan_keluar || 'Keluar')}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => openAlumniSnapshotModal(a.id)}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded font-semibold text-[11px] transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Lihat Rapor</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Alumni */}
            {alumniPagination.last_page > 1 && (
              <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-600">
                  Halaman {alumniPagination.current_page} dari {alumniPagination.last_page} ({alumniPagination.total} Total Alumni)
                </span>
                <div className="flex space-x-1">
                  <button
                    disabled={alumniPagination.current_page <= 1}
                    onClick={() => fetchAlumni(alumniPagination.current_page - 1)}
                    className="px-2.5 py-1 bg-white border border-slate-300 rounded disabled:opacity-50"
                  >
                    Sebelumnya
                  </button>
                  <button
                    disabled={alumniPagination.current_page >= alumniPagination.last_page}
                    onClick={() => fetchAlumni(alumniPagination.current_page + 1)}
                    className="px-2.5 py-1 bg-white border border-slate-300 rounded disabled:opacity-50"
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: MUTASI / KELUARKAN SISWA KE ALUMNI */}
      {/* ======================================================== */}
      {showMutasiModal && targetMutasiSiswa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="px-5 py-4 bg-amber-800 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserMinus className="w-5 h-5 text-amber-200" />
                <div>
                  <h3 className="text-sm font-bold tracking-tight">
                    Keluarkan / Mutasi Siswa
                  </h3>
                  <p className="text-[11px] text-amber-200">
                    Pindahkan siswa ke Buku Induk Alumni (Kategori: KELUAR / PINDAH)
                  </p>
                </div>
              </div>
              <button onClick={() => setShowMutasiModal(false)} className="text-amber-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMutasiSubmit} className="p-5 space-y-3.5">
              {/* Info Profil Siswa */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-amber-800 font-medium">Nama Siswa:</span>
                  <span className="font-bold text-slate-900">{targetMutasiSiswa.nama}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-800 font-medium">NIS:</span>
                  <span className="font-mono font-bold text-slate-900">{targetMutasiSiswa.nis}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-800 font-medium">Kelas / Rombel Asal:</span>
                  <span className="font-semibold text-slate-900">{targetMutasiSiswa.nama_kelas || '-'}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alasan Keluar / Mutasi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={mutasiData.alasan_keluar}
                  onChange={(e) => setMutasiData({ ...mutasiData, alasan_keluar: e.target.value })}
                  placeholder="Contoh: Pindah domisili orang tua / Mutasi sekolah"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-amber-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sekolah Tujuan (Jika Mutasi/Pindah)
                </label>
                <input
                  type="text"
                  value={mutasiData.sekolah_tujuan}
                  onChange={(e) => setMutasiData({ ...mutasiData, sekolah_tujuan: e.target.value })}
                  placeholder="Contoh: SMAN 1 Surabaya (Opsional)"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-amber-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tahun Keluar
                  </label>
                  <input
                    type="text"
                    value={mutasiData.tahun_keluar}
                    onChange={(e) => setMutasiData({ ...mutasiData, tahun_keluar: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status Alumni
                  </label>
                  <input
                    type="text"
                    disabled
                    value="KELUAR / PINDAH"
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-100 rounded text-xs font-bold text-amber-800"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowMutasiModal(false)}
                  className="px-3.5 py-2 bg-slate-100 text-slate-700 rounded text-xs font-semibold hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={mutasiSubmitting}
                  className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded text-xs font-semibold shadow-sm flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <UserMinus className="w-3.5 h-3.5" />
                  <span>{mutasiSubmitting ? 'Memproses Mutasi...' : 'Keluarkan & Arsipkan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: FORM TAMBAH / EDIT SISWA MANUAL */}
      {/* ======================================================== */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-in fade-in duration-200">
            <div className="px-5 py-4 bg-emerald-800 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold tracking-tight">
                {editingSiswa ? 'Edit Data Siswa' : 'Tambah Siswa Baru (Manual)'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-emerald-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    NIS <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nis}
                    onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                    placeholder="20261001"
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs font-mono focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    NISN (Opsional)
                  </label>
                  <input
                    type="text"
                    value={formData.nisn}
                    onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                    placeholder="0081234567"
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs font-mono focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap Siswa <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Contoh: Ahmad Maulana Hasyim"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={formData.jenis_kelamin}
                    onChange={(e) => setFormData({ ...formData, jenis_kelamin: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-700"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kelas Awal <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.kelas_id}
                    onChange={(e) => setFormData({ ...formData, kelas_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs font-semibold focus:ring-1 focus:ring-emerald-700"
                  >
                    <option value="">-- Pilih Kelas --</option>
                    {kelases.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.nama_kelas}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  No. HP / WhatsApp Orang Tua (Wali)
                </label>
                <input
                  type="text"
                  value={formData.no_hp_ortu}
                  onChange={(e) => setFormData({ ...formData, no_hp_ortu: e.target.value })}
                  placeholder="Contoh: 081234567890"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs font-mono focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="status_siswa_aktif"
                  checked={formData.status_aktif}
                  onChange={(e) => setFormData({ ...formData, status_aktif: e.target.checked })}
                  className="w-4 h-4 text-emerald-800 rounded border-slate-300 focus:ring-emerald-700"
                />
                <label htmlFor="status_siswa_aktif" className="text-xs font-semibold text-slate-700">
                  Status Siswa Aktif
                </label>
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-2 bg-slate-100 text-slate-700 rounded text-xs font-semibold hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-800 text-white rounded text-xs font-semibold hover:bg-emerald-900 shadow-sm"
                >
                  {submitting ? 'Menyimpan...' : editingSiswa ? 'Simpan Perubahan' : 'Tambah Siswa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: WIZARD KENAIKAN KELAS & KELULUSAN + IMPORT EXCEL */}
      {/* ======================================================== */}
      {showKenaikanModal && kenaikanStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Header Modal */}
            <div className="px-6 py-4 bg-gradient-to-r from-amber-700 to-amber-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <GraduationCap className="w-5 h-5 text-amber-200" />
                <div>
                  <h3 className="text-sm font-bold tracking-tight">
                    Siklus Kenaikan Kelas, Kelulusan & Import Siswa Baru (Tahun Ajaran {kenaikanStatus.tahun_ajaran_aktif})
                  </h3>
                  <p className="text-[11px] text-amber-200">
                    Alur Berjenjang: 12 ke Alumni (Lulus) → 11 ke 12 → 10 ke 11 → Import Siswa Baru
                  </p>
                </div>
              </div>
              <button onClick={() => setShowKenaikanModal(false)} className="text-amber-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Navigation */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between text-xs font-bold text-slate-600 shrink-0">
              <div className={`flex items-center space-x-1.5 ${kenaikanStep === 1 ? 'text-amber-800' : kenaikanStep > 1 ? 'text-emerald-700' : ''}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${kenaikanStep === 1 ? 'bg-amber-800 text-white' : kenaikanStep > 1 ? 'bg-emerald-700 text-white' : 'bg-slate-200'}`}>
                  {kenaikanStep > 1 ? '✓' : '1'}
                </span>
                <span>Kelulusan Kelas XII</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
              <div className={`flex items-center space-x-1.5 ${kenaikanStep === 2 ? 'text-amber-800' : kenaikanStep > 2 ? 'text-emerald-700' : ''}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${kenaikanStep === 2 ? 'bg-amber-800 text-white' : kenaikanStep > 2 ? 'bg-emerald-700 text-white' : 'bg-slate-200'}`}>
                  {kenaikanStep > 2 ? '✓' : '2'}
                </span>
                <span>Naik XI → XII</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
              <div className={`flex items-center space-x-1.5 ${kenaikanStep === 3 ? 'text-amber-800' : kenaikanStep > 3 ? 'text-emerald-700' : ''}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${kenaikanStep === 3 ? 'bg-amber-800 text-white' : kenaikanStep > 3 ? 'bg-emerald-700 text-white' : 'bg-slate-200'}`}>
                  {kenaikanStep > 3 ? '✓' : '3'}
                </span>
                <span>Naik X → XI</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
              <div className={`flex items-center space-x-1.5 ${kenaikanStep === 4 ? 'text-emerald-700 font-bold' : ''}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${kenaikanStep === 4 ? 'bg-emerald-700 text-white' : 'bg-slate-200'}`}>
                  4
                </span>
                <span>Import Siswa Baru</span>
              </div>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {/* STEP 1: KELAS XII KE ALUMNI (HANYA LULUS) */}
              {kenaikanStep === 1 && (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                    <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                      Tahap 1: Pengarsipan Kelulusan Siswa Kelas XII ({siswaXiiList.length} Siswa)
                    </h4>
                    <p className="text-xs text-emerald-900 leading-relaxed">
                      Seluruh siswa aktif Kelas XII akan diarsipkan dengan status resmi <strong>LULUS</strong> ke <strong>Buku Induk Alumni</strong>, dan rekam jejak nilai rapor 6 semester dibekukan.
                    </p>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="block text-[11px] font-bold text-emerald-950 mb-1">Tahun Kelulusan</label>
                        <input
                          type="text"
                          value={tahunKeluar}
                          onChange={(e) => setTahunKeluar(e.target.value)}
                          className="w-full px-3 py-1.5 border border-emerald-300 rounded text-xs font-mono bg-white font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-emerald-950 mb-1">Nama Angkatan</label>
                        <input
                          type="text"
                          value={namaAngkatan}
                          onChange={(e) => setNamaAngkatan(e.target.value)}
                          className="w-full px-3 py-1.5 border border-emerald-300 rounded text-xs bg-white font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  {siswaXiiList.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                      Tidak ada siswa aktif di Kelas XII saat ini. Anda dapat langsung melanjutkan ke Tahap 2.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700">Daftar Siswa Kelas XII (Status Kelulusan: LULUS):</span>
                      </div>

                      <div className="border border-slate-200 rounded-lg max-h-64 overflow-y-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-slate-600 text-[11px] sticky top-0 border-b">
                            <tr>
                              <th className="p-2.5">NIS</th>
                              <th className="p-2.5">Nama Siswa</th>
                              <th className="p-2.5">Kelas Asal</th>
                              <th className="p-2.5 text-center">Status</th>
                              <th className="p-2.5">No. Ijazah (Opsional)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {siswaXiiList.map((s) => (
                              <tr key={s.id} className="hover:bg-slate-50">
                                <td className="p-2.5 font-mono font-bold text-slate-900">{s.nis}</td>
                                <td className="p-2.5 font-semibold text-slate-900">{s.nama}</td>
                                <td className="p-2.5 text-slate-600">{s.nama_kelas}</td>
                                <td className="p-2.5 text-center">
                                  <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase">
                                    LULUS
                                  </span>
                                </td>
                                <td className="p-2.5">
                                  <input
                                    type="text"
                                    placeholder="Contoh: DN-01/M-SMA/2026/001"
                                    value={siswaXiiIjazah[s.id] || ''}
                                    onChange={(e) => setSiswaXiiIjazah({
                                      ...siswaXiiIjazah,
                                      [s.id]: e.target.value,
                                    })}
                                    className="px-2.5 py-1 border border-slate-300 rounded text-xs w-full max-w-xs font-mono"
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: KENAIKAN KELAS XI KE XII */}
              {kenaikanStep === 2 && (
                <div className="space-y-4">
                  <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl space-y-2">
                    <h4 className="text-xs font-bold text-sky-950 uppercase tracking-wider">
                      Tahap 2: Kenaikan Siswa Kelas XI → Kelas XII ({kenaikanStatus.ringkasan.kelas_xi_total} Siswa)
                    </h4>
                    <p className="text-xs text-sky-900 leading-relaxed">
                      Pilih pemetaan rombongan belajar (kelas asal Kelas XI ke kelas tujuan Kelas XII). Seluruh anggota kelas akan otomatis dipromosikan.
                    </p>
                  </div>

                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 text-[11px] border-b">
                        <tr>
                          <th className="p-3">Kelas Asal (Tingkat XI)</th>
                          <th className="p-3 text-center">Jumlah Siswa</th>
                          <th className="p-3 text-center">→</th>
                          <th className="p-3">Target Kelas Baru (Tingkat XII)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {(kenaikanStatus.kelas_xi || []).map((kXi) => (
                          <tr key={kXi.id} className="hover:bg-slate-50">
                            <td className="p-3 font-bold text-slate-900">{kXi.nama_kelas}</td>
                            <td className="p-3 text-center font-mono text-slate-700">{kXi.jumlah_siswa} Siswa</td>
                            <td className="p-3 text-center text-slate-400">
                              <ArrowRight className="w-4 h-4 mx-auto text-emerald-700" />
                            </td>
                            <td className="p-3">
                              <select
                                value={mapKelasXi[kXi.id] || ''}
                                onChange={(e) => setMapKelasXi({
                                  ...mapKelasXi,
                                  [kXi.id]: parseInt(e.target.value),
                                })}
                                className="px-3 py-1.5 border border-slate-300 rounded text-xs font-bold bg-white focus:ring-1 focus:ring-emerald-700 w-full md:w-64"
                              >
                                {(kenaikanStatus.kelas_xii || []).map((kXii) => (
                                  <option key={kXii.id} value={kXii.id}>
                                    {kXii.nama_kelas}
                                  </option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* STEP 3: KENAIKAN KELAS X KE XI */}
              {kenaikanStep === 3 && (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                    <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                      Tahap 3: Kenaikan Siswa Kelas X → Kelas XI ({kenaikanStatus.ringkasan.kelas_x_total} Siswa)
                    </h4>
                    <p className="text-xs text-emerald-900 leading-relaxed">
                      Pilih pemetaan rombongan belajar (kelas asal Kelas X ke kelas tujuan Kelas XI). Setelah tahap ini selesai, seluruh Kelas X akan kosong dan siap menerima Angkatan Siswa Baru via Import Excel / Manual di Tahap 4.
                    </p>
                  </div>

                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 text-[11px] border-b">
                        <tr>
                          <th className="p-3">Kelas Asal (Tingkat X)</th>
                          <th className="p-3 text-center">Jumlah Siswa</th>
                          <th className="p-3 text-center">→</th>
                          <th className="p-3">Target Kelas Baru (Tingkat XI)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {(kenaikanStatus.kelas_x || []).map((kX) => (
                          <tr key={kX.id} className="hover:bg-slate-50">
                            <td className="p-3 font-bold text-slate-900">{kX.nama_kelas}</td>
                            <td className="p-3 text-center font-mono text-slate-700">{kX.jumlah_siswa} Siswa</td>
                            <td className="p-3 text-center text-slate-400">
                              <ArrowRight className="w-4 h-4 mx-auto text-emerald-700" />
                            </td>
                            <td className="p-3">
                              <select
                                value={mapKelasX[kX.id] || ''}
                                onChange={(e) => setMapKelasX({
                                  ...mapKelasX,
                                  [kX.id]: parseInt(e.target.value),
                                })}
                                className="px-3 py-1.5 border border-slate-300 rounded text-xs font-bold bg-white focus:ring-1 focus:ring-emerald-700 w-full md:w-64"
                              >
                                {(kenaikanStatus.kelas_xi || []).map((kXi) => (
                                  <option key={kXi.id} value={kXi.id}>
                                    {kXi.nama_kelas}
                                  </option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* STEP 4: SELESAI & IMPORT EXCEL SISWA BARU LANGSUNG */}
              {kenaikanStep === 4 && (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-3">
                    <div className="w-10 h-10 bg-emerald-200 text-emerald-800 rounded-full flex items-center justify-center shrink-0">
                      <CheckCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-emerald-950">
                        Kenaikan Kelas Berhasil! Kelas X Kini Siap Menerima Siswa Baru.
                      </h4>
                      <p className="text-xs text-emerald-800">
                        Silakan unduh template dan import file Excel siswa baru di bawah ini, atau input manual.
                      </p>
                    </div>
                  </div>

                  {/* FORM IMPORT EXCEL LANGSUNG DI STEP 4 */}
                  <div className="p-5 bg-sky-50/50 border border-sky-200 rounded-xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sky-100 pb-3">
                      <div>
                        <h4 className="text-xs font-bold text-sky-950 uppercase tracking-wider flex items-center space-x-1.5">
                          <FileSpreadsheet className="w-4 h-4 text-sky-700" />
                          <span>Form Import Siswa Baru (Kelas X / Pindahan)</span>
                        </h4>
                        <p className="text-[11px] text-sky-800">
                          Format kolom: NIS, NISN, Nama Lengkap, Jenis Kelamin, No HP Ortu, Tanggal Lahir, dan Target Kelas.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleDownloadTemplate}
                        disabled={downloadingTemplate}
                        className="inline-flex items-center space-x-1 bg-sky-700 hover:bg-sky-800 text-white px-3 py-1.5 rounded text-xs font-bold shadow-sm shrink-0"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{downloadingTemplate ? 'Mengunduh...' : 'Unduh Format Template (.xlsx)'}</span>
                      </button>
                    </div>

                    <form onSubmit={handleImportSubmit} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Pilih File Spreadsheet (.xlsx / .xls) <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="file"
                            required
                            accept=".xlsx, .xls, .csv"
                            onChange={(e) => setImportFile(e.target.files[0] || null)}
                            className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-sky-100 file:text-sky-800 hover:file:bg-sky-200 border border-slate-300 rounded p-1 bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Target Kelas Default (Jika di file kosong):
                          </label>
                          <select
                            value={importDefaultKelas}
                            onChange={(e) => setImportDefaultKelas(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded text-xs font-semibold bg-white"
                          >
                            <option value="">-- Otomatis Sesuai Kolom Excel --</option>
                            {kelases.map((k) => (
                              <option key={k.id} value={k.id}>
                                {k.nama_kelas}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={() => { setShowKenaikanModal(false); openAddModal(); }}
                          className="px-3.5 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 flex items-center space-x-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Input Manual Siswa Baru</span>
                        </button>

                        <button
                          type="submit"
                          disabled={importLoading || !importFile}
                          className="px-5 py-2 bg-sky-800 hover:bg-sky-900 text-white rounded-lg text-xs font-bold shadow-sm flex items-center space-x-1.5 disabled:opacity-50"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{importLoading ? 'Memproses Import Data...' : 'Unggah & Import Siswa Baru'}</span>
                        </button>
                      </div>
                    </form>

                    {importResult && (
                      <div className={`p-3 rounded-lg border text-xs space-y-1.5 ${
                        importResult.status === 'success'
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                          : 'bg-rose-50 text-rose-900 border-rose-200'
                      }`}>
                        <div className="font-bold flex items-center space-x-1.5">
                          {importResult.status === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                          <span>{importResult.message}</span>
                        </div>

                        {importResult.summary && (
                          <div className="text-[11px] font-mono space-y-0.5 pt-1">
                            <div>Total Baris: {importResult.summary.total_baris_terbaca} | <span className="text-emerald-700 font-bold">Berhasil: {importResult.summary.berhasil_diimpor}</span> | <span className="text-rose-700 font-bold">Gagal: {importResult.summary.gagal_diimpor}</span></div>
                            {importResult.summary.errors && importResult.summary.errors.length > 0 && (
                              <div className="mt-1 p-2 bg-white/80 rounded border border-rose-200 text-rose-800 max-h-24 overflow-y-auto">
                                {importResult.summary.errors.map((err, idx) => (
                                  <div key={idx}>• {err}</div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setShowKenaikanModal(false)}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-100"
              >
                Tutup
              </button>

              <div className="flex items-center space-x-2">
                {kenaikanStep === 1 && (
                  <button
                    type="button"
                    disabled={processingKenaikan}
                    onClick={handleExecuteLulusXii}
                    className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold shadow-sm flex items-center space-x-1.5 disabled:opacity-50"
                  >
                    <span>{processingKenaikan ? 'Memproses Kelulusan...' : 'Luluskan Kelas XII → Lanjut Tahap 2'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                {kenaikanStep === 2 && (
                  <button
                    type="button"
                    disabled={processingKenaikan}
                    onClick={handleExecutePromosiXiToXii}
                    className="px-5 py-2 bg-sky-800 hover:bg-sky-900 text-white rounded-lg text-xs font-bold shadow-sm flex items-center space-x-1.5 disabled:opacity-50"
                  >
                    <span>{processingKenaikan ? 'Memproses Kenaikan...' : 'Eksekusi Naikkan XI ke XII → Lanjut Tahap 3'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                {kenaikanStep === 3 && (
                  <button
                    type="button"
                    disabled={processingKenaikan}
                    onClick={handleExecutePromosiXToXi}
                    className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold shadow-sm flex items-center space-x-1.5 disabled:opacity-50"
                  >
                    <span>{processingKenaikan ? 'Memproses Kenaikan...' : 'Eksekusi Naikkan X ke XI → Tahap Siswa Baru'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                {kenaikanStep === 4 && (
                  <button
                    type="button"
                    onClick={() => { setShowKenaikanModal(false); fetchSiswa(); }}
                    className="px-5 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 shadow-sm"
                  >
                    Selesai & Tutup Wizard
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: SNAPSHOT NILAI RAPOR ALUMNI */}
      {/* ======================================================== */}
      {showSnapshotModal && selectedSnapshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="px-5 py-4 bg-emerald-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-emerald-200" />
                <div>
                  <h3 className="text-sm font-bold tracking-tight">
                    Buku Induk Digital & Snapshot Rapor Alumni
                  </h3>
                  <p className="text-[11px] text-emerald-200">
                    {selectedSnapshot.alumni.nama} (NIS: {selectedSnapshot.alumni.nis})
                  </p>
                </div>
              </div>
              <button onClick={() => setShowSnapshotModal(false)} className="text-emerald-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
              {/* Profil Singkat */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                <div>
                  <span className="text-slate-500 block text-[11px]">Nama Lengkap:</span>
                  <span className="font-bold text-slate-900">{selectedSnapshot.alumni.nama}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">NIS / NISN:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedSnapshot.alumni.nis} / {selectedSnapshot.alumni.nisn || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Status Keluar:</span>
                  <span className={`inline-block px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                    selectedSnapshot.alumni.kategori_keluar === 'LULUS' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedSnapshot.alumni.kategori_keluar}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Tahun Lulus / Angkatan:</span>
                  <span className="font-semibold text-slate-800">{selectedSnapshot.alumni.tahun_keluar} ({selectedSnapshot.alumni.angkatan || '-'})</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Kelas Terakhir:</span>
                  <span className="font-semibold text-slate-800">{selectedSnapshot.alumni.kelas_terakhir || 'XII'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">No. Ijazah / Keterangan:</span>
                  <span className="font-mono text-slate-800">{selectedSnapshot.alumni.no_ijazah || selectedSnapshot.alumni.sekolah_tujuan || '-'}</span>
                </div>
              </div>

              {/* Data Snapshot Rapor JSON */}
              <div>
                <h4 className="font-bold text-slate-800 mb-2 flex items-center space-x-1.5">
                  <FileText className="w-4 h-4 text-emerald-700" />
                  <span>Riwayat Nilai Rapor & Akademik Terarsip:</span>
                </h4>

                {selectedSnapshot.snapshot?.rapor_records && selectedSnapshot.snapshot.rapor_records.length > 0 ? (
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 text-[11px] border-b">
                        <tr>
                          <th className="p-2.5">Mata Pelajaran</th>
                          <th className="p-2.5 text-center">Nilai Akhir</th>
                          <th className="p-2.5 text-center">Predikat</th>
                          <th className="p-2.5">Catatan Akademik</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedSnapshot.snapshot.rapor_records.map((r, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2.5 font-medium text-slate-900">{r.nama_mapel || `Mata Pelajaran #${r.mapel_id || idx+1}`}</td>
                            <td className="p-2.5 text-center font-mono font-bold text-emerald-800">{r.nilai_akhir ?? r.nilai_sts ?? '-'}</td>
                            <td className="p-2.5 text-center font-bold text-slate-700">{r.predikat || '-'}</td>
                            <td className="p-2.5 text-slate-600 italic text-[11px]">{r.catatan || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-slate-500 text-center text-xs">
                    Biodata dan buku induk alumni tersimpan abadi di database. Snapshot nilai detail belum terisi saat pengarsipan.
                  </div>
                )}
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setShowSnapshotModal(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: RESET / GANTI PASSWORD SISWA */}
      {/* ======================================================== */}
      {showResetModal && targetSiswa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="px-5 py-4 bg-emerald-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-400/20 text-amber-300 rounded-lg">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight">
                    Ganti Kata Sandi Akun Siswa
                  </h3>
                  <p className="text-[11px] text-emerald-200">
                    Akses Portal Siswa / Wali Murid
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowResetModal(false)}
                className="text-emerald-200 hover:text-white p-1 rounded hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetSubmit} className="p-5 space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Nama Siswa:</span>
                  <span className="font-bold text-slate-900">{targetSiswa.nama}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">NIS:</span>
                  <span className="font-mono font-bold text-emerald-800">{targetSiswa.nis}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Kelas / Rombel:</span>
                  <span className="font-semibold text-slate-800">{targetSiswa.nama_kelas || '-'}</span>
                </div>
              </div>

              {resetError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{resetError}</span>
                </div>
              )}

              {resetSuccess && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{resetSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Kata Sandi Baru <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full px-3 py-2 pr-9 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Konfirmasi Kata Sandi Baru <span className="text-rose-500">*</span>
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={newPasswordConfirmation}
                  onChange={(e) => setNewPasswordConfirmation(e.target.value)}
                  placeholder="Ulangi kata sandi baru"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="px-3.5 py-2 bg-slate-100 text-slate-700 rounded text-xs font-semibold hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={resetSubmitting}
                  className="px-4 py-2 bg-emerald-800 text-white rounded text-xs font-semibold hover:bg-emerald-900 shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{resetSubmitting ? 'Menyimpan...' : 'Simpan Sandi Baru'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataSiswa;
