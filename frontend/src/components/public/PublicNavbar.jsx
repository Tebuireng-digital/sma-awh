import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function PublicNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profilDropdownOpen, setProfilDropdownOpen] = useState(false);
  const [prestasiDropdownOpen, setPrestasiDropdownOpen] = useState(false);
  const location = useLocation();

  const isBeranda = location.pathname === '/' || location.pathname === '/website';
  const isSambutan = location.pathname === '/profil/sambutan';
  const isVisiMisi = location.pathname === '/profil/visi-misi';
  const isSejarah = location.pathname === '/profil/sejarah';
  const isProfilActive = isSambutan || isVisiMisi || isSejarah || location.pathname.startsWith('/profil');
  const isBerita = location.pathname.startsWith('/berita');
  const isKontak = location.pathname === '/kontak';

  return (
    <header className="sticky top-0 z-50 bg-surface-glass backdrop-blur-md border-b border-border-subtle shadow-sm transition-all duration-200">
      <nav className="w-full px-gutter-mobile md:px-gutter-desktop mx-auto max-w-container-max flex items-center justify-between h-[72px] sm:h-[76px]">
        {/* Logo Container */}
        <Link to="/" className="flex items-center gap-2 sm:gap-3 group min-w-0 shrink">
          <img
            src="/logo.png"
            alt="SMA A. Wahid Hasyim Tebuireng"
            className="h-9 sm:h-12 w-auto object-contain shrink-0 group-hover:scale-105 transition-transform duration-200"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://lh3.googleusercontent.com/aida/AEtjO1XYZJzHzAs8eB6O8vH5v5UcaaAGf2hDpY2Pgf8WZpAV6e3gdeabmbVXN4WOi3Aj6S3kh7_mQ_4jXjDX_VopRfjpoPUsaS8wOoYFHiRqynQJJ3CD8dvNeIphh6H829y23Vlgn68warA2-N47UylNz1dvbITSRqTgZusQEBymFjspmy4Pu55aVulv6IeXPuFTBvvbBjsiHNfRh4JNHRZfnvPpn0W0zdsp7ukW117V6zs2j1js6i8aHdG8Ox4';
            }}
          />
          <div className="flex flex-col min-w-0">
            <span className="font-headline-md text-xs sm:text-base md:text-lg font-bold text-forest-deep tracking-tight leading-tight truncate">
              SMA A. Wahid Hasyim
            </span>
            <span className="text-[9px] sm:text-xs text-gold-burnished tracking-wider uppercase font-semibold truncate">
              Pesantren Tebuireng<span className="hidden xs:inline"> • Akreditasi "A"</span>
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center space-x-6 xl:space-x-8 text-sm font-semibold">
          {/* BERANDA */}
          <Link
            to="/"
            className={`transition-colors duration-150 py-1 relative ${
              isBeranda
                ? 'text-forest-deep font-bold after:content-[\'\'] after:absolute after:bottom-[-6px] after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:rounded-full after:bg-gold-medal'
                : 'text-on-surface-variant hover:text-forest-deep'
            }`}
          >
            Beranda
          </Link>

          {/* PROFIL Dropdown */}
          <div
            className="relative group py-2"
            onMouseEnter={() => setProfilDropdownOpen(true)}
            onMouseLeave={() => setProfilDropdownOpen(false)}
          >
            <button
              aria-haspopup="true"
              aria-expanded={profilDropdownOpen}
              className={`flex items-center gap-1 py-1 focus:outline-none transition-colors duration-150 relative ${
                isProfilActive
                  ? 'text-forest-deep font-bold after:content-[\'\'] after:absolute after:bottom-[-6px] after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:rounded-full after:bg-gold-medal'
                  : 'text-on-surface-variant hover:text-forest-deep'
              }`}
            >
              <span>Profil</span>
              <span className="material-symbols-outlined text-[18px]">expand_more</span>
            </button>
            <div
              className={`absolute left-0 top-full mt-1 w-64 bg-surface-warm border border-border-subtle rounded-xl shadow-lg p-2 transition-all duration-200 z-50 elevation-2 ${
                profilDropdownOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
              }`}
            >
              <Link
                to="/profil/sambutan"
                className={`block px-3.5 py-2 rounded-lg text-xs transition-colors ${
                  isSambutan ? 'text-forest-deep font-bold bg-surface-container' : 'text-on-surface hover:bg-surface-container-low hover:text-forest-deep'
                }`}
                onClick={() => setProfilDropdownOpen(false)}
              >
                <div className="font-semibold text-sm">Sambutan Kepala Sekolah</div>
                <div className="text-[11px] text-on-surface-variant font-normal">Amanat & Kebijakan Pimpinan</div>
              </Link>
              <Link
                to="/profil/visi-misi"
                className={`block px-3.5 py-2 rounded-lg text-xs transition-colors ${
                  isVisiMisi ? 'text-forest-deep font-bold bg-surface-container' : 'text-on-surface hover:bg-surface-container-low hover:text-forest-deep'
                }`}
                onClick={() => setProfilDropdownOpen(false)}
              >
                <div className="font-semibold text-sm">Visi dan Misi</div>
                <div className="text-[11px] text-on-surface-variant font-normal">7 Pilar Pendidikan Karakter</div>
              </Link>
              <Link
                to="/profil/sejarah"
                className={`block px-3.5 py-2 rounded-lg text-xs transition-colors ${
                  isSejarah ? 'text-forest-deep font-bold bg-surface-container' : 'text-on-surface hover:bg-surface-container-low hover:text-forest-deep'
                }`}
                onClick={() => setProfilDropdownOpen(false)}
              >
                <div className="font-semibold text-sm">Sejarah & Identitas</div>
                <div className="text-[11px] text-on-surface-variant font-normal">SK 1989 & 5 Komitmen Kelulusan</div>
              </Link>
              <a
                href="/#profil"
                className="block px-3.5 py-2 rounded-lg text-xs text-on-surface hover:bg-surface-container-low hover:text-forest-deep transition-colors"
                onClick={() => setProfilDropdownOpen(false)}
              >
                <div className="font-semibold text-sm">Profil Lembaga</div>
                <div className="text-[11px] text-on-surface-variant font-normal">Statistik Siswa & Sarana</div>
              </a>
              <Link
                to="/fasilitas"
                className="block px-3.5 py-2 rounded-lg text-xs text-on-surface hover:bg-surface-container-low hover:text-forest-deep transition-colors"
                onClick={() => setProfilDropdownOpen(false)}
              >
                <div className="font-semibold text-sm">Fasilitas Sekolah</div>
                <div className="text-[11px] text-on-surface-variant font-normal">10 Sarana & Galeri Fasilitas</div>
              </Link>
            </div>
          </div>

          {/* KESISWAAN Dropdown */}
          <div className="relative group py-2">
            <button
              className="text-on-surface-variant hover:text-forest-deep transition-colors duration-150 flex items-center gap-1 py-1 focus:outline-none"
            >
              <Link to="/kesiswaan" className="hover:text-forest-deep">Kesiswaan</Link>
              <span className="material-symbols-outlined text-[18px]">expand_more</span>
            </button>
            <div className="absolute left-0 top-full mt-1 w-52 bg-surface-warm border border-border-subtle rounded-xl shadow-lg p-2 transition-all duration-200 z-50 elevation-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0">
              <Link
                to="/kesiswaan"
                className="block px-3.5 py-2 rounded-lg text-xs text-on-surface hover:bg-surface-container-low hover:text-forest-deep transition-colors font-medium"
              >
                Organisasi & Ekstrakurikuler
              </Link>
              <a
                href="https://www.infotbi.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3.5 py-2 rounded-lg text-xs text-on-surface hover:bg-surface-container-low hover:text-forest-deep transition-colors font-medium"
              >
                <span>Cek SPP (INFOTBI)</span>
                <span className="material-symbols-outlined text-[14px] text-gold-burnished">open_in_new</span>
              </a>
            </div>
          </div>

          {/* BERITA Dropdown */}
          <div className="relative group py-2">
            <button
              className={`flex items-center gap-1 py-1 focus:outline-none transition-colors duration-150 relative ${
                isBerita || location.pathname === '/alumni'
                  ? 'text-forest-deep font-bold after:content-[\'\'] after:absolute after:bottom-[-6px] after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:rounded-full after:bg-gold-medal'
                  : 'text-on-surface-variant hover:text-forest-deep'
              }`}
            >
              <Link to="/berita" className="hover:text-forest-deep">Berita</Link>
              <span className="material-symbols-outlined text-[18px]">expand_more</span>
            </button>
            <div className="absolute left-0 top-full mt-1 w-52 bg-surface-warm border border-border-subtle rounded-xl shadow-lg p-2 transition-all duration-200 z-50 elevation-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0">
              <Link
                to="/berita"
                className="block px-3.5 py-2 rounded-lg text-xs text-on-surface hover:bg-surface-container-low hover:text-forest-deep transition-colors font-medium"
              >
                Berita & Kegiatan
              </Link>
              <Link
                to="/alumni"
                className="block px-3.5 py-2 rounded-lg text-xs text-on-surface hover:bg-surface-container-low hover:text-forest-deep transition-colors font-medium"
              >
                Alumni SMA AWH
              </Link>
            </div>
          </div>

          {/* PRESTASI Dropdown */}
          <div
            className="relative group py-2"
            onMouseEnter={() => setPrestasiDropdownOpen(true)}
            onMouseLeave={() => setPrestasiDropdownOpen(false)}
          >
            <button
              className="text-on-surface-variant hover:text-forest-deep transition-colors duration-150 flex items-center gap-1 py-1 focus:outline-none"
            >
              <span>Prestasi</span>
              <span className="material-symbols-outlined text-[18px]">expand_more</span>
            </button>
            <div
              className={`absolute left-0 top-full mt-1 w-52 bg-surface-warm border border-border-subtle rounded-xl shadow-lg p-2 transition-all duration-200 z-50 elevation-2 ${
                prestasiDropdownOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
              }`}
            >
              <Link
                to="/berita?kategori=Prestasi+Akademik"
                className="block px-3.5 py-2 rounded-lg text-xs text-on-surface hover:bg-surface-container-low hover:text-forest-deep transition-colors font-medium"
                onClick={() => setPrestasiDropdownOpen(false)}
              >
                Prestasi Akademik
              </Link>
              <Link
                to="/berita?kategori=Prestasi+Non+Akademik"
                className="block px-3.5 py-2 rounded-lg text-xs text-on-surface hover:bg-surface-container-low hover:text-forest-deep transition-colors font-medium"
                onClick={() => setPrestasiDropdownOpen(false)}
              >
                Prestasi Non Akademik
              </Link>
            </div>
          </div>

          {/* KONTAK */}
          <Link
            to="/kontak"
            className={`transition-colors duration-150 py-1 relative ${
              isKontak
                ? 'text-forest-deep font-bold after:content-[\'\'] after:absolute after:bottom-[-6px] after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:rounded-full after:bg-gold-medal'
                : 'text-on-surface-variant hover:text-forest-deep'
            }`}
          >
            Kontak
          </Link>
        </div>

        {/* Action Cluster: Portal Login */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <Link
            to="/login"
            className="inline-flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-forest-deep hover:bg-forest-light text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-all hover:shadow hover:scale-[1.01] whitespace-nowrap shrink-0"
          >
            <span className="material-symbols-outlined text-[16px] sm:text-[18px] text-gold-medal shrink-0">login</span>
            <span>Portal Login</span>
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 sm:p-2 rounded-lg text-on-surface-variant hover:text-forest-deep hover:bg-surface-container transition-colors focus:outline-none min-h-[38px] min-w-[38px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center shrink-0"
            aria-label="Toggle Navigation Menu"
          >
            <span className="material-symbols-outlined text-[24px] sm:text-[26px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-surface-warm border-t border-border-subtle px-4 pt-3 pb-6 space-y-2.5 shadow-xl animate-fade-in">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
              isBeranda ? 'text-forest-deep bg-surface-container font-bold' : 'text-on-surface hover:bg-surface-container-low'
            }`}
          >
            Beranda
          </Link>

          <div className="pl-3 border-l-2 border-border-strong/60 space-y-1 my-1">
            <span className="text-[11px] font-bold text-gold-burnished uppercase tracking-wider block py-1">
              Profil Sekolah
            </span>
            <Link
              to="/profil/sambutan"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-2.5 py-2 rounded text-sm ${
                isSambutan ? 'text-forest-deep font-bold bg-surface-container-low' : 'text-on-surface-variant hover:text-forest-deep'
              }`}
            >
              Sambutan Kepala Sekolah
            </Link>
            <Link
              to="/profil/visi-misi"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-2.5 py-2 rounded text-sm ${
                isVisiMisi ? 'text-forest-deep font-bold bg-surface-container-low' : 'text-on-surface-variant hover:text-forest-deep'
              }`}
            >
              Visi dan Misi
            </Link>
            <Link
              to="/profil/sejarah"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-2.5 py-2 rounded text-sm ${
                isSejarah ? 'text-forest-deep font-bold bg-surface-container-low' : 'text-on-surface-variant hover:text-forest-deep'
              }`}
            >
              Sejarah & Identitas Sekolah
            </Link>
            <a
              href="/#profil"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-2.5 py-2 rounded text-sm text-on-surface-variant hover:text-forest-deep"
            >
              Statistik Lembaga & Siswa
            </a>
            <Link
              to="/fasilitas"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-2.5 py-2 rounded text-sm text-on-surface-variant hover:text-forest-deep"
            >
              Fasilitas Sekolah
            </Link>
          </div>

          <div className="pl-3 border-l-2 border-border-strong/60 space-y-1 my-1">
            <span className="text-[11px] font-bold text-gold-burnished uppercase tracking-wider block py-1">
              Kesiswaan
            </span>
            <Link
              to="/kesiswaan"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-2.5 py-2 rounded text-sm text-on-surface-variant hover:text-forest-deep"
            >
              Organisasi & Kegiatan Siswa
            </Link>
            <a
              href="https://www.infotbi.com/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-2.5 py-2 rounded text-sm text-on-surface-variant hover:text-forest-deep"
            >
              <span>Cek SPP (INFOTBI)</span>
              <span className="material-symbols-outlined text-[16px] text-gold-burnished">open_in_new</span>
            </a>
          </div>

          <div className="pl-3 border-l-2 border-border-strong/60 space-y-1 my-1">
            <span className="text-[11px] font-bold text-gold-burnished uppercase tracking-wider block py-1">
              Berita & Alumni
            </span>
            <Link
              to="/berita"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-2.5 py-2 rounded text-sm ${
                isBerita ? 'text-forest-deep font-bold bg-surface-container-low' : 'text-on-surface-variant hover:text-forest-deep'
              }`}
            >
              Berita & Prestasi
            </Link>
            <Link
              to="/alumni"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-2.5 py-2 rounded text-sm text-on-surface-variant hover:text-forest-deep"
            >
              Alumni SMA AWH
            </Link>
          </div>

          <Link
            to="/kontak"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
              isKontak ? 'text-forest-deep bg-surface-container font-bold' : 'text-on-surface hover:bg-surface-container-low'
            }`}
          >
            Kontak Resmi
          </Link>

          <div className="pt-3 border-t border-border-subtle">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-forest-deep text-white rounded-xl font-semibold text-sm shadow-sm hover:bg-forest-light transition-colors"
            >
              <span className="material-symbols-outlined text-[18px] text-gold-medal">login</span>
              <span>Portal Login</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
