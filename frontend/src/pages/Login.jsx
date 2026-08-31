import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Building, ShieldCheck, KeyRound, UserCheck, Smartphone, BookOpen, AlertCircle } from 'lucide-react';

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
      case 'piket':
        navigate('/piket');
        break;
      case 'kepala_sekolah':
        navigate('/dashboard-kepsek');
        break;
      default:
        navigate('/guru/presensi');
        break;
    }
  };

  const handleQuickLogin = async (userDemo, passDemo) => {
    setUsername(userDemo);
    setPassword(passDemo);
    setError(null);
    const res = await login(userDemo, passDemo);
    if (res.success) {
      redirectByRole(res.user.role);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Top Banner Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center p-3 bg-emerald-800 rounded-xl shadow-md text-white mb-3">
          <Building className="w-8 h-8 text-emerald-300" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          SMA KH. A. WAHID HASYIM TEBUIRENG
        </h2>
        <p className="mt-1 text-xs text-emerald-800 font-medium">
          Sistem Presensi Real-Time & Kurikulum Merdeka SIMANTEB
        </p>
      </div>

      {/* Main Form Container */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-lg sm:px-8">
          {error && (
            <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Username / NIP / ID Guru
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-sm rounded-md shadow-sm transition-colors focus:outline-none"
            >
              {loading ? 'Memproses Authentokasi...' : 'Masuk ke Portal'}
            </button>
          </form>

          {/* Quick Demo Credentials Panel */}
          <div className="mt-6 border-t border-slate-200 pt-5">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">
              Akses Cepat (Demo Mode Testing)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'admin123')}
                className="flex items-center justify-center space-x-1.5 p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-xs font-medium text-slate-700 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Admin Sistem</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('umar', 'guru123')}
                className="flex items-center justify-center space-x-1.5 p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-xs font-medium text-slate-700 transition-colors"
              >
                <Smartphone className="w-3.5 h-3.5 text-teal-700" />
                <span>Guru (Pak Umar)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('kurikulum', 'kurikulum123')}
                className="flex items-center justify-center space-x-1.5 p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-xs font-medium text-slate-700 transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-700" />
                <span>Waka Kurikulum</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('piket', 'piket123')}
                className="flex items-center justify-center space-x-1.5 p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-xs font-medium text-slate-700 transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5 text-amber-700" />
                <span>Guru Piket</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center text-[11px] text-slate-500">
          Pesantren Tebuireng Jombang &copy; 2026 SMA KH. A. Wahid Hasyim
        </div>
      </div>
    </div>
  );
};

export default Login;
