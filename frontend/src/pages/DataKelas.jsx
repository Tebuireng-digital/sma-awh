import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { School, Plus, Edit3, Trash2, CheckCircle, AlertCircle, RefreshCw, X, UserCheck } from 'lucide-react';

const DataKelas = () => {
  const [kelases, setKelases] = useState([]);
  const [guruList, setGuruList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingKelas, setEditingKelas] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    nama_kelas: '',
    tingkat: 'X',
    id_guru_wali: '',
  });

  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resKelas, resGuru] = await Promise.all([
        client.get('/admin/kelas'),
        client.get('/admin/guru?status=true'),
      ]);
      setKelases(resKelas.data.kelas || []);
      setGuruList(resGuru.data.guru || []);
    } catch (e) {
      console.error(e);
      setMessage({ type: 'error', text: 'Gagal mengambil data kelas.' });
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingKelas(null);
    setFormData({
      nama_kelas: '',
      tingkat: 'X',
      id_guru_wali: '',
    });
    setShowModal(true);
  };

  const openEditModal = (k) => {
    setEditingKelas(k);
    setFormData({
      nama_kelas: k.nama_kelas,
      tingkat: k.tingkat,
      id_guru_wali: k.id_guru_wali || '',
    });
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      if (editingKelas) {
        const res = await client.put(`/admin/kelas/${editingKelas.id}`, formData);
        setMessage({ type: 'success', text: res.data.message });
      } else {
        const res = await client.post('/admin/kelas', formData);
        setMessage({ type: 'success', text: res.data.message });
      }
      setShowModal(false);
      fetchData();
    } catch (e) {
      const errText = e.response?.data?.message || 'Gagal menyimpan data kelas.';
      setMessage({ type: 'error', text: errText });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus kelas ini? Data hubungan siswa di kelas ini juga akan terpengaruh.')) return;
    
    setDeletingId(id);
    setMessage(null);
    try {
      const res = await client.delete(`/admin/kelas/${id}`);
      setMessage({ type: 'success', text: res.data.message });
      fetchData();
    } catch (e) {
      setMessage({ type: 'error', text: 'Gagal menghapus data kelas.' });
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
            <School className="w-5 h-5 text-emerald-800" />
            <span>Manajemen Data Kelas & Wali Kelas</span>
          </h1>
          <p className="text-xs text-slate-500">
            Pengelolaan Rombongan Belajar (Rombel), Penugasan Wali Kelas, dan Rekap Jumlah Siswa
          </p>
        </div>

        <div className="mt-3 sm:mt-0 flex items-center space-x-2">
          <button
            onClick={openAddModal}
            className="bg-emerald-800 hover:bg-emerald-900 text-white px-3.5 py-2 rounded text-xs font-semibold shadow-sm transition-colors flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kelas Baru</span>
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

      {/* Table */}
      <div className="card-surface overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs font-mono text-slate-500 flex items-center justify-center space-x-2">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-700" />
            <span>Memuat Data Kelas...</span>
          </div>
        ) : kelases.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">Belum ada data kelas.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Nama Kelas</th>
                  <th className="py-3 px-4">Tingkat</th>
                  <th className="py-3 px-4">Wali Kelas</th>
                  <th className="py-3 px-4">Kontak Wali Kelas</th>
                  <th className="py-3 px-4 text-center">Jumlah Siswa</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {kelases.map((k) => (
                  <tr key={k.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 font-mono text-sm">{k.nama_kelas}</td>
                    <td className="py-3 px-4">
                      <span className="bg-slate-100 text-slate-800 text-[11px] px-2 py-0.5 rounded font-semibold font-mono">
                        Kelas {k.tingkat}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {k.wali_kelas ? (
                        <div className="flex items-center space-x-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{k.wali_kelas}</span>
                        </div>
                      ) : (
                        <span className="text-amber-700 italic text-[11px]">Belum Ditentukan</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{k.no_hp_wali || '-'}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold text-xs font-mono">
                        {k.jumlah_siswa} Siswa
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => openEditModal(k)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
                          title="Edit Kelas"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(k.id)}
                          disabled={deletingId === k.id}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded transition-colors"
                          title="Hapus Kelas"
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
                {editingKelas ? 'Edit Data Kelas' : 'Tambah Data Kelas Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-emerald-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Kelas <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama_kelas}
                  onChange={(e) => setFormData({ ...formData, nama_kelas: e.target.value })}
                  placeholder="Contoh: X.1, XI.3, XII.8"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs font-mono focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tingkat <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.tingkat}
                  onChange={(e) => setFormData({ ...formData, tingkat: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs font-semibold focus:ring-1 focus:ring-emerald-700"
                >
                  <option value="X">Tingkat X (Sepuluh)</option>
                  <option value="XI">Tingkat XI (Sebelas)</option>
                  <option value="XII">Tingkat XII (Dua Belas)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Wali Kelas
                </label>
                <select
                  value={formData.id_guru_wali}
                  onChange={(e) => setFormData({ ...formData, id_guru_wali: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-700"
                >
                  <option value="">-- Tanpa Wali Kelas --</option>
                  {guruList.map((g) => (
                    <option key={g.id} value={g.id_guru}>
                      {g.nama_lengkap} (ID: {g.id_guru})
                    </option>
                  ))}
                </select>
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
                  {submitting ? 'Menyimpan...' : editingKelas ? 'Simpan Perubahan' : 'Tambah Kelas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataKelas;
