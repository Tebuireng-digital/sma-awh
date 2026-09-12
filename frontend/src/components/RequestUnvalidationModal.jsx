import React, { useState } from 'react';
import api from '../api/client';
import { RotateCcw, AlertTriangle, X, CheckCircle2, ShieldAlert } from 'lucide-react';

const RequestUnvalidationModal = ({ isOpen, onClose, target, onSuccess }) => {
  const [alasan, setAlasan] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !target) return null;

  const isClassScope = target.scope === 'class';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!alasan.trim() || alasan.trim().length < 5) {
      setError('Alasan pembatalan validasi minimal 5 karakter.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        scope: target.scope,
        kelas_id: target.kelas?.id,
        siswa_id: isClassScope ? null : (target.siswa?.id || target.siswa?.siswa_id),
        semester: target.semester || 'Ganjil',
        tahun_ajaran: target.tahun_ajaran || '2026/2027',
        alasan: alasan.trim(),
      };

      const res = await api.post('/rapor-sts/request-cancel-validasi', payload);
      if (res.data?.status === 'success') {
        setAlasan('');
        if (onSuccess) onSuccess(res.data);
        onClose();
      }
    } catch (err) {
      console.error('Gagal mengajukan pembatalan validasi:', err);
      const msg = err.response?.data?.message || 'Gagal mengajukan permohonan pembatalan validasi.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:hidden">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
        {/* Header Modal */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-700 border border-amber-500/20">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Pengajuan Pembatalan Validasi Rapor
              </h3>
              <p className="text-[11px] text-slate-500">
                Memerlukan persetujuan verifikasi oleh Administrator
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Target Metadata Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Ruang Lingkup</span>
              <span className="font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200 text-[11px]">
                {isClassScope ? 'Seluruh Siswa 1 Rombel' : '1 Santri Tertentu'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Rombel / Kelas</span>
              <span className="font-semibold text-slate-800">
                Kelas {target.kelas?.nama_kelas || '-'}
              </span>
            </div>

            {!isClassScope && target.siswa && (
              <div className="flex items-center justify-between pt-1 border-t border-slate-200/80">
                <span className="text-slate-500 font-medium">Nama Santri</span>
                <span className="font-bold text-slate-900 text-right">
                  {target.siswa.nama} <span className="font-mono text-slate-500 font-normal">({target.siswa.nis})</span>
                </span>
              </div>
            )}

            <div className="flex items-center justify-between pt-1 border-t border-slate-200/80 text-[11px]">
              <span className="text-slate-500">Periode Akademik</span>
              <span className="font-mono text-slate-700">
                Semester {target.semester || 'Ganjil'} • TA {target.tahun_ajaran || '2026/2027'}
              </span>
            </div>
          </div>

          {/* Warning Notice */}
          <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Sesuai kebijakan akademik, rapor yang telah divalidasi dan ditandatangani digital tidak dapat dibatalkan secara sepihak. Permohonan ini akan masuk ke antrean verifikasi Administrator.
            </p>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Reason Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Alasan Pembatalan Validasi <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              placeholder="Contoh: Terdapat perbaikan koreksi nilai STS mata pelajaran Fisika dan Matematika yang baru disusulkan oleh guru pengampu..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent transition-all placeholder:text-slate-400"
            />
            <span className="text-[10px] text-slate-400 block mt-1">
              Minimal 5 karakter. Alasan ini dicatat dalam log audit sekolah.
            </span>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting || !alasan.trim()}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Mengirim...</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Kirim Permohonan ke Admin</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestUnvalidationModal;
