import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { 
  X, RotateCcw, Clock, CheckCircle2, AlertCircle, XCircle, 
  ShieldCheck, AlertTriangle, MessageSquare, ChevronDown, Check, Filter
} from 'lucide-react';

const UnvalidationQueueModal = ({ isOpen, onClose, isAdmin = false, onActionComplete }) => {
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [filterStatus, setFilterStatus] = useState(''); // '' for all, 'pending', 'approved', 'rejected'
  const [processingId, setProcessingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [catatanText, setCatatanText] = useState('');
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchRequests();
    }
  }, [isOpen, filterStatus]);

  const fetchRequests = async () => {
    setLoading(true);
    setActionError(null);
    try {
      const url = filterStatus 
        ? `/rapor-sts/unvalidation-requests?status=${filterStatus}` 
        : '/rapor-sts/unvalidation-requests';
      const res = await api.get(url);
      if (res.data?.status === 'success') {
        setRequests(res.data.data || []);
      }
    } catch (err) {
      console.error('Gagal mengambil antrean pembatalan validasi:', err);
      setActionError('Gagal memuat antrean permohonan.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (item) => {
    const scopeLabel = item.siswa_id ? `Santri ${item.nama_siswa}` : `Seluruh Kelas ${item.nama_kelas}`;
    if (!window.confirm(`Setujui pembatalan validasi rapor untuk ${scopeLabel}? Status rapor akan dikembalikan menjadi Draft.`)) {
      return;
    }

    setProcessingId(item.id);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await api.post(`/rapor-sts/unvalidation-requests/${item.id}/approve`, {
        catatan_admin: catatanText.trim() || 'Disetujui oleh Administrator Madrasah.',
      });
      if (res.data?.status === 'success') {
        setActionSuccess(`Berhasil menyetujui pembatalan validasi untuk ${scopeLabel}.`);
        setCatatanText('');
        fetchRequests();
        if (onActionComplete) onActionComplete();
      }
    } catch (err) {
      console.error('Gagal menyetujui pembatalan:', err);
      setActionError(err.response?.data?.message || 'Gagal menyetujui permohonan.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleStartReject = (item) => {
    setRejectingId(item.id);
    setCatatanText('');
    setActionError(null);
  };

  const handleCancelReject = () => {
    setRejectingId(null);
    setCatatanText('');
  };

  const handleConfirmReject = async (item) => {
    if (!catatanText.trim()) {
      setActionError('Catatan alasan penolakan wajib diisi.');
      return;
    }

    setProcessingId(item.id);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await api.post(`/rapor-sts/unvalidation-requests/${item.id}/reject`, {
        catatan_admin: catatanText.trim(),
      });
      if (res.data?.status === 'success') {
        setActionSuccess(`Permohonan pembatalan ditolak.`);
        setRejectingId(null);
        setCatatanText('');
        fetchRequests();
        if (onActionComplete) onActionComplete();
      }
    } catch (err) {
      console.error('Gagal menolak permohonan:', err);
      setActionError(err.response?.data?.message || 'Gagal menolak permohonan.');
    } finally {
      setProcessingId(null);
    }
  };

  if (!isOpen) return null;

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:hidden">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
        {/* Header Modal */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-800 text-white shadow-sm">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Antrean Permohonan Pembatalan Validasi Rapor
                </h3>
                {pendingCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold font-mono">
                    {pendingCount} Menunggu
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                {isAdmin 
                  ? 'Verifikasi dan persetujuan pembatalan validasi rapor dari Wali Kelas'
                  : 'Riwayat pengajuan pembatalan validasi rapor yang Anda ajukan'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter & Actions Bar */}
        <div className="px-5 py-3 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Status:</span>
            </span>
            {[
              { id: '', label: 'Semua' },
              { id: 'pending', label: 'Menunggu Review' },
              { id: 'approved', label: 'Disetujui' },
              { id: 'rejected', label: 'Ditolak' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  filterStatus === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-[11px] text-slate-500 font-mono">
            Total: {requests.length} Permohonan
          </div>
        </div>

        {/* Notifications */}
        {actionSuccess && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{actionSuccess}</span>
          </div>
        )}
        {actionError && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-semibold">{actionError}</span>
          </div>
        )}

        {/* Request List */}
        <div className="p-5 overflow-y-auto space-y-3.5 flex-1">
          {loading ? (
            <div className="py-12 text-center text-xs font-mono text-slate-500 flex flex-col items-center justify-center space-y-2">
              <div className="w-6 h-6 border-2 border-emerald-800 border-t-transparent rounded-full animate-spin"></div>
              <span>Memuat antrean permohonan...</span>
            </div>
          ) : requests.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 flex flex-col items-center justify-center space-y-2">
              <ShieldCheck className="w-10 h-10 text-slate-300" />
              <p className="font-medium">Tidak ada permohonan pembatalan validasi yang ditemukan.</p>
              <p className="text-[11px] text-slate-400">Seluruh status rapor saat ini telah sinkron dan valid.</p>
            </div>
          ) : (
            requests.map((item) => {
              const isItemPending = item.status === 'pending';
              const isItemApproved = item.status === 'approved';
              const isItemRejected = item.status === 'rejected';
              const isRejecting = rejectingId === item.id;
              const isProcessing = processingId === item.id;

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isItemPending
                      ? 'bg-amber-50/40 border-amber-200'
                      : isItemApproved
                      ? 'bg-emerald-50/20 border-emerald-200'
                      : 'bg-rose-50/20 border-rose-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    {/* Left: Metadata & Alasan */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Scope Badge */}
                        <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white text-[10px] font-bold">
                          {item.siswa_id ? 'Santri Individual' : '1 Rombel Penuh'}
                        </span>

                        {/* Status Badge */}
                        {isItemPending && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold">
                            <Clock className="w-3 h-3 text-amber-700" />
                            <span>Menunggu Persetujuan</span>
                          </span>
                        )}
                        {isItemApproved && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                            <span>Disetujui Admin</span>
                          </span>
                        )}
                        {isItemRejected && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-100 text-rose-900 border border-rose-300 text-[10px] font-bold">
                            <XCircle className="w-3 h-3 text-rose-700" />
                            <span>Ditolak</span>
                          </span>
                        )}

                        <span className="text-[11px] font-mono text-slate-500">
                          {item.created_at ? new Date(item.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-'}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="text-xs">
                        <span className="font-bold text-slate-900">
                          {item.siswa_id ? (
                            <>Santri: <span className="text-emerald-900">{item.nama_siswa}</span> <span className="font-mono text-slate-500 font-normal">({item.nis_siswa})</span> • Kelas {item.nama_kelas}</>
                          ) : (
                            <>Seluruh Siswa Kelas {item.nama_kelas}</>
                          )}
                        </span>
                        <div className="text-[11px] text-slate-500">
                          Wali Kelas Pemohon: <span className="font-semibold text-slate-700">{item.nama_wali_pemohon || 'Wali Kelas'}</span> • Periode: <span className="font-mono text-slate-700">Sem. {item.semester} {item.tahun_ajaran}</span>
                        </div>
                      </div>

                      {/* Reason */}
                      <div className="mt-2 p-2.5 rounded-lg bg-white border border-slate-200 text-xs">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          <span>Alasan Pengajuan Wali Kelas:</span>
                        </div>
                        <p className="text-slate-800 leading-relaxed italic">
                          "{item.alasan}"
                        </p>
                      </div>

                      {/* Admin Note if resolved */}
                      {item.catatan_admin && (
                        <div className={`mt-2 p-2.5 rounded-lg border text-xs ${
                          isItemApproved ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950' : 'bg-rose-50/80 border-rose-200 text-rose-950'
                        }`}>
                          <div className="text-[10px] font-bold uppercase tracking-wider mb-0.5">
                            Catatan Administrator ({item.nama_admin_penyetuju || 'Admin'}):
                          </div>
                          <p className="leading-relaxed">
                            {item.catatan_admin}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Right: Admin Action Buttons */}
                    {isAdmin && isItemPending && (
                      <div className="flex sm:flex-col items-center gap-2 shrink-0 pt-2 sm:pt-0">
                        {!isRejecting ? (
                          <>
                            <button
                              onClick={() => handleApprove(item)}
                              disabled={isProcessing}
                              className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1 w-full justify-center disabled:opacity-50"
                              title="Setujui pembatalan dan kembalikan status rapor ke Draft"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Setujui</span>
                            </button>

                            <button
                              onClick={() => handleStartReject(item)}
                              disabled={isProcessing}
                              className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 text-xs font-bold transition-all flex items-center gap-1 w-full justify-center"
                              title="Tolak permohonan pembatalan validasi"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Tolak</span>
                            </button>
                          </>
                        ) : (
                          <div className="w-full sm:w-64 p-3 bg-white rounded-xl border border-rose-300 shadow-sm space-y-2">
                            <div className="text-[11px] font-bold text-rose-800">
                              Alasan Penolakan:
                            </div>
                            <textarea
                              rows={2}
                              value={catatanText}
                              onChange={(e) => setCatatanText(e.target.value)}
                              placeholder="Masukkan alasan penolakan permohonan..."
                              className="w-full p-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
                              autoFocus
                            />
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={handleCancelReject}
                                className="px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 rounded"
                              >
                                Batal
                              </button>
                              <button
                                onClick={() => handleConfirmReject(item)}
                                disabled={isProcessing || !catatanText.trim()}
                                className="px-2.5 py-1 text-[11px] font-bold bg-rose-600 hover:bg-rose-700 text-white rounded shadow-xs disabled:opacity-50"
                              >
                                {isProcessing ? 'Memproses...' : 'Kirim Penolakan'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Modal */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500 text-[11px]">
            SMA A. Wahid Hasyim Tebuireng • Sistem Validasi Rapor STS
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnvalidationQueueModal;
