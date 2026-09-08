import React from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../../components/public/PublicNavbar';
import PublicFooter from '../../components/public/PublicFooter';

export default function PublicFasilitasPage() {
  const facilityPoints = [
    'Modern classroom with smart board and overhead projector',
    'Window wall frame system Auditorium.',
    '360° glass landscaped view library building.',
    'Outdoor Multifunction Sports Court for basket, futsal, volley, badminton courts.',
    'Music and audio visual room.',
    'Visual Art Studio.',
    'Multiplied Computer Labs with smart board.',
    'Multiple Science Labs accomodating all science subjects: Chemistry Laboratory, Physics Laboratory, Biology Laboratory.',
    'School Clinic.',
    'Cafeteria for students and staffs.'
  ];

  const galleryItems = [
    {
      title: 'EL Art Room',
      category: 'Art Room',
      image: 'https://smaawhtebuireng.sch.id/wp-content/uploads/2024/06/EL-Art-Room.jpg'
    },
    {
      title: 'EL Gymnasium',
      category: 'Sports Court',
      image: 'https://smaawhtebuireng.sch.id/wp-content/uploads/2024/06/EL-Gymnasium.jpg'
    },
    {
      title: 'EL ICT Room',
      category: 'ICT Room',
      image: 'https://smaawhtebuireng.sch.id/wp-content/uploads/2024/06/EL-ICT-Room.jpg'
    },
    {
      title: 'EL Library',
      category: 'Library',
      image: 'https://smaawhtebuireng.sch.id/wp-content/uploads/2024/06/EL-Library.jpg'
    },
    {
      title: 'EL Music Room',
      category: 'Music Room',
      image: 'https://smaawhtebuireng.sch.id/wp-content/uploads/2024/06/EL-Music-Room.jpg'
    },
    {
      title: 'MS Basketball Court',
      category: 'Basketball Court',
      image: 'https://smaawhtebuireng.sch.id/wp-content/uploads/2024/06/MS-Basketball-Court.jpg'
    },
    {
      title: 'MS Biology Laboratory',
      category: 'Science Laboratory',
      image: 'https://smaawhtebuireng.sch.id/wp-content/uploads/2024/06/MS-Biology-Laboratory.jpg'
    },
    {
      title: 'MS ICT Room',
      category: 'ICT Room',
      image: 'https://smaawhtebuireng.sch.id/wp-content/uploads/2024/06/MS-ICT-Room.jpg'
    },
    {
      title: 'MS Library',
      category: 'Library',
      image: 'https://smaawhtebuireng.sch.id/wp-content/uploads/2024/06/MS-Library.jpg'
    },
    {
      title: 'MS Music Room',
      category: 'Music Room',
      image: 'https://smaawhtebuireng.sch.id/wp-content/uploads/2024/06/MS-Music-Room.jpg'
    }
  ];

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
                HOME
              </Link>
              <span className="material-symbols-outlined text-[13px] text-outline-variant">chevron_right</span>
              <span className="text-on-surface-variant">PROFIL</span>
              <span className="material-symbols-outlined text-[13px] text-outline-variant">chevron_right</span>
              <span aria-current="page" className="text-forest-deep font-bold">
                Fasilitas
              </span>
            </nav>

            <span className="text-xs text-gold-burnished font-bold uppercase tracking-wider hidden sm:inline-block">
              SMA A. Wahid Hasyim Tebuireng
            </span>
          </div>
        </section>

        {/* HEADER SECTION */}
        <section className="bg-surface-warm/60 border-b border-border-subtle py-8 md:py-12">
          <div className="max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-deep/10 border border-forest-deep/20 text-forest-deep text-xs font-bold uppercase tracking-wider mb-3">
              <span className="material-symbols-outlined text-[15px]">apartment</span>
              <span>Sarana & Prasarana Madrasah</span>
            </div>
            <h1 className="font-headline-xl text-2xl sm:text-3xl lg:text-4xl font-extrabold text-forest-deep tracking-tight leading-tight">
              Fasilitas Sekolah
            </h1>
            <p className="mt-2 text-xs sm:text-sm md:text-base text-on-surface-variant leading-relaxed">
              Dukungan fasilitas pembelajaran terpadu untuk menunjang proses akademik, riset sains, kreativitas, dan pengembangan karakter santri.
            </p>
          </div>
        </section>

        {/* 10 FACILITY BULLETS */}
        <section className="py-12 md:py-16 bg-background">
          <div className="max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop">
            <div className="max-w-4xl mx-auto bg-surface-card border border-border-subtle rounded-3xl p-6 sm:p-10 shadow-sm elevation-1 space-y-6">
              <h2 className="font-headline-md text-lg sm:text-xl font-bold text-forest-deep border-b border-border-subtle pb-4">
                Daftar Sarana & Prasarana Unggulan
              </h2>
              <ul className="space-y-4">
                {facilityPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-3.5">
                    <span className="w-6 h-6 rounded-full bg-forest-deep/10 text-forest-deep flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                      {index + 1}
                    </span>
                    <span className="text-sm sm:text-base text-on-surface leading-relaxed">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* PHOTO GALLERY SECTION */}
        <section className="py-12 md:py-16 bg-surface-warm border-t border-border-subtle">
          <div className="max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop">
            <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
              <span className="text-xs uppercase tracking-widest text-gold-burnished font-bold">
                DOKUMENTASI SARANA
              </span>
              <h2 className="font-headline-xl text-2xl sm:text-3xl font-bold text-forest-deep">
                Galeri Fasilitas Sekolah
              </h2>
              <p className="text-xs sm:text-sm text-on-surface-variant">
                Ruang belajar, laboratorium sains, perpustakaan, sarana olahraga, dan studio seni.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryItems.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl overflow-hidden border border-border-subtle bg-surface-card shadow-sm elevation-1 group hover:border-forest-deep transition-all"
                >
                  <div className="h-52 sm:h-56 overflow-hidden bg-surface-container relative">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3 bg-forest-deep/80 backdrop-blur-sm text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      {item.category}
                    </div>
                  </div>
                  <div className="p-4 bg-surface-card">
                    <h3 className="font-headline-md text-sm sm:text-base font-bold text-forest-deep leading-snug">
                      {item.title}
                    </h3>
                  </div>
                </div>
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
