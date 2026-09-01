import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { Users, Plus, Search, Edit3, Trash2, CheckCircle, AlertCircle, RefreshCw, X, PhoneCall } from 'lucide-react';

const DataSiswa = () => {
  const [siswaList, setSiswaList] = useState([]);
  const [kelases, setKelases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedKelasFilter, setSelectedKelasFilter] = useState('');
  const [message, setMessage] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingSiswa, setEditingSiswa] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    nis: '',
    nama: '',
    jenis_kelamin: 'L',
    no_hp_ortu: '',
    kelas_id: '',
    status_aktif: true,
  });

  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchInitial();
  }, [selectedKelasFilter]);

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

  const openAddModal = () => {
    setEditingSiswa(null);
    setFormData({
      nis: '',
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
    if (!window.confirm('Apakah Anda yakin ingin menghapus data siswa ini?')) return;
    
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Users className="w-5 h-5 text-emerald-800" />
            <span>Manajemen Master Data Siswa / Peserta Didik</span>
          </h1>
          <p className="text-xs text-slate-500">
            Pengelolaan NIS, Rombel/Kelas, Kontak Orang Tua (Wali Santri), & Presensi Terintegrasi
          </p>
        </div>

        <div className="mt-3 sm:mt-0 flex items-center space-x-2">
          <button
            onClick={openAddModal}
            className="bg-emerald-800 hover:bg-emerald-900 text-white px-3.5 py-2 rounded text-xs font-semibold shadow-sm transition-colors flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Data Siswa</span>
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded border text-xs flex items-center justify-between ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          <div className="flex items-center space-x-2">
            {message.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="card-surface p-4 bg-slate-50 border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2 w-full md:w-auto flex-1">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Cari Nama, NIS, atau No HP Ortu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-700"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2" />
          </div>
          <button
            type="submit"
            className="bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5 rounded text-xs font-semibold shrink-0"
          >
            Cari
          </button>
        </form>

        <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
          <div className="flex items-center space-x-2">
            <label className="text-xs font-medium text-slate-600">Kelas:</label>
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
            className="p-1.5 border border-slate-300 rounded hover:bg-slate-100 text-slate-600"
            title="Reset Filter"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card-surface overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs font-mono text-slate-500 flex items-center justify-center space-x-2">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-700" />
            <span>Memuat Data Siswa...</span>
          </div>
        ) : siswaList.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">Tidak ada data siswa yang ditemukan.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">NIS</th>
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-4 text-center">L/P</th>
                  <th className="py-3 px-4">Kelas</th>
                  <th className="py-3 px-4">No. HP Orang Tua / Wali</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {siswaList.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{s.nis}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{s.nama}</td>
                    <td className="py-3 px-4 text-center font-mono">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        s.jenis_kelamin === 'L' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                      }`}>
                        {s.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded text-[11px] font-mono">
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
                        <button
                          onClick={() => openEditModal(s)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
                          title="Edit Siswa"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          disabled={deletingId === s.id}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded transition-colors"
                          title="Hapus Siswa"
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

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="px-5 py-4 bg-emerald-800 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold tracking-tight">
                {editingSiswa ? 'Edit Data Siswa' : 'Tambah Data Siswa Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-emerald-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  NIS (Nomor Induk Siswa) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.nis}
                  onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                  placeholder="Contoh: 20260001"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs font-mono focus:ring-1 focus:ring-emerald-700"
                />
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
                  placeholder="Contoh: Ahmad Maulana"
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
                    Kelas <span className="text-rose-500">*</span>
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
                  No. HP / WA Orang Tua (Wali Santri)
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
    </div>
  );
};

export default DataSiswa;
