import React from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../../components/public/PublicNavbar';
import PublicFooter from '../../components/public/PublicFooter';

export default function PublicAlumniPage() {
  return (
    <div className="bg-background text-on-surface font-body-md antialiased min-h-screen flex flex-col selection:bg-gold-medal selection:text-forest-deep">
      {/* NAVBAR */}
      <PublicNavbar />

      <main className="flex-grow">
        {/* BREADCRUMB */}
        <section className="bg-surface-warm border-b border-border-subtle py-3 sm:py-4">
          <div className="max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
              <Link className="hover:text-forest-deep transition-colors" to="/">
                Beranda
              </Link>
              <span className="material-symbols-outlined text-[13px] text-outline-variant">chevron_right</span>
              <Link className="hover:text-forest-deep transition-colors" to="/berita">
                Berita
              </Link>
              <span className="material-symbols-outlined text-[13px] text-outline-variant">chevron_right</span>
              <span aria-current="page" className="text-forest-deep font-bold">
                Alumni SMA AWH
              </span>
            </nav>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <Link
                to="/berita"
                className="px-3 py-1 rounded-full text-xs font-semibold text-on-surface-variant hover:bg-surface-container whitespace-nowrap transition-colors"
              >
                Semua Berita
              </Link>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-forest-deep text-white whitespace-nowrap shadow-sm">
                Alumni SMA AWH
              </span>
              <Link
                to="/kontak"
                className="px-3 py-1 rounded-full text-xs font-semibold text-on-surface-variant hover:bg-surface-container whitespace-nowrap transition-colors"
              >
                Kontak Kami
              </Link>
            </div>
          </div>
        </section>

        {/* HERO TITLE SECTION */}
        <section className="bg-surface-warm/60 border-b border-border-subtle py-8 md:py-12">
          <div className="max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-forest-deep/10 border border-forest-deep/20 text-forest-deep text-xs font-bold uppercase tracking-wider mb-3">
              <span className="material-symbols-outlined text-[15px]">school</span>
              <span>Jejaring & Ikatan Alumni • Pesantren Tebuireng</span>
            </div>
            <h1 className="font-headline-xl text-2xl sm:text-3xl lg:text-4xl font-extrabold text-forest-deep tracking-tight leading-tight">
              Alumni SMA A. Wahid Hasyim Tebuireng
            </h1>
            <p className="mt-2 text-xs sm:text-sm md:text-base text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
              "Sekolah boleh menjadi masa lalu, tetapi nilai-nilai yang ditanamkan akan menjadi bekal sepanjang hayat."
            </p>
          </div>
        </section>

        {/* MAIN EDITORIAL CONTENT */}
        <div className="max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop py-12 md:py-16">
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Highlight Banner */}
            <div className="p-5 sm:p-6 rounded-2xl bg-surface-card border-l-4 border-gold-medal shadow-sm">
              <p className="font-headline-md text-base sm:text-lg font-bold text-forest-deep leading-snug">
                “Alumni Hebat, Sekolah Bermartabat, Indonesia Kuat.”
              </p>
              <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
                Semangat ngaji, berprestasi, dan mengabdi untuk negeri.
              </p>
            </div>

            {/* Narrative Sections from Original Site */}
            <div className="space-y-5 text-sm sm:text-base leading-relaxed text-on-surface font-normal">
              <p>
                <strong>SMA A. Wahid Hasyim Tebuireng</strong> merupakan salah satu lembaga pendidikan di bawah naungan Yayasan Hasyim Asy’ari Tebuireng yang memadukan pendidikan nasional dengan pendidikan berbasis pesantren. Berlokasi di Tebuireng, Kecamatan Diwek, Kabupaten Jombang, sekolah ini telah terakreditasi <strong>A</strong> dan dikenal dengan penguatan karakter Islami, tradisi keilmuan, serta pembinaan akademik dan nonakademik.
              </p>

              <p>
                Selama puluhan tahun berdiri, SMA A. Wahid Hasyim Tebuireng telah melahirkan ribuan alumni yang tersebar di berbagai daerah di Indonesia. Mereka berkiprah sebagai pendidik, ulama, aparatur sipil negara, anggota TNI dan Polri, pengusaha, akademisi, profesional, hingga tokoh masyarakat. Jejak para alumni menjadi bukti bahwa pendidikan yang mengintegrasikan ilmu pengetahuan, akhlak, dan spiritualitas mampu menghasilkan generasi yang siap menghadapi tantangan zaman.
              </p>

              <div className="pt-2">
                <h2 className="font-headline-xl text-lg sm:text-xl font-bold text-forest-deep mb-2">
                  Pendidikan Berbasis Karakter
                </h2>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  Salah satu kekuatan utama SMA A. Wahid Hasyim Tebuireng adalah perpaduan antara kurikulum nasional dengan kurikulum pesantren. Peserta didik tidak hanya memperoleh pembelajaran akademik, tetapi juga pembinaan akhlakul karimah, kajian keislaman, kedisiplinan, serta nilai-nilai Ahlussunnah wal Jama’ah yang menjadi ciri khas Tebuireng. Pendekatan ini membentuk lulusan yang tidak hanya cerdas secara intelektual, tetapi juga matang secara moral dan sosial.
                </p>
              </div>

              <div className="pt-2">
                <h2 className="font-headline-xl text-lg sm:text-xl font-bold text-forest-deep mb-2">
                  Peran Strategis Alumni
                </h2>
                <p className="text-on-surface-variant text-sm leading-relaxed mb-4">
                  Alumni memiliki posisi yang sangat penting dalam mendukung kemajuan sekolah. Melalui pengalaman di dunia kerja, perguruan tinggi, maupun pengabdian kepada masyarakat, alumni dapat menjadi sumber inspirasi bagi adik-adik kelas.
                </p>
                <p className="text-sm font-semibold text-forest-deep mb-2">
                  Peran alumni dapat diwujudkan melalui berbagai kegiatan, antara lain:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-xl bg-surface-warm border border-border-subtle flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-gold-medal text-[18px] mt-0.5 shrink-0">check_circle</span>
                    <span className="text-xs sm:text-sm text-on-surface">Memberikan motivasi dan berbagi pengalaman karier.</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-surface-warm border border-border-subtle flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-gold-medal text-[18px] mt-0.5 shrink-0">check_circle</span>
                    <span className="text-xs sm:text-sm text-on-surface">Menjadi narasumber seminar, pelatihan, dan kuliah inspiratif.</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-surface-warm border border-border-subtle flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-gold-medal text-[18px] mt-0.5 shrink-0">check_circle</span>
                    <span className="text-xs sm:text-sm text-on-surface">Membantu pengembangan jaringan kerja sama sekolah.</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-surface-warm border border-border-subtle flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-gold-medal text-[18px] mt-0.5 shrink-0">check_circle</span>
                    <span className="text-xs sm:text-sm text-on-surface">Memberikan beasiswa atau bantuan pendidikan bagi siswa berprestasi.</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-surface-warm border border-border-subtle flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-gold-medal text-[18px] mt-0.5 shrink-0">check_circle</span>
                    <span className="text-xs sm:text-sm text-on-surface">Mendukung pengembangan sarana dan prasarana sekolah.</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-surface-warm border border-border-subtle flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-gold-medal text-[18px] mt-0.5 shrink-0">check_circle</span>
                    <span className="text-xs sm:text-sm text-on-surface">Menjadi mitra sekolah dalam program magang, kewirausahaan, maupun pengabdian masyarakat.</span>
                  </div>
                </div>
                <div className="mt-4 p-4 rounded-xl bg-surface-card border border-border-subtle text-xs sm:text-sm text-on-surface-variant">
                  Program seperti <strong>Inspiring Talk with Alumni (INSTALK)</strong> merupakan salah satu bentuk kegiatan yang mempertemukan alumni dengan peserta didik agar pengalaman nyata para lulusan dapat menjadi motivasi bagi generasi berikutnya.
                </div>
              </div>

              <div className="pt-2">
                <h2 className="font-headline-xl text-lg sm:text-xl font-bold text-forest-deep mb-2">
                  Membangun Jejaring Alumni yang Solid
                </h2>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  Di era digital, komunikasi antargenerasi alumni menjadi semakin mudah. Melalui organisasi alumni dan berbagai platform komunikasi, lulusan dari berbagai angkatan dapat saling berbagi informasi, membuka peluang kerja, membangun kolaborasi usaha, hingga melaksanakan kegiatan sosial untuk masyarakat.
                </p>
                <p className="text-on-surface-variant text-sm leading-relaxed mt-2">
                  Jejaring alumni yang kuat juga memberikan manfaat bagi sekolah dalam memperoleh masukan terhadap pengembangan kurikulum, peningkatan kualitas lulusan, serta perluasan kemitraan dengan perguruan tinggi dan dunia industri.
                </p>
              </div>

              <div className="pt-2">
                <h2 className="font-headline-xl text-lg sm:text-xl font-bold text-forest-deep mb-2">
                  Semangat Mengabdi untuk Negeri
                </h2>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  Sebagai bagian dari keluarga besar Tebuireng, alumni diharapkan terus membawa nilai-nilai kejujuran, tanggung jawab, moderasi, kerja keras, serta kepedulian terhadap masyarakat. Kesuksesan seorang alumni bukan hanya diukur dari jabatan atau profesinya, melainkan juga dari manfaat yang diberikan kepada lingkungan sekitar.
                </p>
                <p className="text-on-surface-variant text-sm leading-relaxed mt-2">
                  Semangat "ngaji, berprestasi, dan mengabdi" menjadi warisan yang terus hidup dalam perjalanan setiap lulusan SMA A. Wahid Hasyim Tebuireng. Dengan menjaga silaturahmi dan memperkuat kolaborasi, alumni dapat menjadi mitra strategis sekolah dalam mencetak generasi yang berilmu, berakhlak, dan siap membangun Indonesia.
                </p>
              </div>
            </div>

            {/* Bottom Contact CTA */}
            <div className="pt-6 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-forest-deep text-sm">Sekretariat Ikatan Alumni SMA AWH</h3>
                <p className="text-xs text-on-surface-variant">Hubungi kami untuk kolaborasi, silaturahmi angkatan, atau agenda alumni.</p>
              </div>
              <Link
                to="/kontak"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-forest-deep hover:bg-emerald-deep text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm"
              >
                <span>Hubungi Sekolah</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <PublicFooter />
    </div>
  );
}
