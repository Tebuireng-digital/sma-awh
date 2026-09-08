import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * ScrollToTop Component
 * Otomatis mengembalikan posisi scroll ke paling atas (x: 0, y: 0)
 * setiap kali pengguna berpindah halaman/rute di React Router,
 * serta merefresh kalkulasi posisi ScrollTrigger GSAP.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Jika ada target hash (#spp atau anchor id), biarkan browser scroll ke elemen tersebut
    if (hash) {
      const targetElement = document.querySelector(hash);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }

    // Kembalikan posisi scroll ke atas secara instan
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });

    // Refresh ScrollTrigger agar semua koordinat animasi dihitung ulang dari posisi (0, 0)
    const refreshTimer = setTimeout(() => {
      try {
        ScrollTrigger.refresh();
      } catch (err) {
        // ignore if not ready
      }
    }, 60);

    return () => clearTimeout(refreshTimer);
  }, [pathname, hash]);

  return null;
}
