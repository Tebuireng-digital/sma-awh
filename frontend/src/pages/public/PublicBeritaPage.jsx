import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useParams } from 'react-router-dom';
import PublicNavbar from '../../components/public/PublicNavbar';
import PublicFooter from '../../components/public/PublicFooter';
import { INITIAL_POSTS } from '../../data/publicNewsData';

export default function PublicBeritaPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { kategoriSlug } = useParams();
  const [searchQuery, setSearchQuery] = useState('');

  const [posts, setPosts] = useState(INITIAL_POSTS);

  const categories = [
    'Semua',
    'Berita',
    'Pengumuman',
    'Prestasi Akademik',
    'Prestasi Non Akademik'
  ];

  // Helper to map slugs or query params
  const getInitialCategory = () => {
    if (kategoriSlug) {
      const slugMap = {
        'berita': 'Berita',
        'pengumuman': 'Pengumuman',
        'prestasi-akademik': 'Prestasi Akademik',
        'prestasi-non-akademik': 'Prestasi Non Akademik'
      };
      return slugMap[kategoriSlug.toLowerCase()] || 'Semua';
    }
    const queryCat = searchParams.get('kategori');
    if (queryCat && categories.includes(queryCat)) {
      return queryCat;
    }
    return 'Semua';
  };

  const [selectedKategori, setSelectedKategori] = useState(getInitialCategory);

  useEffect(() => {
    setSelectedKategori(getInitialCategory());
  }, [kategoriSlug, searchParams]);

  useEffect(() => {
    const fetchApiPosts = async () => {
      try {
        const res = await fetch('/api/v1/humas/konten-publik?limit=30');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.data) && data.data.length > 0) {
            const apiItems = data.data
              .filter((item) => item.is_public !== false)
              .map((item) => ({
                id: item.id,
                kategori: item.kategori || 'Berita',
                is_pinned: !!item.is_pinned,
                tanggal: item.created_at
                  ? new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                  : 'Tebuireng',
                penulis: item.author || 'Humas SMA AWH',
                waktuBaca: '3 Menit Baca',
                judul: item.judul || '',
                ringkasan: item.ringkasan || (item.isi ? item.isi.replace(/<[^>]+>/g, '').slice(0, 160) + '...' : ''),
                image_url: item.image_url || '/logo.png',
                isi: item.isi || '',
                galeri: item.galeri_images || [],
              }));
            setPosts(apiItems);
          }
        }
      } catch (err) {
        console.warn('Gagal memuat berita dinamis, menggunakan fallback:', err);
      }
    };
    fetchApiPosts();
  }, []);

  const handleSelectCategory = (cat) => {
    setSelectedKategori(cat);
    if (cat === 'Semua') {
      searchParams.delete('kategori');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ kategori: cat });
    }
  };

  const featuredPost = posts.find((p) => p.is_pinned) || posts.find((p) => p.featured) || posts[0];

  const filteredPosts = posts.filter((post) => {
    const matchCat =
      selectedKategori === 'Semua' ||
      post.kategori === selectedKategori ||
      (Array.isArray(post.semuaKategori) && post.semuaKategori.includes(selectedKategori));

    if (!searchQuery || !searchQuery.trim()) {
      return matchCat;
    }

    const q = searchQuery.toLowerCase().trim();
    const judul = (post.judul || '').toLowerCase();
    const ringkasan = (post.ringkasan || '').toLowerCase();
    const isi = (typeof post.isi === 'string' ? post.isi.replace(/<[^>]+>/g, '') : '').toLowerCase();

    const matchSearch = judul.includes(q) || ringkasan.includes(q) || isi.includes(q);
    return matchCat && matchSearch;
  });

  return (
    <div className="bg-background text-on-surface font-body-md antialiased min-h-screen flex flex-col selection:bg-gold-medal selection:text-forest-deep">
      {/* 1. NAVBAR */}
      <PublicNavbar />

      <main className="flex-grow">
        {/* SUB-NAV & BREADCRUMB */}
        <section className="bg-surface-warm border-b border-border-subtle py-3 sm:py-4">
          <div className="max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
              <Link className="hover:text-forest-deep transition-colors" to="/">
                Beranda
              </Link>
              <span className="material-symbols-outlined text-[13px] text-outline-variant">chevron_right</span>
              <span aria-current="page" className="text-forest-deep font-bold">
                Berita & Cerita Sekolah
              </span>
            </nav>

            <span className="text-xs text-gold-burnished font-bold uppercase tracking-wider hidden sm:inline-block">
              Warta Resmi SMA AWH Tebuireng
            </span>
          </div>
        </section>

        {/* HERO TITLE & SEARCH */}
        <section className="bg-surface-warm/60 border-b border-border-subtle py-8 md:py-12">
          <div className="max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-deep/10 border border-forest-deep/20 text-forest-deep text-xs font-bold uppercase tracking-wider mb-3">
              <span className="material-symbols-outlined text-[15px]">newspaper</span>
              <span>Warta & Jurnalistik Tebuireng • Kabar Kampus Terkini</span>
            </div>
            <h1 className="font-headline-xl text-2xl sm:text-3xl lg:text-4xl font-extrabold text-forest-deep tracking-tight leading-tight">
              Berita & Cerita Sekolah
            </h1>
            <p className="mt-2 text-xs sm:text-sm md:text-base text-on-surface-variant leading-relaxed">
              Menyajikan kabar capaian prestasi, dinamika keilmuan santri, agenda madrasah, dan inspirasi keteladanan dari jantung Pesantren Tebuireng.
            </p>

            {/* Search Input Bar */}
            <div className="pt-6">
              <div className="relative max-w-xl">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari berita, agenda, atau prestasi santri..."
                  className="w-full bg-surface-card border border-border-strong rounded-2xl px-4 py-3 pl-11 text-xs sm:text-sm text-on-surface placeholder:text-outline focus:border-forest-deep focus:ring-2 focus:ring-forest-deep/10 outline-none shadow-sm transition-all"
                />
                <span className="material-symbols-outlined absolute left-3.5 top-3 text-[20px] text-on-surface-variant">
                  search
                </span>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-3 text-xs text-on-surface-variant hover:text-forest-deep"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex gap-2 overflow-x-auto pt-4 pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleSelectCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                    selectedKategori === cat
                      ? 'bg-forest-deep text-white border-forest-deep shadow-sm'
                      : 'bg-surface-card text-on-surface-variant border-border-subtle hover:border-forest-deep hover:text-forest-deep'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== FEATURED HERO STORY ==================== */}
        {!searchQuery && selectedKategori === 'Semua' && (
          <section className="py-10 md:py-12 bg-background">
            <div className="max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop">
              <div className="bg-surface-warm border border-border-subtle rounded-3xl p-6 sm:p-8 lg:p-10 shadow-lg elevation-2 hover:border-forest-deep transition-all">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  {/* Image Column */}
                  <div className="lg:col-span-6 relative rounded-2xl overflow-hidden border border-border-subtle shadow-md">
                    <img
                      alt={featuredPost.judul}
                      className="w-full h-64 sm:h-80 lg:h-96 object-cover"
                      src={featuredPost.image_url}
                    />
                    <div className="absolute top-3 left-3 bg-forest-deep/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/20">
                      Laporan Utama • {featuredPost.kategori}
                    </div>
                    <div className="absolute bottom-3 left-3 bg-forest-deep/80 text-white px-2.5 py-1 rounded-lg text-[11px] font-semibold backdrop-blur-sm flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      <span>{featuredPost.waktuBaca}</span>
                    </div>
                  </div>

                  {/* Content Column */}
                  <div className="lg:col-span-6 space-y-4">
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-gold-burnished uppercase tracking-wide">
                      <span className="material-symbols-outlined text-[16px]">verified</span>
                      <span>Karya Unggulan Santri Tebuireng</span>
                    </div>
                    <h2 className="font-headline-xl text-xl sm:text-2xl lg:text-3xl font-bold text-forest-deep leading-tight">
                      <Link to={`/berita/${featuredPost.id}`} className="hover:text-emerald-vibrant transition-colors">
                        {featuredPost.judul}
                      </Link>
                    </h2>
                    <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed line-clamp-3 sm:line-clamp-4">
                      {featuredPost.ringkasan}
                    </p>

                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-border-subtle">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center font-bold text-forest-deep text-xs border border-border-subtle">
                          WT
                        </div>
                        <div className="text-xs">
                          <p className="font-bold text-forest-deep">{featuredPost.penulis}</p>
                          <p className="text-on-surface-variant">{featuredPost.tanggal}</p>
                        </div>
                      </div>

                      <Link
                        to={`/berita/${featuredPost.id}`}
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-forest-deep hover:bg-emerald-deep text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm self-start sm:self-auto"
                      >
                        <span>Baca Selengkapnya</span>
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ==================== SEMUA BERITA & CERITA SEKOLAH ==================== */}
        <section className="py-12 bg-surface-warm border-t border-border-subtle">
          <div className="max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-border-subtle">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gold-burnished">
                  Arsip Warta Terkini
                </span>
                <h3 className="font-headline-md text-xl sm:text-2xl font-bold text-forest-deep">
                  Dinamika Riset, Akademik & Kepesantrenan
                </h3>
              </div>
              <span className="text-xs text-on-surface-variant font-semibold">
                Menampilkan {filteredPosts.length} Artikel
              </span>
            </div>

            {/* News Grid */}
            {filteredPosts.length === 0 ? (
              <div className="text-center py-16 bg-surface-card border border-border-subtle rounded-3xl p-8 max-w-xl mx-auto shadow-sm">
                <span className="material-symbols-outlined text-5xl text-outline-variant mb-3 block">
                  search_off
                </span>
                <h4 className="font-headline-md text-lg sm:text-xl font-bold text-forest-deep">
                  Tidak Ada Berita Ditemukan
                </h4>
                <p className="text-xs sm:text-sm text-on-surface-variant mt-2 leading-relaxed">
                  Tidak ditemukan berita yang cocok dengan kata kunci &ldquo;<span className="font-semibold text-forest-deep">{searchQuery}</span>&rdquo;
                  {selectedKategori !== 'Semua' && ` pada kategori "${selectedKategori}"`}.
                </p>
                <div className="pt-5 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedKategori('Semua');
                    }}
                    className="px-4 py-2 bg-forest-deep text-white rounded-xl text-xs font-semibold hover:bg-forest-deep/90 transition-all cursor-pointer shadow-xs"
                  >
                    Reset Pencarian
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post) => (
                  <article
                    key={post.id}
                    className="border border-border-subtle rounded-2xl bg-surface-card overflow-hidden flex flex-col justify-between hover:border-forest-deep transition-all duration-200 group shadow-sm hover:shadow-md elevation-1"
                  >
                    {post.image_url && (
                      <div className="h-48 overflow-hidden bg-surface-container relative">
                        <img
                          alt={post.judul}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          src={post.image_url}
                        />
                        <div className="absolute top-2.5 left-2.5 bg-forest-deep/80 backdrop-blur-sm text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          {post.kategoriPill || post.kategori}
                        </div>
                      </div>
                    )}

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-on-surface-variant mb-2">
                          <span>{post.tanggal}</span>
                          <span>•</span>
                          <span>{post.waktuBaca}</span>
                        </div>

                        <h4 className="font-headline-md text-sm sm:text-base font-bold text-forest-deep group-hover:text-emerald-vibrant transition-colors line-clamp-2 leading-snug">
                          <Link to={`/berita/${post.id}`}>
                            {post.judul}
                          </Link>
                        </h4>

                        <p className="text-xs text-on-surface-variant line-clamp-3 leading-relaxed mt-2 font-normal">
                          {post.ringkasan}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-border-subtle flex items-center justify-between text-xs text-forest-deep font-semibold">
                        <span className="text-on-surface-variant font-normal text-[11px]">{post.penulis}</span>
                        <Link
                          to={`/berita/${post.id}`}
                          className="inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                        >
                          <span>Baca</span>
                          <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>


      </main>

      {/* FOOTER */}
      <PublicFooter />
    </div>
  );
}
