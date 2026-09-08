import React from 'react';
import { Link } from 'react-router-dom';

export default function PublicFooter() {
  return (
    <footer className="w-full bg-forest-deep text-surface-warm px-gutter-mobile md:px-gutter-desktop py-12 lg:py-16 border-t border-white/10">
      <div className="max-w-container-max mx-auto space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Col 1: Identity & Foundation (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Logo SMA A. Wahid Hasyim Tebuireng"
                className="h-10 sm:h-12 w-auto object-contain brightness-0 invert"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://lh3.googleusercontent.com/aida/AEtjO1XYZJzHzAs8eB6O8vH5v5UcaaAGf2hDpY2Pgf8WZpAV6e3gdeabmbVXN4WOi3Aj6S3kh7_mQ_4jXjDX_VopRfjpoPUsaS8wOoYFHiRqynQJJ3CD8dvNeIphh6H829y23Vlgn68warA2-N47UylNz1dvbITSRqTgZusQEBymFjspmy4Pu55aVulv6IeXPuFTBvvbBjsiHNfRh4JNHRZfnvPpn0W0zdsp7ukW117V6zs2j1js6i8aHdG8Ox4';
                }}
              />
              <div className="font-headline-md text-lg sm:text-xl font-bold text-surface-warm tracking-tight">
                SMA A. Wahid Hasyim Tebuireng
              </div>
            </div>
            <p className="text-surface-warm/80 text-sm leading-relaxed max-w-md">
              Sekolah menengah atas swasta berbasis pesantren di bawah naungan Yayasan KH. Muhammad Hasyim Asy’ari Pesantren Tebuireng Jombang. Terakreditasi "A" dengan NPSN 20540307.
            </p>
            <div className="pt-2 text-surface-warm/75 text-xs space-y-1.5 border-t border-white/10">
              <p>
                <strong className="text-gold-warm font-semibold">Alamat:</strong> Jl. Irian Jaya, Cukir, Kec. Diwek, Kabupaten Jombang, Jawa Timur 61471
              </p>
              <p>
                <strong className="text-gold-warm font-semibold">Telepon:</strong> 0321-874289 | <strong className="text-gold-warm font-semibold">Email:</strong> admin@smaawhtebuireng.sch.id
              </p>
              <p>
                <strong className="text-gold-warm font-semibold">Jam Operasional:</strong> Sabtu - Kamis, 07.00 - 13.00 WIB (Selasa, 07.00 - 15.00 WIB)
              </p>
            </div>

            {/* Official Social Media Links */}
            <div className="pt-2 flex items-center gap-3">
              <span className="text-xs text-gold-warm font-semibold">Media Sosial:</span>
              <a
                href="https://www.facebook.com/share/1Bdg9xHnvP/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-gold-medal hover:text-forest-deep flex items-center justify-center transition-colors text-surface-warm text-xs font-bold"
                aria-label="Facebook SMA AWH Tebuireng"
              >
                FB
              </a>
              <a
                href="https://www.instagram.com/smaawh.tebuireng"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-gold-medal hover:text-forest-deep flex items-center justify-center transition-colors text-surface-warm text-xs font-bold"
                aria-label="Instagram SMA AWH Tebuireng"
              >
                IG
              </a>
              <a
                href="https://youtube.com/@sma_awh.tebuirengtv3984"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-gold-medal hover:text-forest-deep flex items-center justify-center transition-colors text-surface-warm text-xs font-bold"
                aria-label="YouTube SMA AWH Tebuireng"
              >
                YT
              </a>
            </div>
          </div>

          {/* Col 2: Tautan Penting SSOT (4 cols) */}
          <div className="lg:col-span-4 space-y-3.5">
            <p className="text-xs uppercase tracking-wider text-gold-warm font-bold">
              Tautan Profil & Berita
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <li>
                <Link className="text-surface-warm/80 hover:text-gold-warm transition-colors" to="/profil/sambutan">
                  Sambutan Kepala Sekolah
                </Link>
              </li>
              <li>
                <Link className="text-surface-warm/80 hover:text-gold-warm transition-colors" to="/profil/visi-misi">
                  Visi dan Misi
                </Link>
              </li>
              <li>
                <Link className="text-surface-warm/80 hover:text-gold-warm transition-colors" to="/profil/sejarah">
                  Sejarah Sekolah
                </Link>
              </li>
              <li>
                <Link className="text-surface-warm/80 hover:text-gold-warm transition-colors" to="/fasilitas">
                  Fasilitas Sekolah
                </Link>
              </li>
              <li>
                <Link className="text-surface-warm/80 hover:text-gold-warm transition-colors" to="/kesiswaan">
                  Kesiswaan & Ekstrakurikuler
                </Link>
              </li>
              <li>
                <Link className="text-surface-warm/80 hover:text-gold-warm transition-colors" to="/berita">
                  Berita Sekolah
                </Link>
              </li>
              <li>
                <Link className="text-surface-warm/80 hover:text-gold-warm transition-colors" to="/alumni">
                  Alumni SMA AWH
                </Link>
              </li>
              <li>
                <Link className="text-surface-warm/80 hover:text-gold-warm transition-colors" to="/berita?kategori=Prestasi+Akademik">
                  Prestasi Akademik
                </Link>
              </li>
              <li>
                <Link className="text-surface-warm/80 hover:text-gold-warm transition-colors" to="/berita?kategori=Prestasi+Non+Akademik">
                  Prestasi Non Akademik
                </Link>
              </li>
              <li>
                <Link className="text-surface-warm/80 hover:text-gold-warm transition-colors" to="/kontak">
                  Kontak & Lokasi
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Portal & Layanan (3 cols) */}
          <div className="lg:col-span-3 space-y-3.5">
            <p className="text-xs uppercase tracking-wider text-gold-warm font-bold">
              Portal & Layanan
            </p>
            <div className="space-y-2.5 text-sm">
              <Link
                className="block p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-surface-warm border border-white/10"
                to="/login"
              >
                <div className="font-semibold flex items-center justify-between">
                  <span>Portal Login Sistem</span>
                  <span className="material-symbols-outlined text-[16px] text-gold-warm">login</span>
                </div>
                <div className="text-xs text-surface-warm/70 mt-0.5">Guru, Siswa & Tenaga Kependidikan</div>
              </Link>
              <a
                className="block p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-surface-warm border border-white/10"
                href="https://www.infotbi.com"
                rel="noopener noreferrer"
                target="_blank"
              >
                <div className="font-semibold flex items-center justify-between">
                  <span>Cek SPP (INFOTBI)</span>
                  <span className="material-symbols-outlined text-[16px] text-gold-warm">open_in_new</span>
                </div>
                <div className="text-xs text-surface-warm/70 mt-0.5">Briva 71029 via No.ID Siswa</div>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright Sub-bar */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-surface-warm/70 gap-3">
          <p>© SMA A. Wahid Hasyim Tebuireng Jombang. All Rights Reserved.</p>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap text-center sm:text-right">
            <span className="text-gold-warm font-medium">Sekolah Nyantri, Ngaji, Berprestasi</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
