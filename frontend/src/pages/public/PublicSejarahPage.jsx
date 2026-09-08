import React from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../../components/public/PublicNavbar';
import PublicFooter from '../../components/public/PublicFooter';

export default function PublicSejarahPage() {
  const filosofiPendidikan = [
    'Unggul dalam prestasi akademik.',
    'Berakhlakul karimah sesuai nilai-nilai Islam.',
    'Memiliki jiwa kepemimpinan dan kemandirian.',
    'Menguasai ilmu pengetahuan dan teknologi.',
    'Siap bersaing di tingkat nasional maupun internasional dengan tetap menjunjung tinggi nilai-nilai pesantren.'
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
                Sejarah Sekolah
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
                Sambutan
              </Link>
              <Link
                to="/profil/visi-misi"
                className="px-3 py-1 rounded-full text-xs font-semibold text-on-surface-variant hover:bg-surface-container whitespace-nowrap transition-colors"
              >
                Visi dan Misi
              </Link>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-forest-deep text-white whitespace-nowrap shadow-sm">
                Sejarah Sekolah
              </span>
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-deep/10 border border-forest-deep/20 text-forest-deep text-xs font-bold uppercase tracking-wider mb-3">
              <span className="material-symbols-outlined text-[15px]">history_edu</span>
              <span>SEJARAH SEKOLAH</span>
            </div>
            <h1 className="font-headline-xl text-2xl sm:text-3xl lg:text-4xl font-extrabold text-forest-deep tracking-tight leading-tight">
              Sejarah Singkat SMA A. Wahid Hasyim Tebuireng
            </h1>
          </div>
        </section>

        {/* ==================== SEJARAH SINGKAT NASKAH RESMI ==================== */}
        <section className="py-12 md:py-16 bg-background">
          <div className="max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop">
            <div className="max-w-3xl mx-auto space-y-6 text-sm sm:text-base leading-relaxed text-on-surface font-normal">
              <p>
                <strong>SMA A Wahid Hasyim Tebuireng</strong> merupakan salah satu sekolah menengah atas swasta unggulan yang berada di bawah naungan <strong>Yayasan KH. Muhammad Hasyim Asy’ari Tebuireng</strong>, berlokasi di Jl. Irian Jaya No. 10, Tebuireng, Desa Cukir, Kecamatan Diwek, Kabupaten Jombang, Jawa Timur. Sekolah ini resmi berdiri berdasarkan <strong>Surat Keputusan (SK) Pendirian Nomor 04369/104.7.4/1989 tanggal 21 Agustus 1989</strong> dan hingga kini telah memperoleh <strong>Akreditasi A</strong> sebagai bukti komitmennya dalam menyelenggarakan pendidikan yang bermutu.
              </p>

              <p>
                Didirikan sebagai bagian dari pengembangan lembaga pendidikan di lingkungan <strong>Pesantren Tebuireng</strong>, SMA A Wahid Hasyim hadir untuk menjawab kebutuhan masyarakat akan pendidikan menengah yang mampu memadukan <strong>keunggulan akademik</strong>, <strong>pendidikan karakter</strong>, dan <strong>nilai-nilai keislaman</strong>. Nama sekolah diambil dari <strong>KH. Abdul Wahid Hasyim</strong>, seorang tokoh nasional, ulama pembaru pendidikan Islam, serta putra pendiri Pesantren Tebuireng, KH. Hasyim Asy’ari, yang dikenal atas dedikasinya dalam memajukan pendidikan di Indonesia.
              </p>

              <div className="p-5 sm:p-6 bg-surface-warm border-l-4 border-forest-deep rounded-r-2xl my-6">
                <p className="font-bold text-forest-deep text-sm mb-2">
                  Integrasi Kurikulum Nasional dan Khas Pesantren:
                </p>
                <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                  Sejak awal berdirinya, sekolah ini mengembangkan sistem pendidikan yang mengintegrasikan <strong>kurikulum nasional</strong> dengan <strong>kurikulum khas pesantren</strong>. Selain mempelajari mata pelajaran umum, peserta didik juga mendapatkan penguatan ilmu-ilmu keislaman seperti <em>akidah, akhlak, tafsir, hadis, fikih, nahwu, sharaf, Aswaja, dan Sejarah Kebudayaan Islam</em>. Model pendidikan tersebut bertujuan membentuk lulusan yang memiliki keseimbangan antara kecerdasan intelektual, spiritual, dan sosial.
                </p>
              </div>

              <p>
                Dalam perjalanannya, SMA A Wahid Hasyim Tebuireng terus berkembang dengan meningkatkan kualitas tenaga pendidik, fasilitas pembelajaran, laboratorium, sarana teknologi informasi, serta berbagai kegiatan ekstrakurikuler. Sekolah juga menanamkan budaya disiplin, kepemimpinan, kemandirian, dan semangat berprestasi melalui berbagai program akademik maupun nonakademik.
              </p>

              <p>
                Hingga saat ini, SMA A Wahid Hasyim Tebuireng dikenal sebagai sekolah berbasis pesantren yang mengedepankan pembentukan <strong>akhlakul karimah</strong>, penguasaan ilmu pengetahuan, kemampuan berbahasa asing, serta pengembangan potensi siswa di bidang sains, olahraga, seni, organisasi, dan kewirausahaan. Dengan semangat inovasi yang tetap berlandaskan nilai-nilai Islam Ahlussunnah wal Jama’ah, sekolah terus berupaya mencetak generasi yang siap menghadapi tantangan global tanpa meninggalkan jati diri sebagai insan beriman dan berakhlak mulia.
              </p>
            </div>
          </div>
        </section>

        {/* ==================== IDENTITAS SEKOLAH & FILOSOFI PENDIDIKAN ==================== */}
        <section className="py-12 md:py-16 bg-surface-warm border-t border-border-subtle">
          <div className="max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
              {/* Kolom 1: Identitas Sekolah (6 cols) */}
              <div className="md:col-span-6 bg-surface-card border border-border-subtle rounded-3xl p-6 sm:p-8 shadow-md elevation-1">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-forest-deep text-2xl">badge</span>
                  <h2 className="font-headline-md text-lg sm:text-xl font-bold text-forest-deep">
                    Identitas Sekolah
                  </h2>
                </div>

                <div className="divide-y divide-border-subtle text-xs sm:text-sm">
                  <div className="py-3 flex justify-between gap-4">
                    <span className="text-on-surface-variant font-medium">Nama Sekolah:</span>
                    <strong className="text-forest-deep text-right">SMA A Wahid Hasyim Tebuireng</strong>
                  </div>
                  <div className="py-3 flex justify-between gap-4">
                    <span className="text-on-surface-variant font-medium">NPSN:</span>
                    <strong className="text-forest-deep text-right font-mono font-bold">20540307</strong>
                  </div>
                  <div className="py-3 flex justify-between gap-4">
                    <span className="text-on-surface-variant font-medium">Status:</span>
                    <span className="text-forest-deep text-right font-semibold">Swasta</span>
                  </div>
                  <div className="py-3 flex justify-between gap-4">
                    <span className="text-on-surface-variant font-medium">Naungan:</span>
                    <strong className="text-forest-deep text-right">Yayasan KH. Muhammad Hasyim Asy’ari</strong>
                  </div>
                  <div className="py-3 flex justify-between gap-4">
                    <span className="text-on-surface-variant font-medium">Tanggal Berdiri:</span>
                    <span className="text-forest-deep text-right font-semibold">21 Agustus 1989</span>
                  </div>
                  <div className="py-3 flex justify-between gap-4">
                    <span className="text-on-surface-variant font-medium">Akreditasi:</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-forest-deep text-white font-bold text-xs">
                      A
                    </span>
                  </div>
                  <div className="py-3 flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4">
                    <span className="text-on-surface-variant font-medium">Alamat:</span>
                    <span className="text-forest-deep sm:text-right text-xs leading-relaxed">
                      Jl. Irian Jaya No. 10, Tebuireng, Desa Cukir, Kecamatan Diwek, Kabupaten Jombang, Jawa Timur.
                    </span>
                  </div>
                </div>
              </div>

              {/* Kolom 2: Filosofi Pendidikan (6 cols) */}
              <div className="md:col-span-6 bg-surface-card border border-border-subtle rounded-3xl p-6 sm:p-8 shadow-md elevation-1">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-gold-medal text-2xl">verified</span>
                  <h2 className="font-headline-md text-lg sm:text-xl font-bold text-forest-deep">
                    Filosofi Pendidikan
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-on-surface-variant mb-5">
                  SMA A Wahid Hasyim Tebuireng berkomitmen mencetak lulusan yang:
                </p>

                <div className="space-y-3">
                  {filosofiPendidikan.map((point, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-surface-warm border border-border-subtle flex items-start gap-3"
                    >
                      <span className="w-6 h-6 rounded-lg bg-forest-deep text-white flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-xs sm:text-sm text-on-surface font-medium leading-relaxed">
                        {point}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM NAV CARD */}
        <section className="py-10 bg-background border-t border-border-subtle">
          <div className="max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop">
            <div className="bg-surface-warm border border-border-subtle rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-headline-md text-base font-bold text-forest-deep">
                  Informasi Tambahan Profil Sekolah
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Ketahui visi & misi serta sambutan resmi kepala sekolah.
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
                  to="/profil/sambutan"
                  className="px-4 py-2.5 rounded-xl border border-border-strong hover:bg-surface-container text-forest-deep text-xs font-semibold transition-colors"
                >
                  Sambutan Kepala Sekolah
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
