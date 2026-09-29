import { useCallback, useState } from 'react';
import { ImageOff, Expand } from 'lucide-react';
import type { GalleryItem } from '@/constants/galleryItems';
import { getCategory, serviceNameFor } from '@/lib/gallery';

interface GalleryCardProps {
  item: GalleryItem;
  /** Position in the current grid — drives the entrance stagger. */
  index: number;
  /** Above-the-fold cards load eagerly; everything else is lazy. */
  eager: boolean;
  onOpen: () => void;
}

/**
 * A single portfolio card.
 *
 * Interaction model:
 *  - Desktop (md+): hover lifts the card, zooms the photo to 1.05 (clipped
 *    by .image-card so it never bleeds into a neighbouring column), deepens
 *    a soft shadow and fades in the caption overlay + expand icon.
 *  - Touch: nothing is hidden behind hover — the caption is always visible
 *    and the whole card is one big tappable button.
 * Transitions are short and easing-based; no bounce, no aggressive motion.
 */
export function GalleryCard({ item, index, eager, onOpen }: GalleryCardProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const catInfo = getCategory(item.category);
  const serviceName = serviceNameFor(item);

  /**
   * handleImageError — a photo that 404s (deleted upload, CDN hiccup) must
   * never show the browser's broken-image icon or collapse the card. We swap
   * in a styled placeholder that keeps the exact same aspect ratio, so the
   * masonry layout doesn't reflow and neighbouring items are unaffected.
   */
  const handleImageError = useCallback(() => {
    setFailed(true);
    setLoaded(true);
  }, []);

  /**
   * A cached image can finish loading before React attaches onLoad, which
   * would leave the card stuck at opacity-0. Checking .complete on mount
   * closes that gap.
   */
  const imgRef = useCallback((node: HTMLImageElement | null) => {
    if (!node) return;
    if (node.complete) {
      // naturalWidth === 0 on a complete-but-broken image
      if (node.naturalWidth === 0) handleImageError();
      else setLoaded(true);
    }
  }, [handleImageError]);

  return (
    /* Wrapper owns the entrance animation; the button owns the hover
       transform. Keeping them on separate elements matters — an animation
       with fill-mode "both" would otherwise win the cascade and cancel the
       hover lift. */
    <div
      className="gallery-item break-inside-avoid mb-3 sm:mb-4"
      style={{ animationDelay: `${Math.min(index, 9) * 45}ms` }}
    >
      <button
        type="button"
        onClick={onOpen}
        aria-label={`View ${item.title} — ${serviceName}`}
        className="block w-full text-left glass-card rounded-xl overflow-hidden group cursor-pointer shadow-sm transition-[transform,box-shadow] duration-300 ease-out hover:shadow-[0_16px_36px_-18px_rgba(190,120,150,0.55)] md:hover:-translate-y-1 motion-reduce:transform-none motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        {/* .image-card owns the 1.05 zoom + overflow clipping (index.css) */}
        <div className="image-card relative overflow-hidden">
          {failed ? (
            /* Graceful fallback — same aspect ratio as the real photo, so the
               card keeps its dimensions and the grid never jumps. */
            <div
              className="w-full flex flex-col items-center justify-center gap-2 bg-muted/70 text-muted-foreground p-4 text-center"
              style={{ aspectRatio: `${item.width} / ${item.height}` }}
            >
              <ImageOff className="w-7 h-7 opacity-70" aria-hidden="true" />
              <span className="text-xs font-medium leading-snug">{item.title}</span>
              <span className="text-[11px] opacity-80">Photo unavailable</span>
            </div>
          ) : (
            <>
              {!loaded && (
                <div
                  className="absolute inset-0 bg-muted animate-pulse"
                  style={{ minHeight: '200px' }}
                />
              )}
              <img
                ref={imgRef}
                src={item.thumb || item.image}
                alt={item.alt}
                loading={eager ? 'eager' : 'lazy'}
                decoding="async"
                width={item.width}
                height={item.height}
                onLoad={() => setLoaded(true)}
                onError={handleImageError}
                className={`w-full object-cover ${loaded ? 'opacity-100' : 'opacity-0'}`}
                style={{ display: 'block' }}
              />
            </>
          )}

          {/* Caption overlay — always on for touch, hover-revealed on desktop */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100 md:group-focus-visible:opacity-100">
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <h3 className="font-semibold text-sm leading-tight">{item.title}</h3>
              {/* Which service this design belongs to */}
              <p className="text-xs text-white/90 mt-1">{serviceName}</p>
              <p className="text-xs text-white/80 mt-1 line-clamp-2 hidden sm:block">
                {item.description}
              </p>
            </div>
          </div>

          {/* Expand affordance — desktop hover only, the whole card is tappable */}
          <div className="absolute top-3 right-3 hidden md:flex w-9 h-9 rounded-full bg-white/90 text-foreground items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-300">
            <Expand className="w-4 h-4" aria-hidden="true" />
          </div>

          {/* Category badge */}
          <div className="absolute top-3 left-3 transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100 md:group-focus-visible:opacity-100">
            <span className="text-xs bg-white/95 text-foreground px-2 py-1 rounded-full font-medium shadow-sm">
              <span aria-hidden="true">{catInfo?.emoji}</span> {catInfo?.label}
            </span>
          </div>
        </div>
      </button>
    </div>
  );
}

export default GalleryCard;
