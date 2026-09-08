import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import PublicNavbar from '../../components/public/PublicNavbar';
import PublicFooter from '../../components/public/PublicFooter';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function PublicKontakPage() {
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    email: '',
    no_telepon: '',
    judul_pesan: '',
    pesan_anda: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const containerRef = useRef(null);

  useGSAP(() => {
    // 1. Header
    gsap.fromTo(
      '.gsap-kontak-header',
      { opacity: 0, y: 25 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', clearProps: 'opacity,transform' }
    );

    // 2. Info Card (Left)
    gsap.fromTo(
      '.gsap-kontak-info',
      { opacity: 0, x: -35 },
      { opacity: 1, x: 0, duration: 0.8, delay: 0.1, ease: 'power2.out', clearProps: 'opacity,transform' }
    );

    // 3. Form Card (Right)
    gsap.fromTo(
      '.gsap-kontak-form',
      { opacity: 0, x: 35 },
      { opacity: 1, x: 0, duration: 0.8, delay: 0.2, ease: 'power2.out', clearProps: 'opacity,transform' }
    );

    // 4. Google Maps Section
    gsap.fromTo(
      '.gsap-kontak-map',
      { opacity: 0, scale: 0.97 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.9,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
        scrollTrigger: {
          trigger: '#map-section',
          start: 'top 85%',
          once: true,
        },
      }
    );
  }, { scope: containerRef });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate message submission
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setFormData({
        nama_lengkap: '',
        email: '',
        no_telepon: '',
        judul_pesan: '',
        pesan_anda: ''
      });
    }, 800);
  };

  return (
    <div className="bg-background text-on-surface font-body-md antialiased min-h-screen flex flex-col selection:bg-gold-medal selection:text-forest-deep">
      {/* 1. NAVBAR */}
      <PublicNavbar />

      <main ref={containerRef} className="flex-grow">
        {/* SUB-NAV & BREADCRUMB */}
        <section className="bg-surface-warm border-b border-border-subtle py-3 sm:py-4">
          <div className="max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
              <Link className="hover:text-forest-deep transition-colors" to="/">
                Beranda
              </Link>
              <span className="material-symbols-outlined text-[13px] text-outline-variant">chevron_right</span>
              <span aria-current="page" className="text-forest-deep font-bold">
                Kontak Resmi
              </span>
            </nav>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <Link
                to="/"
                className="px-3 py-1 rounded-full text-xs font-semibold text-on-surface-variant hover:bg-surface-container whitespace-nowrap transition-colors"
              >
                Beranda
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
                Visi & Misi
              </Link>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-forest-deep text-white whitespace-nowrap shadow-sm">
                Kontak
              </span>
            </div>
          </div>
        </section>

        {/* HERO TITLE SECTION */}
        <section className="gsap-kontak-header bg-surface-warm/60 border-b border-border-subtle py-8 md:py-12">
          <div className="max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-deep/10 border border-forest-deep/20 text-forest-deep text-xs font-bold uppercase tracking-wider mb-3">
              <span className="material-symbols-outlined text-[15px]">headset_mic</span>
              <span>Pusat Informasi & Pelayanan Terpadu</span>
            </div>
            <h1 className="font-headline-xl text-2xl sm:text-3xl lg:text-4xl font-extrabold text-forest-deep tracking-tight leading-tight">
              Kontak Resmi & Sekretariat Sekolah
            </h1>
            <p className="mt-2 text-xs sm:text-sm md:text-base text-on-surface-variant leading-relaxed">
              Hubungi sekretariat dan layanan informasi resmi SMA A. Wahid Hasyim Tebuireng untuk keperluan administratif, pendaftaran santri, dan kemitraan pendidikan.
            </p>
          </div>
        </section>

        {/* SECTION 2-COLUMN: INFORMASI SEKOLAH & FORMULIR RESMI */}
        <section className="py-12 md:py-16">
          <div className="max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
              {/* LEFT COLUMN: INFORMASI SEKOLAH (5 cols) */}
              <div className="gsap-kontak-info md:col-span-5 flex flex-col gap-6">
                <div className="bg-surface-warm border border-border-subtle rounded-3xl p-6 sm:p-8 shadow-md elevation-2 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-forest-deep"></div>

                  <div className="border-b border-border-subtle pb-4 mb-6">
                    <span className="text-xs font-bold uppercase tracking-widest text-gold-burnished block mb-1">
                      Sekretariat Resmi
                    </span>
                    <h2 className="font-headline-md text-xl sm:text-2xl font-bold text-forest-deep">
                      Informasi Sekolah
                    </h2>
                  </div>

                  <div className="space-y-5">
                    {/* Alamat Sekolah */}
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-forest-deep shrink-0">
                        <span className="material-symbols-outlined text-xl">location_on</span>
                      </div>
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-forest-deep mb-0.5">
                          Alamat Sekolah
                        </h3>
                        <p className="text-sm font-bold text-on-surface mb-0.5">
                          SMA A. Wahid Hasyim Tebuireng
                        </p>
                        <p className="text-xs text-on-surface-variant leading-relaxed">
                          Jl. Irian Jaya, Kwaron, Cukir, Kec. Diwek, Kabupaten Jombang, Jawa Timur 61471
                        </p>
                      </div>
                    </div>

                    <div className="h-px bg-border-subtle"></div>

                    {/* No Telepon */}
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-forest-deep shrink-0">
                        <span className="material-symbols-outlined text-xl">call</span>
                      </div>
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-forest-deep mb-0.5">
                          No. Telepon Kantor
                        </h3>
                        <a
                          className="text-sm font-bold text-forest-deep hover:text-gold-burnished transition-colors"
                          href="tel:0321874289"
                        >
                          0321-874289
                        </a>
                        <p className="text-xs text-on-surface-variant">Layanan Administrasi & Tata Usaha</p>
                      </div>
                    </div>

                    <div className="h-px bg-border-subtle"></div>

                    {/* Email */}
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-forest-deep shrink-0">
                        <span className="material-symbols-outlined text-xl">mail</span>
                      </div>
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-forest-deep mb-0.5">
                          Email Resmi
                        </h3>
                        <a
                          className="text-sm font-bold text-forest-deep hover:underline break-all"
                          href="mailto:admin@smaawhtebuireng.sch.id"
                        >
                          admin@smaawhtebuireng.sch.id
                        </a>
                        <p className="text-xs text-on-surface-variant">Korespondensi Akademik & Formal</p>
                      </div>
                    </div>

                    <div className="h-px bg-border-subtle"></div>

                    {/* Jam Operasional */}
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-forest-deep shrink-0">
                        <span className="material-symbols-outlined text-xl">schedule</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-forest-deep mb-1.5">
                          Jam Operasional Pelayanan
                        </h3>
                        <div className="text-xs text-on-surface space-y-1.5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-0.5 sm:gap-2">
                            <span className="text-on-surface-variant">Sabtu - Kamis:</span>
                            <span className="font-semibold text-forest-deep">07.00 - 13.00 WIB</span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-0.5 sm:gap-2">
                            <span className="text-on-surface-variant">Selasa:</span>
                            <span className="font-semibold text-forest-deep">07.00 - 15.00 WIB</span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-0.5 sm:gap-2 text-gold-burnished">
                            <span>Jum'at:</span>
                            <span className="font-semibold">Libur Mingguan Pesantren</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="h-px bg-border-subtle"></div>

                    {/* Sosial Media Resmi */}
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-forest-deep mb-2.5">
                        Saluran Media Resmi
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        <a
                          href="https://www.facebook.com/share/1Bdg9xHnvP/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-subtle bg-surface-card hover:bg-forest-deep hover:text-white text-on-surface text-xs font-semibold transition-colors"
                        >
                          <span className="material-symbols-outlined text-[15px]">public</span>
                          <span>Facebook</span>
                        </a>
                        <a
                          href="https://www.instagram.com/smaawh.tebuireng"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-subtle bg-surface-card hover:bg-forest-deep hover:text-white text-on-surface text-xs font-semibold transition-colors"
                        >
                          <span className="material-symbols-outlined text-[15px]">photo_camera</span>
                          <span>Instagram</span>
                        </a>
                        <a
                          href="https://youtube.com/@sma_awh.tebuirengtv3984"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-subtle bg-surface-card hover:bg-forest-deep hover:text-white text-on-surface text-xs font-semibold transition-colors"
                        >
                          <span className="material-symbols-outlined text-[15px]">smart_display</span>
                          <span>YouTube</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Nilai Adab Santri Callout */}
                <div className="p-4 sm:p-5 rounded-2xl bg-surface-card border border-border-subtle flex items-start gap-3 elevation-1">
                  <span className="material-symbols-outlined text-gold-burnished text-2xl shrink-0 mt-0.5">info</span>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Kunjungan silaturahmi langsung ke kantor madrasah diharapkan mematuhi etika kesopanan, busana muslim/muslimah rapi, dan tata tertib syariat yang berlaku di lingkungan Pondok Pesantren Tebuireng.
                  </p>
                </div>
              </div>

              {/* RIGHT COLUMN: FORMULIR RESMI (7 cols) */}
              <div className="gsap-kontak-form md:col-span-7">
                <div className="bg-surface-warm border border-border-subtle rounded-3xl p-6 sm:p-8 lg:p-10 shadow-md elevation-2 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gold-medal"></div>

                  <div className="border-b border-border-subtle pb-4 mb-6">
                    <span className="text-xs font-bold uppercase tracking-widest text-gold-burnished block mb-1">
                      Kirim Pesan Resmi
                    </span>
                    <h2 className="font-headline-md text-xl sm:text-2xl font-bold text-forest-deep">
                      Formulir Korespondensi
                    </h2>
                    <p className="text-xs sm:text-sm text-on-surface-variant mt-1 leading-relaxed">
                      Sampaikan pertanyaan atau keperluan Anda. Petugas sekretariat SMA A. Wahid Hasyim akan menindaklanjuti pesan dalam waktu 1x24 jam kerja.
                    </p>
                  </div>

                  {submitted ? (
                    <div className="p-6 sm:p-8 bg-emerald-50 border border-emerald-vibrant/20 rounded-2xl text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-forest-deep text-white flex items-center justify-center mx-auto shadow-md">
                        <span className="material-symbols-outlined text-2xl">check</span>
                      </div>
                      <h3 className="font-headline-md text-lg sm:text-xl font-bold text-forest-deep">
                        Pesan Anda Telah Terkirim
                      </h3>
                      <p className="text-xs sm:text-sm text-on-surface-variant max-w-md mx-auto leading-relaxed">
                        Terima kasih telah menghubungi kami. Tim sekretariat SMA A. Wahid Hasyim Tebuireng akan segera menanggapi korespondensi Anda.
                      </p>
                      <button
                        onClick={() => setSubmitted(false)}
                        className="mt-3 px-5 py-2.5 bg-forest-deep text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-emerald-deep transition-colors shadow-sm"
                      >
                        Kirim Pesan Lainnya
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                      {/* Nama Lengkap */}
                      <div>
                        <label className="block text-xs sm:text-sm font-bold text-forest-deep mb-1" htmlFor="nama_lengkap">
                          Nama Lengkap <span className="text-red-500">*</span>
                        </label>
                        <input
                          className="w-full bg-surface-card border border-border-strong rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-on-surface placeholder:text-outline focus:border-forest-deep focus:ring-2 focus:ring-forest-deep/10 transition-all outline-none"
                          id="nama_lengkap"
                          name="nama_lengkap"
                          placeholder="Masukkan nama lengkap Anda"
                          required
                          type="text"
                          value={formData.nama_lengkap}
                          onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                        />
                      </div>

                      {/* Email & Phone Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                        {/* Email */}
                        <div>
                          <label className="block text-xs sm:text-sm font-bold text-forest-deep mb-1" htmlFor="email">
                            Email <span className="text-red-500">*</span>
                          </label>
                          <input
                            className="w-full bg-surface-card border border-border-strong rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-on-surface placeholder:text-outline focus:border-forest-deep focus:ring-2 focus:ring-forest-deep/10 transition-all outline-none"
                            id="email"
                            name="email"
                            placeholder="nama@email.com"
                            required
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          />
                        </div>

                        {/* No Telepon */}
                        <div>
                          <label className="block text-xs sm:text-sm font-bold text-forest-deep mb-1" htmlFor="no_telepon">
                            No. Telepon / WhatsApp <span className="text-red-500">*</span>
                          </label>
                          <input
                            className="w-full bg-surface-card border border-border-strong rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-on-surface placeholder:text-outline focus:border-forest-deep focus:ring-2 focus:ring-forest-deep/10 transition-all outline-none"
                            id="no_telepon"
                            name="no_telepon"
                            placeholder="Contoh: 081234567890"
                            required
                            type="tel"
                            value={formData.no_telepon}
                            onChange={(e) => setFormData({ ...formData, no_telepon: e.target.value })}
                          />
                        </div>
                      </div>

                      {/* Judul Pesan */}
                      <div>
                        <label className="block text-xs sm:text-sm font-bold text-forest-deep mb-1" htmlFor="judul_pesan">
                          Judul Pesan <span className="text-red-500">*</span>
                        </label>
                        <input
                          className="w-full bg-surface-card border border-border-strong rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-on-surface placeholder:text-outline focus:border-forest-deep focus:ring-2 focus:ring-forest-deep/10 transition-all outline-none"
                          id="judul_pesan"
                          name="judul_pesan"
                          placeholder="Contoh: Konfirmasi Pendaftaran Santri Baru / Legalitas Dokumen"
                          required
                          type="text"
                          value={formData.judul_pesan}
                          onChange={(e) => setFormData({ ...formData, judul_pesan: e.target.value })}
                        />
                      </div>

                      {/* Pesan Anda */}
                      <div>
                        <label className="block text-xs sm:text-sm font-bold text-forest-deep mb-1" htmlFor="pesan_anda">
                          Pesan Anda <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          className="w-full bg-surface-card border border-border-strong rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-on-surface placeholder:text-outline focus:border-forest-deep focus:ring-2 focus:ring-forest-deep/10 transition-all outline-none resize-y"
                          id="pesan_anda"
                          name="pesan_anda"
                          placeholder="Tuliskan rincian pesan, pertanyaan, atau keperluan Anda secara lengkap..."
                          required
                          rows={4}
                          value={formData.pesan_anda}
                          onChange={(e) => setFormData({ ...formData, pesan_anda: e.target.value })}
                        ></textarea>
                      </div>

                      {/* Privacy Helper */}
                      <p className="text-[11px] text-on-surface-variant leading-normal">
                        Data yang dikirimkan terjamin kerahasiaannya dan hanya digunakan untuk keperluan pelayanan informasi SMA A. Wahid Hasyim Tebuireng.
                      </p>

                      {/* Submit Button */}
                      <div className="pt-2">
                        <button
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-forest-deep hover:bg-emerald-deep text-white text-xs sm:text-sm font-semibold px-8 py-3.5 rounded-xl transition-all shadow-md disabled:opacity-50"
                          type="submit"
                          disabled={submitting}
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {submitting ? 'hourglass_top' : 'send'}
                          </span>
                          <span>{submitting ? 'Mengirimkan Pesan...' : 'Kirim Pesan Resmi'}</span>
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== SECTION LOKASI GOOGLE MAPS ==================== */}
        <section className="py-16 bg-surface-warm border-t border-border-subtle" id="map-section">
          <div className="max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-gold-burnished uppercase tracking-wider mb-1">
                  <span className="material-symbols-outlined text-[16px]">distance</span>
                  <span>Aksesibilitas Kampus Tebuireng</span>
                </div>
                <h2 className="font-headline-xl text-2xl sm:text-3xl font-bold text-forest-deep">
                  Peta Lokasi & Akses Kampus
                </h2>
                <p className="text-xs sm:text-sm text-on-surface-variant max-w-2xl mt-1 leading-relaxed">
                  Terletak strategis di kawasan terpadu Pesantren Tebuireng, Cukir, Kec. Diwek, Kabupaten Jombang, Jawa Timur. Akses mudah dari jalur nasional Surabaya-Madiun.
                </p>
              </div>

              <a
                className="inline-flex items-center justify-center gap-2 bg-surface-card border border-border-strong text-forest-deep hover:bg-forest-deep hover:text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm self-start md:self-auto"
                href="https://maps.google.com/?q=SMA+A+Wahid+Hasyim+Tebuireng+Jombang"
                rel="noopener noreferrer"
                target="_blank"
              >
                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                <span>Buka di Google Maps</span>
              </a>
            </div>

            {/* Google Maps Embed Container */}
            <div className="gsap-kontak-map bg-surface-warm p-2.5 sm:p-3 rounded-3xl border border-border-subtle shadow-md elevation-2">
              <div className="relative w-full h-[320px] sm:h-[400px] md:h-[460px] rounded-2xl overflow-hidden border border-border-subtle">
                <iframe
                  allowFullScreen=""
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3954.7671754020967!2d112.2355480749842!3d-7.600293175114757!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e786b864a787317%3A0x6e9fef04928d1502!2sSMA%20A.%20Wahid%20Hasyim%20Tebuireng!5e0!3m2!1sid!2sid!4v1710000000000!5m2!1sid!2sid"
                  title="Peta Lokasi SMA A. Wahid Hasyim Tebuireng"
                ></iframe>
              </div>
              <div className="p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs text-on-surface-variant">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-forest-deep text-[18px] shrink-0">near_me</span>
                  <span>Kawasan Pondok Pesantren Tebuireng (Akses lewat gerbang barat atau gerbang utama Makam Gus Dur).</span>
                </div>
                <span className="text-[11px] font-bold text-gold-burnished shrink-0">
                  Koordinat: 7°36'01.1"S 112°14'15.8"E
                </span>
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
