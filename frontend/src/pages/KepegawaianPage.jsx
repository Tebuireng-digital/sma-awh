import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  Plus, 
  CheckCircle, 
  Clock, 
  ShieldCheck, 
  FileText, 
  Award, 
  Briefcase, 
  Lock, 
  Search, 
  Filter,
  CheckCheck,
  UserCheck,
  AlertCircle,
  Sparkles,
  Layers
} from 'lucide-react';

const AVAILABLE_ADDITIONAL_ROLES = [
  { key: 'kepala_sekolah', label: 'Kepala Sekolah' },
  { key: 'humas', label: 'Staf Branding & Humas' },
  { key: 'kurikulum', label: 'Waka / Tim Kurikulum' },
  { key: 'kesiswaan', label: 'Staf Kesiswaan' },
  { key: 'sarana', label: 'Staf Sarana Prasarana' },
  { key: 'kepegawaian', label: 'Staf Kepegawaian' },
  { key: 'persuratan', label: 'Persuratan & Tata Usaha' },
  { key: 'bk', label: 'Bimbingan Konseling (BK)' },
  { key: 'pustakawan', label: 'Pengelola Perpustakaan' },
];

const roleLabelMap = {
  admin: 'Admin',
  kepala_sekolah: 'Kepala Sekolah',
  waka: 'Wakil Kepala',
  kurikulum: 'Kurikulum',
  kesiswaan: 'Kesiswaan',
  sarana: 'Sarpras',
  kepegawaian: 'Kepegawaian',
  persuratan: 'Persuratan',
  humas: 'Humas & Branding',
  guru: 'Guru',
  wali_kelas: 'Wali Kelas',
  bk: 'BK',
  pustakawan: 'Pustakawan'
};

const KepegawaianPage = () => {
  const { user, hasAnyRole } = useAuth();
  const role = user?.role || 'kepegawaian';
  const isPrivileged = hasAnyRole(['admin', 'kepala_sekolah', 'waka', 'kepala_tu', 'kepegawaian']);

  const [activeTab, setActiveTab] = useState('pegawai'); // pegawai, pengajuan, riwayat, kinerja
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Data States
  const [pegawaiList, setPegawaiList] = useState([]);
  const [pengajuanList, setPengajuanList] = useState([]);
  const [riwayatList, setRiwayatList] = useState([]);
  const [kinerjaList, setKinerjaList] = useState([]);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // add_pegawai, add_pengajuan, add_riwayat, add_kinerja
  const [formData, setFormData] = useState({});

  // Search & Filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');

  useEffect(() => {
    fetchTabContent();
  }, [activeTab]);

  const fetchTabContent = async () => {
    setLoading(true);
    try {
      if (activeTab === 'pegawai') {
        const res = await api.get('/kepegawaian/pegawai');
        setPegawaiList(res.data.data || []);
      } else if (activeTab === 'pengajuan') {
        const res = await api.get('/kepegawaian/pengajuan');
        setPengajuanList(res.data.data || []);
      } else if (activeTab === 'riwayat') {
        const res = await api.get('/kepegawaian/riwayat-jabatan');
        setRiwayatList(res.data.data || []);
      } else if (activeTab === 'kinerja') {
        const res = await api.get('/kepegawaian/penilaian-kinerja');
        setKinerjaList(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching kepegawaian data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (type, extraData = {}) => {
    setModalType(type);
    let initialRoles = [];
    if (extraData && extraData.additional_roles) {
      initialRoles = Array.isArray(extraData.additional_roles)
        ? [...extraData.additional_roles]
        : (typeof extraData.additional_roles === 'string' ? JSON.parse(extraData.additional_roles || '[]') : []);
    }
    setFormData({
      ...extraData,
      additional_roles: initialRoles,
      jabatan: extraData?.jabatan || 'Guru',
      pendidikan: extraData?.pendidikan || 'S1',
      status_kepegawaian: extraData?.status_kepegawaian || 'Tetap'
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const toggleRole = (roleKey) => {
    const current = Array.isArray(formData.additional_roles) ? [...formData.additional_roles] : [];
    const next = current.includes(roleKey)
      ? current.filter(r => r !== roleKey)
      : [...current, roleKey];
    setFormData({ ...formData, additional_roles: next });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      let endpoint = '';
      if (modalType === 'add_pegawai') endpoint = '/kepegawaian/pegawai';
      else if (modalType === 'edit_pegawai') endpoint = `/kepegawaian/pegawai/${formData.id}`;
      else if (modalType === 'add_pengajuan') endpoint = '/kepegawaian/pengajuan';
      else if (modalType === 'add_riwayat') endpoint = '/kepegawaian/riwayat-jabatan';
      else if (modalType === 'add_kinerja') endpoint = '/kepegawaian/penilaian-kinerja';

      const res = await api.post(endpoint, formData);
      setMsg(res.data.message || 'Berhasil menyimpan data kepegawaian.');
      setShowModal(false);
      setFormData({});
      setTimeout(() => setMsg(''), 5000);
      fetchTabContent();
    } catch (err) {
      console.error('Error submitting form:', err);
      const errMsg = err.response?.data?.message || err.response?.data?.error || 'Gagal menyimpan data kepegawaian.';
      setErrorMsg(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (pengajuanId, status) => {
    try {
      const res = await api.post(`/kepegawaian/approval/${pengajuanId}`, { status });
      setMsg(res.data.message || 'Approval kepegawaian berhasil diperbarui.');
      setTimeout(() => setMsg(''), 3000);
      fetchTabContent();
    } catch (err) {
      console.error('Error approval kepegawaian:', err);
    }
  };

  const filteredPegawai = pegawaiList.filter(item => {
    const matchSearch = item.nama_lengkap.toLowerCase().includes(search.toLowerCase()) || 
                        (item.nip && item.nip.toLowerCase().includes(search.toLowerCase())) ||
                        item.jabatan.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'Semua' || item.status_kepegawaian === statusFilter;
    return matchSearch && matchStatus;
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
              <span>Staf Kepegawaian & Manajemen SDM</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Administrasi Kepegawaian & Ketenagaan SMA AWH
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-2xl font-normal">
              Data Induk Pegawai, Riwayat Jabatan/SK Yayasan, Pengajuan Cuti/Izin & Penilaian Kinerja Guru/Staf
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {activeTab === 'pegawai' && isPrivileged && (
              <button
                onClick={() => handleOpenModal('add_pegawai')}
                className="flex items-center space-x-1.5 px-4 py-2 bg-[#c8942a] hover:bg-[#b08122] text-[#0d281e] rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Pegawai Baru</span>
              </button>
            )}
            {activeTab === 'pengajuan' && (
              <button
                onClick={() => handleOpenModal('add_pengajuan')}
                className="flex items-center space-x-1.5 px-4 py-2 bg-[#c8942a] hover:bg-[#b08122] text-[#0d281e] rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Ajukan Cuti / Izin / SK</span>
              </button>
            )}
            {activeTab === 'riwayat' && isPrivileged && (
              <button
                onClick={() => handleOpenModal('add_riwayat')}
                className="flex items-center space-x-1.5 px-4 py-2 bg-[#c8942a] hover:bg-[#b08122] text-[#0d281e] rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Catat Promosi / SK Baru</span>
              </button>
            )}
            {activeTab === 'kinerja' && isPrivileged && (
              <button
                onClick={() => handleOpenModal('add_kinerja')}
                className="flex items-center space-x-1.5 px-4 py-2 bg-[#c8942a] hover:bg-[#b08122] text-[#0d281e] rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Input Penilaian Kinerja</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {msg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs rounded-xl flex items-center justify-between font-medium shadow-xs">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{msg}</span>
          </div>
          <button onClick={() => setMsg('')} className="text-emerald-700 hover:text-emerald-900 font-bold ml-2 cursor-pointer">✕</button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-300 text-rose-900 text-xs rounded-xl flex items-center justify-between font-medium shadow-xs">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="text-rose-700 hover:text-rose-900 font-bold ml-2 cursor-pointer">✕</button>
        </div>
      )}

      {/* Sensitive Data Info Banner for Non-Privileged */}
      {!isPrivileged && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center space-x-2 font-medium">
          <Lock className="w-4 h-4 text-amber-700 shrink-0" />
          <span>Data Kepegawaian bersifat konfidensial. Anda sedang mengakses profil & riwayat kepegawaian pribadi Anda sendiri.</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-1.5 flex flex-wrap gap-1.5">
        <button
          onClick={() => setActiveTab('pegawai')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'pegawai' ? 'bg-[#0d281e] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <UserCheck className="w-4 h-4 text-emerald-400" />
          <span>1. Data Induk & Ketenagaan</span>
        </button>

        <button
          onClick={() => setActiveTab('pengajuan')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'pengajuan' ? 'bg-[#0d281e] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <CheckCheck className="w-4 h-4 text-blue-400" />
          <span>2. Pengajuan Cuti & Izin</span>
        </button>

        <button
          onClick={() => setActiveTab('riwayat')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'riwayat' ? 'bg-[#0d281e] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Briefcase className="w-4 h-4 text-[#c8942a]" />
          <span>3. Riwayat Jabatan & SK Yayasan</span>
        </button>

        <button
          onClick={() => setActiveTab('kinerja')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'kinerja' ? 'bg-[#0d281e] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4 text-purple-400" />
          <span>4. Penilaian Kinerja (PK Guru)</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        {loading ? (
          <div className="text-center py-10 text-slate-500 text-xs">Memuat data Kepegawaian...</div>
        ) : (
          <>
            {/* TAB 1: DATA INDUK PEGAWAI */}
            {activeTab === 'pegawai' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari NIP, nama, atau jabatan..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <Filter className="w-4 h-4 text-slate-500" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="Semua">Semua Status</option>
                      <option value="Tetap">Pegawai Tetap</option>
                      <option value="Pegawai Tetap Yayasan">Pegawai Tetap Yayasan</option>
                      <option value="GTT (Guru Tidak Tetap)">GTT (Guru Tidak Tetap)</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                        <th className="px-4 py-2.5">NIP</th>
                        <th className="px-4 py-2.5">Nama Lengkap & Pendidikan</th>
                        <th className="px-4 py-2.5">Jabatan / Unit</th>
                        <th className="px-4 py-2.5">Status Kepegawaian</th>
                        <th className="px-4 py-2.5">No. SK Terakhir</th>
                        <th className="px-4 py-2.5 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredPegawai.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-mono font-bold text-slate-800">{p.nip || '-'}</td>
                          <td className="px-4 py-3">
                            <span className="font-bold text-slate-800 block">{p.nama_lengkap}</span>
                            <span className="text-slate-500 text-[11px]">{p.pendidikan || '-'}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-semibold text-slate-800 block">
                              {p.jabatan || 'Guru'}
                            </span>
                            {Array.isArray(p.additional_roles) && p.additional_roles.filter(ar => ar !== 'guru' && ar !== p.jabatan?.toLowerCase()).length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {p.additional_roles
                                  .filter(ar => ar !== 'guru' && ar !== p.jabatan?.toLowerCase())
                                  .map((ar) => (
                                    <span key={ar} className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                                      +{roleLabelMap[ar] || ar}
                                    </span>
                                  ))}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {p.status_kepegawaian ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                {p.status_kepegawaian}
                              </span>
                            ) : (
                              <span className="text-slate-400 font-medium">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-600 text-[11px]">{p.no_sk_terakhir || '-'}</td>
                          <td className="px-4 py-3 text-center">
                            {isPrivileged && (
                              <button
                                onClick={() => handleOpenModal('edit_pegawai', p)}
                                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[11px] font-semibold transition-colors shadow-sm cursor-pointer"
                              >
                                Edit
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

            {/* TAB 2: PENGAJUAN CUTI & APPROVAL SK */}
            {activeTab === 'pengajuan' && (
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 text-xs flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
                  <span>
                    Alur Hak Akses Berjenjang: 
                    <strong className="ml-1">(1) Staf Input Pengajuan &rarr; (2) Kepala TU Verifikasi Berkas &rarr; (3) Kepala Sekolah Approve Final SK</strong>
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                        <th className="px-4 py-2.5">#</th>
                        <th className="px-4 py-2.5">Nama Pegawai & NIP</th>
                        <th className="px-4 py-2.5 text-center">Jenis Pengajuan</th>
                        <th className="px-4 py-2.5">Alasan / Detail Berkas</th>
                        <th className="px-4 py-2.5">Periode Tgl</th>
                        <th className="px-4 py-2.5 text-center">Status Kepala TU</th>
                        <th className="px-4 py-2.5 text-center">Status Kepsek</th>
                        <th className="px-4 py-2.5 text-center">Aksi Approval</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {pengajuanList.map((pg, idx) => (
                        <tr key={pg.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-semibold text-slate-500">{idx + 1}</td>
                          <td className="px-4 py-3">
                            <span className="font-bold text-slate-800 block">{pg.nama_lengkap}</span>
                            <span className="font-mono text-slate-500 text-[11px]">{pg.nip}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                              {pg.jenis}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-700">
                            <div>{pg.alasan}</div>
                            {pg.catatan && <div className="text-[10px] text-slate-400 italic">Note: {pg.catatan}</div>}
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-600 text-[11px]">
                            {pg.tgl_mulai} {pg.tgl_selesai ? `s/d ${pg.tgl_selesai}` : ''}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              pg.status_ktu === 'Disetujui' ? 'bg-emerald-100 text-emerald-800' :
                              pg.status_ktu === 'Ditolak' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              K.TU: {pg.status_ktu}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              pg.status_kepsek === 'Disetujui' ? 'bg-emerald-100 text-emerald-800' :
                              pg.status_kepsek === 'Ditolak' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              Kepsek: {pg.status_kepsek}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {isPrivileged && (
                              <button
                                onClick={() => handleApproval(pg.id, 'Disetujui')}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold transition-colors cursor-pointer"
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

            {/* TAB 3: RIWAYAT JABATAN & SK */}
            {activeTab === 'riwayat' && (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                        <th className="px-4 py-2.5">#</th>
                        <th className="px-4 py-2.5">Nama Pegawai & NIP</th>
                        <th className="px-4 py-2.5">Jabatan / Mutasi Baru</th>
                        <th className="px-4 py-2.5">No. SK Resmi</th>
                        <th className="px-4 py-2.5">Tgl Terbit SK</th>
                        <th className="px-4 py-2.5">Keterangan Promosi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {riwayatList.map((rw, idx) => (
                        <tr key={rw.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-semibold text-slate-500">{idx + 1}</td>
                          <td className="px-4 py-3">
                            <span className="font-bold text-slate-800 block">{rw.nama_lengkap}</span>
                            <span className="font-mono text-slate-500 text-[11px]">{rw.nip}</span>
                          </td>
                          <td className="px-4 py-3 font-bold text-emerald-800">{rw.jabatan}</td>
                          <td className="px-4 py-3 font-mono font-bold text-slate-800">{rw.no_sk || '-'}</td>
                          <td className="px-4 py-3 font-mono text-slate-600">{rw.tgl_sk || '-'}</td>
                          <td className="px-4 py-3 text-slate-600">{rw.keterangan}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4: PENILAIAN KINERJA PEGAWAI */}
            {activeTab === 'kinerja' && (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                        <th className="px-4 py-2.5">#</th>
                        <th className="px-4 py-2.5">Nama Pegawai</th>
                        <th className="px-4 py-2.5">Periode Evaluasi</th>
                        <th className="px-4 py-2.5 text-center">Skor Kinerja</th>
                        <th className="px-4 py-2.5 text-center">Predikat</th>
                        <th className="px-4 py-2.5">Catatan Evaluasi / Kinerja</th>
                        <th className="px-4 py-2.5">Tim Penilai</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {kinerjaList.map((kn, idx) => (
                        <tr key={kn.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-semibold text-slate-500">{idx + 1}</td>
                          <td className="px-4 py-3 font-bold text-slate-800">{kn.nama_lengkap}</td>
                          <td className="px-4 py-3 text-slate-600">{kn.periode}</td>
                          <td className="px-4 py-3 text-center font-mono font-bold text-lg text-emerald-800">{kn.skor_kinerja}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              kn.predikat === 'Sangat Baik' ? 'bg-purple-100 text-purple-800' :
                              kn.predikat === 'Baik' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {kn.predikat}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-700">{kn.catatan_evaluasi}</td>
                          <td className="px-4 py-3 text-slate-500 font-medium">{kn.penilai}</td>
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-sm font-bold text-slate-800">
                {modalType === 'add_pegawai' && 'Tambah Pegawai / Guru Baru'}
                {modalType === 'edit_pegawai' && 'Edit Data Kepegawaian & Merangkap Jabatan'}
                {modalType === 'add_pengajuan' && 'Form Pengajuan Cuti / Izin / SK'}
                {modalType === 'add_riwayat' && 'Catat Mutasi / Penerbitan SK Jabatan'}
                {modalType === 'add_kinerja' && 'Input Penilaian Kinerja Pegawai'}
              </h2>
              <button 
                type="button" 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-base font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
              {(modalType === 'add_pegawai' || modalType === 'edit_pegawai') && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Nama Lengkap & Gelar <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="misal: MUKHAMMAD HAFIDZ ABIZAR, M.H."
                      value={formData.nama_lengkap || ''}
                      onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">NIP (Opsional)</label>
                      <input
                        type="text"
                        placeholder="Isi NIP pegawai..."
                        value={formData.nip || ''}
                        onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                        className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">No. SK Terakhir (Opsional)</label>
                      <input
                        type="text"
                        placeholder="misal: SK/YAS/AWH/2026/015"
                        value={formData.no_sk_terakhir || ''}
                        onChange={(e) => setFormData({ ...formData, no_sk_terakhir: e.target.value })}
                        className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Pendidikan Terakhir</label>
                      <select
                        value={formData.pendidikan || 'S1'}
                        onChange={(e) => setFormData({ ...formData, pendidikan: e.target.value })}
                        className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium bg-white"
                      >
                        <option value="S1">S1 / Sarjana</option>
                        <option value="S2">S2 / Magister</option>
                        <option value="S3">S3 / Doktor</option>
                        <option value="D3">D3 / Diploma</option>
                        <option value="SMA">SMA / Sederajat</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Status Kepegawaian</label>
                      <select
                        value={formData.status_kepegawaian || 'Tetap'}
                        onChange={(e) => setFormData({ ...formData, status_kepegawaian: e.target.value })}
                        className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium bg-white"
                      >
                        <option value="Tetap">Pegawai Tetap</option>
                        <option value="Pegawai Tetap Yayasan">Pegawai Tetap Yayasan (PTY/GTY)</option>
                        <option value="GTT (Guru Tidak Tetap)">GTT (Guru Tidak Tetap)</option>
                        <option value="PTT (Pegawai Tidak Tetap)">PTT (Pegawai Tidak Tetap)</option>
                        <option value="Kontrak">Pegawai Kontrak</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Jabatan Utama / Unit Kerja <span className="text-rose-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.jabatan || 'Guru'}
                      onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium bg-white"
                    >
                      <option value="Guru">Guru / Tenaga Pendidik (Otomatis masuk ke Master Guru)</option>
                      <option value="Kepala Sekolah">Kepala Sekolah</option>
                      <option value="Wakil Kepala Sekolah">Wakil Kepala Sekolah</option>
                      <option value="Kepala Tata Usaha">Kepala Tata Usaha</option>
                      <option value="Staf Administrasi TU">Staf Administrasi TU</option>
                      <option value="Staf Kepegawaian">Staf Kepegawaian</option>
                      <option value="Staf Humas & Media">Staf Humas & Media</option>
                      <option value="Staf Sarana Prasarana">Staf Sarana Prasarana</option>
                      <option value="Pengelola Perpustakaan">Pengelola Perpustakaan</option>
                      <option value="Bimbingan Konseling">Bimbingan Konseling (BK)</option>
                    </select>

                    {(formData.jabatan === 'Guru' || (formData.jabatan && formData.jabatan.toLowerCase().includes('guru'))) && (
                      <div className="mt-1.5 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-800 flex items-center gap-1.5 font-medium">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Otomatis tersinkron ke Master Data Guru dan dibuatkan akun login guru jika belum ada.</span>
                      </div>
                    )}
                  </div>



                  {/* Multi-Role / Merangkap Jabatan Checkboxes */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 mt-2">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Tugas Tambahan / Merangkap Jabatan (Multi-Role)</span>
                      </label>
                      <span className="text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-bold">
                        1 Akun Terpadu
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Centang tugas rangkap yang dipegang pegawai ini. Pegawai dapat mengakses seluruh menu yang dicentang secara langsung dalam satu akun login tanpa logout/ganti akun.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                      {AVAILABLE_ADDITIONAL_ROLES.map((r) => {
                        const isChecked = Array.isArray(formData.additional_roles) && formData.additional_roles.includes(r.key);
                        return (
                          <label 
                            key={r.key} 
                            className={`flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-all ${
                              isChecked 
                                ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold shadow-xs' 
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleRole(r.key)}
                              className="w-3.5 h-3.5 text-emerald-700 rounded border-slate-300 focus:ring-emerald-600 cursor-pointer"
                            />
                            <span className="text-[11px] select-none">{r.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {modalType === 'add_pengajuan' && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Pilih Pegawai</label>
                    <select
                      required
                      value={formData.pegawai_id || ''}
                      onChange={(e) => setFormData({ ...formData, pegawai_id: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="">-- Pilih Pegawai --</option>
                      {pegawaiList.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nama_lengkap} ({p.jabatan})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Jenis Pengajuan</label>
                      <select
                        value={formData.jenis || 'Cuti'}
                        onChange={(e) => setFormData({ ...formData, jenis: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="Cuti">Cuti</option>
                        <option value="Izin">Izin Tidak Masuk</option>
                        <option value="SK">Penerbitan / Perpanjangan SK</option>
                        <option value="Mutasi">Pengajuan Mutasi</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Tgl Mulai</label>
                      <input
                        type="date"
                        required
                        value={formData.tgl_mulai || ''}
                        onChange={(e) => setFormData({ ...formData, tgl_mulai: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Alasan Pengajuan / Deskripsi Berkas</label>
                    <textarea
                      required
                      rows="3"
                      placeholder="Jelaskan keperluan pengajuan..."
                      value={formData.alasan || ''}
                      onChange={(e) => setFormData({ ...formData, alasan: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </>
              )}

              {modalType === 'add_riwayat' && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Pilih Pegawai</label>
                    <select
                      required
                      value={formData.pegawai_id || ''}
                      onChange={(e) => setFormData({ ...formData, pegawai_id: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="">-- Pilih Pegawai --</option>
                      {pegawaiList.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nama_lengkap} ({p.jabatan})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Jabatan / Tugas Baru</label>
                    <input
                      type="text"
                      required
                      placeholder="misal: Kepala Perpustakaan"
                      value={formData.jabatan || ''}
                      onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Keterangan SK / Promosi</label>
                    <input
                      type="text"
                      placeholder="misal: Promosi Jabatan Struktural 2026"
                      value={formData.keterangan || ''}
                      onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </>
              )}

              {modalType === 'add_kinerja' && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Pilih Pegawai</label>
                    <select
                      required
                      value={formData.pegawai_id || ''}
                      onChange={(e) => setFormData({ ...formData, pegawai_id: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="">-- Pilih Pegawai --</option>
                      {pegawaiList.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nama_lengkap} ({p.jabatan})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Skor Kinerja (0 - 100)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      max="100"
                      placeholder="85"
                      value={formData.skor_kinerja || ''}
                      onChange={(e) => setFormData({ ...formData, skor_kinerja: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Catatan Evaluasi / Rekomendasi</label>
                    <textarea
                      rows="3"
                      placeholder="Tuliskan catatan apresiasi atau perbaikan..."
                      value={formData.catatan_evaluasi || ''}
                      onChange={(e) => setFormData({ ...formData, catatan_evaluasi: e.target.value })}
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

export default KepegawaianPage;
