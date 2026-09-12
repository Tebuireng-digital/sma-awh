import React, { useState, useEffect } from 'react';
import PhotoLightboxModal from './PhotoLightboxModal';

export default function NewsDetailModal({ post, onClose }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isLightboxOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, isLightboxOpen]);

  if (!post) return null;

  // Kumpulkan foto dari image_url atau galeri_images
  const getPostImages = () => {
    const list = [];
    if (post.image_url) list.push(post.image_url);

    let gallery = [];
    if (Array.isArray(post.galeri_images)) {
      gallery = post.galeri_images;
    } else if (typeof post.galeri_images === 'string') {
      try {
        gallery = JSON.parse(post.galeri_images) || [];
      } catch (e) {
        gallery = [];
      }
    }

    gallery.forEach((img) => {
      const src = typeof img === 'string' ? img : (img?.src || img?.full_src || img?.image_url || '');
      if (src && !list.includes(src)) {
        list.push(src);
      }
    });

    if (post.isi) {
      const regex = /<img[^>]+src=["']([^"']+)["']/gi;
      let match;
      while ((match = regex.exec(post.isi)) !== null) {
        const src = match[1];
        if (src && !list.includes(src)) {
          list.push(src);
        }
      }
    }

    return list;
  };

  const images = getPostImages();

  const handlePrevImage = (e) => {
    e?.stopPropagation?.();
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNextImage = (e) => {
    e?.stopPropagation?.();
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const cleanPostContent = (html) => {
    if (!html) return '';
    let clean = html.replace(/<p[^>]*>\s*(<strong[^>]*>)?\s*(<img[^>]+>(\s*<img[^>]+>)*)\s*(<\/strong>)?\s*<\/p>/gi, '');
    clean = clean.replace(/<img[^>]+>/gi, '');
    return clean;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.judul,
        text: post.ringkasan || post.judul,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-forest-deep/75 backdrop-blur-sm animate-fade-in">
        <div
          className="bg-surface-warm border border-border-subtle rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto relative flex flex-col elevation-3"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Decorative Border */}
          <div className="h-1.5 w-full bg-gradient-to-r from-forest-deep via-gold-warm to-forest-deep"></div>

          {/* Modal Header */}
          <div className="p-4 sm:p-6 border-b border-border-subtle flex items-start justify-between gap-3 bg-surface-card/60">
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-forest-deep text-white">
                  {post.kategori || 'Publikasi Resmi'}
                </span>
                <span className="text-xs text-on-surface-variant font-medium">
                  {post.tanggal || post.created_at || 'Tebuireng'}
                </span>
              </div>
              <h2 className="font-headline-md text-base sm:text-lg md:text-xl font-bold text-forest-deep leading-snug">
                {post.judul}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-forest-deep transition-colors shrink-0 min-h-[36px] min-w-[36px] flex items-center justify-center"
              aria-label="Tutup Dialog"
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-4 sm:p-6 space-y-5 flex-1 overflow-y-auto">
            {/* Gallery / Single Image with Slider Controls */}
            {images.length > 0 && (
              <div className="space-y-3">
                <div
                  onClick={() => setIsLightboxOpen(true)}
                  className="w-full h-48 sm:h-64 md:h-80 rounded-xl overflow-hidden border border-border-subtle bg-surface-container relative cursor-pointer group select-none"
                  title="Klik untuk memperbesar layar penuh"
                >
                  <img
                    src={images[activeImageIndex]}
                    alt={post.judul}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />

                  {/* Tombol Slide Kiri */}
                  {images.length > 1 && (
                    <button
                      type="button"
                      onClick={handlePrevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/50 hover:bg-forest-deep text-white border border-white/20 backdrop-blur-sm transition-all opacity-80 hover:opacity-100 hover:scale-105"
                      title="Foto Sebelumnya"
                      aria-label="Foto Sebelumnya"
                    >
                      <span className="material-symbols-outlined text-xl">chevron_left</span>
                    </button>
                  )}

                  {/* Tombol Slide Kanan */}
                  {images.length > 1 && (
                    <button
                      type="button"
                      onClick={handleNextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/50 hover:bg-forest-deep text-white border border-white/20 backdrop-blur-sm transition-all opacity-80 hover:opacity-100 hover:scale-105"
                      title="Foto Berikutnya"
                      aria-label="Foto Berikutnya"
                    >
                      <span className="material-symbols-outlined text-xl">chevron_right</span>
                    </button>
                  )}

                  {/* Badges */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    {images.length > 1 && (
                      <span className="bg-forest-deep/85 text-white text-[11px] px-2.5 py-1 rounded-full font-semibold backdrop-blur-sm border border-white/10">
                        {activeImageIndex + 1} / {images.length} Foto
                      </span>
                    )}
                    <span className="bg-black/60 text-white text-[11px] px-2 py-1 rounded-full font-semibold backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">fullscreen</span>
                      <span>Perbesar</span>
                    </span>
                  </div>
                </div>

                {/* Thumbnail strip */}
                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`h-14 w-18 sm:h-16 sm:w-20 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                          activeImageIndex === idx ? 'border-forest-deep shadow-sm scale-105 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

          {/* Isi Artikel */}
          <div className="text-sm sm:text-base text-on-surface leading-relaxed space-y-4 font-normal">
            {post.isi ? (
              <div
                className="prose prose-emerald max-w-none text-on-surface"
                dangerouslySetInnerHTML={{ __html: cleanPostContent(post.isi) }}
              />
            ) : (
              <p className="text-on-surface-variant leading-relaxed">
                {post.ringkasan || 'Tidak ada uraian rincian artikel.'}
              </p>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 px-4 sm:px-6 border-t border-border-subtle bg-surface-card/60 flex items-center justify-between gap-3">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border-strong rounded-lg text-gold-burnished font-semibold text-xs hover:bg-surface-warm transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">
              {copiedLink ? 'check' : 'share'}
            </span>
            <span>{copiedLink ? 'Tautan Disalin!' : 'Bagikan'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-forest-deep hover:bg-emerald-deep text-white rounded-lg text-xs sm:text-sm font-semibold transition-colors shadow-sm"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>

      {/* Fullscreen Photo Lightbox Pop-Up */}
      {isLightboxOpen && (
        <PhotoLightboxModal
          images={images}
          initialIndex={activeImageIndex}
          onClose={() => setIsLightboxOpen(false)}
          title={post.judul}
        />
      )}
    </>
  );
}
