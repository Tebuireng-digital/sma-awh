import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import PublicNavbar from '../../components/public/PublicNavbar';
import PublicFooter from '../../components/public/PublicFooter';
import { INITIAL_POSTS } from '../../data/publicNewsData';

export default function PublicDetailBeritaPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [copiedLink, setCopiedLink] = useState(false);

  // Cari artikel berdasarkan ID (dengan fallback ke INITIAL_POSTS)
  const [post, setPost] = useState(
    () => INITIAL_POSTS.find((p) => String(p.id) === String(id) || p.id === id) || INITIAL_POSTS[0]
  );

  // Ambil artikel terkait
  const [relatedPosts, setRelatedPosts] = useState(() =>
    INITIAL_POSTS.filter((p) => String(p.id) !== String(id)).slice(0, 3)
  );

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`/api/v1/humas/konten-publik/${id}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            const item = json.data;
            setPost({
              id: item.id,
              judul: item.judul,
              kategori: item.kategori || 'Berita',
              tanggal: item.created_at
                ? new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                : 'Tebuireng',
              penulis: item.author || 'Humas SMA AWH',
              waktuBaca: '3 Menit Baca',
              image_url: item.image_url,
              ringkasan: item.ringkasan,
              isi: item.isi,
              galeri: Array.isArray(item.galeri_images) ? item.galeri_images : [],
            });

            if (Array.isArray(json.related) && json.related.length > 0) {
              setRelatedPosts(
                json.related.map((r) => ({
                  id: r.id,
                  judul: r.judul,
                  kategori: r.kategori || 'Berita',
                  tanggal: r.created_at
                    ? new Date(r.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                    : 'Tebuireng',
                  image_url: r.image_url,
                  ringkasan: r.ringkasan,
                }))
              );
            }
          }
        }
      } catch (err) {
        // Gunakan data awal
      }
    };
    fetchDetail();
  }, [id]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.judul,
        text: post.ringkasan,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="bg-background text-on-surface font-body-md antialiased min-h-screen flex flex-col selection:bg-gold-medal selection:text-forest-deep">
      {/* 1. NAVBAR */}
      <PublicNavbar />

      <main className="flex-grow">
        {/* SUB-NAV & BREADCRUMB */}
        <section className="bg-surface-warm border-b border-border-subtle py-3 sm:py-4">
          <div className="max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop flex items-center justify-between">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-on-surface-variant font-medium truncate">
              <Link className="hover:text-forest-deep transition-colors" to="/">
                Beranda
              </Link>
              <span className="material-symbols-outlined text-[13px] text-outline-variant">chevron_right</span>
              <Link className="hover:text-forest-deep transition-colors" to="/berita">
                Berita
              </Link>
              <span className="material-symbols-outlined text-[13px] text-outline-variant">chevron_right</span>
              <span aria-current="page" className="text-forest-deep font-bold truncate max-w-[200px] sm:max-w-md">
                {post.judul}
              </span>
            </nav>

            <Link
              to="/berita"
              className="text-xs text-forest-deep font-semibold hover:underline hidden sm:inline-flex items-center gap-1 shrink-0"
            >
              <span className="material-symbols-outlined text-[15px]">arrow_back</span>
              <span>Kembali ke Berita</span>
            </Link>
          </div>
        </section>

        {/* ARTICLE HEADER & TITLE */}
        <section className="bg-surface-warm/60 border-b border-border-subtle py-8 md:py-12">
          <div className="max-w-4xl mx-auto px-gutter-mobile md:px-gutter-desktop space-y-4">
            {/* Categories */}
            <div className="flex flex-wrap items-center gap-2">
              {(post.semuaKategori || [post.kategori || 'Berita']).map((cat) => (
                <Link
                  key={cat}
                  to={`/berita?kategori=${encodeURIComponent(cat)}`}
                  className="px-3 py-1 rounded-full bg-forest-deep text-white text-xs font-bold uppercase tracking-wider hover:bg-emerald-deep transition-colors"
                >
                  {cat}
                </Link>
              ))}
            </div>

            {/* Title */}
            <h1 className="font-headline-xl text-2xl sm:text-3xl lg:text-4xl font-extrabold text-forest-deep tracking-tight leading-tight">
              {post.judul}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
              {post.ringkasan}
            </p>

            {/* Author & Share Bar */}
            <div className="pt-4 border-t border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-forest-deep text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  AWH
                </div>
                <div className="text-xs">
                  <div className="font-bold text-forest-deep flex items-center gap-1">
                    <span>{post.penulis}</span>
                    <span className="material-symbols-outlined text-emerald-vibrant text-[15px]">verified</span>
                  </div>
                  <div className="text-on-surface-variant flex items-center gap-2 mt-0.5">
                    <span>{post.tanggal}</span>
                    <span>•</span>
                    <span>{post.waktuBaca}</span>
                  </div>
                </div>
              </div>

              {/* Share Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-border-strong rounded-lg text-xs font-semibold text-forest-deep hover:bg-surface-card transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {copiedLink ? 'check' : 'share'}
                  </span>
                  <span>{copiedLink ? 'Tautan Disalin!' : 'Bagikan'}</span>
                </button>
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(post.judul + ' ' + window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 border border-border-strong rounded-lg text-emerald-vibrant hover:bg-surface-card transition-colors"
                  aria-label="Bagikan ke WhatsApp"
                >
                  <span className="material-symbols-outlined text-[18px]">chat</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== 2-COLUMN EDITORIAL ARTICLE WRAPPER ==================== */}
        <div className="max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop py-10 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* LEFT COLUMN: MAIN ARTICLE (8 cols) */}
            <article className="lg:col-span-8 space-y-8">
              {/* Featured Cover Image */}
              <div className="rounded-3xl overflow-hidden border border-border-subtle shadow-md bg-surface-card relative elevation-1">
                <img
                  alt={post.judul}
                  className="w-full h-72 sm:h-96 md:h-[440px] object-cover"
                  src={post.image_url}
                />
                <div className="p-3.5 bg-surface-card border-t border-border-subtle flex items-center gap-2 text-xs text-on-surface-variant">
                  <span className="material-symbols-outlined text-forest-deep text-[18px]">photo_camera</span>
                  <span>Dokumentasi Resmi Prestasi Siswa SMA A. Wahid Hasyim Tebuireng Jombang.</span>
                </div>
              </div>

              {/* Callout Quote Box */}
              {post.quote && (
                <div className="p-6 sm:p-8 rounded-2xl bg-surface-card border-l-4 border-gold-medal shadow-sm elevation-1 space-y-2">
                  <div className="text-gold-medal text-3xl font-serif leading-none">“</div>
                  <p className="font-headline-md text-base sm:text-lg font-bold text-forest-deep leading-snug italic">
                    {post.quote}
                  </p>
                  {post.quoteAuthor && (
                    <p className="text-xs font-semibold text-gold-burnished pt-1">
                      — {post.quoteAuthor}
                    </p>
                  )}
                </div>
              )}

              {/* Formatted Article Body */}
              <div
                className="prose prose-emerald max-w-none text-sm sm:text-base text-on-surface leading-relaxed font-normal space-y-4"
                dangerouslySetInnerHTML={{ __html: post.isi }}
              />

              {/* Photo Gallery if present in the authentic article */}
              {Array.isArray(post.galeri) && post.galeri.length > 0 && (
                <div className="pt-6 border-t border-border-subtle space-y-4">
                  <h3 className="font-headline-md text-base sm:text-lg font-bold text-forest-deep flex items-center gap-2">
                    <span className="material-symbols-outlined text-gold-burnished text-xl">photo_library</span>
                    <span>Dokumentasi Foto Kegiatan ({post.galeri.length} Foto)</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {post.galeri.map((img, idx) => (
                      <div
                        key={idx}
                        className="rounded-2xl overflow-hidden border border-border-subtle bg-surface-card shadow-sm elevation-1 group"
                      >
                        <a href={img.full_src || img.src} target="_blank" rel="noopener noreferrer">
                          <img
                            alt={img.alt || `${post.judul} ${idx + 1}`}
                            className="w-full h-48 sm:h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                            src={img.src}
                            loading="lazy"
                          />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </article>

            {/* RIGHT COLUMN: STICKY SIDEBAR (4 cols) */}
            <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
              {/* Sekretariat & Konsultasi Card */}
              <div className="rounded-3xl bg-forest-deep text-white p-6 shadow-xl border border-white/10 space-y-4 elevation-2">
                <span className="material-symbols-outlined text-gold-warm text-3xl">school</span>
                <h3 className="font-headline-md text-lg sm:text-xl font-bold">
                  Konsultasi & Informasi Sekolah
                </h3>
                <p className="text-xs text-surface-warm/80 leading-relaxed">
                  Sekretariat SMA A. Wahid Hasyim Tebuireng siap melayani informasi akademik, legalitas, kurikulum, serta kunjungan kelembagaan.
                </p>
                <div className="space-y-2 pt-1">
                  <Link
                    to="/kontak"
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-gold-medal hover:bg-gold-warm text-forest-deep font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md"
                  >
                    <span className="material-symbols-outlined text-[16px]">call</span>
                    <span>Hubungi Sekretariat</span>
                  </Link>
                  <Link
                    to="/login"
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-white/10 hover:bg-white/15 text-surface-warm font-semibold rounded-xl text-xs transition-all border border-white/15"
                  >
                    <span className="material-symbols-outlined text-[16px] text-gold-medal">login</span>
                    <span>Portal Login Sistem</span>
                  </Link>
                </div>
              </div>

              {/* Kategori Berita Widget */}
              <div className="rounded-3xl bg-surface-warm border border-border-subtle p-6 shadow-md elevation-1 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                  <h4 className="font-headline-md text-sm font-bold text-forest-deep">
                    Kategori Berita
                  </h4>
                  <span className="text-[11px] text-gold-burnished font-semibold uppercase">Arsip</span>
                </div>

                <div className="space-y-2 text-xs">
                  {['Berita', 'Kegiatan', 'Prestasi Akademik', 'Prestasi Non Akademik', 'Karya Tulis'].map((cat) => (
                    <Link
                      key={cat}
                      to={`/berita?kategori=${encodeURIComponent(cat)}`}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-surface-card hover:bg-surface-container transition-colors text-forest-deep font-semibold"
                    >
                      <span>{cat}</span>
                      <span className="material-symbols-outlined text-[16px] text-on-surface-variant">arrow_forward</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Falsafah Keilmuan Box */}
              <div className="p-5 rounded-2xl bg-surface-card border border-border-subtle space-y-2 text-center elevation-1">
                <span className="material-symbols-outlined text-gold-burnished text-2xl">menu_book</span>
                <h4 className="font-bold text-xs uppercase tracking-wider text-forest-deep">
                  Falsafah Keilmuan
                </h4>
                <p className="text-xs italic text-on-surface-variant leading-relaxed">
                  "Menuntut ilmu dan mengamalkannya adalah ibadah agung. Kemenangan sejati seorang santri adalah antara hati yang bersih dan ketajaman akal."
                </p>
                <span className="text-[11px] text-gold-burnished font-semibold block pt-1">
                  — Wasiat Pendiri Pesantren
                </span>
              </div>
            </aside>
          </div>
        </div>

        {/* ==================== KABAR & CERITA TERKAIT ==================== */}
        <section className="py-12 bg-surface-warm border-t border-border-subtle">
          <div className="max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-border-subtle">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gold-burnished">
                  Liputan Khusus
                </span>
                <h3 className="font-headline-md text-xl sm:text-2xl font-bold text-forest-deep">
                  Kabar & Cerita Terkait
                </h3>
              </div>
              <Link to="/berita" className="text-xs text-forest-deep font-semibold hover:underline flex items-center gap-1">
                <span>Lihat Seluruh Arsip Berita</span>
                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((rPost) => (
                <article
                  key={rPost.id}
                  className="border border-border-subtle rounded-2xl bg-surface-card overflow-hidden flex flex-col justify-between hover:border-forest-deep transition-all duration-200 group shadow-sm hover:shadow-md elevation-1"
                >
                  {rPost.image_url && (
                    <div className="h-44 overflow-hidden bg-surface-container relative">
                      <img
                        alt={rPost.judul}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        src={rPost.image_url}
                      />
                      <div className="absolute top-2.5 left-2.5 bg-forest-deep/80 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {rPost.kategoriPill || rPost.kategori}
                      </div>
                    </div>
                  )}

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-2.5">
                    <div>
                      <div className="text-[11px] text-on-surface-variant mb-1">{rPost.tanggal}</div>
                      <h4 className="font-headline-md text-sm sm:text-base font-bold text-forest-deep group-hover:text-emerald-vibrant transition-colors line-clamp-2 leading-snug">
                        <Link to={`/berita/${rPost.id}`}>
                          {rPost.judul}
                        </Link>
                      </h4>
                      <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed mt-1 font-normal">
                        {rPost.ringkasan}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-border-subtle flex items-center justify-between text-xs text-forest-deep font-semibold">
                      <span className="text-[11px] text-on-surface-variant font-normal">{rPost.penulis}</span>
                      <Link to={`/berita/${rPost.id}`} className="inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        <span>Baca</span>
                        <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <PublicFooter />
    </div>
  );
}
