import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { BookOpen, Plus, Edit, Trash2, Search, AlertCircle, X } from 'lucide-react';

const AdminMapelPage = () => {
  const [mapel, setMapel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    kode: '',
    nama_mapel: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchMapel();
  }, [searchTerm]);

  const fetchMapel = async () => {
    setLoading(true);
    try {
      const res = await client.get('/admin/mapel', { params: { search: searchTerm } });
      setMapel(res.data.mapel || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item = null) => {
    setErrorMsg('');
    if (item) {
      setEditingId(item.id);
      setFormData({
        kode: item.kode,
        nama_mapel: item.nama_mapel,
      });
    } else {
      setEditingId(null);
      setFormData({
        kode: '',
        nama_mapel: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      if (editingId) {
        await client.put(`/admin/mapel/${editingId}`, formData);
      } else {
        await client.post('/admin/mapel', formData);
      }
      handleCloseModal();
      fetchMapel();
    } catch (e) {
      setErrorMsg(e.response?.data?.message || 'Gagal menyimpan data mata pelajaran.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, nama) => {
    if (window.confirm(`Yakin ingin menghapus mata pelajaran ${nama}? Seluruh jadwal yang menggunakan mapel ini mungkin akan bermasalah jika tidak ditangani.`)) {
      try {
        await client.delete(`/admin/mapel/${id}`);
        fetchMapel();
      } catch (e) {
        alert('Gagal menghapus mata pelajaran.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-emerald-700" />
            <span>Manajemen Mata Pelajaran</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola daftar mata pelajaran resmi SMA KH. A. Wahid Hasyim Tebuireng.
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <button
            onClick={() => handleOpenModal()}
            className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center space-x-2 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Mapel</span>
          </button>
        </div>
      </div>

      <div className="card-surface p-4">
        <div className="flex items-center space-x-2 mb-4 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kode atau nama mata pelajaran..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none focus:ring-0 text-sm w-full font-medium"
          />
        </div>

        {loading ? (
          <div className="text-center py-10 text-sm font-mono text-slate-500">Memuat Data...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[11px] border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">No</th>
                  <th className="py-3 px-4">Kode Mapel</th>
                  <th className="py-3 px-4 w-full">Nama Mata Pelajaran</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {mapel.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-500">Belum ada data mata pelajaran.</td>
                  </tr>
                ) : (
                  mapel.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 text-slate-500">{index + 1}</td>
                      <td className="py-3 px-4">
                        <span className="font-mono bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs border border-slate-200">
                          {item.kode}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">{item.nama_mapel}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleOpenModal(item)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.nama_mapel)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-lg">
                {editingId ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}
              </h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded border border-rose-200 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kode Mapel *</label>
                <input
                  type="text"
                  required
                  value={formData.kode}
                  onChange={(e) => setFormData({ ...formData, kode: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                  placeholder="Contoh: PAI"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Mata Pelajaran *</label>
                <input
                  type="text"
                  required
                  value={formData.nama_mapel}
                  onChange={(e) => setFormData({ ...formData, nama_mapel: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                  placeholder="Contoh: Pendidikan Agama Islam"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMapelPage;
