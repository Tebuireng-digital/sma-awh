import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  AlertCircle, 
  ArrowLeft, 
  ArrowRight, 
  Briefcase, 
  GraduationCap, 
  Lock, 
  Eye,
  EyeOff,
  ShieldCheck, 
  CheckCircle2
} from 'lucide-react';

const Login = () => {
  const { login, loginSiswa, loading } = useAuth();
  const navigate = useNavigate();

  // Mode: 'select' (Pilihan Akses) | 'guru' (Form Guru/Staf) | 'siswa' (Form Siswa/Wali Murid)
  const [accessMode, setAccessMode] = useState('select');

  // State Guru/Staf
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPasswordGuru, setShowPasswordGuru] = useState(false);

  // State Siswa/Wali Murid
  const [nisn, setNisn] = useState('');
  const [passwordSiswa, setPasswordSiswa] = useState('');
  const [showPasswordSiswa, setShowPasswordSiswa] = useState(false);

  const [error, setError] = useState(null);

  const redirectByRole = (role) => {
    switch (role) {
      case 'admin':
        navigate('/admin');
        break;
      case 'kurikulum':
        navigate('/kurikulum');
        break;
      case 'kepala_sekolah':
      case 'waka':
        navigate('/dashboard-kepsek');
        break;
      case 'humas':
        navigate('/humas');
        break;
      case 'persuratan':
      case 'tu':
      case 'kepala_tu':
        navigate('/persuratan');
        break;
      case 'sarana':
        navigate('/sarana');
        break;
      case 'kepegawaian':
        navigate('/kepegawaian');
        break;
      case 'bk':
        navigate('/bk');
        break;
      case 'pustakawan':
        navigate('/perpustakaan');
        break;
      case 'siswa':
      case 'wali_santri':
        navigate('/portal-siswa');
        break;
      default:
        navigate('/guru/presensi');
        break;
    }
  };

  const handleLoginGuru = async (e) => {
    e.preventDefault();
    setError(null);
    const res = await login(username, password);
    if (res.success) {
      redirectByRole(res.user.role);
    } else {
      setError(res.message);
    }
  };

  const handleLoginSiswa = async (e) => {
    e.preventDefault();
    setError(null);
    const res = await loginSiswa(nisn, passwordSiswa);
    if (res.success) {
      navigate('/portal-siswa');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between selection:bg-emerald-600 selection:text-white relative overflow-hidden font-sans">
      {/* Subtle Background Pattern & Light Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none"></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-100/60 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-100/50 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Bar Navigation */}
      <header className="relative z-10 px-6 py-5 max-w-6xl mx-auto w-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <img src="/logo.png" alt="Logo Tebuireng" className="h-10 w-auto drop-shadow-sm transition-transform group-hover:scale-105" />
          <div>
            <h1 className="text-sm font-extrabold tracking-wide uppercase text-slate-900 leading-tight">
              SMA A. Wahid Hasyim
            </h1>
            <p className="text-[11px] text-emerald-700 font-semibold">Pesantren Tebuireng Jombang</p>
          </div>
        </Link>
        <Link 
          to="/" 
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 shadow-sm transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Web</span>
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-grow flex items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-4xl mx-auto">
          
          {/* ============================================================ */}
          {/* 1. STEP: PILIHAN AKSES MASUK                                 */}
          {/* ============================================================ */}
          {accessMode === 'select' && (
            <div className="animate-in fade-in zoom-in-95 duration-300">
              <div className="text-center mb-10 sm:mb-12">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase bg-emerald-50 text-emerald-800 border border-emerald-200 mb-3 shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Portal Masuk Terpadu</span>
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-2.5">
                  Masuk ke Portal SMA AWH
                </h2>
                <p className="text-sm sm:text-base text-slate-600 max-w-md mx-auto">
                  Silakan pilih jenis akses portal Anda untuk melanjutkan ke layanan yang sesuai.
                </p>
              </div>

              {/* 2 Big Cards for Access Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                {/* CARD 1: GURU & STAF */}
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setAccessMode('guru');
                  }}
                  className="group text-left p-7 sm:p-8 rounded-3xl bg-white hover:bg-emerald-50/30 border border-slate-200 hover:border-emerald-500 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:scale-[1.02] active:scale-[0.99] relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all"></div>
                  
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 mb-6 group-hover:scale-110 group-hover:bg-emerald-100 transition-transform">
                      <Briefcase className="w-7 h-7" />
                    </div>
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest block mb-1">
                      Pendidik & Tenaga Kependidikan
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 group-hover:text-emerald-800 transition-colors">
                      Guru & Staf Sekolah
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                      Kelola presensi kelas, jurnal mengajar harian, input nilai rapor STS, kurikulum, dan administrasi kepegawaian.
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-700">Masuk Akun Petugas</span>
                    <div className="w-9 h-9 rounded-full bg-slate-100 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center text-slate-600 transition-colors shadow-sm">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </button>

                {/* CARD 2: SISWA / WALI MURID */}
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setAccessMode('siswa');
                  }}
                  className="group text-left p-7 sm:p-8 rounded-3xl bg-white hover:bg-amber-50/30 border border-slate-200 hover:border-amber-500 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:scale-[1.02] active:scale-[0.99] relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all"></div>

                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 mb-6 group-hover:scale-110 group-hover:bg-amber-100 transition-transform">
                      <GraduationCap className="w-7 h-7" />
                    </div>
                    <span className="text-xs font-bold text-amber-700 uppercase tracking-widest block mb-1">
                      Portal Siswa & Orang Tua
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 group-hover:text-amber-800 transition-colors">
                      Siswa / Wali Murid
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                      Pantau kehadiran harian, nilai tugas, rapor digital STS, jadwal pelajaran, riwayat prestasi, dan peminjaman buku.
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-700">Masuk Menggunakan NISN / NIS</span>
                    <div className="w-9 h-9 rounded-full bg-slate-100 group-hover:bg-amber-600 group-hover:text-white flex items-center justify-center text-slate-600 transition-colors shadow-sm">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </button>
              </div>

              {/* Secure System Footnote */}
              <div className="mt-10 text-center flex items-center justify-center gap-2 text-xs text-slate-500">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Sistem Terintegrasi Pesantren Tebuireng & SMA A. Wahid Hasyim</span>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* 2. STEP: FORM LOGIN GURU & STAF                              */}
          {/* ============================================================ */}
          {accessMode === 'guru' && (
            <div className="max-w-md mx-auto animate-in fade-in zoom-in-95 duration-300">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setAccessMode('select');
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 mb-6 group"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                <span>Ganti Pilihan Akses</span>
              </button>

              <div className="bg-white border border-slate-200 rounded-3xl p-7 sm:p-9 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Login Guru & Staf</h3>
                    <p className="text-xs text-slate-500">Pendidik dan Tenaga Kependidikan</p>
                  </div>
                </div>

                {error && (
                  <div className="mb-5 bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleLoginGuru} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Username / NIP / ID Guru
                    </label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Masukkan NIP atau username"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Kata Sandi
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswordGuru ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 pr-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswordGuru(!showPasswordGuru)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                      >
                        {showPasswordGuru ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-lg shadow-emerald-800/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                  >
                    <span>{loading ? 'Memverifikasi Akun...' : 'Masuk Portal GTK'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* 3. STEP: FORM LOGIN SISWA / WALI MURID                       */}
          {/* ============================================================ */}
          {accessMode === 'siswa' && (
            <div className="max-w-md mx-auto animate-in fade-in zoom-in-95 duration-300">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setAccessMode('select');
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 mb-6 group"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                <span>Ganti Pilihan Akses</span>
              </button>

              <div className="bg-white border border-slate-200 rounded-3xl p-7 sm:p-9 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Portal Siswa / Wali Murid</h3>
                    <p className="text-xs text-slate-500">Akses Mandiri Siswa & Orang Tua (Read-Only)</p>
                  </div>
                </div>

                {error && (
                  <div className="mb-5 bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleLoginSiswa} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      NISN / NIS Siswa
                    </label>
                    <input
                      type="text"
                      required
                      value={nisn}
                      onChange={(e) => setNisn(e.target.value)}
                      placeholder="Contoh: 0081234567 atau 16383"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Masukkan NISN atau NIS siswa yang terdaftar di database sekolah.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Kata Sandi
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswordSiswa ? "text" : "password"}
                        required
                        value={passwordSiswa}
                        onChange={(e) => setPasswordSiswa(e.target.value)}
                        placeholder="Kata sandi (default: siswa123)"
                        className="w-full px-4 py-3 pr-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswordSiswa(!showPasswordSiswa)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                      >
                        {showPasswordSiswa ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      *Kata sandi bawaan awal untuk semua siswa adalah <span className="font-semibold text-emerald-700">siswa123</span>.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 space-y-1">
                    <p className="font-bold flex items-center gap-1.5 text-amber-800">
                      <Lock className="w-3.5 h-3.5 text-amber-700" />
                      <span>Informasi Akses Siswa & Wali Murid</span>
                    </p>
                    <p className="text-amber-800/90 leading-relaxed">
                      Siswa dan Wali Murid menggunakan akun dan kata sandi yang sama. Kata sandi dapat diperbarui kapan saja melalui tombol <strong>Ganti Sandi</strong> di dalam portal.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-lg shadow-emerald-800/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                  >
                    <span>{loading ? 'Menghubungkan Portal...' : 'Masuk Portal Siswa / Wali Murid'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-xs text-slate-500 border-t border-slate-200 bg-white/50 backdrop-blur-sm">
        &copy; {new Date().getFullYear()} SMA A. Wahid Hasyim Tebuireng Jombang. Sistem Informasi Manajemen Terpadu.
      </footer>
    </div>
  );
};

export default Login;
