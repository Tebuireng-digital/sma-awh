import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { 
  Printer, Save, CheckCircle2, ChevronLeft, ChevronRight, 
  Users, Award, Sparkles, BookOpen, AlertCircle, RefreshCw, FileText, Check, Clock,
  RotateCcw, Undo2, ShieldCheck, Calendar, Edit3, X, Archive, Download, AlertTriangle, ShieldAlert
} from 'lucide-react';
import RequestUnvalidationModal from '../components/RequestUnvalidationModal';
import UnvalidationQueueModal from '../components/UnvalidationQueueModal';

const WaliKelasRaporPage = () => {
  const { user, hasAnyRole } = useAuth();
  const isAdmin = hasAnyRole ? hasAnyRole(['admin', 'kepala_sekolah']) : (user?.role === 'admin' || user?.role === 'kepala_sekolah');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const [selectedKelasId, setSelectedKelasId] = useState('');
  const [daftarKelas, setDaftarKelas] = useState([]);
  const [kelasInfo, setKelasInfo] = useState(null);
  const [isWaliOfClass, setIsWaliOfClass] = useState(false);
  const [activeSemester, setActiveSemester] = useState('Ganjil');
  const [togglingSemester, setTogglingSemester] = useState(false);
  const [activeTahunAjaran, setActiveTahunAjaran] = useState('2026/2027');
  const [inputTahunAjaran, setInputTahunAjaran] = useState('2026/2027');
  const [savingTahun, setSavingTahun] = useState(false);
  const [daftarExtraMapel, setDaftarExtraMapel] = useState([]);

  // ZIP & PDF Download State
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [downloadingSinglePdf, setDownloadingSinglePdf] = useState(false);

  // Validation Audit Modals
  const [isSemesterModalOpen, setIsSemesterModalOpen] = useState(false);
  const [checkingSemesterValidation, setCheckingSemesterValidation] = useState(false);
  const [semesterValidationData, setSemesterValidationData] = useState(null);

  const [isEditTahunModalOpen, setIsEditTahunModalOpen] = useState(false);
  const [checkingYearValidation, setCheckingYearValidation] = useState(false);
  const [yearValidationData, setYearValidationData] = useState(null);

  const [students, setStudents] = useState([]);
  const [currentStudentIndex, setCurrentStudentIndex] = useState(0);
  const [summary, setSummary] = useState({ total_siswa: 0, total_divalidasi: 0, total_draft: 0, rata_rata_kelas: 0 });

  // Unvalidation Modals & Requests
  const [isRequestUnvalidateModalOpen, setIsRequestUnvalidateModalOpen] = useState(false);
  const [requestUnvalidateTarget, setRequestUnvalidateTarget] = useState(null);
  const [isQueueModalOpen, setIsQueueModalOpen] = useState(false);

  // Notes & Validation form for current student
  const [catatanText, setCatatanText] = useState('');

  const mapel21List = [
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

  const quickCatatanTemplates = [
    'Alhamdulillah nilai akademik sangat memuaskan dan berakhlak mulia. Pertahankan hafalan Al-Quran dan kedisiplinan di asrama pondok.',
    'Menunjukkan kemajuan belajar yang baik. Tingkatkan fokus pada mata pelajaran eksak serta keaktifan dalam diskusi kelas.',
    'Perilaku santri sangat santun dan disiplin. Diharapkan lebih tekun dalam mengulang pelajaran di luar jam wajib belajar.',
    'Tingkatkan kehadiran tepat waktu di madrasah dan asrama. Potensi akademik sangat baik jika lebih konsisten belajar mandiri.',
    'Alhamdulillah mencapai seluruh ketuntasan belajar. Terus berprestasi dan jadilah teladan bagi santri lainnya.'
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async (targetKelasId = null) => {
    setLoading(true);
    setMessage(null);
    try {
      const url = targetKelasId ? `/rapor-sts/walikelas-view?kelas_id=${targetKelasId}` : '/rapor-sts/walikelas-view';
      const res = await api.get(url);
      
      if (res.data?.status === 'success') {
        const data = res.data;
        setKelasInfo(data.kelas);
        setIsWaliOfClass(data.is_wali_of_this_class);
        setDaftarKelas(data.daftar_kelas || []);
        setSelectedKelasId(data.kelas?.id || '');
        setSummary(data.summary || {});
        setActiveSemester(data.semester || 'Ganjil');
        setActiveTahunAjaran(data.tahun_ajaran || '2026/2027');
        setInputTahunAjaran(data.tahun_ajaran || '2026/2027');
        setDaftarExtraMapel(data.daftar_extra_mapel || []);

        const studentList = data.students || [];
        setStudents(studentList);

        if (studentList.length > 0) {
          const defaultIdx = 0;
          setCurrentStudentIndex(defaultIdx);
          setCatatanText(studentList[defaultIdx].catatan_wali_kelas || '');
        } else {
          setCatatanText('');
        }
      }
    } catch (err) {
      console.error('Gagal memuat data rapor wali kelas:', err);
      setMessage({ type: 'error', text: 'Gagal memuat data rapor wali kelas.' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSemesterModal = async () => {
    setIsSemesterModalOpen(true);
    setCheckingSemesterValidation(true);
    setSemesterValidationData(null);
    try {
      const res = await api.get('/admin/rapor-validation-status', {
        params: {
          mode: 'semester',
          tahun_ajaran: activeTahunAjaran,
          semester: activeSemester,
        }
      });
      if (res.data?.status === 'success') {
        setSemesterValidationData(res.data.data);
      }
    } catch (err) {
      console.error('Gagal memeriksa validasi semester:', err);
    } finally {
      setCheckingSemesterValidation(false);
    }
  };

  const handleConfirmToggleSemester = async () => {
    if (togglingSemester) return;
    setTogglingSemester(true);
    setMessage(null);
    try {
      const res = await api.post('/admin/semester/toggle');
      if (res.data?.status === 'success') {
        const nextSem = res.data.semester;
        setActiveSemester(nextSem);
        setStudents((prev) => prev.map((s) => ({ ...s, semester: nextSem })));
        setIsSemesterModalOpen(false);
        setMessage({ type: 'success', text: `Semester berhasil diubah menjadi ${nextSem}` });
        if (selectedKelasId) fetchInitialData(selectedKelasId);
      }
    } catch (err) {
      console.error('Error toggle semester:', err);
      const errMsg = err.response?.data?.message || 'Gagal mengubah semester.';
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setTogglingSemester(false);
    }
  };

  const handleOpenYearModal = async () => {
    setInputTahunAjaran(activeTahunAjaran);
    setIsEditTahunModalOpen(true);
    setCheckingYearValidation(true);
    setYearValidationData(null);
    try {
      const res = await api.get('/admin/rapor-validation-status', {
        params: {
          mode: 'full_year',
          tahun_ajaran: activeTahunAjaran,
        }
      });
      if (res.data?.status === 'success') {
        setYearValidationData(res.data.data);
      }
    } catch (err) {
      console.error('Gagal memeriksa validasi tahun ajaran:', err);
    } finally {
      setCheckingYearValidation(false);
    }
  };

  const handleUpdateTahunAjaran = async (customVal = null) => {
    const valToSave = customVal || inputTahunAjaran;
    if (!valToSave || savingTahun) return;
    setSavingTahun(true);
    setMessage(null);
    try {
      const res = await api.post('/admin/tahun-ajaran', { tahun_ajaran: valToSave });
      if (res.data?.status === 'success') {
        const newTa = res.data.tahun_ajaran;
        setActiveTahunAjaran(newTa);
        setInputTahunAjaran(newTa);
        setStudents((prev) => prev.map((s) => ({ ...s, tahun_ajaran: newTa })));
        setIsEditTahunModalOpen(false);
        setMessage({ type: 'success', text: `Tahun pelajaran berhasil diubah menjadi ${newTa}` });
        if (selectedKelasId) fetchInitialData(selectedKelasId);
      }
    } catch (err) {
      console.error('Error updating tahun ajaran:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Gagal mengubah tahun pelajaran.' });
    } finally {
      setSavingTahun(false);
    }
  };

  const handleDownloadZipKelas = async () => {
    if (!selectedKelasId || downloadingZip) return;
    setDownloadingZip(true);
    setMessage(null);
    try {
      const res = await api.get('/rapor-sts/export-zip', {
        params: {
          kelas_id: selectedKelasId,
          semester: activeSemester,
          tahun_ajaran: activeTahunAjaran,
        },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/zip' }));
      const link = document.createElement('a');
      link.href = url;
      const cleanClassName = (kelasInfo?.nama_kelas || selectedKelasId).replace(/[\/\s]/g, '_');
      const cleanTa = activeTahunAjaran.replace(/[\/\s]/g, '-');
      link.setAttribute('download', `Rapor_STS_Kelas_${cleanClassName}_${activeSemester}_${cleanTa}.zip`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      setMessage({ type: 'success', text: `Arsip ZIP rapor resmi (PDF) Kelas ${kelasInfo?.nama_kelas} berhasil diunduh.` });
    } catch (err) {
      console.error('Gagal mengunduh berkas ZIP:', err);
      setMessage({ type: 'error', text: 'Gagal mengunduh arsip ZIP rapor kelas. Pastikan data rapor tersedia.' });
    } finally {
      setDownloadingZip(false);
    }
  };

  const handleDownloadZipAll = async () => {
    if (downloadingZip) return;
    setDownloadingZip(true);
    setMessage(null);
    try {
      const res = await api.get('/rapor-sts/export-zip-all', {
        params: {
          semester: activeSemester,
          tahun_ajaran: activeTahunAjaran,
        },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/zip' }));
      const link = document.createElement('a');
      link.href = url;
      const cleanTa = activeTahunAjaran.replace(/[\/\s]/g, '-');
      link.setAttribute('download', `Rapor_STS_Semua_Kelas_${activeSemester}_${cleanTa}.zip`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      setMessage({ type: 'success', text: `Arsip massal ZIP rapor resmi (PDF) seluruh rombel berhasil diunduh.` });
    } catch (err) {
      console.error('Gagal mengunduh ZIP semua kelas:', err);
      setMessage({ type: 'error', text: 'Gagal mengunduh arsip ZIP seluruh kelas.' });
    } finally {
      setDownloadingZip(false);
    }
  };

  const handleDownloadPdfSingle = async (siswaId, nis, nama) => {
    if (!siswaId || downloadingSinglePdf) return;
    setDownloadingSinglePdf(true);
    try {
      const res = await api.get(`/rapor-sts/${siswaId}/export-pdf`, {
        params: {
          semester: activeSemester,
          tahun_ajaran: activeTahunAjaran,
        },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      const safeNama = (nama || 'Siswa').replace(/[^A-Za-z0-9_]/g, '_');
      link.setAttribute('download', `Rapor_STS_${nis || siswaId}_${safeNama}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Gagal mengunduh PDF rapor santri:', err);
      setMessage({ type: 'error', text: 'Gagal mengunduh berkas PDF lembar rapor santri.' });
    } finally {
      setDownloadingSinglePdf(false);
    }
  };

  const handleSelectKelas = (e) => {
    const kId = e.target.value;
    setSelectedKelasId(kId);
    fetchInitialData(kId);
  };

  const handleSelectStudent = (index) => {
    if (index >= 0 && index < students.length) {
      setCurrentStudentIndex(index);
      setCatatanText(students[index].catatan_wali_kelas || '');
      setMessage(null);
    }
  };

  const currentStudent = students[currentStudentIndex] || null;

  const handleSaveCatatan = async (validateNow = false) => {
    if (!currentStudent) return;
    setSaving(true);
    setMessage(null);

    try {
      const res = await api.post(`/rapor-sts/${currentStudent.siswa_id}/catatan-walikelas`, {
        catatan_wali_kelas: catatanText,
        validate_now: validateNow,
      });

      if (res.data?.status === 'success') {
        setMessage({ 
          type: 'success', 
          text: validateNow 
            ? `Rapor ${currentStudent.nama} berhasil divalidasi & catatan tersimpan!` 
            : `Catatan untuk ${currentStudent.nama} berhasil disimpan.` 
        });

        // Update local state
        const updated = [...students];
        updated[currentStudentIndex] = {
          ...updated[currentStudentIndex],
          catatan_wali_kelas: catatanText,
          status_validasi: validateNow ? 'approved_by_walikelas' : updated[currentStudentIndex].status_validasi,
          ttd_walikelas: validateNow ? new Date().toISOString() : updated[currentStudentIndex].ttd_walikelas,
        };
        setStudents(updated);

        // Update summary counts
        if (validateNow) {
          setSummary(prev => ({
            ...prev,
            total_divalidasi: prev.total_divalidasi + 1,
            total_draft: Math.max(0, prev.total_draft - 1)
          }));
        }
      }
    } catch (err) {
      console.error('Error saving catatan:', err);
      setMessage({ type: 'error', text: 'Gagal menyimpan catatan atau validasi rapor.' });
    } finally {
      setSaving(false);
    }
  };

  const handleBulkApprove = async () => {
    if (!selectedKelasId) return;
    if (!window.confirm(`Validasi seluruh rapor siswa di kelas ${kelasInfo?.nama_kelas}?`)) return;

    setSaving(true);
    setMessage(null);
    try {
      const res = await api.post('/rapor-sts/bulk-approve-walikelas', {
        kelas_id: selectedKelasId
      });

      if (res.data?.status === 'success') {
        setMessage({ type: 'success', text: res.data.message });
        fetchInitialData(selectedKelasId);
      }
    } catch (err) {
      console.error('Error bulk approve:', err);
      setMessage({ type: 'error', text: 'Gagal memvalidasi seluruh kelas.' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelValidation = async (siswaId) => {
    if (!siswaId) return;

    if (!isAdmin) {
      // Wali Kelas wajib mengajukan permohonan pembatalan validasi melalui persetujuan Admin
      setRequestUnvalidateTarget({
        scope: 'student',
        siswa: currentStudent,
        kelas: kelasInfo,
        semester: activeSemester,
        tahun_ajaran: activeTahunAjaran,
      });
      setIsRequestUnvalidateModalOpen(true);
      return;
    }

    if (!window.confirm(`[ADMIN] Batalkan validasi rapor untuk santri ${currentStudent?.nama}? Status rapor akan kembali menjadi Draft.`)) return;

    setSaving(true);
    setMessage(null);
    try {
      const res = await api.post(`/rapor-sts/${siswaId}/cancel-validasi`);
      if (res.data?.status === 'success') {
        setMessage({ type: 'success', text: res.data.message });

        const updated = [...students];
        updated[currentStudentIndex] = {
          ...updated[currentStudentIndex],
          status_validasi: 'draft',
          ttd_walikelas: null,
          has_pending_unvalidation: false,
          pending_unvalidation_alasan: null,
        };
        setStudents(updated);

        setSummary(prev => ({
          ...prev,
          total_divalidasi: Math.max(0, (prev.total_divalidasi || 0) - 1),
          total_draft: (prev.total_draft || 0) + 1,
        }));
      }
    } catch (err) {
      console.error('Error cancel validasi:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Gagal membatalkan validasi rapor santri.' });
    } finally {
      setSaving(false);
    }
  };

  const handleBulkCancelValidation = async () => {
    if (!selectedKelasId) return;

    if (!isAdmin) {
      // Wali Kelas mengajukan pembatalan untuk seluruh kelas
      setRequestUnvalidateTarget({
        scope: 'class',
        kelas: kelasInfo,
        semester: activeSemester,
        tahun_ajaran: activeTahunAjaran,
      });
      setIsRequestUnvalidateModalOpen(true);
      return;
    }

    if (!window.confirm(`[ADMIN] Batalkan validasi seluruh rapor siswa di kelas ${kelasInfo?.nama_kelas}? Semua rapor akan kembali berstatus Draft.`)) return;

    setSaving(true);
    setMessage(null);
    try {
      const res = await api.post('/rapor-sts/bulk-cancel-validasi', {
        kelas_id: selectedKelasId
      });
      if (res.data?.status === 'success') {
        setMessage({ type: 'success', text: res.data.message });
        fetchInitialData(selectedKelasId);
      }
    } catch (err) {
      console.error('Error bulk cancel validasi:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Gagal membatalkan validasi seluruh kelas.' });
    } finally {
      setSaving(false);
    }
  };

  const handleUnvalidationSuccess = (resData) => {
    setMessage({
      type: 'success',
      text: resData?.message || 'Permohonan pembatalan validasi berhasil diajukan dan menunggu persetujuan admin.',
    });
    fetchInitialData(selectedKelasId);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs font-mono text-slate-500 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-emerald-800 border-t-transparent rounded-full animate-spin"></div>
        <p>Memuat Lembar Rapor Wali Kelas SMA AWH...</p>
      </div>
    );
  }

  const scores = currentStudent?.scores || {};
  const isApproved = currentStudent?.status_validasi === 'approved_by_walikelas' || currentStudent?.status_validasi === 'approved_by_kepsek';

  const extraMapelList = [...daftarExtraMapel];
  if (currentStudent?.extra_scores) {
    Object.entries(currentStudent.extra_scores).forEach(([mid, info]) => {
      if (!extraMapelList.some((e) => String(e.mapel_id) === String(mid))) {
        extraMapelList.push({
          mapel_id: mid,
          nama_mapel: info.nama_mapel || `Mapel ${mid}`,
          kktp: info.kktp || 75,
        });
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0d281e] via-[#0f3527] to-[#124231] rounded-2xl p-5 sm:p-6 text-white shadow-md border border-emerald-900/40 relative overflow-hidden print:hidden">
        {/* Top Mini Header: Badges & Academic Period Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-white/10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold backdrop-blur-sm border border-white/10">
            <Award className="w-3.5 h-3.5 text-amber-300" />
            <span>Portal Wali Kelas • Verifikasi & Validasi Rapor STS</span>
          </div>

          {/* Academic Period Pills (Khusus Admin) */}
          {user?.role === 'admin' && (
            <div className="inline-flex items-center gap-1.5 bg-black/30 backdrop-blur-md rounded-xl p-1 border border-white/10 text-xs shadow-inner">
              <span className="text-[10px] uppercase font-bold text-emerald-200/60 px-2 hidden sm:inline tracking-wider">
                Periode
              </span>
              <button
                onClick={handleOpenSemesterModal}
                disabled={togglingSemester}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-amber-500/20 text-amber-200 hover:text-amber-100 text-xs font-semibold transition-all flex items-center gap-1.5 border border-white/5 hover:border-amber-400/30"
                title="Audit & Ganti Semester (Wajib 100% Wali Kelas Tervalidasi)"
              >
                <RefreshCw className={`w-3 h-3 ${togglingSemester ? 'animate-spin' : ''}`} />
                <span>Semester <strong className="text-white underline decoration-amber-400/60">{activeSemester}</strong></span>
              </button>
              <div className="h-3.5 w-px bg-white/15"></div>
              <button
                onClick={handleOpenYearModal}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-teal-500/20 text-teal-200 hover:text-teal-100 text-xs font-semibold transition-all flex items-center gap-1.5 border border-white/5 hover:border-teal-400/30"
                title="Audit & Ganti Tahun Pelajaran (Wajib Ganjil & Genap 100% Tervalidasi)"
              >
                <Calendar className="w-3 h-3" />
                <span>TP <strong className="text-white underline decoration-teal-400/60">{activeTahunAjaran}</strong></span>
              </button>
            </div>
          )}
        </div>

        {/* Main Content & Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="max-w-2xl">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
              Lembar Rapor Santri & Catatan Perkembangan Wali Kelas
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 mt-1.5 font-normal leading-relaxed">
              Periksa kompilasi 21 mata pelajaran, berikan catatan bimbingan santri, dan setujui penerbitan rapor resmi.
            </p>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Download ZIP Button Group */}
            <div className="inline-flex items-center rounded-xl bg-emerald-700/90 hover:bg-emerald-700 p-0.5 border border-emerald-500/40 shadow-sm transition-all">
              <button
                onClick={handleDownloadZipKelas}
                disabled={downloadingZip || !selectedKelasId}
                className="px-3.5 py-2 text-white text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
                title="Unduh Kumpulan Lembar Rapor Resmi Kelas Ini dalam Bentuk ZIP (.pdf saja)"
              >
                <Archive className={`w-3.5 h-3.5 ${downloadingZip ? 'animate-bounce text-amber-300' : ''}`} />
                <span>{downloadingZip ? 'Mengemas ZIP...' : 'Unduh ZIP Kelas'}</span>
              </button>

              {['admin', 'kurikulum', 'kepala_sekolah', 'waka'].includes(user?.role) && (
                <>
                  <div className="h-4 w-px bg-white/20"></div>
                  <button
                    onClick={handleDownloadZipAll}
                    disabled={downloadingZip}
                    className="px-2.5 py-2 text-emerald-100 hover:text-white text-xs font-semibold transition-all flex items-center gap-1 disabled:opacity-50 hover:bg-white/10 rounded-lg"
                    title="Unduh Arsip Massal ZIP Berisi Lembar Rapor PDF Seluruh Rombel Sekolah"
                  >
                    <Download className="w-3 h-3 text-emerald-300" />
                    <span>Semua Rombel</span>
                  </button>
                </>
              )}
            </div>

            <button
              onClick={() => setIsQueueModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-100 hover:text-white text-xs font-semibold border border-white/15 transition-all flex items-center gap-1.5 shadow-sm"
              title="Lihat Antrean & Riwayat Permohonan Pembatalan Validasi Rapor"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-300" />
              <span>Antrean Batal Validasi</span>
              {summary.total_pending_unvalidation > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-bold font-mono">
                  {summary.total_pending_unvalidation}
                </span>
              )}
            </button>

            <Link
              to="/rapor-sts"
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-100 hover:text-white text-xs font-semibold border border-white/15 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-300" />
              <span>Input Nilai Mapel</span>
            </Link>

            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-[#c8942a] hover:bg-[#b08020] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 border border-amber-400/30"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Rapor STS</span>
            </button>
          </div>
        </div>
      </div>

      {/* Control Bar: Class Selector & Student Navigator */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              {daftarKelas.length > 1 ? 'Pilih Rombel / Kelas' : 'Rombel Binaan Wali Kelas'}
            </label>
            {daftarKelas.length > 1 ? (
              <select
                value={selectedKelasId}
                onChange={handleSelectKelas}
                className="px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-700 outline-none"
              >
                {daftarKelas.map((k) => (
                  <option key={k.id} value={k.id}>
                    Kelas {k.nama_kelas} ({k.jumlah_siswa || 0} Siswa)
                  </option>
                ))}
              </select>
            ) : (
              <div className="px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 text-xs font-bold text-emerald-950 flex items-center gap-1.5 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Kelas {kelasInfo?.nama_kelas} ({students.length} Siswa)</span>
                <span className="text-[10px] bg-emerald-200/80 text-emerald-800 font-semibold px-1.5 py-0.5 rounded ml-1">Terkunci</span>
              </div>
            )}
          </div>

          <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Pilih Siswa ({currentStudentIndex + 1} dari {students.length})
            </label>
            <select
              value={currentStudentIndex}
              onChange={(e) => handleSelectStudent(Number(e.target.value))}
              className="px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-700 outline-none max-w-[280px]"
            >
              {students.map((s, idx) => (
                <option key={s.siswa_id} value={idx}>
                  {idx + 1}. {s.nama} ({s.has_pending_unvalidation ? '⏳ Menunggu Admin' : s.status_validasi === 'approved_by_walikelas' ? '✓ Divalidasi' : 'Draft'})
                </option>
              ))}
            </select>
          </div>

          {/* Prev / Next buttons */}
          <div className="flex items-end gap-1 pt-4 sm:pt-0">
            <button
              onClick={() => handleSelectStudent(currentStudentIndex - 1)}
              disabled={currentStudentIndex === 0}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Siswa Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4 text-slate-700" />
            </button>
            <button
              onClick={() => handleSelectStudent(currentStudentIndex + 1)}
              disabled={currentStudentIndex === students.length - 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Siswa Selanjutnya"
            >
              <ChevronRight className="w-4 h-4 text-slate-700" />
            </button>
          </div>
        </div>

        {/* Progress & Quick Bulk Validation */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[11px] font-bold text-slate-800">
              {summary.total_divalidasi} dari {summary.total_siswa} Rapor Divalidasi
            </div>
            <div className="w-36 bg-slate-100 rounded-full h-2 overflow-hidden mt-1 border border-slate-200">
              <div 
                className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${summary.total_siswa > 0 ? (summary.total_divalidasi / summary.total_siswa) * 100 : 0}%` }}
              ></div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkApprove}
              disabled={saving}
              className="px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 shrink-0"
              title="Validasi seluruh rapor siswa dalam rombel ini"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Validasi 1 Kelas</span>
            </button>

            {summary.total_divalidasi > 0 && (
              summary.has_class_pending_unvalidation ? (
                <button
                  type="button"
                  onClick={() => setIsQueueModalOpen(true)}
                  className="px-3 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 shrink-0"
                  title={`Permohonan pembatalan 1 rombel sedang ditinjau admin. Alasan: "${summary.class_pending_unvalidation_alasan || '-'}"`}
                >
                  <Clock className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
                  <span>Rombel Menunggu Admin</span>
                </button>
              ) : (
                <button
                  onClick={handleBulkCancelValidation}
                  disabled={saving}
                  className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 shrink-0"
                  title={isAdmin ? "Batalkan validasi seluruh siswa dalam rombel ini (Admin)" : "Ajukan permohonan pembatalan validasi seluruh rombel ini ke Admin"}
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                  <span>{isAdmin ? 'Batalkan Validasi (Admin)' : 'Ajukan Batal 1 Kelas'}</span>
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border text-xs flex items-center gap-2 print:hidden ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
          <span className="font-semibold">{message.text}</span>
        </div>
      )}

      {/* Main Official Report Card Sheet (Matches Screenshot 1 Exactly) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-sm max-w-4xl mx-auto space-y-6 text-slate-800 print:border-none print:shadow-none print:p-0">
        
        {/* School Header with Logo & Text in 1 Row Centered, Text Left-Aligned */}
        <div className="pb-4 border-b-2 border-slate-900">
          <div className="flex items-center justify-center gap-4 sm:gap-6">
            <img 
              src="/logo-rapor-awh.jpeg" 
              alt="Logo SMA A. Wahid Hasyim" 
              className="w-16 h-20 sm:w-20 sm:h-24 object-contain shrink-0" 
              onError={(e) => { e.target.src = '/logo.png'; }}
            />
            <div className="text-left space-y-0.5">
              <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-slate-900 font-serif leading-tight">
                LAPORAN HASIL SUMATIF TENGAH SEMESTER
              </h2>
              <h3 className="text-base sm:text-lg font-black uppercase tracking-wide text-slate-900 font-serif leading-tight">
                SMA A. WAHID HASYIM TEBUIRENG
              </h3>
              <div className="flex items-center gap-1.5 pt-0.5">
                <p className="text-xs sm:text-sm font-bold tracking-wider text-slate-800 font-serif">
                  TAHUN PELAJARAN {currentStudent?.tahun_ajaran || activeTahunAjaran || '2026-2027'}
                </p>
                {user?.role === 'admin' && (
                  <button
                    onClick={() => {
                      setInputTahunAjaran(activeTahunAjaran);
                      setIsEditTahunModalOpen(true);
                    }}
                    className="print:hidden p-1 rounded-md text-slate-400 hover:text-emerald-700 hover:bg-slate-100 transition-colors"
                    title="Ganti Tahun Pelajaran (Khusus Admin)"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Student Identity Grid (Exact match with RAPOR STS X-1.docx) */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-xs font-semibold py-1">
          <div className="flex">
            <span className="w-24 text-slate-700 font-bold">Nama Siswa/I</span>
            <span className="mr-2">:</span>
            <span className="font-bold text-slate-900 uppercase">{currentStudent?.nama || '-'}</span>
          </div>
          <div className="flex">
            <span className="w-20 text-slate-700 font-bold">Kelas</span>
            <span className="mr-2">:</span>
            <span className="font-bold text-slate-900">{kelasInfo?.nama_kelas || '-'}</span>
          </div>
          <div className="flex">
            <span className="w-24 text-slate-700 font-bold">No. Induk</span>
            <span className="mr-2">:</span>
            <span className="font-mono text-slate-900">{currentStudent?.nis || '-'}</span>
          </div>
          <div className="flex">
            <span className="w-20 text-slate-700 font-bold">Semester</span>
            <span className="mr-2">:</span>
            <span className="font-bold text-slate-900">{currentStudent?.semester || activeSemester || 'Ganjil'}</span>
          </div>
        </div>

        {/* 21 Subjects Table (Exact layout with RAPOR STS X-1.docx) */}
        <div className="border border-slate-700 rounded overflow-hidden">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-700 font-bold text-slate-900 text-center">
                <th rowSpan={2} className="py-2 px-2 border-r border-slate-700 w-10 text-center">No</th>
                <th rowSpan={2} colSpan={2} className="py-2 px-3 border-r border-slate-700 text-center">Mata Pelajaran</th>
                <th colSpan={2} className="py-1 px-3 border-b border-slate-700 text-center">Nilai Rapor</th>
              </tr>
              <tr className="bg-slate-50 border-b border-slate-700 font-bold text-slate-900 text-center">
                <th className="py-1 px-3 border-r border-slate-700 w-24 text-center">Nilai</th>
                <th className="py-1 px-3 text-center w-28">Ketuntasan</th>
              </tr>
            </thead>
            <tbody>
              {/* Mapel 1 to 9 */}
              {[
                { no: 1, key: 'nilai_pai', name: 'Pendidikan Agama Islam' },
                { no: 2, key: 'nilai_ppkn', name: 'PPKN' },
                { no: 3, key: 'nilai_indo', name: 'Bahasa Indonesia' },
                { no: 4, key: 'nilai_mtk', name: 'Matematika' },
                { no: 5, key: 'nilai_inggris', name: 'Bhs. Inggris' },
                { no: 6, key: 'nilai_seni', name: 'Seni Budaya' },
                { no: 7, key: 'nilai_penjas', name: 'Penjaskes' },
                { no: 8, key: 'nilai_informa', name: 'Informatika' },
                { no: 9, key: 'nilai_sejarah', name: 'Sejarah' },
              ].map((m) => (
                <tr key={m.key} className="border-b border-slate-200 hover:bg-slate-50/50">
                  <td className="py-1 px-2 text-center border-r border-slate-700 font-mono text-slate-600">
                    {m.no}
                  </td>
                  <td colSpan={2} className="py-1 px-3 border-r border-slate-700 font-medium text-slate-900">
                    {m.name}
                  </td>
                  <td className="py-1 px-3 text-center border-r border-slate-700 font-mono font-bold text-slate-900">
                    {(scores[m.key] || 0) > 0 ? scores[m.key] : <span className="text-slate-400 font-normal">0</span>}
                  </td>
                  <td className="py-1 px-3 text-center font-mono text-slate-600">
                    75
                  </td>
                </tr>
              ))}

              {/* Mapel 10, 11, 12: IPA (Biologi, Fisika, Kimia) */}
              <tr className="border-b border-slate-200 hover:bg-slate-50/50">
                <td className="py-1 px-2 text-center border-r border-slate-700 font-mono text-slate-600">
                  10
                </td>
                <td rowSpan={3} className="py-1 px-2 border-r border-slate-700 text-center font-bold text-slate-800 bg-slate-50/40 w-14">
                  IPA
                </td>
                <td className="py-1 px-3 border-r border-slate-700 font-medium text-slate-900">
                  Biologi
                </td>
                <td className="py-1 px-3 text-center border-r border-slate-700 font-mono font-bold text-slate-900">
                  {(scores['nilai_biologi'] || 0) > 0 ? scores['nilai_biologi'] : <span className="text-slate-400 font-normal">0</span>}
                </td>
                <td className="py-1 px-3 text-center font-mono text-slate-600">
                  75
                </td>
              </tr>
              <tr className="border-b border-slate-200 hover:bg-slate-50/50">
                <td className="py-1 px-2 text-center border-r border-slate-700 font-mono text-slate-600">
                  11
                </td>
                <td className="py-1 px-3 border-r border-slate-700 font-medium text-slate-900">
                  Fisika
                </td>
                <td className="py-1 px-3 text-center border-r border-slate-700 font-mono font-bold text-slate-900">
                  {(scores['nilai_fisika'] || 0) > 0 ? scores['nilai_fisika'] : <span className="text-slate-400 font-normal">0</span>}
                </td>
                <td className="py-1 px-3 text-center font-mono text-slate-600">
                  75
                </td>
              </tr>
              <tr className="border-b border-slate-200 hover:bg-slate-50/50">
                <td className="py-1 px-2 text-center border-r border-slate-700 font-mono text-slate-600">
                  12
                </td>
                <td className="py-1 px-3 border-r border-slate-700 font-medium text-slate-900">
                  Kimia
                </td>
                <td className="py-1 px-3 text-center border-r border-slate-700 font-mono font-bold text-slate-900">
                  {(scores['nilai_kimia'] || 0) > 0 ? scores['nilai_kimia'] : <span className="text-slate-400 font-normal">0</span>}
                </td>
                <td className="py-1 px-3 text-center font-mono text-slate-600">
                  75
                </td>
              </tr>

              {/* Mapel 13, 14, 15: IPS (Geografi, Sosiologi, Ekonomi) */}
              <tr className="border-b border-slate-200 hover:bg-slate-50/50">
                <td className="py-1 px-2 text-center border-r border-slate-700 font-mono text-slate-600">
                  13
                </td>
                <td rowSpan={3} className="py-1 px-2 border-r border-slate-700 text-center font-bold text-slate-800 bg-slate-50/40 w-14">
                  IPS
                </td>
                <td className="py-1 px-3 border-r border-slate-700 font-medium text-slate-900">
                  Geografi
                </td>
                <td className="py-1 px-3 text-center border-r border-slate-700 font-mono font-bold text-slate-900">
                  {(scores['nilai_geografi'] || 0) > 0 ? scores['nilai_geografi'] : <span className="text-slate-400 font-normal">0</span>}
                </td>
                <td className="py-1 px-3 text-center font-mono text-slate-600">
                  75
                </td>
              </tr>
              <tr className="border-b border-slate-200 hover:bg-slate-50/50">
                <td className="py-1 px-2 text-center border-r border-slate-700 font-mono text-slate-600">
                  14
                </td>
                <td className="py-1 px-3 border-r border-slate-700 font-medium text-slate-900">
                  Sosiologi
                </td>
                <td className="py-1 px-3 text-center border-r border-slate-700 font-mono font-bold text-slate-900">
                  {(scores['nilai_sosiologi'] || 0) > 0 ? scores['nilai_sosiologi'] : <span className="text-slate-400 font-normal">0</span>}
                </td>
                <td className="py-1 px-3 text-center font-mono text-slate-600">
                  75
                </td>
              </tr>
              <tr className="border-b border-slate-200 hover:bg-slate-50/50">
                <td className="py-1 px-2 text-center border-r border-slate-700 font-mono text-slate-600">
                  15
                </td>
                <td className="py-1 px-3 border-r border-slate-700 font-medium text-slate-900">
                  Ekonomi
                </td>
                <td className="py-1 px-3 text-center border-r border-slate-700 font-mono font-bold text-slate-900">
                  {(scores['nilai_ekonomi'] || 0) > 0 ? scores['nilai_ekonomi'] : <span className="text-slate-400 font-normal">0</span>}
                </td>
                <td className="py-1 px-3 text-center font-mono text-slate-600">
                  75
                </td>
              </tr>

              {/* Mapel 16 to 21 */}
              {[
                { no: 16, key: 'nilai_pkwu', name: 'PKWU' },
                { no: 17, key: 'nilai_alquran', name: 'Al-Quran' },
                { no: 18, key: 'nilai_akhlaq', name: 'Akhlaq' },
                { no: 19, key: 'nilai_fiqih', name: 'Fiqih' },
                { no: 20, key: 'nilai_nahwu', name: 'Nahwu Shorof' },
                { no: 21, key: 'nilai_aswaja', name: 'Aswaja' },
              ].map((m) => (
                <tr key={m.key} className="border-b border-slate-200 hover:bg-slate-50/50">
                  <td className="py-1 px-2 text-center border-r border-slate-700 font-mono text-slate-600">
                    {m.no}
                  </td>
                  <td colSpan={2} className="py-1 px-3 border-r border-slate-700 font-medium text-slate-900">
                    {m.name}
                  </td>
                  <td className="py-1 px-3 text-center border-r border-slate-700 font-mono font-bold text-slate-900">
                    {(scores[m.key] || 0) > 0 ? scores[m.key] : <span className="text-slate-400 font-normal">0</span>}
                  </td>
                  <td className="py-1 px-3 text-center font-mono text-slate-600">
                    75
                  </td>
                </tr>
              ))}

              {/* Mapel Tambahan / Mapel Baru jika ada */}
              {extraMapelList.map((ext, extIdx) => {
                const extScore = currentStudent?.extra_scores?.[ext.mapel_id]?.nilai
                  ?? currentStudent?.extra_scores?.[String(ext.mapel_id)]?.nilai
                  ?? 0;
                return (
                  <tr key={`extra_${ext.mapel_id}`} className="border-b border-slate-200 hover:bg-slate-50/50">
                    <td className="py-1 px-2 text-center border-r border-slate-700 font-mono text-slate-600">
                      {21 + extIdx + 1}
                    </td>
                    <td colSpan={2} className="py-1 px-3 border-r border-slate-700 font-medium text-slate-900">
                      {ext.nama_mapel}
                    </td>
                    <td className="py-1 px-3 text-center border-r border-slate-700 font-mono font-bold text-slate-900">
                      {extScore > 0 ? extScore : <span className="text-slate-400 font-normal">0</span>}
                    </td>
                    <td className="py-1 px-3 text-center font-mono text-slate-600">
                      {ext.kktp || 75}
                    </td>
                  </tr>
                );
              })}

              {/* Summary Rows (JUMLAH & RATA-RATA aligned with Nilai column) */}
              <tr className="bg-slate-50 font-bold border-b border-slate-700 text-slate-900">
                <td colSpan={3} className="py-1.5 px-4 text-center border-r border-slate-700 tracking-wider">
                  JUMLAH
                </td>
                <td className="py-1.5 px-3 text-center border-r border-slate-700 font-mono font-bold text-slate-900">
                  {currentStudent?.jumlah || 0}
                </td>
                <td className="py-1.5 px-3 text-center text-slate-400 font-mono">-</td>
              </tr>
              <tr className="bg-slate-50 font-bold border-b border-slate-700 text-slate-900">
                <td colSpan={3} className="py-1.5 px-4 text-center border-r border-slate-700 tracking-wider">
                  RATA-RATA
                </td>
                <td className="py-1.5 px-3 text-center border-r border-slate-700 font-mono font-bold text-slate-900">
                  {currentStudent?.rata_rata || 0}
                </td>
                <td className="py-1.5 px-3 text-center text-slate-400 font-mono">-</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Wali Kelas Notes Section */}
        <div className="border border-slate-700 rounded p-4 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Catatan Wali Kelas:
            </label>
            {isApproved && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <Check className="w-3 h-3" />
                <span>Tervalidasi Wali Kelas</span>
              </span>
            )}
          </div>

          <textarea
            rows={3}
            value={catatanText}
            onChange={(e) => setCatatanText(e.target.value)}
            placeholder="Tuliskan catatan perkembangan karakter, kedisiplinan pondok, dan motivasi belajar untuk santri ini..."
            className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-700 outline-none leading-relaxed text-slate-800 print:border-none print:p-0"
          />

          {/* Quick template chips (Hidden in Print) */}
          <div className="flex flex-wrap gap-1.5 pt-1 print:hidden">
            <span className="text-[10px] font-semibold text-slate-500 self-center mr-1">Rekomendasi Catatan:</span>
            {quickCatatanTemplates.map((tpl, tIdx) => (
              <button
                key={tIdx}
                type="button"
                onClick={() => setCatatanText(tpl)}
                className="text-[10px] px-2 py-1 rounded bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 border border-slate-200 transition-colors text-left"
              >
                Template #{tIdx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Signature & Validation Footer (Matches RAPOR STS X-1.docx exactly) */}
        <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-6 text-center text-xs">
          <div>
            <p className="text-slate-600 mb-12">Mengetahui,<br/>Orang Tua / Wali Santri</p>
            <p className="font-bold border-t border-slate-500 pt-1 inline-block min-w-[140px] text-slate-900">
              ( ........................................ )
            </p>
          </div>

          <div className="hidden sm:block">
            <p className="text-slate-600 mb-12">Mengetahui,<br/>Kepala Sekolah</p>
            <p className="font-bold border-t border-slate-500 pt-1 inline-block min-w-[140px] text-slate-900">
              NIKMATURROHMAH, M.Pd.
            </p>
          </div>

          <div>
            <p className="text-slate-600 mb-12">
              Tebuireng, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br/>
              Wali Kelas {kelasInfo?.nama_kelas}
            </p>
            <p className="font-bold border-t border-slate-500 pt-1 inline-block min-w-[140px] text-slate-900">
              {kelasInfo?.nama_wali || user?.name || '( Wali Kelas )'}
            </p>
          </div>
        </div>

        {/* Action Controls for Wali Kelas (Hidden in Print) */}
        <div className="border-t border-slate-200 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Status Rapor:</span>
            {currentStudent?.has_pending_unvalidation ? (
              <button
                type="button"
                onClick={() => setIsQueueModalOpen(true)}
                className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 flex items-center gap-1 transition-all"
                title={`Permohonan pembatalan validasi sedang ditinjau Admin. Alasan: "${currentStudent.pending_unvalidation_alasan || '-'}"`}
              >
                <Clock className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
                <span>Menunggu Persetujuan Admin</span>
              </button>
            ) : (
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                isApproved ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-100 text-slate-700 border border-slate-300'
              }`}>
                {isApproved ? '✓ Telah Divalidasi Wali Kelas' : 'Draft (Menunggu Validasi)'}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleDownloadPdfSingle(currentStudent?.siswa_id, currentStudent?.nis, currentStudent?.nama)}
              disabled={!currentStudent || downloadingSinglePdf}
              className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
              title="Unduh Lembar Spreadsheet Resmi Rapor STS Siswa Ini (PDF)"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-700" />
              <span>{downloadingSinglePdf ? 'Mengunduh...' : 'Unduh PDF Siswa'}</span>
            </button>

            <button
              onClick={() => handleSaveCatatan(false)}
              disabled={saving}
              className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Catatan</span>
            </button>

            {currentStudent?.has_pending_unvalidation ? (
              <button
                type="button"
                onClick={() => setIsQueueModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                title={`Permohonan pembatalan validasi sedang ditinjau Admin. Alasan: "${currentStudent.pending_unvalidation_alasan || '-'}"`}
              >
                <Clock className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
                <span>Menunggu Persetujuan Admin</span>
              </button>
            ) : isApproved ? (
              <button
                onClick={() => handleCancelValidation(currentStudent?.siswa_id)}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                title={isAdmin ? "Batalkan validasi rapor siswa ini dan kembalikan ke Draft (Admin)" : "Ajukan permohonan pembatalan validasi rapor siswa ini ke Admin"}
              >
                <RotateCcw className="w-3.5 h-3.5 text-white" />
                <span>{isAdmin ? 'Batalkan Validasi Rapor' : 'Ajukan Pembatalan Validasi'}</span>
              </button>
            ) : (
              <button
                onClick={() => handleSaveCatatan(true)}
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Validasi & Setujui Rapor Siswa Ini</span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Modal Verifikasi Kesiapan Pemindahan Semester (Khusus Admin) */}
      {isSemesterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:hidden">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header Modal */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-700 border border-amber-500/20">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Verifikasi Kesiapan Pemindahan Semester</h3>
                  <p className="text-[11px] text-slate-500">
                    Syarat Ketentuan: Seluruh wali kelas wajib 100% memvalidasi rapor santri sebelum semester dapat dialihkan.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSemesterModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Modal */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {checkingSemesterValidation ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <RefreshCw className="w-8 h-8 text-emerald-700 animate-spin mb-3" />
                  <p className="text-xs font-bold text-slate-800">Mengaudit Status Validasi Seluruh Rombel...</p>
                  <p className="text-[11px] text-slate-500 mt-1">Memeriksa kelengkapan validasi 26 wali kelas untuk Semester {activeSemester} TP {activeTahunAjaran}</p>
                </div>
              ) : semesterValidationData ? (
                <>
                  {/* Status Banner */}
                  {semesterValidationData.can_switch_semester ? (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-emerald-900">Validasi Lengkap 100% — Kesiapan Terpenuhi</h4>
                        <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                          Seluruh {semesterValidationData.total_rombel} wali kelas telah memvalidasi seluruh rapor santri ({semesterValidationData.siswa_tervalidasi} dari {semesterValidationData.total_siswa} santri). 
                          Sistem mengizinkan perpindahan ke <strong>Semester {activeSemester === 'Ganjil' ? 'Genap' : 'Ganjil'}</strong>.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
                      <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-rose-900">Pergantian Semester Belum Diizinkan</h4>
                        <p className="text-xs text-rose-800 mt-0.5 leading-relaxed">
                          {semesterValidationData.message}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Semester Aktif</span>
                      <span className="text-sm font-black text-slate-800">{activeSemester}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Pindah</span>
                      <span className="text-sm font-black text-emerald-700">{activeSemester === 'Ganjil' ? 'Genap' : 'Ganjil'}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rombel Tuntas</span>
                      <span className={`text-sm font-black ${semesterValidationData.can_switch_semester ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {semesterValidationData.rombel_tervalidasi} / {semesterValidationData.total_rombel}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Persentase</span>
                      <span className={`text-sm font-black ${semesterValidationData.can_switch_semester ? 'text-emerald-700' : 'text-rose-600'}`}>
                        {semesterValidationData.persentase}%
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                      <span>Progres Validasi Santri: {semesterValidationData.siswa_tervalidasi} / {semesterValidationData.total_siswa} Santri</span>
                      <span className="font-bold">{semesterValidationData.persentase}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
                      <div 
                        className={`h-2.5 rounded-full transition-all duration-500 ${
                          semesterValidationData.can_switch_semester ? 'bg-emerald-600' : 'bg-rose-500'
                        }`}
                        style={{ width: `${semesterValidationData.persentase}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Rombel Belum Tervalidasi List */}
                  {semesterValidationData.unvalidated_classes && semesterValidationData.unvalidated_classes.length > 0 && (
                    <div className="border border-rose-200 rounded-xl overflow-hidden">
                      <div className="bg-rose-100/60 px-4 py-2 border-b border-rose-200 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-rose-900">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Daftar Rombel Belum Tervalidasi ({semesterValidationData.unvalidated_classes.length} Kelas)</span>
                        </div>
                        <span className="text-[10px] font-semibold text-rose-700">Wajib tuntas 100%</span>
                      </div>
                      <div className="divide-y divide-rose-100 max-h-48 overflow-y-auto text-xs">
                        {semesterValidationData.unvalidated_classes.map((cls) => (
                          <div key={cls.kelas_id} className="p-3 bg-white hover:bg-rose-50/40 flex items-center justify-between gap-2">
                            <div>
                              <div className="font-bold text-slate-800">Kelas {cls.nama_kelas}</div>
                              <div className="text-[11px] text-slate-500">Wali Kelas: {cls.wali_kelas || 'Belum Ditentukan'}</div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="inline-block px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                                Pending {cls.siswa_pending} dari {cls.total_siswa} santri
                              </span>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                Divalidasi: {cls.siswa_divalidasi} santri
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-6 text-center text-xs text-rose-600">
                  Gagal memuat status validasi dari server.
                </div>
              )}
            </div>

            {/* Footer Modal */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                {semesterValidationData?.can_switch_semester 
                  ? 'Siap dipindahkan ke semester berikutnya.' 
                  : 'Tombol terkunci demi integritas data.'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsSemesterModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-all"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={handleConfirmToggleSemester}
                  disabled={!semesterValidationData?.can_switch_semester || togglingSemester}
                  className="px-4 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${togglingSemester ? 'animate-spin' : ''}`} />
                  <span>{togglingSemester ? 'Memindahkan...' : `Pindahkan ke Semester ${activeSemester === 'Ganjil' ? 'Genap' : 'Ganjil'}`}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Verifikasi Kesiapan Ubah Tahun Pelajaran (Khusus Admin) */}
      {isEditTahunModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:hidden">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header Modal */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-500/10 text-teal-700 border border-teal-500/20">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Ubah Tahun Pelajaran Rapor</h3>
                  <p className="text-[11px] text-slate-500">
                    Syarat Ketentuan: Semester Ganjil DAN Genap TP {activeTahunAjaran} harus telah divalidasi 100% oleh seluruh wali kelas.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditTahunModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Modal */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {checkingYearValidation ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <RefreshCw className="w-8 h-8 text-teal-700 animate-spin mb-3" />
                  <p className="text-xs font-bold text-slate-800">Mengaudit Status Validasi Tahunan...</p>
                  <p className="text-[11px] text-slate-500 mt-1">Memeriksa kelengkapan validasi Semester Ganjil dan Genap TP {activeTahunAjaran}</p>
                </div>
              ) : yearValidationData ? (
                <>
                  {/* Status Banner */}
                  {yearValidationData.can_update_year ? (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-emerald-900">Validasi Tahunan Tuntas 100% — Kesiapan Terpenuhi</h4>
                        <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                          Seluruh wali kelas telah menyelesaikan validasi rapor Semester Ganjil dan Genap. Anda dapat memperbarui Tahun Pelajaran.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
                      <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-rose-900">Perubahan Tahun Pelajaran Terkunci</h4>
                        <p className="text-xs text-rose-800 mt-0.5 leading-relaxed">
                          {yearValidationData.message}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Dual Cards: Semester Ganjil vs Genap */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Ganjil */}
                    <div className={`p-4 rounded-xl border ${yearValidationData.ganjil?.can_proceed ? 'bg-emerald-50/50 border-emerald-200' : 'bg-rose-50/50 border-rose-200'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-800">1. Semester Ganjil</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${yearValidationData.ganjil?.can_proceed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                          {yearValidationData.ganjil?.can_proceed ? '✓ Tuntas 100%' : 'Belum Tuntas'}
                        </span>
                      </div>
                      <div className="text-lg font-black text-slate-800 mb-1">
                        {yearValidationData.ganjil?.persentase}%
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {yearValidationData.ganjil?.rombel_tervalidasi} dari {yearValidationData.ganjil?.total_rombel} rombel tervalidasi ({yearValidationData.ganjil?.siswa_tervalidasi} santri)
                      </p>
                    </div>

                    {/* Genap */}
                    <div className={`p-4 rounded-xl border ${yearValidationData.genap?.can_proceed ? 'bg-emerald-50/50 border-emerald-200' : 'bg-rose-50/50 border-rose-200'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-800">2. Semester Genap</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${yearValidationData.genap?.can_proceed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                          {yearValidationData.genap?.can_proceed ? '✓ Tuntas 100%' : 'Belum Tuntas'}
                        </span>
                      </div>
                      <div className="text-lg font-black text-slate-800 mb-1">
                        {yearValidationData.genap?.persentase}%
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {yearValidationData.genap?.rombel_tervalidasi} dari {yearValidationData.genap?.total_rombel} rombel tervalidasi ({yearValidationData.genap?.siswa_tervalidasi} santri)
                      </p>
                    </div>
                  </div>

                  {/* Input Form Section */}
                  <div className={`space-y-3 pt-2 ${!yearValidationData.can_update_year ? 'opacity-60 pointer-events-none' : ''}`}>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Tahun Pelajaran Baru:
                      </label>
                      <input
                        type="text"
                        value={inputTahunAjaran}
                        disabled={!yearValidationData.can_update_year}
                        onChange={(e) => setInputTahunAjaran(e.target.value)}
                        placeholder="Contoh: 2027/2028 atau 2027-2028"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-teal-700 outline-none"
                      />
                    </div>

                    <div>
                      <span className="block text-[11px] font-semibold text-slate-500 mb-1.5">Pilihan Cepat Tahun:</span>
                      <div className="flex flex-wrap gap-2">
                        {['2025/2026', '2026/2027', '2027/2028', '2028/2029'].map((tp) => (
                          <button
                            key={tp}
                            type="button"
                            disabled={!yearValidationData.can_update_year}
                            onClick={() => setInputTahunAjaran(tp)}
                            className={`px-2.5 py-1 text-xs rounded-lg font-semibold border transition-all ${
                              inputTahunAjaran === tp 
                                ? 'bg-teal-700 text-white border-teal-700' 
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {tp}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {!yearValidationData.can_update_year && (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Form dinonaktifkan sampai seluruh wali kelas merampungkan validasi rapor semester ganjil dan genap.</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-6 text-center text-xs text-rose-600">
                  Gagal memuat status audit tahun ajaran.
                </div>
              )}
            </div>

            {/* Footer Modal */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                {yearValidationData?.can_update_year 
                  ? 'Syarat validasi ganjil & genap terpenuhi.' 
                  : 'Perubahan tahun ajaran diblokir sistem.'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditTahunModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-all"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateTahunAjaran()}
                  disabled={!yearValidationData?.can_update_year || savingTahun || !inputTahunAjaran.trim()}
                  className="px-4 py-2 text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white rounded-xl shadow transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{savingTahun ? 'Menyimpan...' : 'Simpan Tahun Pelajaran'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pengajuan Pembatalan Validasi (Untuk Wali Kelas) */}
      <RequestUnvalidationModal
        isOpen={isRequestUnvalidateModalOpen}
        onClose={() => setIsRequestUnvalidateModalOpen(false)}
        target={requestUnvalidateTarget}
        onSuccess={handleUnvalidationSuccess}
      />

      {/* Modal Antrean Pembatalan Validasi (Admin & Wali Kelas) */}
      <UnvalidationQueueModal
        isOpen={isQueueModalOpen}
        onClose={() => setIsQueueModalOpen(false)}
        isAdmin={isAdmin}
        onActionComplete={() => fetchInitialData(selectedKelasId)}
      />
    </div>
  );
};

export default WaliKelasRaporPage;
