import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const res = await login(username, password);
    if (res.success) {
      redirectByRole(res.user.role);
    } else {
      setError(res.message);
    }
  };

  const redirectByRole = (role) => {
    switch (role) {
      case 'admin':
        navigate('/admin');
        break;
      case 'kurikulum':
        navigate('/kurikulum');
        break;

      case 'kepala_sekolah':
        navigate('/dashboard-kepsek');
        break;
      default:
        navigate('/guru/presensi');
        break;
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-slate-50 to-emerald-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Top Banner Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <img 
          src="/logo.png" 
          alt="Logo Tebuireng" 
          className="mx-auto h-24 w-auto drop-shadow-md mb-4" 
        />
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          SMA KH. A. WAHID HASYIM<br/>TEBUIRENG
        </h2>
        <p className="mt-2 text-sm text-emerald-800 font-semibold bg-emerald-100 inline-block px-4 py-1.5 rounded-full border border-emerald-200 shadow-sm">
          Sistem Informasi Manajemen Sekolah Terpadu
        </p>
      </div>

      {/* Main Form Container */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/90 backdrop-blur-md py-8 px-6 shadow-xl border border-white rounded-2xl sm:px-10">
          {error && (
            <div className="mb-6 bg-rose-50 border-l-4 border-rose-500 text-rose-700 p-4 rounded text-sm flex items-start space-x-3 shadow-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Username / NIP / ID Guru
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow shadow-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Memproses Autentikasi...' : 'Masuk ke Portal'}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center text-xs text-slate-500 font-medium">
          Pesantren Tebuireng Jombang &copy; 2026 SMA KH. A. Wahid Hasyim
        </div>
      </div>
    </div>
  );
};

export default Login;
