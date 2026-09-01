import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { Users, Plus, Search, Edit3, Trash2, CheckCircle, AlertCircle, RefreshCw, X, KeyRound } from 'lucide-react';

const DataGuru = () => {
  const [guruList, setGuruList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [message, setMessage] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingGuru, setEditingGuru] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    id_guru: '',
    nama_lengkap: '',
    pendidikan_terakhir: 'S1',
    no_hp: '',
    status_aktif: true,
  });

  // Delete State
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchGuru();
  }, [statusFilter]);

  const fetchGuru = async (searchQuery = search) => {
    setLoading(true);
    try {
      let params = [];
      if (searchQuery) params.push(`search=${encodeURIComponent(searchQuery)}`);
      if (statusFilter !== '') params.push(`status=${statusFilter}`);
      const queryStr = params.length > 0 ? `?${params.join('&')}` : '';

      const res = await client.get(`/admin/guru${queryStr}`);
      setGuruList(res.data.guru || []);
    } catch (e) {
      console.error(e);
      setMessage({ type: 'error', text: 'Gagal mengambil data guru.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchGuru(search);
  };

  const openAddModal = () => {
    setEditingGuru(null);
    setFormData({
      id_guru: '',
      nama_lengkap: '',
      pendidikan_terakhir: 'S1',
      no_hp: '',
      status_aktif: true,
    });
    setShowModal(true);
  };

  const openEditModal = (guru) => {
    setEditingGuru(guru);
    setFormData({
      id_guru: guru.id_guru,
      nama_lengkap: guru.nama_lengkap,
      pendidikan_terakhir: guru.pendidikan_terakhir || 'S1',
      no_hp: guru.no_hp || '',
      status_aktif: guru.status_aktif,
    });
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      if (editingGuru) {
        const res = await client.put(`/admin/guru/${editingGuru.id}`, formData);
        setMessage({ type: 'success', text: res.data.message });
      } else {
        const res = await client.post('/admin/guru', formData);
        setMessage({ type: 'success', text: res.data.message });
      }
      setShowModal(false);
      fetchGuru();
    } catch (e) {
      const errText = e.response?.data?.message || 'Gagal menyimpan data guru.';
      setMessage({ type: 'error', text: errText });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data guru ini beserta akun loginya?')) return;
    
    setDeletingId(id);
    setMessage(null);
    try {
      const res = await client.delete(`/admin/guru/${id}`);
      setMessage({ type: 'success', text: res.data.message });
      fetchGuru();
    } catch (e) {
      setMessage({ type: 'error', text: 'Gagal menghapus data guru.' });
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
            <span>Manajemen Master Data Guru & Tenaga Pendidik</span>
          </h1>
          <p className="text-xs text-slate-500">
            Pengelolaan NIK/ID Guru, Informasi Kontak, dan Pembuatan Otomatis Akun Login Guru
          </p>
        </div>

        <div className="mt-3 sm:mt-0 flex items-center space-x-2">
          <button
            onClick={openAddModal}
            className="bg-emerald-800 hover:bg-emerald-900 text-white px-3.5 py-2 rounded text-xs font-semibold shadow-sm transition-colors flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Data Guru</span>
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
              placeholder="Cari Nama, ID Guru, atau No HP..."
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
            <label className="text-xs font-medium text-slate-600">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded text-xs font-medium bg-white"
            >
              <option value="">Semua Status</option>
              <option value="true">Aktif</option>
              <option value="false">Non-Aktif</option>
            </select>
          </div>

          <button
            onClick={() => { setSearch(''); setStatusFilter(''); fetchGuru(''); }}
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
            <span>Memuat Data Guru...</span>
          </div>
        ) : guruList.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">Tidak ada data guru yang ditemukan.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">ID Guru</th>
                  <th className="py-3 px-4">Nama Lengkap</th>
                  <th className="py-3 px-4">Pendidikan</th>
                  <th className="py-3 px-4">No. HP / WA</th>
                  <th className="py-3 px-4">Akun Login System</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {guruList.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{g.id_guru}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{g.nama_lengkap}</td>
                    <td className="py-3 px-4 text-slate-600">{g.pendidikan_terakhir || '-'}</td>
                    <td className="py-3 px-4 font-mono text-slate-700">{g.no_hp || '-'}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center space-x-1 bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px] font-mono">
                        <KeyRound className="w-3 h-3 text-slate-500" />
                        <span>guru_{g.id_guru}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {g.status_aktif ? (
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
                          onClick={() => openEditModal(g)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
                          title="Edit Guru"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(g.id)}
                          disabled={deletingId === g.id}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded transition-colors"
                          title="Hapus Guru"
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
                {editingGuru ? 'Edit Data Guru' : 'Tambah Data Guru Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-emerald-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ID / NIK Guru <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={formData.id_guru}
                  onChange={(e) => setFormData({ ...formData, id_guru: e.target.value })}
                  placeholder="Contoh: 101, 102"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs font-mono focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap Guru <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama_lengkap}
                  onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                  placeholder="Contoh: Drs. H. Ahmad Dahlan, M.Pd"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Pendidikan Terakhir</label>
                  <select
                    value={formData.pendidikan_terakhir}
                    onChange={(e) => setFormData({ ...formData, pendidikan_terakhir: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-700"
                  >
                    <option value="S1">S1 / Sarjana</option>
                    <option value="S2">S2 / Magister</option>
                    <option value="S3">S3 / Doktor</option>
                    <option value="D3">D3 / Diploma</option>
                    <option value="SMA">SMA / Sederajat</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">No. HP / WhatsApp</label>
                  <input
                    type="text"
                    value={formData.no_hp}
                    onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
                    placeholder="08123456789"
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs font-mono focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="status_aktif"
                  checked={formData.status_aktif}
                  onChange={(e) => setFormData({ ...formData, status_aktif: e.target.checked })}
                  className="w-4 h-4 text-emerald-800 rounded border-slate-300 focus:ring-emerald-700"
                />
                <label htmlFor="status_aktif" className="text-xs font-semibold text-slate-700">
                  Status Guru Aktif Mengajar
                </label>
              </div>

              {!editingGuru && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded text-[11px] text-emerald-900 font-mono">
                  💡 Akun user login otomatis dibuat: <strong>guru_{formData.id_guru || 'ID'}</strong> (Password default: <code>guru123</code>).
                </div>
              )}

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
                  {submitting ? 'Menyimpan...' : editingGuru ? 'Simpan Perubahan' : 'Tambah Guru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataGuru;
