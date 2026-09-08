import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../../components/public/PublicNavbar';
import PublicFooter from '../../components/public/PublicFooter';
import client from '../../api/client';

export default function PublicVisiMisiPage() {
  const [photos, setPhotos] = useState({
    img1: '/humas/visi-misi-img-1.jpg',
    img2: '/humas/visi-misi-img-2.jpg',
    img3: '/humas/visi-misi-img-3.jpg',
    img4: '/humas/47251278_1102449716593688_3082816894808214767_n.jpg',
  });

  useEffect(() => {
    client.get('/humas/konten-publik?kategori=Aset%20Web').then((res) => {
      if (res.data?.status === 'success' && Array.isArray(res.data.data)) {
        const items = res.data.data;
        const p1 = items.find((i) => i.slug === 'aset-visi-misi-img-1')?.image_url;
        const p2 = items.find((i) => i.slug === 'aset-visi-misi-img-2')?.image_url;
        const p3 = items.find((i) => i.slug === 'aset-visi-misi-img-3')?.image_url;
        const p4 = items.find((i) => i.slug === 'aset-visi-misi-img-4')?.image_url;
        setPhotos((prev) => ({
          img1: p1 || prev.img1,
          img2: p2 || prev.img2,
          img3: p3 || prev.img3,
          img4: p4 || prev.img4,
        }));
      }
    }).catch(() => {});
  }, []);

  const missionList = [
    'Membangun budaya tertib beribadah , sholat berjamaah .',
    'Membangun budaya literasi, khotmil Qur.an dan kajian Agama.',
    'Membangun budaya 5S (Senyum, Sapa, Salam, Santun dan Sopan )',
    'Membangun lingkungan belajar yang bersih, nyaman dan sehat.',
    'Membangun budaya disiplin, berprestasi dan mandiri.',
    'Meningkatkan rasa kepedulian, nasionalisme, patriotism, dang bangga atas budaya lokal pondok pesantren melalui aktivitas sosial, lingkungan dan kebangsaan.',
    'Melaksanakan kurikulum nasional dan mulok berbasis pesantren'
  ];

  return (
    <div className="bg-background text-on-surface font-body-md antialiased min-h-screen flex flex-col selection:bg-gold-medal selection:text-forest-deep">
      {/* 1. NAVBAR */}
      <PublicNavbar />

      <main className="flex-grow">
        {/* SUB-NAV / BREADCRUMB */}
        <section className="bg-surface-warm border-b border-border-subtle py-3 sm:py-4">
          <div className="max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
              <Link className="hover:text-forest-deep transition-colors" to="/">
                BERANDA
              </Link>
              <span className="material-symbols-outlined text-[13px] text-outline-variant">chevron_right</span>
              <span className="text-on-surface-variant">PROFIL</span>
              <span className="material-symbols-outlined text-[13px] text-outline-variant">chevron_right</span>
              <span aria-current="page" className="text-forest-deep font-bold">
                Visi dan Misi
              </span>
            </nav>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <Link
                to="/#profil"
                className="px-3 py-1 rounded-full text-xs font-semibold text-on-surface-variant hover:bg-surface-container whitespace-nowrap transition-colors"
              >
                Overview
              </Link>
              <Link
                to="/profil/sambutan"
                className="px-3 py-1 rounded-full text-xs font-semibold text-on-surface-variant hover:bg-surface-container whitespace-nowrap transition-colors"
              >
                Sambutan Kepala Sekolah
              </Link>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-forest-deep text-white whitespace-nowrap shadow-sm">
                Visi dan Misi
              </span>
              <Link
                to="/profil/sejarah"
                className="px-3 py-1 rounded-full text-xs font-semibold text-on-surface-variant hover:bg-surface-container whitespace-nowrap transition-colors"
              >
                Sejarah Sekolah
              </Link>
              <a
                href="/#fasilitas"
                className="px-3 py-1 rounded-full text-xs font-semibold text-on-surface-variant hover:bg-surface-container whitespace-nowrap transition-colors"
              >
                Fasilitas
              </a>
            </div>
          </div>
        </section>

        {/* HERO TITLE SECTION */}
        <section className="bg-surface-warm/60 border-b border-border-subtle py-8 md:py-12">
          <div className="max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-forest-deep/10 border border-forest-deep/20 text-forest-deep text-xs font-bold uppercase tracking-wider mb-3">
              <span className="material-symbols-outlined text-[15px]">flag</span>
              <span>Haluan Institusi Pendidikan</span>
            </div>
            <h1 className="font-headline-xl text-2xl sm:text-3xl lg:text-4xl font-extrabold text-forest-deep tracking-tight leading-tight">
              VISI & MISI
            </h1>
            <p className="mt-2 text-xs sm:text-sm md:text-base text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
              SMA A. Wahid Hasyim Tebuireng Jombang
            </p>
          </div>
        </section>

        {/* ==================== VISI & MISI CONTENT ==================== */}
        <section className="max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Column: Visi & Misi Text Content (7 cols) */}
            <div className="lg:col-span-7 space-y-10">
              {/* VISI BOX */}
              <div className="bg-surface-warm border border-border-subtle rounded-3xl p-6 sm:p-8 shadow-md elevation-1">
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gold-burnished mb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-gold-medal"></span>
                  <span>VISI SEKOLAH</span>
                </div>
                <h2 className="font-headline-xl text-xl sm:text-2xl font-bold text-forest-deep mb-4">
                  VISI
                </h2>
                <div className="p-5 sm:p-6 bg-surface-card rounded-2xl border-l-4 border-gold-medal shadow-sm">
                  <p className="font-headline-md text-base sm:text-xl font-bold text-forest-deep leading-relaxed">
                    “ Beriman, Bertaqwa, Berakhlaq Mulia, Berprestasi dan Mandiri “
                  </p>
                </div>
              </div>

              {/* MISI BOX */}
              <div className="bg-surface-warm border border-border-subtle rounded-3xl p-6 sm:p-8 shadow-md elevation-1">
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gold-burnished mb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-vibrant"></span>
                  <span>MISI SEKOLAH</span>
                </div>
                <h2 className="font-headline-xl text-xl sm:text-2xl font-bold text-forest-deep mb-4">
                  MISI
                </h2>
                <div className="space-y-3">
                  {missionList.map((item, index) => (
                    <div
                      key={index}
                      className="bg-surface-card border border-border-subtle rounded-xl p-4 flex items-start gap-3.5 shadow-sm"
                    >
                      <span className="w-7 h-7 rounded-lg bg-forest-deep text-white flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                        {index + 1}
                      </span>
                      <p className="text-xs sm:text-sm text-on-surface font-medium leading-relaxed">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: 4 Authentic Photos from Live Site (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-surface-warm border border-border-subtle rounded-3xl p-5 shadow-md elevation-1">
                <h3 className="font-headline-md text-sm font-bold text-forest-deep mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-gold-burnished text-[18px]">photo_library</span>
                  <span>Dokumentasi Kegiatan Siswa</span>
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl overflow-hidden border border-border-subtle aspect-[4/3] bg-surface-card">
                    <img
                      alt="Kegiatan Siswa SMA AWH 1"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      src={photos.img1}
                      onError={(e) => { e.target.src = '/humas/visi-misi-img-1.jpg'; }}
                    />
                  </div>
                  <div className="rounded-xl overflow-hidden border border-border-subtle aspect-[4/3] bg-surface-card">
                    <img
                      alt="Kegiatan Siswa SMA AWH 2"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      src={photos.img2}
                      onError={(e) => { e.target.src = '/humas/visi-misi-img-2.jpg'; }}
                    />
                  </div>
                  <div className="rounded-xl overflow-hidden border border-border-subtle aspect-[4/3] bg-surface-card">
                    <img
                      alt="Kegiatan Siswa SMA AWH 3"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      src={photos.img3}
                      onError={(e) => { e.target.src = '/humas/visi-misi-img-3.jpg'; }}
                    />
                  </div>
                  <div className="rounded-xl overflow-hidden border border-border-subtle aspect-[4/3] bg-surface-card">
                    <img
                      alt="Kegiatan Siswa SMA AWH 4"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      src={photos.img4}
                      onError={(e) => { e.target.src = '/humas/47251278_1102449716593688_3082816894808214767_n.jpg'; }}
                    />
                  </div>
                </div>
              </div>

              {/* Quick Navigation Card */}
              <div className="bg-forest-deep text-white rounded-3xl p-6 shadow-md space-y-3">
                <span className="text-xs uppercase tracking-wider text-gold-warm font-bold block">
                  Profil Lembaga
                </span>
                <h4 className="font-headline-md text-base sm:text-lg font-bold">
                  Pelajari Lebih Lanjut
                </h4>
                <p className="text-xs text-surface-warm/80 leading-relaxed">
                  Kenali sejarah berdirinya SMA A. Wahid Hasyim Tebuireng dan sambutan resmi kepala sekolah.
                </p>
                <div className="pt-2 flex flex-col gap-2">
                  <Link
                    to="/profil/sejarah"
                    className="inline-flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold transition-colors"
                  >
                    <span>Sejarah Sekolah</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                  <Link
                    to="/profil/sambutan"
                    className="inline-flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold transition-colors"
                  >
                    <span>Sambutan Kepala Sekolah</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <PublicFooter />
    </div>
  );
}
