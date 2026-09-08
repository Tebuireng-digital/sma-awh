import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            
            <h2 className="text-lg font-bold text-slate-900">
              Terjadi Kendala Memuat Halaman
            </h2>
            
            <p className="text-xs text-slate-500 leading-relaxed">
              Sistem mendeteksi kendala pada komponen antarmuka. Silakan muat ulang halaman atau kembali ke halaman utama.
            </p>

            {this.state.error && (
              <div className="p-3 bg-slate-100 rounded-lg text-left overflow-x-auto">
                <code className="text-[11px] text-rose-700 font-mono">
                  {this.state.error.toString()}
                </code>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={this.handleReload}
                className="inline-flex items-center gap-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-4 py-2 rounded-lg text-xs transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Muat Ulang</span>
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-lg text-xs transition-colors border border-slate-300"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Ke Beranda</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
