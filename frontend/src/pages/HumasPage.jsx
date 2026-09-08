import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import {
  Globe, Share2, Plus, Edit, Trash2, CheckCircle, Clock, AlertTriangle,
  Eye, ExternalLink, Image as ImageIcon, Send,
  Search, Filter, Check, X, ShieldAlert, Sparkles, FileText, ChevronRight, Images,
  Film, Copy, CheckCheck
} from 'lucide-react';

const InstagramIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

export default function HumasPage() {
  const [activeTab, setActiveTab] = useState('konten'); // 'konten', 'approval', 'editor', 'instagram'
  const [kontenList, setKontenList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter & Search
  const [filterKategori, setFilterKategori] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  // Galeri & Aset Website Filters
  const [assetFilter, setAssetFilter] = useState('all'); // 'all', 'profil', 'kesiswaan'
  const [assetSearch, setAssetSearch] = useState('');

  // Editor Form State
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    judul: '',
    kategori: 'Berita',
    ringkasan: '',
    isi: '',
    platform_target: 'Website',
    image_url: '',
    status: 'Pending Approval',
    is_pinned: false,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  // Gallery Images State (Gambar Pelengkap / Galeri Tambahan)
  const [existingGalleryImages, setExistingGalleryImages] = useState([]);
  const [selectedGalleryFiles, setSelectedGalleryFiles] = useState([]); // [{ file, preview }]

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState(null);

  // Approval Action State
  const [approvalModalPost, setApprovalModalPost] = useState(null);
  const [catatanRevisi, setCatatanRevisi] = useState('');
  const [approvalSubmitting, setApprovalSubmitting] = useState(false);

  // Preview Modal
  const [previewPost, setPreviewPost] = useState(null);
  const [copiedSlug, setCopiedSlug] = useState(null);

  const handleCopyUrl = (url, slug) => {
    const fullUrl = url?.startsWith('http') ? url : window.location.origin + (url || '');
    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullUrl);
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 2000);
    }
  };

  const getAssetLocationInfo = (slug) => {
    switch (slug) {
      case 'aset-visi-misi-img-1':
        return {
          location: 'Halaman Profil Visi Misi & Beranda Profil',
          link: '/profil/visi-misi',
          badge: 'Foto Santri Belajar',
          group: 'profil',
          isVideo: false,
        };
      case 'aset-visi-misi-img-2':
        return {
          location: 'Halaman Profil Visi Misi & Beranda Profil',
          link: '/profil/visi-misi',
          badge: 'Foto Keaktifan Santri',
          group: 'profil',
          isVideo: false,
        };
      case 'aset-visi-misi-img-3':
        return {
          location: 'Halaman Profil Visi Misi',
          link: '/profil/visi-misi',
          badge: 'Foto Pembinaan Akhlak',
          group: 'profil',
          isVideo: false,
        };
      case 'aset-visi-misi-img-4':
        return {
          location: 'Halaman Profil Visi Misi',
          link: '/profil/visi-misi',
          badge: 'Foto Santri Berprestasi',
          group: 'profil',
          isVideo: false,
        };
      case 'aset-gedung-kompleks-putra':
        return {
          location: 'Halaman Beranda (Gedung Kompleks Putra)',
          link: '/#kompleks',
          badge: 'Foto Kompleks Putra',
          group: 'profil',
          isVideo: false,
        };
      case 'aset-gedung-kompleks-putri':
        return {
          location: 'Halaman Beranda (Gedung Kompleks Putri)',
          link: '/#kompleks',
          badge: 'Foto Kompleks Putri',
          group: 'profil',
          isVideo: false,
        };
      case 'aset-video-profil-resmi-sma-awh':
        return {
          location: 'Halaman Beranda (Video Dokumenter Profil)',
          link: '/',
          badge: 'Video MP4 Resmi',
          group: 'profil',
          isVideo: true,
        };
      case 'aset-foto-kepala-sekolah':
        return {
          location: 'Halaman Sambutan Kepala Sekolah & Beranda Hero',
          link: '/profil/sambutan',
          badge: 'Foto Resmi Kepsek',
          group: 'profil',
          isVideo: false,
        };

      // Kesiswaan & Ekstrakurikuler
      case 'aset-kesiswaan-osis-1':
        return {
          location: 'Halaman Kesiswaan (Seksi OSIS - Foto 1)',
          link: '/kesiswaan#osis',
          badge: 'OSIS Pengurus',
          group: 'kesiswaan',
          isVideo: false,
        };
      case 'aset-kesiswaan-osis-2':
        return {
          location: 'Halaman Kesiswaan (Seksi OSIS - Foto 2)',
          link: '/kesiswaan#osis',
          badge: 'OSIS Diskusi Program',
          group: 'kesiswaan',
          isVideo: false,
        };
      case 'aset-kesiswaan-osis-3':
        return {
          location: 'Halaman Kesiswaan (Seksi OSIS - Foto 3)',
          link: '/kesiswaan#osis',
          badge: 'OSIS Kepanitiaan',
          group: 'kesiswaan',
          isVideo: false,
        };
      case 'aset-kesiswaan-mpk-1':
        return {
          location: 'Halaman Kesiswaan (Seksi MPK)',
          link: '/kesiswaan#mpk',
          badge: 'MPK Musyawarah',
          group: 'kesiswaan',
          isVideo: false,
        };
      case 'aset-kesiswaan-paskibra-1':
        return {
          location: 'Halaman Kesiswaan (Seksi Paskibra - Foto 1)',
          link: '/kesiswaan#paskibraka',
          badge: 'Paskibra Formasi',
          group: 'kesiswaan',
          isVideo: false,
        };
      case 'aset-kesiswaan-paskibra-2':
        return {
          location: 'Halaman Kesiswaan (Seksi Paskibra - Foto 2)',
          link: '/kesiswaan#paskibraka',
          badge: 'Paskibra Latihan PBB',
          group: 'kesiswaan',
          isVideo: false,
        };
      case 'aset-kesiswaan-paskibra-3':
        return {
          location: 'Halaman Kesiswaan (Seksi Paskibra - Foto 3)',
          link: '/kesiswaan#paskibraka',
          badge: 'Paskibra Upacara',
          group: 'kesiswaan',
          isVideo: false,
        };
      case 'aset-kesiswaan-olahraga-1':
        return {
          location: 'Halaman Kesiswaan (Seksi Olahraga - Foto 1)',
          link: '/kesiswaan#olahraga',
          badge: 'Basket Skuad Tim',
          group: 'kesiswaan',
          isVideo: false,
        };
      case 'aset-kesiswaan-olahraga-2':
        return {
          location: 'Halaman Kesiswaan (Seksi Olahraga - Foto 2)',
          link: '/kesiswaan#olahraga',
          badge: 'Basket Kejuaraan',
          group: 'kesiswaan',
          isVideo: false,
        };
      case 'aset-kesiswaan-olahraga-3':
        return {
          location: 'Halaman Kesiswaan (Seksi Olahraga - Foto 3)',
          link: '/kesiswaan#olahraga',
          badge: 'Olahraga Sportivitas',
          group: 'kesiswaan',
          isVideo: false,
        };
      case 'aset-kesiswaan-drumband-1':
        return {
          location: 'Halaman Kesiswaan (Seksi Drumband - Foto 1)',
          link: '/kesiswaan#drumband',
          badge: 'Drumband Bahana',
          group: 'kesiswaan',
          isVideo: false,
        };
      case 'aset-kesiswaan-drumband-2':
        return {
          location: 'Halaman Kesiswaan (Seksi Drumband - Foto 2)',
          link: '/kesiswaan#drumband',
          badge: 'Drumband Pawai Kirab',
          group: 'kesiswaan',
          isVideo: false,
        };
      case 'aset-kesiswaan-musik-1':
        return {
          location: 'Halaman Kesiswaan (Seksi Seni Musik - Foto 1)',
          link: '/kesiswaan#musik',
          badge: 'Pentas Seni Teater',
          group: 'kesiswaan',
          isVideo: false,
        };
      case 'aset-kesiswaan-musik-2':
        return {
          location: 'Halaman Kesiswaan (Seksi Seni Musik - Foto 2)',
          link: '/kesiswaan#musik',
          badge: 'Pentas Musik Santri',
          group: 'kesiswaan',
          isVideo: false,
        };
      default:
        return {
          location: slug?.startsWith('aset-kesiswaan') ? 'Halaman Kesiswaan' : 'Aset Website Umum',
          link: slug?.startsWith('aset-kesiswaan') ? '/kesiswaan' : '/website',
          badge: slug?.startsWith('aset-kesiswaan') ? 'Kesiswaan' : 'Media Aset',
          group: slug?.startsWith('aset-kesiswaan') ? 'kesiswaan' : 'profil',
          isVideo: false,
        };
    }
  };

  useEffect(() => {
    fetchKonten();
  }, []);

  const fetchKonten = async () => {
    setLoading(true);
    try {
      const res = await client.get('/humas/konten');
      if (res.data && res.data.status === 'success') {
        setKontenList(res.data.data || []);
      }
    } catch (err) {
      console.error('Gagal mengambil data konten:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePin = async (postId) => {
    try {
      const res = await client.post(`/humas/konten/${postId}/toggle-pin`);
      if (res.data && res.data.status === 'success') {
        setKontenList((prev) =>
          prev.map((item) =>
            item.id === postId ? { ...item, is_pinned: res.data.is_pinned } : item
          )
        );
      }
    } catch (err) {
      console.error('Gagal mengubah status pin:', err);
    }
  };

  const handleResetForm = () => {
    setEditingId(null);
    setFormData({
      judul: '',
      kategori: 'Berita',
      ringkasan: '',
      isi: '',
      platform_target: 'Website',
      image_url: '',
      status: 'Pending Approval',
      is_pinned: false,
    });
    setSelectedFile(null);
    setImagePreview('');
    setExistingGalleryImages([]);
    setSelectedGalleryFiles([]);
    setFormMessage(null);
  };

  const handleStartEdit = (post) => {
    setEditingId(post.id);
    setFormData({
      judul: post.judul || '',
      kategori: post.kategori || 'Berita',
      ringkasan: post.ringkasan || '',
      isi: post.isi || '',
      platform_target: post.platform_target || 'Website',
      image_url: post.image_url || '',
      status: post.status || 'Draft',
      is_pinned: !!post.is_pinned,
    });
    setImagePreview(post.image_url || '');
    setSelectedFile(null);
    setSelectedGalleryFiles([]);

    // Muat galeri gambar yang sudah tersimpan
    let gallery = [];
    if (Array.isArray(post.galeri_images)) {
      gallery = post.galeri_images;
    } else if (typeof post.galeri_images === 'string') {
      try {
        gallery = JSON.parse(post.galeri_images) || [];
      } catch (e) {
        gallery = [];
      }
    }
    setExistingGalleryImages(gallery);

    setActiveTab('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newItems = files.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setSelectedGalleryFiles((prev) => [...prev, ...newItems]);
    }
  };

  const handleRemoveExistingGalleryImage = (indexToRemove) => {
    setExistingGalleryImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleRemoveSelectedGalleryFile = (indexToRemove) => {
    setSelectedGalleryFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormMessage(null);

    const postData = new FormData();
    postData.append('judul', formData.judul);
    postData.append('kategori', formData.kategori);
    postData.append('ringkasan', formData.ringkasan);
    postData.append('isi', formData.isi);
    postData.append('platform_target', formData.platform_target);
    postData.append('status', formData.status);
    postData.append('is_pinned', formData.is_pinned ? '1' : '0');
    if (formData.image_url && !selectedFile) {
      postData.append('image_url', formData.image_url);
    }
    if (selectedFile) {
      postData.append('image', selectedFile);
    }

    // Lampirkan gambar galeri yang dipertahankan
    postData.append('existing_galeri', JSON.stringify(existingGalleryImages));

    // Lampirkan berkas foto galeri baru
    selectedGalleryFiles.forEach((item) => {
      postData.append('galeri[]', item.file);
    });

    try {
      const url = editingId ? `/humas/konten/${editingId}` : '/humas/konten';
      if (editingId) {
        postData.append('_method', 'PUT');
      }

      const res = await client.post(url, postData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data && res.data.status === 'success') {
        const isAsset = formData.kategori === 'Aset Web';
        setFormMessage({ type: 'success', text: res.data.message || 'Konten berhasil disimpan!' });
        await fetchKonten();
        setTimeout(() => {
          handleResetForm();
          setActiveTab(isAsset ? 'aset' : 'konten');
        }, 1200);
      } else {
        setFormMessage({ type: 'error', text: res.data?.message || 'Gagal menyimpan konten.' });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Terjadi kesalahan saat menyimpan konten.';
      setFormMessage({ type: 'error', text: msg });
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus konten ini?')) return;
    try {
      const res = await client.delete(`/humas/konten/${id}`);
      if (res.data && res.data.status === 'success') {
        await fetchKonten();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus konten.');
    }
  };

  const handleApprovalAction = async (action) => {
    if (!approvalModalPost) return;
    setApprovalSubmitting(true);
    try {
      const res = await client.post(`/humas/konten/${approvalModalPost.id}/approval`, {
        action,
        catatan: catatanRevisi,
      });
      if (res.data && res.data.status === 'success') {
        setApprovalModalPost(null);
        setCatatanRevisi('');
        await fetchKonten();
      } else {
        alert(res.data?.message || 'Gagal memproses approval.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Terjadi kesalahan jaringan.');
    } finally {
      setApprovalSubmitting(false);
    }
  };

  // Filtered list
  const filteredKonten = kontenList.filter(item => {
    const matchCat = filterKategori === 'Semua' || item.kategori === filterKategori;
    const matchStat = filterStatus === 'Semua' || item.status === filterStatus;
    const matchSearch = !searchQuery ||
      item.judul?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.ringkasan?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchStat && matchSearch;
  });

  // Filtered Aset Web
  const filteredAset = kontenList.filter(item => {
    if (item.kategori !== 'Aset Web') return false;
    const info = getAssetLocationInfo(item.slug);
    if (assetFilter !== 'all' && info.group !== assetFilter) return false;
    if (assetSearch.trim()) {
      const q = assetSearch.toLowerCase();
      const matchTitle = item.judul?.toLowerCase().includes(q);
      const matchBadge = info.badge?.toLowerCase().includes(q);
      const matchLoc = info.location?.toLowerCase().includes(q);
      const matchSlug = item.slug?.toLowerCase().includes(q);
      if (!matchTitle && !matchBadge && !matchLoc && !matchSlug) return false;
    }
    return true;
  });

  const totalAsetCount = kontenList.filter(i => i.kategori === 'Aset Web').length;
  const profilAsetCount = kontenList.filter(i => i.kategori === 'Aset Web' && getAssetLocationInfo(i.slug).group === 'profil').length;
  const kesiswaanAsetCount = kontenList.filter(i => i.kategori === 'Aset Web' && getAssetLocationInfo(i.slug).group === 'kesiswaan').length;

  const pendingApprovalList = kontenList.filter(item => item.status === 'Pending Approval');
  // Stats
  const countPublished = kontenList.filter(i => i.status === 'Published').length;
  const countPending = pendingApprovalList.length;
  const countDraft = kontenList.filter(i => i.status === 'Draft').length;
  const countPinned = kontenList.filter(i => i.is_pinned).length;

  return (
    <div className="space-y-6">
      
      {/* 1. HEADER HALAMAN */}
      <div className="bg-gradient-to-r from-[#0d281e] via-[#0f3527] to-[#124231] rounded-2xl p-6 text-white shadow-md border border-emerald-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-radial from-[#c8942a]/15 to-transparent rounded-full blur-2xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-white/10 border border-white/10 rounded-2xl text-[#fde047] backdrop-blur-sm shrink-0">
              <Globe className="w-7 h-7" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold backdrop-blur-sm mb-1.5 border border-white/10">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Modul Humas, Publikasi & Media Resmi</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <span>Humas & Branding Sekolah</span>
                <span className="text-xs bg-[#c8942a] text-[#0d281e] px-2 py-0.5 rounded-full font-bold">CMS Web</span>
              </h1>
              <p className="text-xs text-emerald-100/80 mt-1 max-w-xl">
                Kelola 4 klasifikasi konten (Berita, Pengumuman, Prestasi Akademik, Prestasi Non Akademik), 3 Pin Sorotan Beranda, dan sinkronisasi otomatis.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleSyncWebsite}
              disabled={syncLoading}
              className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-3.5 py-2.5 rounded-xl text-xs backdrop-blur-sm transition-all cursor-pointer disabled:opacity-50 shadow-sm"
              title="Tarik warta terbaru dari website resmi smaawhtebuireng.sch.id"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#fde047] ${syncLoading ? 'animate-spin' : ''}`} />
              <span>{syncLoading ? 'Sinkronisasi...' : 'Sinkron Website'}</span>
            </button>

            <button
              onClick={() => {
                handleResetForm();
                setShowModal(true);
              }}
              className="inline-flex items-center gap-1.5 bg-[#c8942a] hover:bg-[#b08122] text-[#0d281e] font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Konten Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. STATISTIK KONTEN BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-slate-100 text-slate-700">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900">{kontenList.length}</div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Artikel</div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-700">{countPublished}</div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Tayang di Web</div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-200 shadow-sm flex items-center gap-3.5 bg-gradient-to-br from-white to-amber-50/40">
          <div className="p-3 rounded-xl bg-amber-100 text-amber-800 font-bold text-base">
            📌
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-amber-800">{countPinned} <span className="text-xs font-normal text-slate-400 font-sans">/ 3 Beranda</span></div>
            <div className="text-[11px] font-semibold text-amber-900 uppercase tracking-wider">Pin Beranda</div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-700">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-amber-600">{countPending}</div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Menunggu Approval</div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-purple-50 text-purple-700">
            <Edit className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-purple-700">{countDraft}</div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Draft Humas</div>
          </div>
        </div>
      </div>

      {/* 3. TABS NAVIGASI CMS */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-1.5 flex flex-wrap gap-1.5">
        <button
          onClick={() => setActiveTab('konten')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'konten'
              ? 'bg-[#0d281e] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4 text-emerald-400" />
          <span>Semua Konten</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
            activeTab === 'konten' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            {kontenList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('aset')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'aset'
              ? 'bg-[#0d281e] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Images className="w-4 h-4 text-cyan-400" />
          <span>Galeri & Aset Website</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
            activeTab === 'aset' ? 'bg-white/20 text-white' : 'bg-cyan-100 text-cyan-800'
          }`}>
            {kontenList.filter(i => i.kategori === 'Aset Web').length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('approval')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'approval'
              ? 'bg-[#0d281e] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>Antrean Approval Kepsek</span>
          {countPending > 0 && (
            <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
              {countPending}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('editor')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'editor'
              ? 'bg-[#0d281e] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Plus className="w-4 h-4 text-blue-400" />
          <span>{editingId ? 'Edit Artikel' : 'Editor Publikasi'}</span>
        </button>

        <button
          onClick={() => setActiveTab('instagram')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'instagram'
              ? 'bg-[#0d281e] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <InstagramIcon className="w-4 h-4 text-pink-500" />
          <span>Simulator Feed Medsos</span>
        </button>
      </div>

      {/* TAB CONTENT: GALERI & ASET WEBSITE */}
      {activeTab === 'aset' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-50 text-cyan-800 text-[11px] font-bold mb-1.5 border border-cyan-200">
                  <Images className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Media Aset Statis & Dinamis Website Sekolah</span>
                </div>
                <h3 className="font-bold text-base sm:text-lg text-slate-900">
                  Kelola Galeri & Berkas Media Website Utama
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Foto dan video yang tampil di halaman publik (Visi Misi, Gedung Kompleks, dan Video Profil) tersimpan di database lokal. Jika ingin mengganti foto/video, klik tombol <strong>Edit / Ganti Media</strong>.
                </p>
              </div>

              <button
                onClick={() => {
                  handleResetForm();
                  setFormData(prev => ({
                    ...prev,
                    kategori: 'Aset Web',
                    status: 'Published',
                  }));
                  setActiveTab('editor');
                }}
                className="inline-flex items-center gap-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Aset Media Baru</span>
              </button>
            </div>

            {/* Filter Sub-Tabs & Search Bar for Aset */}
            <div className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                <button
                  onClick={() => setAssetFilter('all')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    assetFilter === 'all'
                      ? 'bg-emerald-800 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>Semua Media Web</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    assetFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {totalAsetCount}
                  </span>
                </button>

                <button
                  onClick={() => setAssetFilter('profil')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    assetFilter === 'profil'
                      ? 'bg-emerald-800 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>Beranda & Profil Utama</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    assetFilter === 'profil' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {profilAsetCount}
                  </span>
                </button>

                <button
                  onClick={() => setAssetFilter('kesiswaan')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    assetFilter === 'kesiswaan'
                      ? 'bg-emerald-800 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>Halaman Kesiswaan</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    assetFilter === 'kesiswaan' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {kesiswaanAsetCount}
                  </span>
                </button>
              </div>

              <div className="relative w-full md:w-72">
                <input
                  type="text"
                  placeholder="Cari aset (OSIS, Video, Kepsek...)"
                  value={assetSearch}
                  onChange={(e) => setAssetSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                {assetSearch && (
                  <button
                    onClick={() => setAssetSearch('')}
                    className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* List Aset Web Cards */}
            {filteredAset.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <Images className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">Tidak ada aset yang sesuai</p>
                <p className="text-xs text-slate-400 mt-0.5">Coba ubah filter atau kata kunci pencarian Anda.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-6">
                {filteredAset.map((item) => {
                  const info = getAssetLocationInfo(item.slug);
                  const isVideo = item.image_url?.endsWith('.mp4') || info.isVideo;

                return (
                  <div key={item.id} className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition-all group">
                    <div>
                      {/* Media Header / Placement Info */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-cyan-100 text-cyan-800 border border-cyan-200/60">
                          {info.badge}
                        </span>
                        <span className="text-[10px] font-mono font-semibold text-slate-400">
                          ID #{item.id}
                        </span>
                      </div>

                      {/* Visual Preview */}
                      <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-200 mb-3 aspect-video flex items-center justify-center">
                        {isVideo ? (
                          <video
                            src={item.image_url}
                            controls
                            preload="metadata"
                            className="w-full h-full object-cover"
                          >
                            Browser Anda tidak mendukung tag video.
                          </video>
                        ) : (
                          <img
                            src={item.image_url}
                            alt={item.judul}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = '/logo.png';
                            }}
                          />
                        )}
                        {isVideo && (
                          <span className="absolute top-2 right-2 bg-black/70 text-amber-300 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1 backdrop-blur-sm pointer-events-none">
                            <Film className="w-3 h-3" /> MP4 Video
                          </span>
                        )}
                      </div>

                      {/* Title & Description */}
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug mb-1 line-clamp-2">
                        {item.judul}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                        {item.ringkasan || item.isi}
                      </p>

                      {/* Placement in Web */}
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 text-[11px] space-y-1 mb-3">
                        <div className="text-slate-500 flex items-center gap-1">
                          <span className="font-semibold text-slate-700">Tampil Pada:</span>
                          <span className="text-emerald-800 font-bold">{info.location}</span>
                        </div>
                        <div className="text-slate-400 font-mono text-[10px] truncate" title={item.image_url}>
                          {item.image_url}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleStartEdit(item)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                          title="Ganti Foto atau Video ini"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Ganti / Edit</span>
                        </button>
                        <button
                          onClick={() => handleCopyUrl(item.image_url, item.slug)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
                          title="Salin path URL gambar"
                        >
                          {copiedSlug === item.slug ? (
                            <>
                              <CheckCheck className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-700 text-[10px]">Tersalin!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-slate-500" />
                              <span className="text-[10px]">Salin URL</span>
                            </>
                          )}
                        </button>
                      </div>

                      <Link
                        to={info.link}
                        target="_blank"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                        title="Tinjau di Halaman Web"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
            )}
          </div>
        </div>
      )}

      {/* 4. TAB CONTENT: SEMUA KONTEN */}
      {activeTab === 'konten' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          
          {/* Filter Bar */}
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Cari artikel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-500 font-medium">Kategori:</span>
                <select
                  value={filterKategori}
                  onChange={(e) => setFilterKategori(e.target.value)}
                  className="text-xs py-1 px-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="Semua">Semua Kategori</option>
                  <option value="Berita">Berita</option>
                  <option value="Pengumuman">Pengumuman</option>
                  <option value="Prestasi Akademik">Prestasi Akademik</option>
                  <option value="Prestasi Non Akademik">Prestasi Non Akademik</option>
                  <option value="Aset Web">Aset Web & Media</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-500 font-medium">Status:</span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="text-xs py-1 px-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="Semua">Semua Status</option>
                  <option value="Published">Published (Tayang)</option>
                  <option value="Pending Approval">Pending Approval</option>
                  <option value="Draft">Draft</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table Konten */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 w-12">#</th>
                  <th className="py-3 px-4">Artikel / Konten</th>
                  <th className="py-3 px-4 w-36">Kategori</th>
                  <th className="py-3 px-3 w-32 text-center">Pin Beranda</th>
                  <th className="py-3 px-4 w-28">Platform</th>
                  <th className="py-3 px-4 w-36">Status</th>
                  <th className="py-3 px-4 w-32">Tanggal</th>
                  <th className="py-3 px-4 w-28 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-10 text-slate-400">
                      Memuat data konten...
                    </td>
                  </tr>
                ) : filteredKonten.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-10 text-slate-400">
                      Tidak ada konten yang sesuai filter.
                    </td>
                  </tr>
                ) : (
                  filteredKonten.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-start gap-3">
                          {item.image_url?.endsWith('.mp4') ? (
                            <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-700 flex flex-col items-center justify-center text-amber-400 shrink-0 relative overflow-hidden">
                              <Film className="w-5 h-5" />
                              <span className="text-[8px] text-white font-mono">MP4</span>
                            </div>
                          ) : (
                            <img
                              src={item.image_url || '/logo.png'}
                              alt=""
                              className="w-12 h-12 object-cover rounded-lg bg-slate-100 border border-slate-200 shrink-0"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/logo.png';
                              }}
                            />
                          )}
                          <div>
                            <div
                              className="font-bold text-slate-900 leading-snug line-clamp-2 hover:text-emerald-800 cursor-pointer flex items-center gap-1.5"
                              onClick={() => setPreviewPost(item)}
                            >
                              {item.is_pinned && <span className="text-amber-500 font-normal shrink-0" title="Disematkan di Beranda">📌</span>}
                              <span>{item.judul}</span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                              {item.ringkasan}
                            </div>
                            {item.galeri_images && item.galeri_images.length > 0 && (
                              <div className="flex items-center gap-1 text-[10px] text-emerald-800 font-semibold bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded w-fit mt-1">
                                <Images className="w-3 h-3 text-emerald-700" />
                                <span>+{item.galeri_images.length} Foto Pelengkap</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          item.kategori === 'Prestasi Akademik'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : item.kategori === 'Prestasi Non Akademik'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : item.kategori === 'Pengumuman'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : item.kategori === 'Aset Web'
                            ? 'bg-cyan-50 text-cyan-800 border-cyan-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}>
                          {item.kategori}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {item.kategori !== 'Aset Web' ? (
                          <button
                            type="button"
                            onClick={() => handleTogglePin(item.id)}
                            title={item.is_pinned ? "Klik untuk melepas Pin dari Beranda" : "Klik untuk sematkan di 3 Pin Beranda"}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all shadow-xs cursor-pointer ${
                              item.is_pinned
                                ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 border border-slate-200'
                            }`}
                          >
                            <span>📌</span>
                            <span>{item.is_pinned ? 'Disematkan' : 'Pin'}</span>
                          </button>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {item.platform_target || 'Website'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit ${
                          item.status === 'Published'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'Pending Approval'
                            ? 'bg-amber-100 text-amber-800'
                            : item.status === 'Rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {item.status === 'Published' && <CheckCircle className="w-3 h-3" />}
                          {item.status === 'Pending Approval' && <Clock className="w-3 h-3" />}
                          {item.status === 'Rejected' && <X className="w-3 h-3" />}
                          <span>{item.status}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {item.published_at ? item.published_at.substring(0, 10) : item.created_at?.substring(0, 10)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setPreviewPost(item)}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                            title="Preview Konten"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleStartEdit(item)}
                            className="p-1.5 text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 rounded transition-colors"
                            title="Edit Konten"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeletePost(item.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
                            title="Hapus Konten"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* 5. TAB CONTENT: ANTREAN APPROVAL KEPSEK / WAKA */}
      {activeTab === 'approval' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              <span>Verifikasi & Persetujuan Publikasi Kepala Sekolah / Waka</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Semua konten yang dibuat oleh staf Humas berstatus <em>Pending Approval</em> harus ditinjau dan disetujui pimpinan sebelum tayang di Website Publik.
            </p>
          </div>

          {pendingApprovalList.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="font-bold text-sm text-slate-700">Tidak ada antrean konten yang menunggu persetujuan.</p>
              <p className="text-xs text-slate-400 mt-1">Semua pengajuan artikel telah diproses.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingApprovalList.map(post => (
                <div key={post.id} className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                        {post.kategori}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        ID #{post.id}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm leading-snug mb-2">
                      {post.judul}
                    </h4>

                    {post.image_url && (
                      <img
                        src={post.image_url}
                        alt=""
                        className="w-full h-36 object-cover rounded-lg border border-slate-200 mb-3 bg-white"
                        onError={(e) => { e.target.onerror = null; e.target.src = '/logo.png'; }}
                      />
                    )}

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-3">
                      {post.ringkasan || post.isi}
                    </p>

                    <div className="text-[11px] text-slate-400 border-t border-slate-200 pt-2">
                      Penulis: <strong>{post.author || 'Staf Humas'}</strong> • Target: {post.platform_target || 'Website'}
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-200 flex items-center gap-2">
                    <button
                      onClick={() => setApprovalModalPost(post)}
                      className="flex-1 inline-flex items-center justify-center gap-1 bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-2 rounded-lg text-xs transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      <span>Tinjau & Setujui</span>
                    </button>
                    <button
                      onClick={() => setPreviewPost(post)}
                      className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-white"
                      title="Lihat Detail"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. TAB CONTENT: EDITOR FORMULIR KONTEN */}
      {activeTab === 'editor' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 max-w-4xl mx-auto space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                {editingId ? 'Edit Konten Publikasi' : 'Buat Artikel / Konten Baru'}
              </h3>
              <p className="text-xs text-slate-500">
                Isi rincian berita, prestasi, atau kegiatan untuk dipublikasikan ke Website Sekolah dan Media Sosial
              </p>
            </div>
            {editingId && (
              <button
                onClick={handleResetForm}
                className="text-xs text-slate-400 hover:text-slate-600 underline"
              >
                Batal Edit
              </button>
            )}
          </div>

          {formMessage && (
            <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
              formMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {formMessage.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              <span>{formMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmitForm} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Judul Artikel <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.judul}
                onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                placeholder="Contoh: Selamat dan Sukses Peserta Kompetisi Sains Hardiknas 2026..."
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kategori <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.kategori}
                  onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="Berita">Berita</option>
                  <option value="Pengumuman">Pengumuman</option>
                  <option value="Prestasi Akademik">Prestasi Akademik</option>
                  <option value="Prestasi Non Akademik">Prestasi Non Akademik</option>
                  <option value="Aset Web">Aset Web & Media Website</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Publikasi
                </label>
                <select
                  value={formData.platform_target}
                  onChange={(e) => setFormData({ ...formData, platform_target: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="Website">Website Sekolah</option>
                  <option value="Instagram">Instagram Feed</option>
                  <option value="Semua">Semua (Website & Instagram)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Status Publikasi
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="Pending Approval">Ajukan Approval (Rekomendasi)</option>
                  <option value="Published">Langsung Terbitkan (Published)</option>
                  <option value="Draft">Simpan Draft</option>
                </select>
              </div>
            </div>

            {formData.kategori !== 'Aset Web' && (
              <div className="flex items-center gap-2.5 p-3 bg-amber-50/80 border border-amber-200 rounded-xl">
                <input
                  type="checkbox"
                  id="modal_is_pinned"
                  checked={formData.is_pinned}
                  onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                />
                <label htmlFor="modal_is_pinned" className="text-xs font-semibold text-amber-900 cursor-pointer flex items-center gap-1.5">
                  <span>📌</span>
                  <span>Sematkan di Beranda (Tampilkan dalam 3 Pin Utama Beranda)</span>
                </label>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ringkasan Singkat (Excerpt)
              </label>
              <textarea
                rows="2"
                value={formData.ringkasan}
                onChange={(e) => setFormData({ ...formData, ringkasan: e.target.value })}
                placeholder="Ringkasan 1-2 kalimat untuk pratinjau di kartu berita..."
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Isi Berita Lengkap <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows="8"
                required
                value={formData.isi}
                onChange={(e) => setFormData({ ...formData, isi: e.target.value })}
                placeholder="Tuliskan berita lengkap, narasi kegiatan, atau daftar pemenang lomba..."
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600 font-sans leading-relaxed"
              />
            </div>

            {/* Media Upload: Foto Utama & Foto Pelengkap (Galeri) */}
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-5">
              
              {/* 1. Foto Utama */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-emerald-700" />
                    <span>Gambar / Foto Utama Artikel</span>
                  </label>
                  <span className="text-[11px] text-slate-400">Tampil di header artikel & kartu depan</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">
                      Pilih File Foto / Video Lokal (Upload)
                    </label>
                    <input
                      type="file"
                      accept="image/*,video/mp4,video/*"
                      onChange={handleFileChange}
                      className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-emerald-100 file:text-emerald-800 hover:file:bg-emerald-200"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">
                      Atau Masukkan URL Gambar / Video
                    </label>
                    <input
                      type="text"
                      value={formData.image_url}
                      onChange={(e) => {
                        setFormData({ ...formData, image_url: e.target.value });
                        setImagePreview(e.target.value);
                      }}
                      placeholder="https://... atau /storage/humas/..."
                      className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-300"
                    />
                  </div>
                </div>

                {imagePreview && (
                  <div className="mt-3 flex items-center gap-3 bg-white p-2.5 rounded-lg border border-slate-200 w-fit">
                    {imagePreview.endsWith('.mp4') || selectedFile?.type?.startsWith('video/') ? (
                      <video
                        src={imagePreview}
                        controls
                        className="w-28 h-20 object-cover rounded-md border border-slate-300 bg-black"
                      />
                    ) : (
                      <img
                        src={imagePreview}
                        alt="Pratinjau Utama"
                        className="w-24 h-16 object-cover rounded-md border border-slate-200 bg-slate-100"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/logo.png';
                        }}
                      />
                    )}
                    <div>
                      <div className="text-xs font-bold text-slate-800">Media Terpilih</div>
                      <div className="text-[11px] text-emerald-700 font-medium">★ Berkas siap disimpan ke server</div>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Foto Pelengkap / Galeri Tambahan */}
              <div className="pt-4 border-t border-slate-200/80">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Images className="w-4 h-4 text-emerald-700" />
                    <span>Gambar Pelengkap / Galeri Tambahan (Slider di Bawah Foto Utama)</span>
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Bisa upload banyak foto sekaligus (Multiple)
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">
                      Pilih Satu atau Beberapa Foto Sekaligus:
                    </label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleGalleryFilesChange}
                      className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-amber-100 file:text-amber-900 hover:file:bg-amber-200"
                    />
                  </div>

                  {/* Thumbnail List of Existing & New Gallery Photos */}
                  {(existingGalleryImages.length > 0 || selectedGalleryFiles.length > 0) && (
                    <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                      <div className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                        <span>
                          Daftar Foto Pelengkap ({existingGalleryImages.length + selectedGalleryFiles.length} Foto):
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          Klik tanda silang (✕) untuk menghapus foto
                        </span>
                      </div>

                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 pt-1">
                        {/* Existing Gallery Photos */}
                        {existingGalleryImages.map((imgUrl, idx) => (
                          <div key={`exist-${idx}`} className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                            <img
                              src={imgUrl}
                              alt=""
                              className="w-full h-20 object-cover"
                              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/logo.png'; }}
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveExistingGalleryImage(idx)}
                              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow transition-transform hover:scale-110"
                              title="Hapus foto ini"
                            >
                              <X className="w-3 h-3" />
                            </button>
                            <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-white text-center py-0.5">
                              Tersimpan #{idx + 1}
                            </div>
                          </div>
                        ))}

                        {/* Newly Selected Gallery Photos */}
                        {selectedGalleryFiles.map((item, idx) => (
                          <div key={`new-${idx}`} className="relative group rounded-lg overflow-hidden border-2 border-amber-400 bg-amber-50/50">
                            <img
                              src={item.preview}
                              alt=""
                              className="w-full h-20 object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveSelectedGalleryFile(idx)}
                              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow transition-transform hover:scale-110"
                              title="Batalkan foto ini"
                            >
                              <X className="w-3 h-3" />
                            </button>
                            <div className="absolute bottom-0 inset-x-0 bg-amber-600 text-[9px] text-white font-bold text-center py-0.5">
                              Baru
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleResetForm}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={formSubmitting}
                className="inline-flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-6 py-2.5 rounded-lg text-xs shadow transition-all disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{formSubmitting ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Kirim Konten'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 7. TAB CONTENT: SIMULATOR INSTAGRAM FEED */}
      {activeTab === 'instagram' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <InstagramIcon className="w-5 h-5 text-pink-600" />
                <span>Simulator Feed Instagram Resmi @smaawhtebuireng</span>
              </h3>
              <p className="text-xs text-slate-500">
                Tinjau keselarasan visual konten media sosial sekolah dengan rasio 1:1 square
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {kontenList.slice(0, 12).map((item) => (
              <div
                key={item.id}
                onClick={() => setPreviewPost(item)}
                className="aspect-square relative rounded-xl overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer group shadow-sm hover:shadow-md transition-all"
              >
                <img
                  src={item.image_url || '/logo.png'}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => { e.target.onerror = null; e.target.src = '/logo.png'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2.5 flex flex-col justify-end text-white text-[11px]">
                  <span className="font-bold line-clamp-2">{item.judul}</span>
                  <span className="text-[10px] text-amber-300 mt-0.5">#{item.kategori} #SMAAWH</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
            <h4 className="font-bold text-slate-800">Format Standar Caption & Tagar Humas:</h4>
            <div className="p-3 bg-white rounded-lg border border-slate-200 font-mono text-[11px] text-slate-700">
              [JUDUL KEGIATAN/PRESTASI]<br /><br />
              SMA A. Wahid Hasyim Tebuireng terus berkomitmen mewujudkan generasi yang berakhlakul karimah, unggul dalam sains, dan berakar pada tradisi keilmuan pesantren.<br /><br />
              #SMAAWH #TebuirengJombang #SantriBerprestasi #ResearchCultureSchool #Hardiknas2026 #PesantrenTebuireng
            </div>
          </div>
        </div>
      )}

      {/* 8. MODAL APPROVAL KEPSEK / WAKA */}
      {approvalModalPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">
                Persetujuan Publikasi Artikel
              </h3>
              <button onClick={() => setApprovalModalPost(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                {approvalModalPost.kategori}
              </span>
              <h4 className="font-bold text-sm text-slate-900">
                {approvalModalPost.judul}
              </h4>
              <p className="text-xs text-slate-600 line-clamp-3">
                {approvalModalPost.ringkasan || approvalModalPost.isi}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Catatan Revisi (Jika Ditolak)
              </label>
              <textarea
                rows="3"
                value={catatanRevisi}
                onChange={(e) => setCatatanRevisi(e.target.value)}
                placeholder="Tuliskan catatan perbaikan atau alasan penolakan untuk Staf Humas..."
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleApprovalAction('reject')}
                disabled={approvalSubmitting}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-xs transition-colors"
              >
                Tolak & Minta Revisi
              </button>
              <button
                type="button"
                onClick={() => handleApprovalAction('approve')}
                disabled={approvalSubmitting}
                className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg text-xs shadow transition-colors"
              >
                Setujui & Publikasikan di Web
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. MODAL PREVIEW DETAIL ARTIKEL */}
      {previewPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  {previewPost.kategori}
                </span>
                <span className="text-xs text-slate-400">
                  Status: <strong>{previewPost.status}</strong>
                </span>
              </div>
              <button onClick={() => setPreviewPost(null)} className="text-slate-500 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <h2 className="text-xl font-bold text-slate-900">
                {previewPost.judul}
              </h2>

              {previewPost.image_url && (
                <div className="rounded-xl overflow-hidden bg-slate-900 max-h-72 border border-slate-200 flex items-center justify-center">
                  {previewPost.image_url.endsWith('.mp4') ? (
                    <video
                      src={previewPost.image_url}
                      controls
                      autoPlay
                      className="w-full max-h-72 object-contain bg-black"
                    >
                      Browser Anda tidak mendukung tag video.
                    </video>
                  ) : (
                    <img
                      src={previewPost.image_url}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.onerror = null; e.target.src = '/logo.png'; }}
                    />
                  )}
                </div>
              )}

              {/* Galeri Foto Pelengkap jika ada */}
              {Array.isArray(previewPost.galeri_images) && previewPost.galeri_images.length > 0 && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                    <Images className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Galeri Foto Pelengkap ({previewPost.galeri_images.length} Foto):</span>
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {previewPost.galeri_images.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt=""
                        className="w-20 h-14 object-cover rounded-lg border border-slate-200 shrink-0 bg-white"
                        onError={(e) => { e.target.onerror = null; e.target.src = '/logo.png'; }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div
                className="prose prose-sm text-xs text-slate-700 space-y-2"
                dangerouslySetInnerHTML={{ __html: previewPost.isi || previewPost.ringkasan }}
              />
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setPreviewPost(null)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-4 py-2 rounded-lg text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
