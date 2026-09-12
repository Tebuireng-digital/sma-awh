import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import PublicNavbar from '../../components/public/PublicNavbar';
import PublicFooter from '../../components/public/PublicFooter';
import NewsDetailModal from '../../components/public/NewsDetailModal';
import { INITIAL_POSTS } from '../../data/publicNewsData';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const HERO_SLIDES = [
  {
    id: 1,
    badge: 'SMA A. Wahid Hasyim • Pesantren Tebuireng Jombang • Akreditasi "A"',
    kicker: 'SELAMAT DATANG DI',
    title: 'Sekolah SMA A. Wahid Hasyim Tebuireng',
    tagline: 'Sekolah Nyantri, Ngaji, Berprestasi',
    description:
      'SMA A Wahid Hasyim Tebuireng hadir dengan komitmen kuat untuk menyelenggarakan pendidikan berkualitas yang tidak hanya fokus pada pencapaian akademik, tetapi juga pada pembentukan karakter Islami yang luhur, selaras dengan nilai-nilai agung Pesantren Tebuireng.',
    image: 'https://smaawhtebuireng.sch.id/wp-content/uploads/2026/07/21-Jul-2026-09.14.49.png',
    alt: 'Gedung Sekolah SMA A. Wahid Hasyim Tebuireng',
    objectPosition: 'object-center'
  },
  {
    id: 2,
    badge: 'Sarana & Fasilitas Unggulan • Akreditasi "A"',
    kicker: 'LITERASI & RISET SANTRI',
    title: 'Perpustakaan Terakreditasi "A"',
    tagline: 'Pusat Sumber Belajar & Khazanah Literasi Modern',
    description:
      'SMA A Wahid Hasyim Tebuireng memiliki perpustakaan yang sangat baik dan menjadi kebanggaan bagi siswa dan guru, dengan koleksi buku yang luas dan beragam, serta fasilitas yang nyaman dan modern.',
    image: 'https://smaawhtebuireng.sch.id/wp-content/uploads/2025/05/WhatsApp-Image-2025-05-10-at-08.53.00.jpeg',
    alt: 'Perpustakaan Terakreditasi A SMA A. Wahid Hasyim Tebuireng',
    objectPosition: 'object-center'
  },
  {
    id: 3,
    badge: 'Amanat Kepemimpinan • Sambutan Resmi',
    kicker: 'KEPALA SEKOLAH SMA AWH',
    title: 'Nikmaturrohmah, M.Pd.',
    tagline: 'Membangun Generasi Unggul Berakhlakul Karimah',
    description:
      'Membina generasi santri yang berakhlak mulia, berwawasan luas, dan berdaya saing global dengan mengintegrasikan kurikulum nasional serta penguatan tradisi keilmuan Pesantren Tebuireng.',
    image: '/humas/kepala-sekolah-nikmaturrohmah.jpg',
    alt: 'Ibu Nikmaturrohmah, M.Pd. - Kepala Sekolah SMA A. Wahid Hasyim Tebuireng',
    objectPosition: 'object-top'
  }
];

export default function PublicBerandaPage() {
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [activeModalPost, setActiveModalPost] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [mediaAssets, setMediaAssets] = useState({
    fotoVisi1: '/humas/visi-misi-img-1.jpg',
    fotoVisi2: '/humas/visi-misi-img-2.jpg',
    kompleksPutra: '/humas/sma-putra.png',
    kompleksPutri: '/humas/sma-putri.png',
    videoProfil: '/humas/video-profil-sma-awh.mp4',
    fotoKepsek: '/humas/kepala-sekolah-nikmaturrohmah.jpg',
    sloganSiswa: 'Sekolah Nyantri Ngaji Berprestasi',
    labelTahunSiswa: 'Jumlah Siswa Tahun Akademik 2025-2026',
    jumlahSiswa: '769',
  });

  // Auto-slide every 5 seconds (5000ms) smoothly without bottom buttons
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (window.location.hash === '#spp') {
      window.location.href = 'https://www.infotbi.com/';
    }
  }, []);

  useEffect(() => {
    const fetchApiPosts = async () => {
      try {
        const res = await fetch('/api/v1/humas/konten-publik?limit=12');
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
                judul: item.judul,
                ringkasan: item.ringkasan,
                image_url: item.image_url,
                isi: item.isi,
                galeri_images: item.galeri_images
              }));
            setPosts(apiItems);
          }
        }
      } catch (err) {
        console.warn('Menggunakan data artikel default:', err);
      }

      try {
        const resAset = await fetch('/api/v1/humas/konten-publik?kategori=Aset%20Web&limit=100');
        if (resAset.ok) {
          const jsonAset = await resAset.json();
          if (Array.isArray(jsonAset.data)) {
            const items = jsonAset.data;
            const v1 = items.find((i) => i.slug === 'aset-visi-misi-img-1')?.image_url;
            const v2 = items.find((i) => i.slug === 'aset-visi-misi-img-2')?.image_url;
            const kp = items.find((i) => i.slug === 'aset-gedung-kompleks-putra')?.image_url;
            const kpi = items.find((i) => i.slug === 'aset-gedung-kompleks-putri')?.image_url;
            const vid = items.find((i) => i.slug === 'aset-video-profil-resmi-sma-awh')?.image_url;
            const fk = items.find((i) => i.slug === 'aset-foto-kepala-sekolah')?.image_url;
            const statSiswa = items.find((i) => i.slug === 'aset-statistik-siswa-beranda');
            setMediaAssets((prev) => ({
              fotoVisi1: v1 || prev.fotoVisi1,
              fotoVisi2: v2 || prev.fotoVisi2,
              kompleksPutra: kp || prev.kompleksPutra,
              kompleksPutri: kpi || prev.kompleksPutri,
              videoProfil: vid || prev.videoProfil,
              fotoKepsek: fk || prev.fotoKepsek,
              sloganSiswa: statSiswa?.judul || prev.sloganSiswa,
              labelTahunSiswa: statSiswa?.isi || prev.labelTahunSiswa,
              jumlahSiswa: statSiswa?.ringkasan || prev.jumlahSiswa,
            }));
          }
        }
      } catch (e) {}
    };
    fetchApiPosts();
  }, []);

  const mainRef = useRef(null);

  // GSAP Animations
  useGSAP(() => {
    // 1. 4 Pilar Animasi
    gsap.fromTo(
      '.gsap-pilar-card',
      { opacity: 0, y: 35 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
        scrollTrigger: {
          trigger: '#pilar',
          start: 'top 85%',
          once: true,
        },
      }
    );

    // 2. Profil Kurikulum Reveal
    gsap.fromTo(
      '.gsap-profil-text',
      { opacity: 0, x: -35 },
      {
        opacity: 1,
        x: 0,
        duration: 0.8,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
        scrollTrigger: {
          trigger: '#profil',
          start: 'top 80%',
          once: true,
        },
      }
    );

    gsap.fromTo(
      '.gsap-profil-img',
      { opacity: 0, x: 35 },
      {
        opacity: 1,
        x: 0,
        duration: 0.8,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
        scrollTrigger: {
          trigger: '#profil',
          start: 'top 80%',
          once: true,
        },
      }
    );

    // 3. Berita Terbaru Grid Stagger
    gsap.fromTo(
      '.gsap-berita-card',
      { opacity: 0, y: 35 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
        scrollTrigger: {
          trigger: '#berita',
          start: 'top 80%',
          once: true,
        },
      }
    );

    // 4. Pesantren Karakter Banner
    gsap.fromTo(
      '.gsap-karakter-box',
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
        scrollTrigger: {
          trigger: '#karakter-section',
          start: 'top 80%',
          once: true,
        },
      }
    );

    // 5. SPP Info Box
    gsap.fromTo(
      '.gsap-spp-box',
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
        scrollTrigger: {
          trigger: '#spp',
          start: 'top 85%',
          once: true,
        },
      }
    );

    // 6. Cerita & Highlights
    gsap.fromTo(
      '.gsap-cerita-card',
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
        scrollTrigger: {
          trigger: '#cerita-section',
          start: 'top 80%',
          once: true,
        },
      }
    );

    // 7. Student Number Counter
    const counterElem = document.getElementById('student-count-val');
    if (counterElem) {
      const targetVal = parseInt(mediaAssets.jumlahSiswa, 10) || 769;
      const obj = { val: 0 };
      gsap.to(obj, {
        val: targetVal,
        duration: 2,
        ease: 'power1.out',
        scrollTrigger: {
          trigger: '#student-count-sec',
          start: 'top 85%',
          once: true,
        },
        onUpdate: () => {
          if (counterElem) {
            counterElem.innerText = Math.round(obj.val);
          }
        },
      });
    }

    // 8. Kompleks Putra & Putri
    gsap.fromTo(
      '.gsap-kompleks-card',
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
        scrollTrigger: {
          trigger: '#student-count-sec',
          start: 'top 75%',
          once: true,
        },
      }
    );

    // 9. Layanan Pendidikan Cards
    gsap.fromTo(
      '.gsap-layanan-card',
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
        scrollTrigger: {
          trigger: '#layanan-section',
          start: 'top 80%',
          once: true,
        },
      }
    );

    // 10. Video Profil Frame
    gsap.fromTo(
      '.gsap-video-frame',
      { opacity: 0, scale: 0.95 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.9,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
        scrollTrigger: {
          trigger: '#video-profil-sec',
          start: 'top 80%',
          once: true,
        },
      }
    );
  }, { scope: mainRef, dependencies: [mediaAssets.jumlahSiswa] });

  // Hero Slide Text Entrance per slide change
  useGSAP(() => {
    gsap.fromTo(
      '.hero-slide-content',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
    );
  }, { scope: mainRef, dependencies: [currentSlide] });

  return (
    <div className="bg-background text-on-surface font-body-md antialiased min-h-screen flex flex-col selection:bg-gold-medal selection:text-forest-deep">
      {/* 1. NAVBAR RESMI */}
      <PublicNavbar />

      <main ref={mainRef} className="flex-grow">
        {/* ==================== 2. HERO SLIDER SECTION (3 SLIDES - AUTO 5 DETIK) ==================== */}
        <section
          aria-label="Sorotan Utama SMA A. Wahid Hasyim"
          className="relative min-h-[580px] sm:min-h-[620px] md:min-h-[600px] lg:h-[680px] bg-[#0d281e] overflow-hidden flex items-center select-none"
        >
          {/* Subtle Background Pattern & Glow */}
          <div className="absolute inset-0 lattice-pattern opacity-10 pointer-events-none z-[3]"></div>
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-emerald-vibrant/10 blur-3xl pointer-events-none z-[2]"></div>

          {/* Slides */}
          {HERO_SLIDES.map((slide, index) => {
            const isActive = index === currentSlide;
            return (
              <div
                key={slide.id}
                className={`absolute inset-0 flex items-start md:items-center transition-opacity duration-1000 ease-in-out ${
                  isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                {/* Photo: Di mobile di posisi ATAS (jelas & tidak hilang) dengan gradasi ke bawah. Di desktop di sisi kanan dengan gradasi ke kiri. */}
                <div className="absolute top-0 inset-x-0 h-[260px] sm:h-[320px] md:inset-y-0 md:right-0 md:left-auto md:w-[58%] lg:w-[52%] md:h-full overflow-hidden pointer-events-none">
                  <img
                    src={slide.id === 3 ? (mediaAssets.fotoKepsek || slide.image) : slide.image}
                    alt={slide.alt}
                    onError={(e) => {
                      if (slide.id === 3 && e.target.src !== window.location.origin + '/humas/kepala-sekolah-nikmaturrohmah.jpg') {
                        e.target.src = '/humas/kepala-sekolah-nikmaturrohmah.jpg';
                      }
                    }}
                    className={`w-full h-full object-cover ${slide.objectPosition || 'object-center'} transition-transform duration-[8000ms] ease-out ${
                      isActive ? 'scale-105' : 'scale-100'
                    }`}
                  />
                  {/* Desktop: Smooth gradient fading to the left into #0d281e */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0d281e] via-[#0d281e]/75 via-35% to-transparent hidden md:block"></div>

                  {/* Mobile: Gradasi halus dari foto atas ke bawah menuju warna hijau pekat #0d281e */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent via-40% to-[#0d281e] md:hidden"></div>
                  <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-b from-transparent via-[#0d281e]/85 to-[#0d281e] md:hidden"></div>
                </div>

                {/* Text Narrative on the Left: Pada mobile diberi padding top agar teks tersusun rapi di bawah transisi foto */}
                <div className="relative z-10 w-full max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop pt-[175px] sm:pt-[220px] md:py-16 lg:py-20 pb-8 sm:pb-12">
                  <div className="hero-slide-content max-w-xl lg:max-w-2xl space-y-3.5 sm:space-y-5">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0d281e]/90 backdrop-blur-md border border-white/20 text-[11px] sm:text-xs text-surface-warm font-medium leading-normal shadow-md">
                      <span className="w-2 h-2 rounded-full bg-gold-warm animate-pulse shrink-0"></span>
                      <span className="font-semibold text-gold-warm">{slide.badge}</span>
                    </div>

                    {/* Titles */}
                    <div className="space-y-2 sm:space-y-2.5">
                      <p className="text-[11px] sm:text-xs uppercase tracking-widest text-gold-warm font-bold">
                        {slide.kicker}
                      </p>
                      <div className="min-h-0 sm:min-h-[72px] lg:min-h-[96px] flex items-center">
                        <h1 className="font-headline-xl text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.2] text-white">
                          {slide.title}
                        </h1>
                      </div>
                      <div className="flex items-center gap-2.5 sm:gap-3 pt-0.5">
                        <div className="w-1.5 h-5 sm:h-6 bg-gold-medal rounded-full shrink-0"></div>
                        <p className="text-gold-warm font-semibold text-xs sm:text-sm md:text-base tracking-wide uppercase">
                          {slide.tagline}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-surface-warm/90 text-xs sm:text-sm md:text-base leading-relaxed font-normal min-h-0 sm:min-h-[60px]">
                      {slide.description}
                    </p>

                    {/* Sub-footnote Lokasi Resmi & Slide Indicator Dots */}
                    <div className="pt-3 sm:pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-start sm:items-center gap-2 text-[11px] sm:text-xs text-surface-warm/80 leading-snug">
                        <span className="material-symbols-outlined text-gold-medal text-[16px] sm:text-[18px] shrink-0 mt-0.5 sm:mt-0">location_on</span>
                        <span>Kampus Pesantren Tebuireng, Cukir, Diwek, Kabupaten Jombang, Jawa Timur</span>
                      </div>

                      {/* Slide Indicator Dots (Interactive) */}
                      <div className="flex items-center gap-1.5 shrink-0" aria-label="Navigasi slide">
                        {HERO_SLIDES.map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentSlide(idx);
                            }}
                            className={`h-1.5 rounded-full transition-all duration-300 focus:outline-none ${
                              idx === currentSlide
                                ? 'w-6 sm:w-8 bg-gold-medal'
                                : 'w-2 bg-white/30 hover:bg-white/60'
                            }`}
                            aria-label={`Slide ${idx + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* ==================== 4. 4 PILAR INFO BOXES (KURIKULUM, PEMBELAJARAN, PROGRAM, KERJASAMA) ==================== */}
        <section className="py-12 md:py-20 bg-background" id="pilar">
          <div className="max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Box 1: KURIKULUM */}
              <div className="gsap-pilar-card bg-surface-warm border border-border-subtle rounded-2xl p-6 flex flex-col justify-between elevation-1 hover:border-forest-deep transition-colors duration-200">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-forest-deep mb-4">
                    <span className="material-symbols-outlined text-2xl">account_balance</span>
                  </div>
                  <h3 className="font-headline-md text-base sm:text-lg font-bold text-forest-deep uppercase tracking-wide mb-2">
                    KURIKULUM
                  </h3>
                  <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    Menerapkan Kurikulum P5 berbasis pendidikan umum dan ketrampilan kewirausahaan.
                  </p>
                </div>
              </div>

              {/* Box 2: PEMBELAJARAN */}
              <div className="gsap-pilar-card bg-surface-warm border border-border-subtle rounded-2xl p-6 flex flex-col justify-between elevation-1 hover:border-forest-deep transition-colors duration-200">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-forest-deep mb-4">
                    <span className="material-symbols-outlined text-2xl">laptop_chromebook</span>
                  </div>
                  <h3 className="font-headline-md text-base sm:text-lg font-bold text-forest-deep uppercase tracking-wide mb-2">
                    PEMBELAJARAN
                  </h3>
                  <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    Menerapkan Kurikulum P5 berbasis pendidikan umum dan ketrampilan kewirausahaan.
                  </p>
                </div>
              </div>

              {/* Box 3: PROGRAM */}
              <div className="gsap-pilar-card bg-surface-warm border border-border-subtle rounded-2xl p-6 flex flex-col justify-between elevation-1 hover:border-forest-deep transition-colors duration-200">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-forest-deep mb-4">
                    <span className="material-symbols-outlined text-2xl">school</span>
                  </div>
                  <h3 className="font-headline-md text-base sm:text-lg font-bold text-forest-deep uppercase tracking-wide mb-2">
                    PROGRAM
                  </h3>
                  <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    Memiliki berbagai macam program pengembangan baik yang berkaitan dengan bidang akademik maupun non akademik.
                  </p>
                </div>
              </div>

              {/* Box 4: KERJASAMA */}
              <div className="gsap-pilar-card bg-surface-warm border border-border-subtle rounded-2xl p-6 flex flex-col justify-between elevation-1 hover:border-forest-deep transition-colors duration-200">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-forest-deep mb-4">
                    <span className="material-symbols-outlined text-2xl">groups</span>
                  </div>
                  <h3 className="font-headline-md text-base sm:text-lg font-bold text-forest-deep uppercase tracking-wide mb-2">
                    KERJASAMA
                  </h3>
                  <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    Memiliki kerja sama atau kemitraan dengan ITS, UNESA, dan UIN Malang dalam pengembangan sekolah.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== 5. PROFIL & KURIKULUM SINGKAT ==================== */}
        <section className="py-16 bg-surface-warm border-y border-border-subtle" id="profil">
          <div className="max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Text & Bullets (7 cols) */}
              <div className="gsap-profil-text md:col-span-7 space-y-6">
                <div>
                  <h2 className="font-headline-xl text-2xl sm:text-3xl font-bold text-forest-deep tracking-tight mb-3">
                    SMA A. Wahid Hasyim Tebuireng
                  </h2>
                  <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
                    SMA A Wahid Hasyim Tebuireng adalah sekolah menengah atas swasta yang berlokasi di Tebuireng, Kecamatan Diwek, Kabupaten Jombang, Jawa Timur. Sekolah ini memiliki NPSN 20540307 Terakreditasi "A".
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="font-headline-md text-lg font-bold text-forest-deep">
                    Kurikulum
                  </h3>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-on-surface list-none pl-0">
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-emerald-vibrant text-[18px] mt-0.5 shrink-0">check_circle</span>
                      <span>SMA A Wahid Hasyim menerapkan kurikulum nasional dan kurikulum pesantren.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-emerald-vibrant text-[18px] mt-0.5 shrink-0">check_circle</span>
                      <span>Kurikulum pesantren meliputi akidah, akhlak, tafsir, hadits, fiqh, nahwu, shorof, aswaja, dan Sejarah Kebudayaan Islam.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-emerald-vibrant text-[18px] mt-0.5 shrink-0">check_circle</span>
                      <span>Program alternatif pilihan siswa adalah jurusan IPA dan IPS.</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-2">
                  <Link
                    to="/profil/visi-misi"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-forest-deep hover:bg-emerald-deep text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm"
                  >
                    <span>Visi & Misi</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                </div>
              </div>

              {/* Photos Grid (5 cols) */}
              <div className="gsap-profil-img md:col-span-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl overflow-hidden border border-border-subtle bg-surface-card p-2 shadow-sm">
                    <img
                      alt="Santri SMA AWH"
                      className="w-full h-36 sm:h-44 object-cover rounded-xl"
                      src={mediaAssets.fotoVisi1}
                      onError={(e) => { e.target.src = '/humas/visi-misi-img-1.jpg'; }}
                    />
                  </div>
                  <div className="rounded-2xl overflow-hidden border border-border-subtle bg-surface-card p-2 shadow-sm">
                    <img
                      alt="Kegiatan Siswa"
                      className="w-full h-36 sm:h-44 object-cover rounded-xl"
                      src={mediaAssets.fotoVisi2}
                      onError={(e) => { e.target.src = '/humas/visi-misi-img-2.jpg'; }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== 6. BERITA TERBARU (3 ARTIKEL PIN UTAMA DI BERANDA) ==================== */}
        {(() => {
          const pinnedPosts = posts.filter((p) => p.is_pinned);
          const unpinnedPosts = posts.filter((p) => !p.is_pinned);
          const berandaDisplayPosts = (pinnedPosts.length > 0 ? [...pinnedPosts, ...unpinnedPosts] : posts).slice(0, 3);

          return (
            <section className="py-16 bg-background" id="berita">
              <div className="max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-gold-burnished font-bold flex items-center gap-1">
                      <span>📌</span>
                      <span>Warta Pilihan & Sorotan Beranda</span>
                    </span>
                    <h2 className="font-headline-xl text-2xl sm:text-3xl font-bold text-forest-deep mt-1">
                      Berita & Pengumuman Pilihan
                    </h2>
                  </div>
                  <Link
                    to="/berita"
                    className="text-xs sm:text-sm text-forest-deep font-semibold inline-flex items-center gap-1.5 hover:underline"
                  >
                    <span>Lihat Semua Berita</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                </div>

                {/* Grid 3 Berita Pin */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {berandaDisplayPosts.map((post) => (
                    <Link
                      key={post.id}
                      to={`/berita/${post.id}`}
                      className="gsap-berita-card border border-border-subtle rounded-2xl bg-surface-warm overflow-hidden flex flex-col justify-between hover:border-forest-deep transition-colors duration-200 group shadow-sm hover:shadow-md elevation-1"
                    >
                      {post.image_url && (
                        <div className="h-44 sm:h-48 overflow-hidden bg-surface-container relative">
                          <img
                            alt={post.judul}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            src={post.image_url}
                          />
                          <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm shadow-sm ${
                              post.kategori === 'Prestasi Akademik'
                                ? 'bg-blue-900/90 text-blue-100'
                                : post.kategori === 'Prestasi Non Akademik'
                                ? 'bg-amber-900/90 text-amber-100'
                                : post.kategori === 'Pengumuman'
                                ? 'bg-rose-900/90 text-rose-100'
                                : 'bg-forest-deep/90 text-surface-warm'
                            }`}>
                              {post.kategori}
                            </span>
                            {post.is_pinned && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gold-medal text-forest-deep backdrop-blur-sm shadow-sm flex items-center gap-0.5">
                                <span>📌</span>
                                <span>Pin</span>
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex items-center gap-1.5 mb-2 text-[11px] text-on-surface-variant font-medium">
                            <span className="material-symbols-outlined text-[14px] text-gold-burnished">calendar_today</span>
                            <time>{post.tanggal}</time>
                          </div>

                          <h3 className="font-headline-md text-sm sm:text-base font-bold text-forest-deep group-hover:text-emerald-vibrant transition-colors line-clamp-2 leading-snug">
                            {post.judul}
                          </h3>

                          <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed mt-1.5 font-normal">
                            {post.ringkasan}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-border-subtle flex items-center justify-between text-xs text-forest-deep font-semibold">
                          <span className="group-hover:text-emerald-vibrant transition-colors">Baca Rincian</span>
                          <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 text-emerald-vibrant transition-transform">
                            arrow_forward
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          );
        })()}

        {/* ==================== 7. SEKOLAH BERBASIS PESANTREN & PEMBENTUKAN KARAKTER ISLAMI ==================== */}
        <section className="py-16 bg-surface-warm border-y border-border-subtle" id="karakter-section">
          <div className="max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop">
            <div className="gsap-karakter-box max-w-3xl mx-auto space-y-4">
              <span className="text-xs uppercase tracking-widest text-gold-burnished font-bold block">
                Sekolah Berbasis Pesantren
              </span>
              <h2 className="font-headline-xl text-2xl sm:text-3xl lg:text-4xl font-bold text-forest-deep leading-tight">
                Pembentukan Karakter Islami Berlandaskan Tradisi Luhur Tebuireng
              </h2>
              <div className="space-y-4 text-sm sm:text-base text-on-surface-variant leading-relaxed font-normal pt-2">
                <p>
                  Di SMA A Wahid Hasyim, kami tidak hanya fokus pada keunggulan akademik, tetapi juga berkomitmen kuat pada pembentukan karakter mulia (akhlakul karimah) sesuai dengan ajaran Ahlussunnah wal Jama'ah An-Nahdliyah. Kami mengintegrasikan nilai-nilai luhur dan tradisi keilmuan Pesantren Tebuireng ke dalam setiap aspek pendidikan.
                </p>
                <p>
                  Siswa dibimbing untuk memiliki kedisiplinan tinggi, kemandirian, rasa hormat kepada guru dan orang tua (ta'dzim), serta pemahaman mendalam tentang ilmu agama Islam melalui kajian kitab dan praktik ibadah sehari-hari, menciptakan lulusan yang tidak hanya cerdas secara intelektual tetapi juga matang secara spiritual dan sosial.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== 8. INFORMASI PEMBAYARAN SPP SISWA ==================== */}
        <section className="py-16 bg-background" id="spp">
          <div className="max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop">
            <div className="gsap-spp-box bg-surface-warm border-2 border-gold-medal/40 rounded-3xl p-6 sm:p-10 shadow-md elevation-2">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-8 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-gold-burnished block">
                    INFORMASI PEMBAYARAN SPP SISWA
                  </span>
                  <h2 className="font-headline-xl text-xl sm:text-2xl lg:text-3xl font-bold text-forest-deep">
                    Untuk Tahun Akademik 2026/2027
                  </h2>
                  <div className="text-on-surface-variant text-xs sm:text-sm space-y-2 pt-2">
                    <p className="font-medium text-forest-deep">Silahkan Login Sesuai Dengan Akses Anda.</p>
                    <ol className="list-decimal pl-5 space-y-1">
                      <li>Untuk Siswa & Siswi Silahkan login dan Password menggunakan No.ID Siswa.</li>
                      <li>Kode Bayar Briva 71029 (No.ID )</li>
                    </ol>
                  </div>
                </div>

                <div className="lg:col-span-4 flex flex-col justify-center items-start lg:items-end space-y-2">
                  <a
                    className="w-full sm:w-auto px-6 py-3.5 bg-forest-deep hover:bg-emerald-deep text-white rounded-xl text-sm font-semibold shadow inline-flex items-center justify-center gap-2 transition-all"
                    href="https://www.infotbi.com"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <span>LOGIN SPP ONLINE</span>
                    <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                  </a>
                  <span className="text-[11px] text-on-surface-variant">Portal resmi: www.infotbi.com</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== 9. CERITA & HIGHLIGHTS KEGIATAN ==================== */}
        <section className="py-16 bg-surface-warm border-t border-border-subtle" id="cerita-section">
          <div className="max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop">
            <div className="mb-8">
              <span className="text-xs uppercase tracking-wider text-gold-burnished font-bold">
                Cerita & Dokumentasi
              </span>
              <h2 className="font-headline-xl text-2xl sm:text-3xl font-bold text-forest-deep mt-1">
                Aktivitas & Kebersamaan Siswa
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Highlight 1 */}
              <div className="gsap-cerita-card bg-surface-card border border-border-subtle rounded-2xl overflow-hidden shadow-sm elevation-1">
                <div className="h-40 bg-surface-container overflow-hidden">
                  <img
                    alt="Goes Jogja Familly Gathering SMA Awh TBI"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    src="https://smaawhtebuireng.sch.id/wp-content/uploads/2024/08/visi-misi-img-1.jpg"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-headline-md text-sm font-bold text-forest-deep leading-snug">
                    Goes Jogja Familly Gathering SMA Awh TBI
                  </h3>
                  <p className="text-[11px] text-on-surface-variant mt-1.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px] text-gold-burnished">calendar_today</span>
                    <span>14 Juni 2024</span>
                  </p>
                </div>
              </div>

              {/* Highlight 2 */}
              <div className="gsap-cerita-card bg-surface-card border border-border-subtle rounded-2xl overflow-hidden shadow-sm elevation-1">
                <div className="h-40 bg-surface-container overflow-hidden">
                  <img
                    alt="FUN GAME"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    src="https://smaawhtebuireng.sch.id/wp-content/uploads/2024/08/visi-misi-img-2.jpg"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-headline-md text-sm font-bold text-forest-deep leading-snug">
                    FUN GAME
                  </h3>
                  <p className="text-[11px] text-on-surface-variant mt-1.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px] text-gold-burnished">calendar_today</span>
                    <span>16 Mei 2024</span>
                  </p>
                </div>
              </div>

              {/* Highlight 3 */}
              <div className="gsap-cerita-card bg-surface-card border border-border-subtle rounded-2xl overflow-hidden shadow-sm elevation-1">
                <div className="h-40 bg-surface-container overflow-hidden">
                  <img
                    alt="Cultural Melody: Harmony In Play"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    src="https://smaawhtebuireng.sch.id/wp-content/uploads/2024/08/47251278_1102449716593688_3082816894808214767_n.jpg"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-headline-md text-sm font-bold text-forest-deep leading-snug">
                    Cultural Melody: Harmony In Play
                  </h3>
                  <p className="text-[11px] text-on-surface-variant mt-1.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px] text-gold-burnished">calendar_today</span>
                    <span>16 Mei 2024</span>
                  </p>
                </div>
              </div>

              {/* Highlight 4 */}
              <div className="gsap-cerita-card bg-surface-card border border-border-subtle rounded-2xl overflow-hidden shadow-sm elevation-1">
                <div className="h-40 bg-surface-container overflow-hidden">
                  <img
                    alt="MPLS 2026"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    src="https://smaawhtebuireng.sch.id/wp-content/uploads/2024/08/visi-misi-img-3.jpg"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-headline-md text-sm font-bold text-forest-deep leading-snug">
                    MPLS 2026
                  </h3>
                  <p className="text-[11px] text-on-surface-variant mt-1.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px] text-gold-burnished">calendar_today</span>
                    <span>16 Mei 2024</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== 10. MEWUJUDKAN GENERASI YANG BEWAWASAN LUAS (3 PROMO BANNERS) ==================== */}
        <section className="py-16 bg-background" id="layanan-section">
          <div className="max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop">
            <div className="text-center max-w-2xl mx-auto mb-10 space-y-1">
              <span className="text-xs uppercase tracking-widest text-gold-burnished font-bold">
                SEKOLAH A. WAHID HASYIM TEBUIRENG
              </span>
              <h2 className="font-headline-xl text-2xl sm:text-3xl font-bold text-forest-deep">
                Mewujudkan Generasi yang Bewawasan Luas
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Banner 1: AKADEMIK */}
              <div className="gsap-layanan-card bg-surface-warm border border-border-subtle rounded-2xl overflow-hidden shadow-md flex flex-col justify-between elevation-1 group">
                <div>
                  <div className="h-48 overflow-hidden bg-surface-container relative">
                    <img
                      alt="Prestasi Akademik SMA AWH"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      src="https://smaawhtebuireng.sch.id/wp-content/uploads/2024/08/visi-misi-img-2.jpg"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-forest-deep text-white shadow-sm">
                      AKADEMIK
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                      Penyerahan medali kepada siswa berprestasi dalam bidang akademik SMA A.Wahid Hasyim Tebuireng.
                    </p>
                  </div>
                </div>
                <div className="p-5 pt-0">
                  <Link
                    to="/berita?kategori=Prestasi+Akademik"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-deep hover:text-emerald-vibrant transition-colors"
                  >
                    <span>Selengkapnya</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                </div>
              </div>

              {/* Banner 2: NON AKADEMIK */}
              <div className="gsap-layanan-card bg-surface-warm border border-border-subtle rounded-2xl overflow-hidden shadow-md flex flex-col justify-between elevation-1 group">
                <div>
                  <div className="h-48 overflow-hidden bg-surface-container relative">
                    <img
                      alt="Prestasi Non Akademik Basket SMA AWH"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      src="https://smaawhtebuireng.sch.id/wp-content/uploads/2024/08/73398053_473367346870723_1960732390216728258_n.jpg"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gold-medal text-forest-deep shadow-sm">
                      NON AKADEMIK
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                      Lomba Basket Ball Tingkat Kabupaten digedung olah raga Kabupaten jombang, mendapatkan juara 2 tingkat Kabupaten.
                    </p>
                  </div>
                </div>
                <div className="p-5 pt-0">
                  <Link
                    to="/berita?kategori=Prestasi+Non+Akademik"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-deep hover:text-emerald-vibrant transition-colors"
                  >
                    <span>Selengkapnya</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                </div>
              </div>

              {/* Banner 3: KEGIATAN */}
              <div className="gsap-layanan-card bg-surface-warm border border-border-subtle rounded-2xl overflow-hidden shadow-md flex flex-col justify-between elevation-1 group">
                <div>
                  <div className="h-48 overflow-hidden bg-surface-container relative">
                    <img
                      alt="Pelaksanaan Expo Siswa SMA AWH"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      src="https://smaawhtebuireng.sch.id/wp-content/uploads/2024/08/67490507_2069377540024179_6463802374394739202_n.jpg"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-vibrant text-white shadow-sm">
                      KEGIATAN
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                      Pelaksanaan Expo Siswa untuk menjaring kreatifitas dan bakat Siswa dalam segala bidang untuk bisa ditampilkan dipublikasikan Sekolah.
                    </p>
                  </div>
                </div>
                <div className="p-5 pt-0">
                  <Link
                    to="/berita?kategori=Kegiatan"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-deep hover:text-emerald-vibrant transition-colors"
                  >
                    <span>Selengkapnya</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== 11. JUMLAH SISWA TAHUN AKADEMIK ==================== */}
        <section className="py-16 bg-surface-warm border-y border-border-subtle" id="student-count-sec">
          <div className="max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop">
            <div className="text-center max-w-2xl mx-auto mb-10 space-y-1">
              <h2 className="font-headline-xl text-xl sm:text-2xl font-bold text-forest-deep">
                {mediaAssets.sloganSiswa || 'Sekolah Nyantri Ngaji Berprestasi'}
              </h2>
              <p className="text-xs sm:text-sm text-on-surface-variant">
                {mediaAssets.labelTahunSiswa || 'Jumlah Siswa Tahun Akademik 2025-2026'}
              </p>
              <div id="student-count-val" className="font-headline-xl text-4xl sm:text-5xl font-extrabold text-forest-deep pt-2">
                {mediaAssets.jumlahSiswa || '769'}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {/* Kompleks SMA Putra */}
              <div className="gsap-kompleks-card bg-surface-card border border-border-subtle rounded-2xl overflow-hidden p-3 shadow-sm">
                <img
                  alt="SMA Putra Tebuireng"
                  className="w-full h-48 sm:h-56 object-cover rounded-xl"
                  src={mediaAssets.kompleksPutra}
                  onError={(e) => { e.target.src = '/humas/sma-putra.png'; }}
                />
                <div className="p-3 text-center">
                  <span className="font-headline-md font-bold text-sm text-forest-deep block">Kompleks Pendidikan Putra</span>
                  <span className="text-[11px] text-on-surface-variant">Pesantren Tebuireng Jombang</span>
                </div>
              </div>

              {/* Kompleks SMA Putri */}
              <div className="gsap-kompleks-card bg-surface-card border border-border-subtle rounded-2xl overflow-hidden p-3 shadow-sm">
                <img
                  alt="SMA Putri Tebuireng"
                  className="w-full h-48 sm:h-56 object-cover rounded-xl"
                  src={mediaAssets.kompleksPutri}
                  onError={(e) => { e.target.src = '/humas/sma-putri.png'; }}
                />
                <div className="p-3 text-center">
                  <span className="font-headline-md font-bold text-sm text-forest-deep block">Kompleks Pendidikan Putri</span>
                  <span className="text-[11px] text-on-surface-variant">Pesantren Tebuireng Jombang</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== 12. 3 INFOBOX KEUNGGULAN / FASILITAS ==================== */}
        <section className="py-16 bg-background" id="fasilitas">
          <div className="max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 01. Fasilitas Laboratorium Modern */}
              <div className="bg-surface-warm border border-border-subtle rounded-2xl p-6 flex flex-col justify-between elevation-1">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-headline-xl text-2xl font-extrabold text-gold-medal">01.</span>
                    <span className="text-xs uppercase font-bold text-on-surface-variant">Laboratorium</span>
                  </div>
                  <h3 className="font-headline-md text-base sm:text-lg font-bold text-forest-deep mb-2">
                    Fasilitas Laboratorium Modern
                  </h3>
                  <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    Laboratorium Kimia, Fisika, dan Biologi kami dilengkapi peralatan modern untuk mendukung pembelajaran sains yang mendalam dan eksperimen langsung.
                  </p>
                </div>
              </div>

              {/* 02. Ekstrakurikuler Beragam */}
              <div className="bg-surface-warm border border-border-subtle rounded-2xl p-6 flex flex-col justify-between elevation-1" id="kesiswaan">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-headline-xl text-2xl font-extrabold text-gold-medal">02.</span>
                    <span className="text-xs uppercase font-bold text-on-surface-variant">Ekstrakurikuler</span>
                  </div>
                  <h3 className="font-headline-md text-base sm:text-lg font-bold text-forest-deep mb-2">
                    Ekstrakurikuler Beragam
                  </h3>
                  <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    Kembangkan minat dan bakat melalui beragam pilihan ekstrakurikuler: Olahraga (Futsal, Basket), Seni (Paduan Suara, Teater), Sains (KIR), Keagamaan (Kajian Kitab), dan lainnya.
                  </p>
                </div>
              </div>

              {/* 03. Pendidikan Khas Tebuireng */}
              <div className="bg-surface-warm border border-border-subtle rounded-2xl p-6 flex flex-col justify-between elevation-1">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-headline-xl text-2xl font-extrabold text-gold-medal">03.</span>
                    <span className="text-xs uppercase font-bold text-on-surface-variant">Karakter Pesantren</span>
                  </div>
                  <h3 className="font-headline-md text-base sm:text-lg font-bold text-forest-deep mb-2">
                    Pendidikan Khas Tebuireng
                  </h3>
                  <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    Integrasi kurikulum nasional dengan penguatan ilmu agama, pembinaan akhlakul karimah, dan tradisi keilmuan Pesantren Tebuireng untuk membentuk pribadi utuh.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== VIDEO PROFIL RESMI SEKOLAH ==================== */}
        <section className="pb-16 bg-background" id="video-profil-sec">
          <div className="max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop">
            <div className="gsap-video-frame rounded-3xl overflow-hidden border border-border-subtle shadow-xl bg-black relative elevation-2">
              <video
                src={mediaAssets.videoProfil}
                onError={(e) => {
                  if (e.target.src !== window.location.origin + '/humas/video-profil-sma-awh.mp4') {
                    e.target.src = '/humas/video-profil-sma-awh.mp4';
                  }
                }}
                poster={mediaAssets.fotoVisi1 || '/humas/visi-misi-img-1.jpg'}
                playsInline
                controls
                preload="metadata"
                className="w-full max-h-[560px] object-cover mx-auto"
              >
                Browser Anda tidak mendukung tag video.
              </video>
            </div>
          </div>
        </section>

        {/* ==================== 13. INFORMASI KONTAK & PETA LOKASI ==================== */}
        <section className="py-16 md:py-20 bg-surface-warm border-t border-border-subtle" id="kontak">
          <div className="max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
              <div className="md:col-span-5 space-y-4 flex flex-col justify-between">
                <div>
                  <span className="text-xs uppercase tracking-wider text-gold-burnished font-bold">
                    Sekretariat Resmi
                  </span>
                  <h2 className="font-headline-xl text-2xl sm:text-3xl font-bold text-forest-deep mt-1">
                    Informasi Kontak
                  </h2>
                </div>

                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="flex items-start gap-3 p-3.5 bg-surface-card rounded-xl border border-border-subtle">
                    <span className="material-symbols-outlined text-forest-deep text-[20px] mt-0.5">location_on</span>
                    <div>
                      <strong className="block text-forest-deep text-xs font-bold uppercase tracking-wide">Alamat:</strong>
                      <span className="text-on-surface-variant">Jl. Irian Jaya, Cukir, Kec. Diwek, Kabupaten Jombang, Jawa Timur 61471</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3.5 bg-surface-card rounded-xl border border-border-subtle">
                    <span className="material-symbols-outlined text-forest-deep text-[20px] mt-0.5">call</span>
                    <div>
                      <strong className="block text-forest-deep text-xs font-bold uppercase tracking-wide">Telepon:</strong>
                      <span className="text-on-surface-variant">0321-874289</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3.5 bg-surface-card rounded-xl border border-border-subtle">
                    <span className="material-symbols-outlined text-forest-deep text-[20px] mt-0.5">mail</span>
                    <div>
                      <strong className="block text-forest-deep text-xs font-bold uppercase tracking-wide">Email:</strong>
                      <a href="mailto:admin@smaawhtebuireng.sch.id" className="text-forest-deep hover:underline">
                        admin@smaawhtebuireng.sch.id
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3.5 bg-surface-card rounded-xl border border-border-subtle">
                    <span className="material-symbols-outlined text-forest-deep text-[20px] mt-0.5">schedule</span>
                    <div>
                      <strong className="block text-forest-deep text-xs font-bold uppercase tracking-wide">Jam Operasional:</strong>
                      <span className="text-on-surface-variant">Sabtu - Kamis, 07.00 - 13.00 WIB (Selasa, 07.00 - 15.00 WIB)</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    to="/kontak"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-forest-deep hover:bg-emerald-deep text-white rounded-xl text-sm font-semibold shadow transition-colors"
                  >
                    <span>Buka Halaman Kontak Lengkap</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </Link>
                </div>
              </div>

              {/* Google Maps Container */}
              <div className="md:col-span-7 flex flex-col">
                <div className="border border-border-subtle rounded-2xl overflow-hidden bg-surface-card shadow-sm h-full flex flex-col min-h-[300px]">
                  <div className="px-4 py-3 bg-surface-container border-b border-border-subtle flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-forest-deep text-[18px]">map</span>
                      <span className="font-bold text-forest-deep text-xs sm:text-sm">Lokasi Kami</span>
                    </div>
                    <a
                      href="https://maps.google.com/?q=SMA+A+Wahid+Hasyim+Tebuireng+Jombang"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-gold-burnished hover:underline inline-flex items-center gap-1 font-semibold"
                    >
                      <span>Google Maps</span>
                      <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                    </a>
                  </div>
                  <div className="w-full flex-1">
                    <iframe
                      title="Peta Lokasi SMA A. Wahid Hasyim Tebuireng"
                      src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15818.784475236718!2d112.2367208!3d-7.6080094!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7841d6b8200483%3A0xe5b4bf67f88086fa!2sSMA%20A.%20Wahid%20Hasyim%20Tebuireng!5e0!3m2!1sen!2sid!4v1724224881985!5m2!1sen!2sid"
                      width="100%"
                      height="100%"
                      style={{ border: 0, minHeight: '300px' }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 14. FOOTER */}
      <PublicFooter />

      {/* 15. MODAL BACA BERITA */}
      {activeModalPost && (
        <NewsDetailModal post={activeModalPost} onClose={() => setActiveModalPost(null)} />
      )}
    </div>
  );
}
