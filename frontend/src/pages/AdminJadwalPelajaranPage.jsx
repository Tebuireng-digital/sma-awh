import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { Calendar, Plus, Edit, Trash2, Search, AlertCircle, X, Clock, MapPin, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

const AdminJadwalPelajaranPage = () => {
  const [jadwal, setJadwal] = useState([]);
  const [kelas, setKelas] = useState([]);
  const [mapel, setMapel] = useState([]);
  const [guru, setGuru] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [selectedHari, setSelectedHari] = useState('Senin');
  const [selectedKelasFilter, setSelectedKelasFilter] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    kelas_id: '',
    mapel_id: '',
    id_guru: '',
    hari: 'Senin',
    jam_ke: 1,
    jam_mulai: '07:00',
    jam_selesai: '07:45',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const hariList = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  useEffect(() => {
    fetchMasterData();
  }, []);

  useEffect(() => {
    fetchJadwal();
  }, [selectedHari, selectedKelasFilter]);

  const fetchMasterData = async () => {
    try {
      const [resKelas, resMapel, resGuru] = await Promise.all([
        client.get('/master/kelas'),
        client.get('/admin/mapel'),
        client.get('/admin/guru')
      ]);
      setKelas(resKelas.data.kelas || []);
      setMapel(resMapel.data.mapel || []);
      setGuru(resGuru.data.guru || []);
      
      if (resKelas.data.kelas && resKelas.data.kelas.length > 0) {
        // Biarkan kosong ('') untuk menampilkan 'Semua Kelas' secara default
        setSelectedKelasFilter('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchJadwal = async () => {
    setLoading(true);
    try {
      const res = await client.get('/admin/jadwal', { 
        params: { 
          hari: selectedHari,
          kelas_id: selectedKelasFilter
        } 
      });
      setJadwal(res.data.jadwal || []);
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
        kelas_id: item.kelas_id,
        mapel_id: item.mapel_id,
        id_guru: item.id_guru,
        hari: item.hari,
        jam_ke: item.jam_ke,
        jam_mulai: item.jam_mulai.substring(0, 5),
        jam_selesai: item.jam_selesai.substring(0, 5),
      });
    } else {
      setEditingId(null);
      setFormData({
        kelas_id: selectedKelasFilter,
        mapel_id: mapel.length > 0 ? mapel[0].id : '',
        id_guru: guru.length > 0 ? guru[0].id_guru : '',
        hari: selectedHari,
        jam_ke: 1,
        jam_mulai: '07:00',
        jam_selesai: '07:45',
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
        await client.put(`/admin/jadwal/${editingId}`, formData);
      } else {
        await client.post('/admin/jadwal', formData);
      }
      handleCloseModal();
      fetchJadwal();
    } catch (e) {
      setErrorMsg(e.response?.data?.message || 'Gagal menyimpan jadwal.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, jam_ke, mapel_nama) => {
    if (window.confirm(`Yakin ingin menghapus jadwal jam ke-${jam_ke} (${mapel_nama})?`)) {
      try {
        await client.delete(`/admin/jadwal/${id}`);
        fetchJadwal();
      } catch (e) {
        alert('Gagal menghapus jadwal.');
      }
    }
  };

  const handleDownloadExcel = async () => {
    try {
      const response = await client.get('/admin/jadwal/export', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Jadwal_Pelajaran_AWH.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(error);
      alert('Gagal mendownload jadwal Excel dari server.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Calendar className="w-6 h-6 text-emerald-700" />
            <span>Manajemen Jadwal Mengajar</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Atur matriks jadwal mengajar guru per kelas dan hari secara dinamis.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <button
            onClick={handleDownloadExcel}
            className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold flex items-center space-x-2 shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download Jadwal</span>
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center space-x-2 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Jadwal</span>
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card-surface p-4 border border-slate-200">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pilih Hari</label>
          <div className="flex flex-wrap gap-2">
            {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Ahad'].map(h => (
              <button
                key={h}
                onClick={() => setSelectedHari(h)}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                  selectedHari === h 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {h}
              </button>
            ))}
          </div>
        </div>

        <div className="card-surface p-4 border border-slate-200">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pilih Kelas</label>
          <select
            value={selectedKelasFilter}
            onChange={(e) => setSelectedKelasFilter(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded text-sm font-bold focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
          >
            <option value="">Semua Kelas</option>
            {kelas.map(k => (
              <option key={k.id} value={k.id}>{k.nama_kelas} (Tingkat {k.tingkat})</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card-surface">
        {loading ? (
          <div className="text-center py-10 text-sm font-mono text-slate-500">Memuat Jadwal...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[11px] border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4 w-20 text-center">Jam Ke</th>
                  <th className="py-3 px-4 w-32">Waktu</th>
                  <th className="py-3 px-4 w-32">Kelas</th>
                  <th className="py-3 px-4">Mata Pelajaran</th>
                  <th className="py-3 px-4">Guru Pengajar</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {jadwal.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-500">
                      Belum ada jadwal untuk {selectedHari} di kelas ini.
                    </td>
                  </tr>
                ) : (
                  jadwal.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 text-center">
                        <span className="font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded text-xs">
                          {item.jam_ke}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-500">
                        {item.jam_mulai.substring(0, 5)} - {item.jam_selesai.substring(0, 5)}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">{item.nama_kelas}</td>
                      <td className="py-3 px-4 font-bold text-emerald-800">{item.nama_mapel}</td>
                      <td className="py-3 px-4 text-slate-700">{item.nama_guru}</td>
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
                            onClick={() => handleDelete(item.id, item.jam_ke, item.nama_mapel)}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden my-auto">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-lg">
                {editingId ? 'Edit Sesi Jadwal' : 'Tambah Sesi Jadwal'}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hari *</label>
                  <select
                    required
                    value={formData.hari}
                    onChange={(e) => setFormData({ ...formData, hari: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-emerald-600"
                  >
                    {hariList.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jam Ke- *</label>
                  <input
                    type="number"
                    min="1" max="15"
                    required
                    value={formData.jam_ke}
                    onChange={(e) => setFormData({ ...formData, jam_ke: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jam Mulai *</label>
                  <input
                    type="time"
                    required
                    value={formData.jam_mulai}
                    onChange={(e) => setFormData({ ...formData, jam_mulai: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-emerald-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jam Selesai *</label>
                  <input
                    type="time"
                    required
                    value={formData.jam_selesai}
                    onChange={(e) => setFormData({ ...formData, jam_selesai: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-emerald-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kelas *</label>
                <select
                  required
                  value={formData.kelas_id}
                  onChange={(e) => setFormData({ ...formData, kelas_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm font-bold focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="" disabled>-- Pilih Kelas --</option>
                  {kelas.map(k => <option key={k.id} value={k.id}>{k.nama_kelas}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mata Pelajaran *</label>
                <select
                  required
                  value={formData.mapel_id}
                  onChange={(e) => setFormData({ ...formData, mapel_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="" disabled>-- Pilih Mata Pelajaran --</option>
                  {mapel.map(m => <option key={m.id} value={m.id}>{m.kode} - {m.nama_mapel}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Guru Pengajar *</label>
                <select
                  required
                  value={formData.id_guru}
                  onChange={(e) => setFormData({ ...formData, id_guru: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm font-bold focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="" disabled>-- Pilih Guru Pengajar --</option>
                  {guru.map(g => <option key={g.id_guru} value={g.id_guru}>{g.nama_lengkap}</option>)}
                </select>
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

export default AdminJadwalPelajaranPage;
