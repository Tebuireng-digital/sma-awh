import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  HeartHandshake,
  Lock,
  Unlock,
  ShieldAlert,
  Award,
  GraduationCap,
  CalendarCheck,
  Plus,
  Trash2,
  Pencil,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  User,
  BookOpen,
  Briefcase
} from 'lucide-react';

const BKPage = () => {
  const { user } = useAuth();
  const role = strToLower(user?.role || 'bk');

  function strToLower(val) {
    return String(val || '').toLowerCase();
  }

  const isPrivileged = ['bk', 'guru_bk', 'kepala_sekolah', 'waka_kesiswaan', 'waka', 'kesiswaan', 'admin'].includes(role);

  const [activeTab, setActiveTab] = useState('absensi'); // absensi, konseling, pelanggaran, prestasi, studi_lanjut
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  // Data States
  const [siswaList, setSiswaList] = useState([]);
  const [catatanList, setCatatanList] = useState([]);
  const [pelanggaranList, setPelanggaranList] = useState([]);
  const [prestasiList, setPrestasiList] = useState([]);
  const [studiList, setStudiList] = useState([]);
  const [absensiList, setAbsensiList] = useState([]);

  // Search & Filter
  const [search, setSearch] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // add_catatan, add_pelanggaran, add_prestasi, add_studi, add_absensi
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchSiswaList();
    fetchTabContent();
  }, [activeTab]);

  const fetchSiswaList = async () => {
    try {
      const res = await api.get('/bk/siswa-list');
      setSiswaList(res.data.data || res.data || []);
    } catch (err) {
      console.error('Error fetching siswa list for BK:', err);
    }
  };

  const fetchTabContent = async () => {
    setLoading(true);
    try {
      if (activeTab === 'konseling') {
        const res = await api.get('/bk/catatan');
        setCatatanList(res.data.data || []);
      } else if (activeTab === 'pelanggaran') {
        const res = await api.get('/bk/pelanggaran');
        setPelanggaranList(res.data.data || []);
      } else if (activeTab === 'prestasi') {
        const res = await api.get('/bk/prestasi');
        setPrestasiList(res.data.data || []);
      } else if (activeTab === 'studi_lanjut') {
        const res = await api.get('/bk/studi-lanjut');
        setStudiList(res.data.data || []);
      } else if (activeTab === 'absensi') {
        const res = await api.get('/bk/absensi');
        setAbsensiList(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching BK tab data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (type, item = null) => {
    setModalType(type);
    if (item) {
      setEditItem(item);
      setFormData({ ...item });
    } else {
      setEditItem(null);
      if (type === 'add_absensi') {
        setFormData({
          status_absensi: 'Membolos',
          tanggal: new Date().toISOString().split('T')[0],
          keterangan: ''
        });
      } else if (type === 'add_pelanggaran') {
        setFormData({
          kategori_bobot: 'Ringan',
          poin: 10,
          status_kasus: 'Dalam Penanganan BK'
        });
      } else if (type === 'add_prestasi') {
        setFormData({
          tingkat: 'Provinsi',
          peringkat: 'Juara 1'
        });
      } else if (type === 'add_studi') {
        setFormData({
          pilihan_karir: 'Kuliah PTN',
          status_tracing: 'Terdata'
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
      if (modalType.includes('catatan')) endpoint = '/bk/catatan';
      else if (modalType.includes('pelanggaran')) endpoint = '/bk/pelanggaran';
      else if (modalType.includes('prestasi')) endpoint = '/bk/prestasi';
      else if (modalType.includes('studi')) endpoint = '/bk/studi-lanjut';
      else if (modalType.includes('absensi')) endpoint = '/bk/absensi';

      let res;
      if (editItem) {
        res = await api.put(`${endpoint}/${editItem.id}`, formData);
      } else {
        res = await api.post(endpoint, formData);
      }

      setMsg(res.data.message || 'Berhasil menyimpan data BK.');
      setShowModal(false);
      setFormData({});
      setEditItem(null);
      setTimeout(() => setMsg(''), 4000);
      fetchTabContent();
    } catch (err) {
      console.error('Error submitting BK form:', err);
      const errMsg = err.response?.data?.message || (err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(', ') : 'Gagal menyimpan data BK.');
      setMsg(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (category, id) => {
    if (!window.confirm('Hapus data ini?')) return;
    try {
      const res = await api.delete(`/bk/${category}/${id}`);
      setMsg(res.data.message || 'Data berhasil dihapus.');
      setTimeout(() => setMsg(''), 3000);
      fetchTabContent();
    } catch (err) {
      console.error(`Error deleting ${category}:`, err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-rose-100 text-rose-800 rounded-xl">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800">Modul Bimbingan Konseling (BK) & Catatan Rahasia</h1>
            <p className="text-xs text-slate-500">
              Absensi BK, Prestasi, Pelanggaran & Kasus, Tracing Study, Rencana Studi Lanjut, Bimbingan Karir, Konseling Rahasia
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {activeTab === 'konseling' && isPrivileged && (
            <button
              onClick={() => handleOpenModal('add_catatan')}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>+ Catatan Konseling Rahasia</span>
            </button>
          )}
          {activeTab === 'pelanggaran' && isPrivileged && (
            <button
              onClick={() => handleOpenModal('add_pelanggaran')}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>+ Catat Pelanggaran / Kasus</span>
            </button>
          )}
          {activeTab === 'prestasi' && (
            <button
              onClick={() => handleOpenModal('add_prestasi')}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>+ Catat Prestasi Siswa</span>
            </button>
          )}
          {activeTab === 'studi_lanjut' && (
            <button
              onClick={() => handleOpenModal('add_studi')}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>+ Input Tracing & Studi Lanjut</span>
            </button>
          )}
          {activeTab === 'absensi' && (
            <button
              onClick={() => handleOpenModal('add_absensi')}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>+ Catat Absensi Khusus BK</span>
            </button>
          )}
        </div>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Privacy Notice Banner */}
      <div className={`p-3.5 rounded-xl border text-xs flex items-start space-x-3 ${
        isPrivileged ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'
      }`}>
        {isPrivileged ? (
          <Unlock className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        ) : (
          <Lock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        )}
        <div>
          <strong className="block font-bold">
            {isPrivileged 
              ? 'Akses Spesial Terbuka (Guru BK / Kepala Sekolah / Waka Kesiswaan)' 
              : 'Proteksi Kerahasiaan Rekam Konseling (Guru / Wali Kelas)'}
          </strong>
          <span className="text-[11px] leading-relaxed block mt-0.5">
            {isPrivileged
              ? 'Anda memiliki hak akses penuh untuk membaca dan mencatat Detail Konseling Rahasia, Kasus Siswa, dan Catatan Rujukan BK.'
              : 'Data konseling bersifat RAHASIA — Akses detail catatan konseling dibatasi hanya untuk BK, Kepala Sekolah, dan Waka Kesiswaan. Wali Kelas / Guru melihat status umum (misal: "Sedang ditangani BK").'}
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-1.5 flex flex-wrap gap-1">
        <button
          onClick={() => setActiveTab('absensi')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'absensi' ? 'bg-rose-700 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>1. Absensi Siswa BK</span>
        </button>

        <button
          onClick={() => setActiveTab('konseling')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'konseling' ? 'bg-rose-700 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          <span>2. Bimbingan Konseling & Catatan Rahasia</span>
        </button>

        <button
          onClick={() => setActiveTab('pelanggaran')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'pelanggaran' ? 'bg-rose-700 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>3. Pelanggaran & Kelola Kasus</span>
        </button>

        <button
          onClick={() => setActiveTab('prestasi')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'prestasi' ? 'bg-rose-700 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>4. Prestasi Siswa</span>
        </button>

        <button
          onClick={() => setActiveTab('studi_lanjut')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'studi_lanjut' ? 'bg-rose-700 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>5. Tracing Study & Bimbingan Karir</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        {loading ? (
          <div className="text-center py-10 text-slate-500 text-xs">Memuat data Bimbingan Konseling...</div>
        ) : (
          <>
            {/* TAB 1: ABSENSI SISWA BK */}
            {activeTab === 'absensi' && (
              <div className="space-y-4">
                {absensiList.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300 p-6 space-y-3">
                    <CalendarCheck className="w-10 h-10 text-slate-400 mx-auto" />
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-slate-700">Belum Ada Rekap Absensi Khusus BK</h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Data rekap absensi temuan BK (seperti membolos atau alpa) belum ada. Klik tombol di bawah untuk mencatat data baru secara manual.
                      </p>
                    </div>
                    <button
                      onClick={() => handleOpenModal('add_absensi')}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Catat Absensi Khusus BK</span>
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                          <th className="px-4 py-2.5">#</th>
                          <th className="px-4 py-2.5">Nama Siswa & NIS</th>
                          <th className="px-4 py-2.5">Kelas</th>
                          <th className="px-4 py-2.5">Tanggal</th>
                          <th className="px-4 py-2.5 text-center">Status Absensi</th>
                          <th className="px-4 py-2.5">Keterangan Khusus BK</th>
                          <th className="px-4 py-2.5 text-center">Aksi (CRUD)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {absensiList.map((a, idx) => (
                          <tr key={a.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-semibold text-slate-500">{idx + 1}</td>
                            <td className="px-4 py-3">
                              <span className="font-bold text-slate-800 block">{a.nama_siswa}</span>
                              <span className="font-mono text-slate-500 text-[11px]">{a.nis}</span>
                            </td>
                            <td className="px-4 py-3 font-semibold text-slate-700">{a.kelas || '-'}</td>
                            <td className="px-4 py-3 font-mono text-slate-600">{a.tanggal}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                a.status_absensi === 'Membolos' ? 'bg-rose-100 text-rose-800' :
                                a.status_absensi === 'Alpa' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {a.status_absensi}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-700">{a.keterangan || '-'}</td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center space-x-1">
                                <button
                                  onClick={() => handleOpenModal('add_absensi', a)}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  title="Edit Absensi"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteItem('absensi', a.id)}
                                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                  title="Hapus Absensi"
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

            {/* TAB 2: BIMBINGAN KONSELING & CATATAN RAHASIA */}
            {activeTab === 'konseling' && (
              <div className="space-y-4">
                {catatanList.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300 p-6 space-y-3">
                    <HeartHandshake className="w-10 h-10 text-slate-400 mx-auto" />
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-slate-700">Belum Ada Catatan Konseling Rahasia</h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Belum ada catatan konseling pribadi yang dimasukkan. Pihak BK dapat menambahkan rekam konseling baru secara mandiri.
                      </p>
                    </div>
                    {isPrivileged && (
                      <button
                        onClick={() => handleOpenModal('add_catatan')}
                        className="inline-flex items-center space-x-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>+ Catatan Konseling Rahasia</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                          <th className="px-4 py-2.5">#</th>
                          <th className="px-4 py-2.5">Nama Siswa & Kelas</th>
                          <th className="px-4 py-2.5">Judul Konseling</th>
                          <th className="px-4 py-2.5">Detail Catatan Konseling (Rahasia)</th>
                          <th className="px-4 py-2.5 text-center">Status Publik (Wali Kelas)</th>
                          <th className="px-4 py-2.5">Ditangani Oleh</th>
                          <th className="px-4 py-2.5 text-center">Aksi (CRUD)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {catatanList.map((c, idx) => {
                          const isMasked = c.catatan_rahasia?.includes('[DETAIL CATATAN RAHASIA');
                          return (
                            <tr key={c.id} className="hover:bg-slate-50">
                              <td className="px-4 py-3 font-semibold text-slate-500">{idx + 1}</td>
                              <td className="px-4 py-3">
                                <span className="font-bold text-slate-800 block">{c.nama_siswa}</span>
                                <span className="text-slate-500 text-[11px]">Kelas: {c.kelas || '-'} | NIS: {c.nis}</span>
                              </td>
                              <td className="px-4 py-3 font-semibold text-slate-800">{c.judul}</td>
                              <td className="px-4 py-3">
                                {isMasked ? (
                                  <div className="flex items-center space-x-1.5 text-amber-800 bg-amber-50 p-2 rounded border border-amber-200 text-[11px]">
                                    <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                                    <span>{c.catatan_rahasia}</span>
                                  </div>
                                ) : (
                                  <div className="text-slate-700 leading-relaxed bg-emerald-50/60 p-2 rounded border border-emerald-100">
                                    {c.catatan_rahasia}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                                  {c.status_publik || 'Sedang ditangani BK'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-slate-600 font-medium">{c.ditangani_oleh}</td>
                              <td className="px-4 py-3 text-center">
                                {isPrivileged && (
                                  <div className="flex items-center justify-center space-x-1">
                                    <button
                                      onClick={() => handleOpenModal('add_catatan', c)}
                                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                      title="Edit Catatan"
                                    >
                                      <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteItem('catatan', c.id)}
                                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                      title="Hapus Catatan"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: PELANGGARAN & KELOLA KASUS */}
            {activeTab === 'pelanggaran' && (
              <div className="space-y-4">
                {pelanggaranList.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300 p-6 space-y-3">
                    <ShieldAlert className="w-10 h-10 text-slate-400 mx-auto" />
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-slate-700">Belum Ada Rekam Pelanggaran / Kasus</h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Belum ada kasus pelanggaran siswa yang dicatat.
                      </p>
                    </div>
                    {isPrivileged && (
                      <button
                        onClick={() => handleOpenModal('add_pelanggaran')}
                        className="inline-flex items-center space-x-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>+ Catat Pelanggaran / Kasus</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                          <th className="px-4 py-2.5">#</th>
                          <th className="px-4 py-2.5">Nama Siswa</th>
                          <th className="px-4 py-2.5">Jenis Pelanggaran</th>
                          <th className="px-4 py-2.5 text-center">Bobot / Poin</th>
                          <th className="px-4 py-2.5 text-center">Status Kasus</th>
                          <th className="px-4 py-2.5">Tindakan Penanganan</th>
                          <th className="px-4 py-2.5">Detail Kasus (Rahasia)</th>
                          <th className="px-4 py-2.5 text-center">Aksi (CRUD)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {pelanggaranList.map((p, idx) => {
                          const isMasked = p.catatan_rahasia?.includes('[DETAIL KASUS RAHASIA');
                          return (
                            <tr key={p.id} className="hover:bg-slate-50">
                              <td className="px-4 py-3 font-semibold text-slate-500">{idx + 1}</td>
                              <td className="px-4 py-3">
                                <span className="font-bold text-slate-800 block">{p.nama_siswa}</span>
                                <span className="text-slate-500 text-[11px]">{p.kelas}</span>
                              </td>
                              <td className="px-4 py-3 font-semibold text-slate-800">{p.jenis_pelanggaran}</td>
                              <td className="px-4 py-3 text-center">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  p.kategori_bobot === 'Berat' ? 'bg-rose-100 text-rose-800' :
                                  p.kategori_bobot === 'Sedang' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                                }`}>
                                  {p.kategori_bobot} (+{p.poin} Poin)
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                                  {p.status_kasus}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-slate-700">{p.tindakan_penanganan || '-'}</td>
                              <td className="px-4 py-3">
                                {isMasked ? (
                                  <div className="flex items-center space-x-1 text-amber-800 bg-amber-50 p-1.5 rounded border border-amber-200 text-[10px]">
                                    <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                    <span>{p.catatan_rahasia}</span>
                                  </div>
                                ) : (
                                  <div className="text-slate-700 text-[11px] bg-slate-50 p-1.5 rounded border border-slate-200">
                                    {p.catatan_rahasia}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {isPrivileged && (
                                  <div className="flex items-center justify-center space-x-1">
                                    <button
                                      onClick={() => handleOpenModal('add_pelanggaran', p)}
                                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                      title="Edit Pelanggaran"
                                    >
                                      <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteItem('pelanggaran', p.id)}
                                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                      title="Hapus Pelanggaran"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: PRESTASI SISWA */}
            {activeTab === 'prestasi' && (
              <div className="space-y-4">
                {prestasiList.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300 p-6 space-y-3">
                    <Award className="w-10 h-10 text-slate-400 mx-auto" />
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-slate-700">Belum Ada Rekam Prestasi Siswa</h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Belum ada pencapaian atau kejuaraan siswa yang dimasukkan.
                      </p>
                    </div>
                    <button
                      onClick={() => handleOpenModal('add_prestasi')}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Catat Prestasi Siswa</span>
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                          <th className="px-4 py-2.5">#</th>
                          <th className="px-4 py-2.5">Nama Siswa</th>
                          <th className="px-4 py-2.5">Nama Prestasi & Kejuaraan</th>
                          <th className="px-4 py-2.5 text-center">Tingkat</th>
                          <th className="px-4 py-2.5 text-center">Peringkat</th>
                          <th className="px-4 py-2.5">Penyelenggara & Catatan</th>
                          <th className="px-4 py-2.5 text-center">Aksi (CRUD)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {prestasiList.map((pr, idx) => (
                          <tr key={pr.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-semibold text-slate-500">{idx + 1}</td>
                            <td className="px-4 py-3">
                              <span className="font-bold text-slate-800 block">{pr.nama_siswa}</span>
                              <span className="text-slate-500 text-[11px]">{pr.kelas}</span>
                            </td>
                            <td className="px-4 py-3 font-bold text-emerald-800">{pr.nama_prestasi}</td>
                            <td className="px-4 py-3 text-center">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                                {pr.tingkat}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center font-bold text-amber-700">{pr.peringkat}</td>
                            <td className="px-4 py-3 text-slate-700">
                              <div>{pr.penyelenggara}</div>
                              {pr.catatan && <div className="text-[10px] text-slate-500">{pr.catatan}</div>}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center space-x-1">
                                <button
                                  onClick={() => handleOpenModal('add_prestasi', pr)}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  title="Edit Prestasi"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteItem('prestasi', pr.id)}
                                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                  title="Hapus Prestasi"
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

            {/* TAB 5: TRACING STUDY & BIMBINGAN KARIR */}
            {activeTab === 'studi_lanjut' && (
              <div className="space-y-4">
                {studiList.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300 p-6 space-y-3">
                    <GraduationCap className="w-10 h-10 text-slate-400 mx-auto" />
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-slate-700">Belum Ada Tracing Study & Karir</h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Belum ada data pilihan kuliah / kerja / pesantren alumni dan siswa.
                      </p>
                    </div>
                    <button
                      onClick={() => handleOpenModal('add_studi')}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Input Tracing & Studi Lanjut</span>
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                          <th className="px-4 py-2.5">#</th>
                          <th className="px-4 py-2.5">Nama Siswa / Alumni</th>
                          <th className="px-4 py-2.5">Pilihan Karir / Studi</th>
                          <th className="px-4 py-2.5">Target Univ / Perusahaan</th>
                          <th className="px-4 py-2.5">Jurusan Diminati</th>
                          <th className="px-4 py-2.5 text-center">Status Tracing</th>
                          <th className="px-4 py-2.5">Catatan Bimbingan Karir</th>
                          <th className="px-4 py-2.5 text-center">Aksi (CRUD)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {studiList.map((st, idx) => (
                          <tr key={st.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-semibold text-slate-500">{idx + 1}</td>
                            <td className="px-4 py-3">
                              <span className="font-bold text-slate-800 block">{st.nama_siswa}</span>
                              <span className="text-slate-500 text-[11px]">Tahun Lulus: {st.tahun_lulus}</span>
                            </td>
                            <td className="px-4 py-3 font-semibold text-indigo-900">{st.pilihan_karir}</td>
                            <td className="px-4 py-3 font-bold text-slate-800">{st.target_universitas_perusahaan || '-'}</td>
                            <td className="px-4 py-3 text-slate-700">{st.jurusan_diminati || '-'}</td>
                            <td className="px-4 py-3 text-center">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                {st.status_tracing}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-600">{st.catatan_bimbingan_karir || '-'}</td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center space-x-1">
                                <button
                                  onClick={() => handleOpenModal('add_studi', st)}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  title="Edit Tracing"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteItem('studi-lanjut', st.id)}
                                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                  title="Hapus Tracing"
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
              {modalType === 'add_catatan' && 'Tambah Catatan Konseling Rahasia'}
              {modalType === 'add_pelanggaran' && 'Catat Pelanggaran / Kasus Siswa'}
              {modalType === 'add_prestasi' && 'Input Prestasi Siswa'}
              {modalType === 'add_studi' && 'Input Tracing Study & Bimbingan Karir'}
              {modalType === 'add_absensi' && 'Catat Rekap Absensi Khusus BK'}
            </h2>

            <form onSubmit={handleFormSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilih Siswa</label>
                <select
                  required
                  value={formData.siswa_id || ''}
                  onChange={(e) => setFormData({ ...formData, siswa_id: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-rose-500"
                >
                  <option value="">-- Pilih Siswa --</option>
                  {siswaList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nama} {s.kelas ? `(${s.kelas})` : ''} - NIS: {s.nis}
                    </option>
                  ))}
                </select>
              </div>

              {modalType === 'add_catatan' && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Judul Konseling</label>
                    <input
                      type="text"
                      required
                      placeholder="misal: Konseling Hambatan Belajar & Motivasi"
                      value={formData.judul || ''}
                      onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
                      <span>Catatan Rahasia Konseling</span>
                      <span className="text-[10px] text-rose-600 font-bold flex items-center">
                        <Lock className="w-3 h-3 mr-1" /> Terkunci untuk BK & Kepsek
                      </span>
                    </label>
                    <textarea
                      required
                      rows="3"
                      placeholder="Tuliskan isi percakapan & catatan rahasia..."
                      value={formData.catatan_rahasia || ''}
                      onChange={(e) => setFormData({ ...formData, catatan_rahasia: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                </>
              )}

              {modalType === 'add_pelanggaran' && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Jenis Pelanggaran</label>
                    <input
                      type="text"
                      required
                      placeholder="misal: Terlambat Masuk Sekolah / Membolos"
                      value={formData.jenis_pelanggaran || ''}
                      onChange={(e) => setFormData({ ...formData, jenis_pelanggaran: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Bobot Pelanggaran</label>
                      <select
                        value={formData.kategori_bobot || 'Ringan'}
                        onChange={(e) => setFormData({ ...formData, kategori_bobot: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-rose-500"
                      >
                        <option value="Ringan">Ringan (5-10 Poin)</option>
                        <option value="Sedang">Sedang (15-25 Poin)</option>
                        <option value="Berat">Berat (&gt;30 Poin)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Poin</label>
                      <input
                        type="number"
                        placeholder="10"
                        value={formData.poin || ''}
                        onChange={(e) => setFormData({ ...formData, poin: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-rose-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {modalType === 'add_prestasi' && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nama Prestasi & Kejuaraan</label>
                    <input
                      type="text"
                      required
                      placeholder="misal: Juara 1 KSN Biologi"
                      value={formData.nama_prestasi || ''}
                      onChange={(e) => setFormData({ ...formData, nama_prestasi: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Tingkat</label>
                      <select
                        value={formData.tingkat || 'Provinsi'}
                        onChange={(e) => setFormData({ ...formData, tingkat: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-rose-500"
                      >
                        <option value="Kota/Kabupaten">Kota / Kabupaten</option>
                        <option value="Provinsi">Provinsi</option>
                        <option value="Nasional">Nasional</option>
                        <option value="Internasional">Internasional</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Peringkat</label>
                      <input
                        type="text"
                        placeholder="Juara 1"
                        value={formData.peringkat || ''}
                        onChange={(e) => setFormData({ ...formData, peringkat: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-rose-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {modalType === 'add_studi' && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Pilihan Karir / Studi Lanjut</label>
                    <select
                      value={formData.pilihan_karir || 'Kuliah PTN'}
                      onChange={(e) => setFormData({ ...formData, pilihan_karir: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-rose-500"
                    >
                      <option value="Kuliah PTN">Kuliah Perguruan Tinggi Negeri (PTN)</option>
                      <option value="Kuliah PTS">Kuliah Perguruan Tinggi Swasta (PTS)</option>
                      <option value="Kerja / Magang">Bekerja / Magang</option>
                      <option value="Wirausaha">Wirausaha</option>
                      <option value="Pesantren">Lanjut Pesantren</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Target Universitas / Perusahaan</label>
                    <input
                      type="text"
                      placeholder="misal: Universitas Airlangga / ITS"
                      value={formData.target_universitas_perusahaan || ''}
                      onChange={(e) => setFormData({ ...formData, target_universitas_perusahaan: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                </>
              )}

              {modalType === 'add_absensi' && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Status Absensi</label>
                      <select
                        value={formData.status_absensi || 'Membolos'}
                        onChange={(e) => setFormData({ ...formData, status_absensi: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-rose-500"
                      >
                        <option value="Membolos">Membolos</option>
                        <option value="Alpa">Alpa</option>
                        <option value="Izin">Izin Tidak Masuk</option>
                        <option value="Sakit">Sakit</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Tanggal</label>
                      <input
                        type="date"
                        required
                        value={formData.tanggal || ''}
                        onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-rose-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Keterangan Temuan BK</label>
                    <input
                      type="text"
                      placeholder="misal: Membolos jam pelajaran ke-3 di kantin"
                      value={formData.keterangan || ''}
                      onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-rose-500"
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
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded font-semibold shadow"
                >
                  Simpan Data BK
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BKPage;
