import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Printer, Save, RefreshCw, FileText, CheckCircle } from 'lucide-react';

const RaporSTSPage = () => {
  const [siswaList, setSiswaList] = useState([]);
  const [selectedSiswaId, setSelectedSiswaId] = useState('');
  const [raporData, setRaporData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const userRole = localStorage.getItem('role') || 'admin';

  const mapel21 = [
    { key: 'nilai_pai', label: 'Pendidikan Agama Islam' },
    { key: 'nilai_ppkn', label: 'PPKN' },
    { key: 'nilai_indo', label: 'Bahasa Indonesia' },
    { key: 'nilai_mtk', label: 'Matematika' },
    { key: 'nilai_inggris', label: 'Bhs. Inggris' },
    { key: 'nilai_seni', label: 'Seni Budaya' },
    { key: 'nilai_penjas', label: 'Penjaskes' },
    { key: 'nilai_informa', label: 'Informatika' },
    { key: 'nilai_sejarah', label: 'Sejarah' },
    { key: 'nilai_biologi', label: 'IPA Biologi' },
    { key: 'nilai_fisika', label: 'Fisika' },
    { key: 'nilai_kimia', label: 'Kimia' },
    { key: 'nilai_geografi', label: 'IPS Geografi' },
    { key: 'nilai_sosiologi', label: 'Sosiologi' },
    { key: 'nilai_ekonomi', label: 'Ekonomi' },
    { key: 'nilai_pkwu', label: 'PKWU' },
    { key: 'nilai_alquran', label: 'Al-Quran' },
    { key: 'nilai_akhlaq', label: 'Akhlaq' },
    { key: 'nilai_fiqih', label: 'Fiqih' },
    { key: 'nilai_nahwu', label: 'Nahwu Shorof' },
    { key: 'nilai_aswaja', label: 'Aswaja' },
  ];

  useEffect(() => {
    fetchSiswa();
  }, []);

  const fetchSiswa = async () => {
    try {
      const res = await api.get('/admin/siswa');
      if (res.data && res.data.data) {
        setSiswaList(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedSiswaId(res.data.data[0].id);
          fetchRapor(res.data.data[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching siswa:', err);
    }
  };

  const fetchRapor = async (siswaId) => {
    setLoading(true);
    try {
      const res = await api.get(`/rapor-sts/${siswaId}`);
      if (res.data && res.data.data) {
        setRaporData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching rapor:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSiswaChange = (e) => {
    const id = e.target.value;
    setSelectedSiswaId(id);
    fetchRapor(id);
  };

  const handleGradeChange = (key, val) => {
    if (!raporData) return;
    const newNilai = parseInt(val) || 0;
    const updated = { ...raporData, [key]: newNilai };

    let sum = 0;
    mapel21.forEach((m) => {
      sum += parseInt(updated[m.key]) || 0;
    });

    updated.jumlah = sum;
    updated.rata_rata = (sum / 21).toFixed(2);
    setRaporData(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      await api.post('/rapor-sts', raporData);
      setMessage('Rapor STS berhasil disimpan!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error saving rapor:', err);
      setMessage('Gagal menyimpan Rapor.');
    } finally {
      setSaving(false);
    }
  };

  const handleAction = async (actionType) => {
    setSaving(true);
    setMessage('');
    try {
      let endpoint = '';
      if (actionType === 'submit') endpoint = `/rapor-sts/${selectedSiswaId}/submit`;
      else if (actionType === 'walikelas') endpoint = `/rapor-sts/${selectedSiswaId}/approve-walikelas`;
      else if (actionType === 'kepsek') endpoint = `/rapor-sts/${selectedSiswaId}/approve-kepsek`;
      else if (actionType === 'reset') endpoint = `/rapor-sts/${selectedSiswaId}/reset`;

      const payload = actionType === 'walikelas' ? { catatan_wali_kelas: raporData.catatan_wali_kelas } : {};
      await api.post(endpoint, payload);
      
      const labelMap = {
        submit: 'Kirim ke Wali Kelas',
        walikelas: 'Validasi Wali Kelas',
        kepsek: 'Approve Final Kepsek',
        reset: 'Reset ke Draft'
      };
      setMessage(`Berhasil: ${labelMap[actionType] || actionType}`);
      setTimeout(() => setMessage(''), 3000);
      fetchRapor(selectedSiswaId); // refresh data
    } catch (err) {
      console.error(`Error ${actionType}:`, err);
      setMessage(`Gagal melakukan aksi.`);
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = async () => {
    if (!selectedSiswaId) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/rapor-sts/${selectedSiswaId}/export`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Gagal mengunduh Excel');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Rapor_STS_${raporData?.nama_siswa || 'Siswa'}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      console.error('Error exporting excel:', err);
      setMessage('Gagal mengunduh Excel.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Header - Hidden when printing */}
      <div className="print:hidden bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800">Rapor STS</h1>
            <p className="text-xs text-slate-500">Format Resmi Template RAPOR STS X-1.docx</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedSiswaId}
            onChange={handleSiswaChange}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            {siswaList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nama} ({s.nis})
              </option>
            ))}
          </select>

          {/* Guru / Admin: Simpan (Draft) & Submit */}
          {(userRole === 'guru' || userRole === 'wali_kelas' || userRole === 'admin' || userRole === 'kurikulum') && raporData?.status_validasi === 'draft' && (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold border border-slate-300 transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Draft</span>
              </button>
              <button
                onClick={() => handleAction('submit')}
                disabled={saving}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow transition-colors"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Kirim ke Wali Kelas</span>
              </button>
            </>
          )}

          {/* Wali Kelas / Waka / Admin Role: Validasi */}
          {(userRole === 'wali_kelas' || userRole === 'waka' || userRole === 'admin') && raporData?.status_validasi === 'submitted_by_guru' && (
            <button
              onClick={() => handleAction('walikelas')}
              disabled={saving}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Validasi & TTD Wali Kelas</span>
            </button>
          )}

          {/* Kepsek / Admin Role: Approve Final */}
          {(userRole === 'kepala_sekolah' || userRole === 'waka' || userRole === 'admin') && raporData?.status_validasi === 'approved_by_walikelas' && (
            <button
              onClick={() => handleAction('kepsek')}
              disabled={saving}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Approve Final & TTD Kepsek</span>
            </button>
          )}

          {/* Admin / Kepsek Reset option */}
          {(userRole === 'admin' || userRole === 'kepala_sekolah' || userRole === 'waka') && raporData?.status_validasi !== 'draft' && (
            <button
              onClick={() => handleAction('reset')}
              disabled={saving}
              className="px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-medium transition-colors"
              title="Kembalikan ke status Draft"
            >
              Reset ke Draft
            </button>
          )}

          <button
            onClick={handleExportExcel}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Unduh Excel</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-semibold transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak PDF</span>
          </button>
        </div>
      </div>

      {/* Workflow Status Banner */}
      <div className="print:hidden bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2 text-xs font-medium">
          <span className="text-slate-500">Status Validasi Berjenjang:</span>
          {raporData?.status_validasi === 'draft' && (
            <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              Draft (Input Nilai Guru)
            </span>
          )}
          {raporData?.status_validasi === 'submitted_by_guru' && (
            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              Menunggu Validasi Wali Kelas
            </span>
          )}
          {raporData?.status_validasi === 'approved_by_walikelas' && (
            <span className="px-2.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-full font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
              Menunggu Approval Final Kepala Sekolah
            </span>
          )}
          {raporData?.status_validasi === 'approved_by_kepsek' && (
            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              Selesai / Approved Final (Locked)
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2 text-[11px] text-slate-400">
          <span className={raporData?.status_validasi === 'draft' ? 'text-emerald-700 font-bold underline' : 'text-slate-600'}>1. Guru Input</span>
          <span>&rarr;</span>
          <span className={raporData?.status_validasi === 'submitted_by_guru' ? 'text-blue-700 font-bold underline' : ['approved_by_walikelas', 'approved_by_kepsek'].includes(raporData?.status_validasi) ? 'text-slate-600' : ''}>2. Validasi Wali Kelas</span>
          <span>&rarr;</span>
          <span className={raporData?.status_validasi === 'approved_by_walikelas' ? 'text-purple-700 font-bold underline' : raporData?.status_validasi === 'approved_by_kepsek' ? 'text-emerald-700 font-bold' : ''}>3. Approve Kepsek</span>
        </div>
      </div>

      {message && (
        <div className="print:hidden p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {/* Rapor Sheet matching RAPOR STS X-1.docx */}
      {loading || !raporData ? (
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
          <p className="text-xs">Memuat Dokumen Rapor...</p>
        </div>
      ) : (
        <div className="bg-white p-8 border border-slate-300 shadow-md max-w-4xl mx-auto rounded-none print:shadow-none print:border-none print:p-0">
          {/* Header Document */}
          <div className="text-center border-b-2 border-black pb-4 mb-6">
            <h2 className="text-base font-bold tracking-wide uppercase">
              LAPORAN HASIL SUMATIF TENGAH SEMESTER
            </h2>
            <h3 className="text-sm font-bold text-emerald-900">
              SMA A. WAHID HASYIM TEBUIRENG
            </h3>
            <p className="text-xs font-medium">TAHUN PELAJARAN {raporData.tahun_ajaran || '2026/2027'}</p>
          </div>

          {/* Student Info Metadata */}
          <div className="grid grid-cols-2 gap-4 text-xs font-semibold mb-6">
            <div className="space-y-1">
              <div className="flex">
                <span className="w-28 text-slate-600">Nama Siswa/I</span>
                <span className="w-3">:</span>
                <span className="font-bold">{raporData.nama_siswa}</span>
              </div>
              <div className="flex">
                <span className="w-28 text-slate-600">No. Induk / NIS</span>
                <span className="w-3">:</span>
                <span>{raporData.no_induk}</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex">
                <span className="w-28 text-slate-600">Kelas</span>
                <span className="w-3">:</span>
                <span>{raporData.kelas || 'X.1'}</span>
              </div>
              <div className="flex">
                <span className="w-28 text-slate-600">Semester</span>
                <span className="w-3">:</span>
                <span>{raporData.semester || 'Ganjil'}</span>
              </div>
            </div>
          </div>

          {/* Table 21 Subjects */}
          <table className="w-full border-collapse border border-black text-xs">
            <thead>
              <tr className="bg-slate-100 text-center font-bold border-b border-black">
                <th className="border border-black px-2 py-1.5 w-10">No</th>
                <th className="border border-black px-3 py-1.5 text-left">Mata Pelajaran</th>
                <th className="border border-black px-3 py-1.5 w-28">Nilai Rapor</th>
                <th className="border border-black px-3 py-1.5 w-28">Nilai Ketuntasan</th>
              </tr>
            </thead>
            <tbody>
              {mapel21.map((m, idx) => (
                <tr key={m.key} className="border-b border-black hover:bg-slate-50">
                  <td className="border border-black px-2 py-1 text-center font-medium">{idx + 1}</td>
                  <td className="border border-black px-3 py-1 font-medium">{m.label}</td>
                  <td className="border border-black px-2 py-1 text-center">
                    {raporData.status_validasi === 'draft' && (userRole === 'guru' || userRole === 'wali_kelas' || userRole === 'admin' || userRole === 'kurikulum') ? (
                      <input
                        type="number"
                        value={raporData[m.key]}
                        onChange={(e) => handleGradeChange(m.key, e.target.value)}
                        className="w-16 text-center font-bold border border-slate-300 rounded px-1 py-0.5 print:border-none focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                      />
                    ) : (
                      <span className="font-bold block w-full text-center font-mono">{raporData[m.key]}</span>
                    )}
                  </td>
                  <td className="border border-black px-2 py-1 text-center font-semibold font-mono">
                    {raporData.kktp || 75}
                  </td>
                </tr>
              ))}

              {/* Total & Average Rows */}
              <tr className="bg-slate-50 font-bold border-t-2 border-black">
                <td colSpan="2" className="border border-black px-3 py-1.5 text-right uppercase">
                  JUMLAH
                </td>
                <td className="border border-black px-2 py-1.5 text-center text-sm font-bold text-emerald-900 font-mono">
                  {raporData.jumlah}
                </td>
                <td className="border border-black px-2 py-1.5 text-center">-</td>
              </tr>
              <tr className="bg-slate-50 font-bold">
                <td colSpan="2" className="border border-black px-3 py-1.5 text-right uppercase">
                  RATA-RATA
                </td>
                <td className="border border-black px-2 py-1.5 text-center text-sm font-bold text-emerald-900 font-mono">
                  {raporData.rata_rata}
                </td>
                <td className="border border-black px-2 py-1.5 text-center">-</td>
              </tr>
            </tbody>
          </table>

          {/* Teacher Catatan */}
          <div className="mt-4 p-3 border border-black text-xs">
            <span className="font-bold">Catatan Wali Kelas:</span>
            {raporData.status_validasi === 'submitted_by_guru' && (userRole === 'waka' || userRole === 'wali_kelas' || userRole === 'admin') ? (
              <textarea
                value={raporData.catatan_wali_kelas || ''}
                onChange={(e) => setRaporData({ ...raporData, catatan_wali_kelas: e.target.value })}
                className="w-full mt-1 p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows="2"
                placeholder="Tulis catatan di sini lalu klik 'Validasi & TTD Wali Kelas' di atas..."
              />
            ) : (
              <p className="italic text-slate-700 mt-1">
                "{raporData.catatan_wali_kelas || '-'}"
              </p>
            )}
          </div>

          {/* Signatures */}
          <div className="mt-8 grid grid-cols-2 gap-8 text-center text-xs font-semibold">
            <div>
              <p>Tebuireng, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="mt-1">Wali Kelas</p>
              <div className="h-16 flex items-center justify-center">
                {(raporData.status_validasi === 'approved_by_walikelas' || raporData.status_validasi === 'approved_by_kepsek') ? (
                  <div className="p-1.5 bg-emerald-50 border border-emerald-300 rounded text-[10px] text-center">
                    <span className="text-emerald-800 font-bold block">
                      Ditandatangani Digital
                    </span>
                    <span className="text-slate-500 font-mono text-[9px]">
                      {raporData.ttd_walikelas ? new Date(raporData.ttd_walikelas).toLocaleString('id-ID') : 'Verified'}
                    </span>
                  </div>
                ) : (
                  <span className="text-slate-400 text-[11px] italic">[ Belum divalidasi ]</span>
                )}
              </div>
              <p className="font-bold underline">
                {(raporData.status_validasi === 'approved_by_walikelas' || raporData.status_validasi === 'approved_by_kepsek') ? '( Wali Kelas )' : '...........................'}
              </p>
            </div>

            <div>
              <p>Mengetahui,</p>
              <p className="mt-1">Kepala Sekolah</p>
              <div className="h-16 flex items-center justify-center">
                {raporData.status_validasi === 'approved_by_kepsek' ? (
                  <div className="p-1.5 bg-indigo-50 border border-indigo-300 rounded text-[10px] text-center">
                    <span className="text-indigo-800 font-bold block">
                      Ditandatangani Digital
                    </span>
                    <span className="text-slate-500 font-mono text-[9px]">
                      {raporData.ttd_kepsek ? new Date(raporData.ttd_kepsek).toLocaleString('id-ID') : 'Verified'}
                    </span>
                  </div>
                ) : (
                  <span className="text-slate-400 text-[11px] italic">[ Belum disetujui ]</span>
                )}
              </div>
              <p className="font-bold underline">
                {raporData.status_validasi === 'approved_by_kepsek' ? 'Drs. H. Hari Winarto, MM.' : '...........................'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RaporSTSPage;
