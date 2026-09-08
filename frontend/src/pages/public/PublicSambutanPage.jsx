import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import PublicNavbar from '../../components/public/PublicNavbar';
import PublicFooter from '../../components/public/PublicFooter';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function PublicSambutanPage() {
  const [fotoKepsek, setFotoKepsek] = useState('/humas/kepala-sekolah-nikmaturrohmah.jpg');
  const containerRef = useRef(null);

  useGSAP(() => {
    // Header Title
    gsap.fromTo(
      '.gsap-sambutan-header',
      { opacity: 0, y: 25 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', clearProps: 'opacity,transform' }
    );

    // Foto Kepala Sekolah (Sidebar)
    gsap.fromTo(
      '.gsap-kepsek-sidebar',
      { opacity: 0, x: -30 },
      { opacity: 1, x: 0, duration: 0.9, delay: 0.2, ease: 'power2.out', clearProps: 'opacity,transform' }
    );

    // Naskah Sambutan
    gsap.fromTo(
      '.gsap-sambutan-article',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.9, delay: 0.3, ease: 'power2.out', clearProps: 'opacity,transform' }
    );

    // Quote / Harapan Box
    gsap.fromTo(
      '.gsap-harapan-box',
      { opacity: 0, scale: 0.98 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.7,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
        scrollTrigger: {
          trigger: '.gsap-harapan-box',
          start: 'top 85%',
          once: true,
        },
      }
    );
  }, { scope: containerRef });

  useEffect(() => {
    const fetchFotoKepsek = async () => {
      try {
        const res = await fetch('/api/v1/humas/konten-publik?kategori=Aset%20Web');
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.data)) {
            const asset = json.data.find((item) => item.slug === 'aset-foto-kepala-sekolah');
            if (asset && asset.image_url) {
              setFotoKepsek(asset.image_url);
            }
          }
        }
      } catch (err) {
        console.warn('Gagal memuat foto kepsek dari API, menggunakan foto lokal:', err);
      }
    };
    fetchFotoKepsek();
  }, []);
  return (
    <div className="bg-background text-on-surface font-body-md antialiased min-h-screen flex flex-col selection:bg-gold-medal selection:text-forest-deep">
      {/* 1. NAVBAR */}
      <PublicNavbar />

      <main ref={containerRef} className="flex-grow">
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
                Sambutan Kepala Sekolah
              </span>
            </nav>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <Link
                to="/#profil"
                className="px-3 py-1 rounded-full text-xs font-semibold text-on-surface-variant hover:bg-surface-container whitespace-nowrap transition-colors"
              >
                Overview
              </Link>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-forest-deep text-white whitespace-nowrap shadow-sm">
                Sambutan
              </span>
              <Link
                to="/profil/visi-misi"
                className="px-3 py-1 rounded-full text-xs font-semibold text-on-surface-variant hover:bg-surface-container whitespace-nowrap transition-colors"
              >
                Visi dan Misi
              </Link>
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
        <section className="gsap-sambutan-header bg-surface-warm/60 border-b border-border-subtle py-8 md:py-12">
          <div className="max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-deep/10 border border-forest-deep/20 text-forest-deep text-xs font-bold uppercase tracking-wider mb-3">
              <span className="material-symbols-outlined text-[15px]">record_voice_over</span>
              <span>Pimpinan Lembaga</span>
            </div>
            <h1 className="font-headline-xl text-2xl sm:text-3xl lg:text-4xl font-extrabold text-forest-deep tracking-tight leading-tight">
              Sambutan Kepala Sekolah SMA A. Wahid Hasyim Tebuireng
            </h1>
          </div>
        </section>

        {/* MAIN EDITORIAL CONTENT */}
        <div className="max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* SIDEBAR: FOTO KEPALA SEKOLAH (4 cols) */}
            <aside className="gsap-kepsek-sidebar md:col-span-5 lg:col-span-4 order-1 md:order-1">
              <div className="bg-surface-warm border border-border-subtle rounded-3xl overflow-hidden shadow-md elevation-2 md:sticky md:top-24">
                <div className="p-5 border-b border-border-subtle flex justify-center bg-surface-card">
                  <div className="w-full max-w-[240px] aspect-[0.9] rounded-2xl overflow-hidden border border-border-subtle bg-white shadow-sm">
                    <img
                      alt="Kepala Sekolah SMA A. Wahid Hasyim Tebuireng Jombang NIKMATURROHMAH, M.Pd."
                      className="w-full h-full object-cover object-top"
                      src={fotoKepsek}
                      onError={(e) => {
                        if (e.target.src !== window.location.origin + '/humas/kepala-sekolah-nikmaturrohmah.jpg') {
                          e.target.src = '/humas/kepala-sekolah-nikmaturrohmah.jpg';
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="p-5 sm:p-6 space-y-3 text-center sm:text-left">
                  <span className="px-2.5 py-0.5 rounded-full bg-forest-deep text-white text-[10px] font-bold uppercase tracking-wider inline-block">
                    Kepala Sekolah
                  </span>
                  <h2 className="font-headline-md text-lg sm:text-xl font-bold text-forest-deep leading-snug">
                    NIKMATURROHMAH, M.Pd.
                  </h2>
                  <p className="text-xs text-on-surface-variant">
                    SMA A. Wahid Hasyim Tebuireng Jombang
                  </p>

                  <div className="pt-3 border-t border-border-subtle">
                    <Link
                      to="/kontak"
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-forest-deep hover:bg-emerald-deep text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[16px]">mail</span>
                      <span>Hubungi Sekolah</span>
                    </Link>
                  </div>
                </div>
              </div>
            </aside>

            {/* MAIN ARTICLE: NASKAH VERBATIM SAMBUTAN DARI SITUS RESMI (8 cols) */}
            <article className="gsap-sambutan-article md:col-span-7 lg:col-span-8 order-2 md:order-2 bg-surface-warm border border-border-subtle rounded-3xl p-6 sm:p-8 lg:p-10 shadow-md elevation-1">
              <div className="space-y-5 text-sm sm:text-base leading-relaxed text-on-surface font-normal">
                <p className="font-bold text-forest-deep text-base sm:text-lg">
                  Assalamualaikum warahmatullahi wabarakatuh,
                </p>

                <p>
                  Yang terhormat Bapak/Ibu guru, staf, komite sekolah yang mewakili orang tua/wali serta siswa-siswi SMA A. Wahid Hasyim Tebuireng yang saya cintai.
                </p>

                <p>
                  Alhamdulillah, pada hari yang berbahagia ini kita bersama-sama merayakan sebuah tonggak sejarah baru bagi SMA A. Wahid Hasyim Tebuireng. Hari ini, kita resmi meluncurkan website sekolah kita. Kehadiran website ini merupakan wujud nyata dari komitmen kita dalam mewujudkan visi dan misi sekolah, yaitu mencetak generasi muda yang beriman, bertaqwa, berakhlak mulia, berprestasi, dan mandiri.
                </p>

                <div className="gsap-harapan-box bg-surface-card border border-border-subtle p-5 sm:p-6 my-6 rounded-2xl">
                  <p className="font-bold text-forest-deep text-sm mb-3">
                    Dengan adanya website ini, kita berharap dapat:
                  </p>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-on-surface list-none pl-0">
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-gold-medal text-[18px] mt-0.5 shrink-0">check_circle</span>
                      <span>Meningkatkan transparansi dalam pengelolaan sekolah.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-gold-medal text-[18px] mt-0.5 shrink-0">check_circle</span>
                      <span>Memudahkan akses informasi bagi seluruh stakeholder.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-gold-medal text-[18px] mt-0.5 shrink-0">check_circle</span>
                      <span>Memperkuat tali silaturahmi antara sekolah, siswa, orang tua, dan masyarakat.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-gold-medal text-[18px] mt-0.5 shrink-0">check_circle</span>
                      <span>Menyajikan pembelajaran yang lebih inovatif dengan memanfaatkan teknologi digital.</span>
                    </li>
                  </ul>
                </div>

                <p>
                  Saya mengajak seluruh civitas akademika SMA A. Wahid Hasyim Tebuireng untuk memanfaatkan website ini secara optimal. Mari kita isi website ini dengan konten-konten yang positif, inspiratif, dan bermanfaat. Akhir kata, saya ucapkan terima kasih kepada semua pihak yang telah berkontribusi dalam mewujudkan peluncuran website ini. Semoga website ini dapat memberikan manfaat yang sebesar-besarnya bagi kita semua.
                </p>

                <p className="font-bold text-forest-deep text-base sm:text-lg pt-2">
                  Wassalamualaikum warahmatullahi wabarakatuh.
                </p>
              </div>

              {/* Signature Block */}
              <div className="mt-10 pt-6 border-t border-border-subtle">
                <p className="text-xs font-bold text-forest-deep uppercase">Kepala Sekolah</p>
                <p className="font-headline-md text-base sm:text-lg font-bold text-forest-deep mt-1">
                  NIKMATURROHMAH, M.Pd.
                </p>
              </div>
            </article>
          </div>
        </div>

        {/* BOTTOM NAV CARD */}
        <section className="py-10 bg-background border-t border-border-subtle">
          <div className="max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop">
            <div className="bg-surface-warm border border-border-subtle rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-headline-md text-base font-bold text-forest-deep">
                  Lanjut Membaca Profil Sekolah
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Ketahui visi & misi serta sejarah pendirian SMA A. Wahid Hasyim Tebuireng.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to="/profil/visi-misi"
                  className="px-4 py-2.5 rounded-xl bg-forest-deep hover:bg-emerald-deep text-white text-xs font-semibold transition-colors"
                >
                  Visi dan Misi
                </Link>
                <Link
                  to="/profil/sejarah"
                  className="px-4 py-2.5 rounded-xl border border-border-strong hover:bg-surface-container text-forest-deep text-xs font-semibold transition-colors"
                >
                  Sejarah Sekolah
                </Link>
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
