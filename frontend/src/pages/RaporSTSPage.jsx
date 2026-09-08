import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { 
  Save, CheckCircle2, AlertCircle, Users, BookOpen, 
  Award, Sparkles, RefreshCw, Filter, ArrowRight, Check, Search
} from 'lucide-react';

const RaporSTSPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const [permissions, setPermissions] = useState(null);
  const [allowedClasses, setAllowedClasses] = useState([]);
  const [selectedKelasId, setSelectedKelasId] = useState('');
  const [selectedMapelKey, setSelectedMapelKey] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  // Class & Student Grades data
  const [kelasData, setKelasData] = useState(null);
  const [siswaGrades, setSiswaGrades] = useState([]);
  const [editedSiswaIds, setEditedSiswaIds] = useState(new Set());
  const [stats, setStats] = useState({
    total_siswa: 0,
    total_terisi: 0,
    rata_rata: 0,
    tertinggi: 0,
    terendah: 0,
    total_tuntas: 0,
    total_belum_tuntas: 0,
  });

  const inputRefs = useRef([]);

  const mapelMasterList = [
    { key: 'nilai_pai', label: 'Pendidikan Agama Islam (PAI)' },
    { key: 'nilai_ppkn', label: 'PPKN' },
    { key: 'nilai_indo', label: 'Bahasa Indonesia' },
    { key: 'nilai_mtk', label: 'Matematika' },
    { key: 'nilai_inggris', label: 'Bahasa Inggris' },
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

  const [mapelList, setMapelList] = useState(mapelMasterList);

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/rapor-sts-access/my-permissions');
      if (res.data?.status === 'success') {
        const p = res.data;
        setPermissions(p);
        if (p.all_mapel_info && p.all_mapel_info.length > 0) {
          setMapelList(p.all_mapel_info);
        }
        const classes = p.allowed_classes || [];
        setAllowedClasses(classes);

        if (classes.length > 0) {
          const firstClass = classes[0];
          setSelectedKelasId(firstClass.kelas_id);

          // Determine initial mapel
          const mapelKeys = firstClass.allowed_mapel_keys || [];
          const initialMapelKey = mapelKeys.length > 0 ? mapelKeys[0] : (p.all_allowed_mapels?.[0] || 'nilai_pai');
          setSelectedMapelKey(initialMapelKey);

          loadClassGrades(firstClass.kelas_id, initialMapelKey);
        } else {
          setLoading(false);
        }
      }
    } catch (e) {
      console.error('Error fetching permissions:', e);
      setLoading(false);
    }
  };

  const loadClassGrades = async (kelasId, mapelKey) => {
    if (!kelasId || !mapelKey) return;
    setLoadingGrades(true);
    setMessage(null);
    try {
      const res = await api.get(`/rapor-sts/mapel-kelas?kelas_id=${kelasId}&mapel_key=${mapelKey}`);
      if (res.data?.status === 'success') {
        setKelasData(res.data.kelas);
        setSiswaGrades(res.data.siswa || []);
        setStats(res.data.statistik || {});
        setEditedSiswaIds(new Set());
      }
    } catch (e) {
      console.error('Error fetching class grades:', e);
      setMessage({ type: 'error', text: 'Gagal memuat data nilai kelas.' });
    } finally {
      setLoading(false);
      setLoadingGrades(false);
    }
  };

  const handleKelasChange = (e) => {
    const kId = Number(e.target.value);
    setSelectedKelasId(kId);

    // Find allowed mapel in this class
    const foundClass = allowedClasses.find((c) => c.kelas_id === kId);
    let mapelToUse = selectedMapelKey;
    if (foundClass && foundClass.allowed_mapel_keys && foundClass.allowed_mapel_keys.length > 0) {
      if (!foundClass.allowed_mapel_keys.includes(selectedMapelKey)) {
        mapelToUse = foundClass.allowed_mapel_keys[0];
        setSelectedMapelKey(mapelToUse);
      }
    }

    loadClassGrades(kId, mapelToUse);
  };

  const handleMapelChange = (e) => {
    const mKey = e.target.value;
    setSelectedMapelKey(mKey);
    loadClassGrades(selectedKelasId, mKey);
  };

  const handleGradeChange = (siswaId, val) => {
    let num = val === '' ? 0 : parseInt(val, 10);
    if (isNaN(num)) num = 0;
    if (num > 100) num = 100;
    if (num < 0) num = 0;

    setSiswaGrades((prev) => {
      const next = prev.map((s) => {
        if (s.siswa_id === siswaId) {
          const isFilled = num > 0;
          const statusTuntas = num >= 75 ? 'Tuntas' : (num > 0 ? 'Belum Tuntas' : 'Belum Diisi');
          return { ...s, nilai: num, is_filled: isFilled, status_tuntas: statusTuntas };
        }
        return s;
      });

      // Recalculate quick stats
      const filled = next.filter((s) => s.is_filled);
      const totalTerisi = filled.length;
      const sum = filled.reduce((acc, curr) => acc + curr.nilai, 0);
      const rataRata = totalTerisi > 0 ? Math.round((sum / totalTerisi) * 10) / 10 : 0;
      const tuntas = filled.filter((s) => s.nilai >= 75).length;
      const belumTuntas = filled.filter((s) => s.nilai < 75).length;

      setStats((prevStats) => ({
        ...prevStats,
        total_terisi: totalTerisi,
        rata_rata: rataRata,
        total_tuntas: tuntas,
        total_belum_tuntas: belumTuntas,
      }));

      return next;
    });

    setEditedSiswaIds((prev) => new Set(prev).add(siswaId));
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter' || e.key === 'ArrowDown') {
      e.preventDefault();
      if (inputRefs.current[index + 1]) {
        inputRefs.current[index + 1].focus();
        inputRefs.current[index + 1].select();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus();
        inputRefs.current[index - 1].select();
      }
    }
  };

  const handleSaveAll = async () => {
    if (!selectedKelasId || !selectedMapelKey || siswaGrades.length === 0) return;
    setSaving(true);
    setMessage(null);

    const payload = {
      kelas_id: selectedKelasId,
      mapel_key: selectedMapelKey,
      grades: siswaGrades.map((s) => ({
        siswa_id: s.siswa_id,
        nilai: s.nilai,
      })),
    };

    try {
      const res = await api.post('/rapor-sts/mapel-kelas', payload);
      if (res.data?.status === 'success') {
        setMessage({
          type: 'success',
          text: `Berhasil menyimpan nilai ${selectedMapelLabel} untuk seluruh siswa (${res.data.message})`,
        });
        setEditedSiswaIds(new Set());
      }
    } catch (e) {
      console.error('Error saving class grades:', e);
      setMessage({
        type: 'error',
        text: e.response?.data?.message || 'Gagal menyimpan nilai rapor kelas.',
      });
    } finally {
      setSaving(false);
    }
  };

  const selectedMapelObj = mapelList.find((m) => m.key === selectedMapelKey);
  const selectedMapelLabel = selectedMapelObj ? selectedMapelObj.label : 'Mata Pelajaran';

  // Determine selectable mapels for this class
  const currentClassObj = allowedClasses.find((c) => c.kelas_id === Number(selectedKelasId));
  const availableMapelKeys = (currentClassObj && currentClassObj.allowed_mapel_keys && currentClassObj.allowed_mapel_keys.length > 0)
    ? currentClassObj.allowed_mapel_keys
    : (permissions?.all_allowed_mapels || []);

  const filteredSiswa = siswaGrades.filter((s) => {
    if (!searchFilter) return true;
    const q = searchFilter.toLowerCase();
    return s.nama.toLowerCase().includes(q) || String(s.nis).includes(q);
  });

  const isWaliKelasUser = Boolean(user?.is_wali_kelas || permissions?.is_wali_kelas);

  if (loading) {
    return (
      <div className="p-12 text-center text-xs font-mono text-slate-500 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-emerald-800 border-t-transparent rounded-full animate-spin"></div>
        <p>Memuat Form Input Nilai Rapor Guru SMA AWH...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0d281e] via-[#0f3527] to-[#124231] rounded-2xl p-6 text-white shadow-md border border-emerald-900/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold backdrop-blur-sm mb-2 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Input Nilai Rapor Guru Pengampu</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Pengisian Nilai Rapor Kelas (1 Mapel Seluruh Santri)
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-2xl font-normal">
              Input nilai rapor STS secara cepat dan simultan untuk seluruh siswa di kelas yang Anda ampu tanpa perlu membuka lembar per siswa.
            </p>
          </div>

          {isWaliKelasUser && (
            <Link
              to="/walikelas/rapor"
              className="px-4 py-2.5 rounded-xl bg-[#c8942a] hover:bg-[#b08020] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-2 shrink-0 border border-amber-400/40"
            >
              <Award className="w-4 h-4" />
              <span>Buka Menu Wali Kelas (Validasi Rapor) &rarr;</span>
            </Link>
          )}
        </div>
      </div>

      {/* Homeroom notice banner if user is wali kelas */}
      {isWaliKelasUser && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold shrink-0">
              <Award className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <p className="font-bold text-emerald-950">
                Anda Ditugaskan sebagai Wali Kelas {user?.wali_kelas?.nama_kelas || ''}
              </p>
              <p className="text-emerald-800/80 text-[11px]">
                Di halaman ini Anda dapat mengisi nilai mapel yang Anda ajar. Untuk memvalidasi lembar rapor 21 mapel lengkap & memberi catatan perkembangan santri, buka Menu Wali Kelas.
              </p>
            </div>
          </div>
          <Link
            to="/walikelas/rapor"
            className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shrink-0 self-start sm:self-center transition-colors"
          >
            Buka Menu Wali Kelas
          </Link>
        </div>
      )}

      {/* Filter Selector Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Pilih Rombel / Kelas
            </label>
            <select
              value={selectedKelasId}
              onChange={handleKelasChange}
              className="px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-700 outline-none min-w-[180px]"
            >
              {allowedClasses.map((c) => (
                <option key={c.kelas_id} value={c.kelas_id}>
                  Kelas {c.nama_kelas} {c.is_wali ? '(Wali Kelas Anda)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Mata Pelajaran yang Anda Ampu
            </label>
            <select
              value={selectedMapelKey}
              onChange={handleMapelChange}
              className="px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-700 outline-none min-w-[220px]"
            >
              {mapelList
                .filter((m) => availableMapelKeys.includes(m.key) || permissions?.is_full_access)
                .map((m) => (
                  <option key={m.key} value={m.key}>
                    {m.label} {m.is_extra ? '(Mapel Tambahan)' : ''}
                  </option>
                ))}
            </select>
          </div>

          <div className="h-8 w-px bg-slate-200 hidden md:block"></div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Cari Santri
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Ketik nama / NIS..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-700 w-44"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleSaveAll}
            disabled={saving || siswaGrades.length === 0}
            className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Menyimpan...' : 'Simpan Nilai Semua Siswa'}</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Siswa</div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 mt-0.5">{stats.total_siswa}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Kelas {kelasData?.nama_kelas || '-'}</div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-blue-600">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nilai Terisi</div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-blue-800 mt-0.5">
            {stats.total_terisi} <span className="text-xs font-normal text-slate-500">/ {stats.total_siswa}</span>
          </div>
          <div className="text-[10px] text-blue-700 font-semibold mt-0.5">
            {stats.total_siswa > 0 ? Math.round((stats.total_terisi / stats.total_siswa) * 100) : 0}% Lengkap
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-emerald-600">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Rata-Rata Kelas</div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-800 mt-0.5">{stats.rata_rata}</div>
          <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">KKM: 75</div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-teal-600">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tuntas (≥ 75)</div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-teal-800 mt-0.5">{stats.total_tuntas}</div>
          <div className="text-[10px] text-teal-700 font-semibold mt-0.5">Mencapai Target KKM</div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-amber-600">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Belum Tuntas (&lt; 75)</div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-amber-800 mt-0.5">{stats.total_belum_tuntas}</div>
          <div className="text-[10px] text-amber-700 font-semibold mt-0.5">Perlu Remedial</div>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border text-xs flex items-center gap-2 ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
          <span className="font-semibold">{message.text}</span>
        </div>
      )}

      {/* Main Table: Simple Fast Grade Entry for Subject Teachers */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-800" />
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Daftar Nilai: {selectedMapelLabel} • Kelas {kelasData?.nama_kelas || '-'}
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Tekan <kbd className="px-1.5 py-0.5 bg-slate-200 rounded font-bold text-slate-700">Enter</kbd> atau <kbd className="px-1.5 py-0.5 bg-slate-200 rounded font-bold text-slate-700">↓</kbd> untuk pindah baris cepat
          </span>
        </div>

        {loadingGrades ? (
          <div className="p-12 text-center text-xs font-mono text-slate-500 flex flex-col items-center justify-center space-y-2">
            <div className="w-6 h-6 border-2 border-emerald-800 border-t-transparent rounded-full animate-spin"></div>
            <p>Memuat santri kelas...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-3 px-3 text-center w-12">No</th>
                  <th className="py-3 px-3 text-center w-24">NIS</th>
                  <th className="py-3 px-4 text-left">Nama Siswa / Santri</th>
                  <th className="py-3 px-3 text-center w-36">Nilai Rapor (0-100)</th>
                  <th className="py-3 px-3 text-center w-24">KKM</th>
                  <th className="py-3 px-4 text-center w-36">Ketuntasan</th>
                  <th className="py-3 px-3 text-center w-28">Status Rapor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80">
                {filteredSiswa.map((siswa, idx) => {
                  const isEdited = editedSiswaIds.has(siswa.siswa_id);
                  const isPassed = siswa.nilai >= 75;

                  return (
                    <tr 
                      key={siswa.siswa_id}
                      className={`transition-colors ${isEdited ? 'bg-amber-50/40' : 'hover:bg-slate-50/70'}`}
                    >
                      <td className="py-2.5 px-3 text-center font-mono text-slate-500">
                        {siswa.no}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-slate-600 font-semibold">
                        {siswa.nis}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <span>{siswa.nama}</span>
                          {isEdited && (
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Ada perubahan belum disimpan"></span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <input
                          ref={(el) => (inputRefs.current[idx] = el)}
                          type="number"
                          min="0"
                          max="100"
                          value={siswa.nilai === 0 ? '' : siswa.nilai}
                          onChange={(e) => handleGradeChange(siswa.siswa_id, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, idx)}
                          placeholder="0"
                          className="w-24 px-2.5 py-1.5 text-center font-mono font-bold text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 outline-none transition-all"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-slate-600">
                        75
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        {siswa.is_filled ? (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isPassed 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}>
                            {isPassed ? '✓ Tuntas' : 'Belum Tuntas'}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium italic">
                            Belum Diisi
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="text-[10px] font-semibold text-slate-500 uppercase">
                          {siswa.status_validasi === 'approved_by_walikelas' ? 'Divalidasi' : 'Draft'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Menampilkan <strong className="text-slate-800">{filteredSiswa.length}</strong> santri di Kelas {kelasData?.nama_kelas}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveAll}
              disabled={saving || siswaGrades.length === 0}
              className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Menyimpan...' : 'Simpan Nilai Semua Siswa'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RaporSTSPage;
