import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import PublicNavbar from '../../components/public/PublicNavbar';
import PublicFooter from '../../components/public/PublicFooter';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const defaultKesiswaanSections = [
  {
    id: 'osis',
    title: 'OSIS (Organisasi Siswa Intra Sekolah)',
    badge: 'Kepemimpinan & Organisasi',
    desc: 'Wadah pembinaan kepemimpinan, integritas, dan manajerial santri dalam mengelola berbagai kegiatan intra madrasah berlandaskan nilai-nilai akhlakul karimah Pesantren Tebuireng.',
    photos: [
      {
        slug: 'aset-kesiswaan-osis-1',
        url: '/humas/kesiswaan/kesiswaan-osis-1.jpg',
        caption: 'Pengurus OSIS SMA A. Wahid Hasyim Tebuireng',
      },
      {
        slug: 'aset-kesiswaan-osis-2',
        url: '/humas/kesiswaan/kesiswaan-osis-2.jpg',
        caption: 'Aktivitas Diskusi & Program Kerja OSIS',
      },
      {
        slug: 'aset-kesiswaan-osis-3',
        url: '/humas/kesiswaan/kesiswaan-osis-3.jpg',
        caption: 'Dokumentasi Kepanitiaan Santri',
      },
    ],
  },
  {
    id: 'mpk',
    title: 'MPK (Majelis Perwakilan Kelas)',
    badge: 'Aspirasi & Musyawarah',
    desc: 'Lembaga legislatif siswa yang menampung dan menyalurkan aspirasi perwakilan kelas, mengawasi kinerja pengurus OSIS, serta menegakkan kedisiplinan santri.',
    photos: [
      {
        slug: 'aset-kesiswaan-mpk-1',
        url: '/humas/kesiswaan/kesiswaan-mpk-1.jpg',
        caption: 'Sidang Pleno & Musyawarah MPK',
      },
    ],
  },
  {
    id: 'paskibraka',
    title: 'Paskibraka',
    badge: 'Kedisiplinan & Nasionalisme',
    desc: 'Pasukan Pengibar Bendera Pusaka SMA A. Wahid Hasyim melatih ketahanan fisik, disiplin baris-berbaris prima, serta penanaman jiwa patriotisme dan cinta tanah air.',
    photos: [
      {
        slug: 'aset-kesiswaan-paskibra-1',
        url: '/humas/kesiswaan/kesiswaan-paskibra-1.jpg',
        caption: 'Formasi Pasukan Pengibar Bendera SMA AWH',
      },
      {
        slug: 'aset-kesiswaan-paskibra-2',
        url: '/humas/kesiswaan/kesiswaan-paskibra-2.jpg',
        caption: 'Latihan Kedisiplinan Paskibraka',
      },
      {
        slug: 'aset-kesiswaan-paskibra-3',
        url: '/humas/kesiswaan/kesiswaan-paskibra-3.jpg',
        caption: 'Upacara Bendera Khidmat di Lapangan',
      },
    ],
  },
  {
    id: 'olahraga',
    title: 'Olahraga & Prestasi Atletik',
    badge: 'Sportivitas & Kesehatan',
    desc: 'Pembinaan bakat olahraga cabang bola basket, futsal, voli, bulutangkis, dan kebugaran jasmani santri untuk menorehkan prestasi di tingkat kabupaten hingga provinsi.',
    photos: [
      {
        slug: 'aset-kesiswaan-olahraga-1',
        url: '/humas/kesiswaan/kesiswaan-olahraga-1.jpg',
        caption: 'Skuad Tim Basket Putra & Putri SMA AWH',
      },
      {
        slug: 'aset-kesiswaan-olahraga-2',
        url: '/humas/kesiswaan/kesiswaan-olahraga-2.jpg',
        caption: 'Pertandingan Kejuaraan Basket Pelajar',
      },
      {
        slug: 'aset-kesiswaan-olahraga-3',
        url: '/humas/kesiswaan/kesiswaan-olahraga-3.jpg',
        caption: 'Semangat Sportivitas Santri Atlet',
      },
    ],
  },
  {
    id: 'drumband',
    title: 'Drumband Bahana Tebuireng',
    badge: 'Seni Musik Harmoni',
    desc: 'Korps Drumband resmi madrasah yang tampil memukau dalam karnaval budaya kemerdekaan, milad pesantren, dan pawai taaruf daerah.',
    photos: [
      {
        slug: 'aset-kesiswaan-drumband-1',
        url: '/humas/kesiswaan/kesiswaan-drumband-1.jpg',
        caption: 'Penampilan Korps Drumband SMA AWH',
      },
      {
        slug: 'aset-kesiswaan-drumband-2',
        url: '/humas/kesiswaan/kesiswaan-drumband-2.jpg',
        caption: 'Pawai Kirab Drumband Tebuireng',
      },
    ],
  },
  {
    id: 'musik',
    title: 'Seni Musik & Kreativitas',
    badge: 'Ekspresi Budaya & Paduan Suara',
    desc: 'Wadah ekspresi seni religi dan modern santri mencakup paduan suara, teater, seni kaligrafi islami, serta musik akustik beretika.',
    photos: [
      {
        slug: 'aset-kesiswaan-musik-1',
        url: '/humas/kesiswaan/kesiswaan-musik-1.jpg',
        caption: 'Pentas Seni Musik & Teater Santri',
      },
      {
        slug: 'aset-kesiswaan-musik-2',
        url: '/humas/kesiswaan/kesiswaan-musik-2.jpg',
        caption: 'Pentas Kreativitas Panggung Santri',
      },
    ],
  },
];

export default function PublicKesiswaanPage() {
  const [sections, setSections] = useState(defaultKesiswaanSections);
  const containerRef = useRef(null);

  useGSAP(() => {
    // 1. Header
    gsap.fromTo(
      '.gsap-kesiswaan-header',
      { opacity: 0, y: 25 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', clearProps: 'opacity,transform' }
    );

    // 2. Sections & Cards
    const secNodes = gsap.utils.toArray('.gsap-kesiswaan-sec');
    secNodes.forEach((sec) => {
      gsap.fromTo(
        sec,
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          clearProps: 'opacity,transform',
          scrollTrigger: {
            trigger: sec,
            start: 'top 85%',
            once: true,
          },
        }
      );

      const cards = sec.querySelectorAll('.gsap-kesiswaan-card');
      if (cards.length > 0) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 25 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out',
            clearProps: 'opacity,transform',
            scrollTrigger: {
              trigger: sec,
              start: 'top 80%',
              once: true,
            },
          }
        );
      }
    });
  }, { scope: containerRef, dependencies: [sections] });

  useEffect(() => {
    const fetchKesiswaanAssets = async () => {
      try {
        const res = await fetch('/api/v1/humas/konten-publik?kategori=Aset%20Web&limit=50');
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.data)) {
            const assetMap = {};
            json.data.forEach((item) => {
              if (item.slug) {
                assetMap[item.slug] = item;
              }
            });

            setSections((prev) =>
              prev.map((sec) => ({
                ...sec,
                photos: sec.photos.map((photo) => {
                  const matched = assetMap[photo.slug];
                  if (matched) {
                    return {
                      ...photo,
                      url: matched.image_url || photo.url,
                      caption: matched.judul || photo.caption,
                    };
                  }
                  return photo;
                }),
              }))
            );
          }
        }
      } catch (err) {
        console.warn('Gagal memuat aset kesiswaan dari CMS, fallback ke data lokal:', err);
      }
    };

    fetchKesiswaanAssets();
  }, []);

  return (
    <div className="bg-background text-on-surface font-body-md antialiased min-h-screen flex flex-col selection:bg-gold-medal selection:text-forest-deep">
      {/* NAVBAR */}
      <PublicNavbar />

      <main ref={containerRef} className="flex-grow">
        {/* SUB-NAV & BREADCRUMB */}
        <section className="bg-surface-warm border-b border-border-subtle py-3 sm:py-4">
          <div className="max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
              <Link className="hover:text-forest-deep transition-colors" to="/">
                BERANDA
              </Link>
              <span className="material-symbols-outlined text-[13px] text-outline-variant">chevron_right</span>
              <span className="text-on-surface-variant">KESISWAAN</span>
              <span className="material-symbols-outlined text-[13px] text-outline-variant">chevron_right</span>
              <span aria-current="page" className="text-forest-deep font-bold">
                Kesiswaan
              </span>
            </nav>

            <span className="text-xs text-gold-burnished font-bold uppercase tracking-wider hidden sm:inline-block">
              SMA A. Wahid Hasyim Tebuireng
            </span>
          </div>
        </section>

        {/* HEADER SECTION */}
        <section className="gsap-kesiswaan-header bg-surface-warm/60 border-b border-border-subtle py-8 md:py-12">
          <div className="max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-deep/10 border border-forest-deep/20 text-forest-deep text-xs font-bold uppercase tracking-wider mb-3">
              <span className="material-symbols-outlined text-[15px]">groups</span>
              <span>Organisasi & Ekstrakurikuler Santri</span>
            </div>
            <h1 className="font-headline-xl text-2xl sm:text-3xl lg:text-4xl font-extrabold text-forest-deep tracking-tight leading-tight">
              Kesiswaan SMA A. Wahid Hasyim
            </h1>
            <p className="mt-2 text-xs sm:text-sm md:text-base text-on-surface-variant leading-relaxed">
              Membentuk generasi santri yang mandiri, berkarakter mulia, berjiwa kepemimpinan, berprestasi dalam bidang olahraga dan seni, serta berwawasan global.
            </p>
          </div>
        </section>

        {/* SECTIONS LIST */}
        <div className="py-12 md:py-16 space-y-16 max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop">
          {sections.map((sec, sIdx) => (
            <section
              key={sec.id}
              id={sec.id}
              className={`gsap-kesiswaan-sec rounded-3xl border border-border-subtle p-6 sm:p-10 elevation-1 ${
                sIdx % 2 === 0 ? 'bg-surface-card' : 'bg-surface-warm'
              }`}
            >
              <div className="space-y-4 mb-8">
                <span className="px-3 py-1 rounded-full bg-forest-deep text-white text-xs font-bold uppercase tracking-wider">
                  {sec.badge}
                </span>
                <h2 className="font-headline-xl text-xl sm:text-2xl lg:text-3xl font-bold text-forest-deep">
                  {sec.title}
                </h2>
                <p className="text-xs sm:text-sm md:text-base text-on-surface-variant leading-relaxed max-w-3xl">
                  {sec.desc}
                </p>
              </div>

              {/* Photo Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sec.photos.map((p, pIdx) => (
                  <div
                    key={pIdx}
                    className="gsap-kesiswaan-card rounded-2xl overflow-hidden border border-border-subtle bg-background shadow-sm group hover:border-forest-deep transition-colors duration-200"
                  >
                    <div className="h-48 sm:h-56 overflow-hidden bg-surface-container">
                      <img
                        src={p.url}
                        alt={p.caption}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/logo.png';
                        }}
                      />
                    </div>
                    <div className="p-3 bg-surface-card border-t border-border-subtle">
                      <p className="text-xs text-on-surface-variant font-medium">
                        {p.caption}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      {/* FOOTER */}
      <PublicFooter />
    </div>
  );
}
