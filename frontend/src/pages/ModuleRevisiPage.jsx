import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { 
  ShieldCheck, 
  BookOpen, 
  Package, 
  Mail, 
  Share2, 
  Library, 
  User, 
  CheckCircle, 
  Plus, 
  Lock, 
  FileText,
  Clock
} from 'lucide-react';

const ModuleRevisiPage = ({ type }) => {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchData();
  }, [type]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      if (type === 'kepegawaian') endpoint = '/kepegawaian/pengajuan';
      else if (type === 'bk') endpoint = '/bk/catatan';
      else if (type === 'sarana') endpoint = '/sarana/inventaris';
      else if (type === 'persuratan') endpoint = '/persuratan/surat';
      else if (type === 'humas') endpoint = '/humas/konten';
      else if (type === 'perpustakaan') endpoint = '/perpustakaan/buku';
      else if (type === 'portal-siswa') endpoint = '/rapor-sts/1';

      if (endpoint) {
        const res = await api.get(endpoint);
        if (res.data && res.data.data) {
          setDataList(Array.isArray(res.data.data) ? res.data.data : [res.data.data]);
        }
      }
    } catch (err) {
      console.error(`Error fetching ${type}:`, err);
    } finally {
      setLoading(false);
    }
  };

  const titles = {
    kepegawaian: { title: 'Kepegawaian & HRD', subtitle: 'Data Induk Pegawai & Alur Approval Berjenjang (K.TU -> Kepsek)', icon: ShieldCheck },
    bk: { title: 'Bimbingan Konseling (BK)', subtitle: 'Bimbingan Karir, Tracing Study & Catatan Konseling Rahasia', icon: BookOpen },
    sarana: { title: 'Sarana & Prasarana', subtitle: 'Inventaris Barang, Peminjaman IT Laptop & Approval Penghapusan Aset', icon: Package },
    persuratan: { title: 'Persuratan & Archiving', subtitle: 'Surat Masuk/Keluar, Penomoran Otomatis & Arsip Digital', icon: Mail },
    humas: { title: 'Humas & Branding', subtitle: 'Manajemen Website Sekolah, Sosmed & Alur Approval Post', icon: Share2 },
    perpustakaan: { title: 'Perpustakaan Digital', subtitle: 'Katalog Buku, Sirkulasi Peminjaman-Pengembalian & Denda', icon: Library },
    'portal-siswa': { title: 'Portal Self-Service Siswa / Wali', subtitle: 'Cek Nilai Rapor, Jadwal, Absensi & Status Perpustakaan', icon: User },
  };

  const curr = titles[type] || titles['kepegawaian'];
  const Icon = curr.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800">{curr.title}</h1>
            <p className="text-xs text-slate-500">{curr.subtitle}</p>
          </div>
        </div>

        {type !== 'portal-siswa' && (
          <button
            onClick={() => setFormOpen(!formOpen)}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Data</span>
          </button>
        )}
      </div>

      {msg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{msg}</span>
        </div>
      )}

      {/* Main Content Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        {loading ? (
          <div className="text-center py-8 text-slate-500 text-xs">Memuat data...</div>
        ) : (
          <div className="space-y-4">
            {type === 'bk' && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs flex items-center space-x-2 mb-4">
                <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Catatan Rahasia BK dibatasi aksesnya hanya untuk BK, Kepala Sekolah, dan Waka Kesiswaan.</span>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Deskripsi / Judul</th>
                    <th className="px-4 py-3">Kategori / Status</th>
                    <th className="px-4 py-3">Tanggal / Waktu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dataList.length > 0 ? (
                    dataList.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-500">{idx + 1}</td>
                        <td className="px-4 py-3 font-medium text-slate-800">
                          {item.nama_lengkap || item.judul || item.nama_barang || item.perihal || item.catatan_rahasia || 'Data Portal'}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {item.status || item.jenis || item.kategori || 'Aktif'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                          {item.tanggal || item.created_at || '2026-09-03'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-4 py-6 text-center text-slate-400">
                        Belum ada data tercatat.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleRevisiPage;
