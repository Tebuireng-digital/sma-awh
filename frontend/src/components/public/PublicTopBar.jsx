import React from 'react';
import { Link } from 'react-router-dom';

export default function PublicTopBar() {
  return (
    <aside aria-label="Informasi Operasional Resmi" className="w-full bg-forest-deep text-surface-warm/90 border-b border-white/10 text-xs">
      <div className="max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop py-2 flex flex-wrap items-center justify-between gap-y-1.5 gap-x-4">
        {/* Waktu & Lokasi */}
        <div className="flex items-center gap-x-4 gap-y-1 text-surface-warm/85 font-medium flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px] text-gold-medal">schedule</span>
            <span className="hidden sm:inline">Sabtu - Kamis, 07.00 - 13.00 WIB | Selasa, 07.00 - 15.00 WIB</span>
            <span className="sm:hidden">Sab-Kam 07.00-13.00 | Sel 07.00-15.00 WIB</span>
          </span>
          <span className="hidden lg:inline-block text-white/20">•</span>
          <span className="hidden md:flex items-center gap-1.5 text-surface-warm/80">
            <span className="material-symbols-outlined text-[15px] text-gold-medal">location_on</span>
            <span>Pesantren Tebuireng, Jombang</span>
          </span>
        </div>

        {/* Kontak Cepat & Portal Login */}
        <div className="flex items-center gap-x-3 sm:gap-x-4 text-surface-warm/85 ml-auto">
          <a
            className="flex items-center gap-1 hover:text-gold-medal transition-colors"
            href="tel:0321874289"
          >
            <span className="material-symbols-outlined text-[15px]">call</span>
            <span className="font-semibold">0321-874289</span>
          </a>
          <span className="hidden sm:inline-block text-white/20">|</span>
          <a
            className="hidden sm:flex items-center gap-1 hover:text-gold-medal transition-colors"
            href="mailto:admin@smaawhtebuireng.sch.id"
          >
            <span className="material-symbols-outlined text-[15px]">mail</span>
            <span className="hidden lg:inline">admin@smaawhtebuireng.sch.id</span>
            <span className="lg:hidden">Email</span>
          </a>
          <span className="text-white/20">|</span>
          <Link
            to="/login"
            className="inline-flex items-center gap-1 bg-gold-medal hover:bg-gold-warm text-forest-deep px-2.5 py-1 rounded font-semibold text-[11px] tracking-wide transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[13px]">lock</span>
            <span>Portal Login</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
