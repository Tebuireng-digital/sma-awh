import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * PhotoLightboxModal
 * Modal pop-up penampil foto dokumentasi berita resolusi tinggi.
 * Dilengkapi slider (Next/Prev), navigasi keyboard (panah kiri/kanan/Esc),
 * swipe gesture pada layar sentuh/mobile, thumbnail strip, dan indikator foto.
 */
export default function PhotoLightboxModal({
  images = [],
  initialIndex = 0,
  onClose,
  title = '',
}) {
  const [currentIndex, setCurrentIndex] = useState(
    Math.min(Math.max(0, initialIndex), Math.max(0, images.length - 1))
  );
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const thumbnailScrollRef = useRef(null);

  const total = images.length;

  // Helper resolusi URL foto
  const getImgFullSrc = useCallback((item) => {
    if (!item) return '';
    if (typeof item === 'string') return item;
    return item.full_src || item.src || item.image_url || '';
  }, []);

  const getImgThumbSrc = useCallback((item) => {
    if (!item) return '';
    if (typeof item === 'string') return item;
    return item.src || item.full_src || item.image_url || '';
  }, []);

  const getImgCaption = useCallback((item) => {
    if (!item || typeof item === 'string') return '';
    return item.alt || item.caption || item.title || '';
  }, []);

  const currentItem = images[currentIndex] || null;
  const currentSrc = getImgFullSrc(currentItem);
  const currentCaption = getImgCaption(currentItem);

  // Navigasi Slide
  const handlePrev = useCallback(() => {
    if (total <= 1) return;
    setIsLoaded(false);
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const handleNext = useCallback(() => {
    if (total <= 1) return;
    setIsLoaded(false);
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  // Keyboard navigation & lock background scroll
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handlePrev, handleNext, onClose]);

  // Preload gambar tetangga agar transisi slide instan
  useEffect(() => {
    if (total <= 1) return;
    const nextIdx = (currentIndex + 1) % total;
    const prevIdx = (currentIndex - 1 + total) % total;
    const nextImg = new Image();
    nextImg.src = getImgFullSrc(images[nextIdx]);
    const prevImg = new Image();
    prevImg.src = getImgFullSrc(images[prevIdx]);
  }, [currentIndex, total, images, getImgFullSrc]);

  // Auto-scroll thumbnail terpilih ke tengah
  useEffect(() => {
    if (thumbnailScrollRef.current) {
      const activeEl = thumbnailScrollRef.current.children[currentIndex];
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest',
        });
      }
    }
  }, [currentIndex]);

  // Touch swipe support (Mobile)
  const handleTouchStart = (e) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchEndX(null);
  };

  const handleTouchMove = (e) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const diff = touchStartX - touchEndX;
    const minSwipeDistance = 50; // px

    if (diff > minSwipeDistance) {
      handleNext(); // Swipe ke kiri -> foto berikutnya
    } else if (diff < -minSwipeDistance) {
      handlePrev(); // Swipe ke kanan -> foto sebelumnya
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  if (!images || total === 0) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Dokumentasi Foto Berita"
      className="fixed inset-0 z-50 flex flex-col justify-between bg-black/95 backdrop-blur-md select-none animate-fade-in"
      onClick={onClose}
    >
      {/* ================= HEADER BAR ================= */}
      <div
        className="w-full flex items-center justify-between px-4 sm:px-6 py-3.5 bg-gradient-to-b from-black/80 to-transparent z-20 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 min-w-0 pr-4">
          {total > 1 && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/15 text-gold-warm border border-white/20 shrink-0">
              Foto {currentIndex + 1} dari {total}
            </span>
          )}
          {title && (
            <p className="text-xs sm:text-sm text-slate-300 font-medium truncate max-w-md hidden sm:block">
              {title}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Tombol Buka Tab Baru / Resolusi Asli */}
          {currentSrc && (
            <a
              href={currentSrc}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-all flex items-center justify-center"
              title="Buka foto asli resolusi penuh"
              aria-label="Buka foto asli resolusi penuh"
            >
              <span className="material-symbols-outlined text-[20px]">open_in_new</span>
            </a>
          )}

          {/* Tombol Tutup Pop-Up */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/15 hover:bg-rose-600/80 text-white transition-all flex items-center justify-center hover:scale-105 active:scale-95"
            title="Tutup (Esc)"
            aria-label="Tutup Pop-up Foto"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>
      </div>

      {/* ================= MAIN VIEWPORT AREA ================= */}
      <div
        className="relative flex-1 flex items-center justify-center p-2 sm:p-6 min-h-0"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Tombol Slide Sebelumnya (Left Arrow) */}
        {total > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3.5 rounded-full bg-black/50 hover:bg-forest-deep text-white border border-white/20 backdrop-blur-sm transition-all shadow-xl hover:scale-110 active:scale-95 focus:outline-none"
            title="Foto Sebelumnya (Panah Kiri)"
            aria-label="Foto Sebelumnya"
          >
            <span className="material-symbols-outlined text-2xl sm:text-3xl">chevron_left</span>
          </button>
        )}

        {/* Gambar Utama */}
        <div className="relative max-w-5xl max-h-[72vh] sm:max-h-[78vh] flex flex-col items-center justify-center">
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-white/20 border-t-gold-warm rounded-full animate-spin"></div>
            </div>
          )}

          <img
            key={currentSrc}
            src={currentSrc}
            alt={currentCaption || title || `Dokumentasi Foto ${currentIndex + 1}`}
            onLoad={() => setIsLoaded(true)}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/logo.png';
              setIsLoaded(true);
            }}
            className={`max-w-full max-h-[68vh] sm:max-h-[75vh] object-contain rounded-xl shadow-2xl transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Caption / Keterangan Foto */}
          {currentCaption && (
            <div className="mt-3 px-4 py-1.5 rounded-full bg-black/60 border border-white/10 text-slate-200 text-xs text-center max-w-xl truncate backdrop-blur-sm">
              {currentCaption}
            </div>
          )}
        </div>

        {/* Tombol Slide Berikutnya (Right Arrow) */}
        {total > 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3.5 rounded-full bg-black/50 hover:bg-forest-deep text-white border border-white/20 backdrop-blur-sm transition-all shadow-xl hover:scale-110 active:scale-95 focus:outline-none"
            title="Foto Berikutnya (Panah Kanan)"
            aria-label="Foto Berikutnya"
          >
            <span className="material-symbols-outlined text-2xl sm:text-3xl">chevron_right</span>
          </button>
        )}
      </div>

      {/* ================= BOTTOM THUMBNAIL STRIP ================= */}
      {total > 1 && (
        <div
          className="w-full py-3 sm:py-4 px-4 bg-gradient-to-t from-black/90 via-black/70 to-transparent z-20"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            ref={thumbnailScrollRef}
            className="flex items-center justify-center gap-2 sm:gap-3 overflow-x-auto max-w-4xl mx-auto py-1 px-2 scrollbar-thin scrollbar-thumb-white/30"
          >
            {images.map((item, idx) => {
              const thumbSrc = getImgThumbSrc(item);
              const isActive = idx === currentIndex;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setIsLoaded(false);
                    setCurrentIndex(idx);
                  }}
                  className={`relative shrink-0 rounded-lg overflow-hidden border-2 transition-all h-12 w-16 sm:h-16 sm:w-22 ${
                    isActive
                      ? 'border-gold-medal ring-2 ring-gold-warm scale-105 opacity-100'
                      : 'border-white/20 opacity-50 hover:opacity-80'
                  }`}
                  title={`Lihat Foto ${idx + 1}`}
                  aria-label={`Lihat Foto ${idx + 1}`}
                >
                  <img
                    src={thumbSrc}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/logo.png';
                    }}
                  />
                  {isActive && (
                    <div className="absolute inset-0 bg-gold-medal/15 pointer-events-none" />
                  )}
                </button>
              );
            })}
          </div>

          <p className="text-[11px] text-center text-slate-400 pt-1.5 hidden sm:block">
            Gunakan tombol panah ◄ ► pada keyboard atau geser layar untuk berpindah foto
          </p>
        </div>
      )}
    </div>
  );
}
