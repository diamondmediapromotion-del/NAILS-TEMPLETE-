import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Sparkles } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import { useBreadcrumbSchema } from '@/hooks/useBreadcrumbSchema';
import { useJsonLd } from '@/hooks/useJsonLd';
import { useGalleryData } from '@/hooks/useGalleryData';
import { Button } from '@/components/ui/button';
import { GalleryFilters } from '@/components/gallery/GalleryFilters';
import { GalleryGrid } from '@/components/gallery/GalleryGrid';
import { GalleryLightbox } from '@/components/gallery/GalleryLightbox';
import {
  buildGallerySchema,
  countByCategory,
  filterByCategory,
  getCategoryLabel,
} from '@/lib/gallery';
import { absoluteUrl } from '@/lib/seo';

/**
 * How many photos are mounted before the visitor asks for more. Keeps the
 * page fast if the salon uploads hundreds of images over time.
 */
const INITIAL_VISIBLE = 12;
const LOAD_MORE_STEP = 12;

/**
 * GalleryPage — composition only.
 *
 * Data comes from useGalleryData (initializeGallery); the filter control,
 * grid and lightbox are separate components. This file just wires them
 * together and owns the small amount of shared state: which category is
 * selected, how many cards are mounted, and which photo is open.
 */
export default function GalleryPage() {
  const navigate = useNavigate();

  useSEO({
    title: 'Nail Art Gallery | Best Nail Art & Mehndi Designs – Nails by Uma',
    description:
      'Browse our nail art gallery featuring the best nail art designs, gel nails, acrylic nails, bridal nail packages & mehndi designs. See real work by our expert nail technicians.',
    keywords:
      'nail art gallery, best nail art, gel nail designs, acrylic nail art, bridal nail art, mehndi designs, luxury nail salon gallery, nail art ideas, nail art near me',
    canonicalPath: '/gallery',
    // Self-hosted share card (1200×630) — no dependency on a third-party CDN
    ogImage: absoluteUrl('/gallery/og-gallery.jpg'),
  });

  // ── BreadcrumbList JSON-LD — Home > Gallery ──────────────────────
  useBreadcrumbSchema();

  // Curated portfolio + staff uploads, merged. Never blocks the first paint.
  const { items, loading } = useGalleryData();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  /** filterGallery */
  const filtered = useMemo(
    () => filterByCategory(items, selectedCategory),
    [items, selectedCategory],
  );

  /** updateCounts — one derived source for every count on the page. */
  const counts = useMemo(() => countByCategory(items), [items]);

  const visible = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);
  const remaining = filtered.length - visible.length;

  // ── ImageGallery JSON-LD — helps the portfolio surface in Google Images ──
  useJsonLd(items.length ? buildGallerySchema(items) : null, 'gallery-page');

  /** Reset paging + close the viewer whenever the filter changes. */
  useEffect(() => {
    setLightboxIndex(null);
    setVisibleCount(INITIAL_VISIBLE);
  }, [selectedCategory]);

  const openLightbox = useCallback((index: number) => setLightboxIndex(index), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const loadMore = useCallback(() => setVisibleCount((c) => c + LOAD_MORE_STEP), []);

  const showNext = useCallback(() => {
    setLightboxIndex((current) =>
      current === null ? null : (current + 1) % filtered.length,
    );
  }, [filtered.length]);

  const showPrevious = useCallback(() => {
    setLightboxIndex((current) =>
      current === null ? null : (current - 1 + filtered.length) % filtered.length,
    );
  }, [filtered.length]);

  const lightboxItem = lightboxIndex === null ? null : filtered[lightboxIndex] ?? null;

  /**
   * One keydown listener for the whole page, attached only while the viewer
   * is open and removed on close — no duplicate or leaked listeners.
   */
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'ArrowLeft') showPrevious();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, closeLightbox, showNext, showPrevious]);

  /** Stop the page behind the viewer from scrolling. */
  useEffect(() => {
    if (lightboxIndex === null) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [lightboxIndex]);

  const categoryLabel = selectedCategory === 'all' ? '' : `${getCategoryLabel(selectedCategory)} `;

  return (
    /* overflow-x-hidden: belt-and-braces guarantee that nothing in the
       gallery can ever produce a horizontal page scroll on small screens. */
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 overflow-x-hidden">
      {/* Hero — H1 is the primary page heading.
          Mobile is laid out on its own terms rather than as shrunken
          desktop: tighter vertical rhythm, a heading that fits a 320px
          viewport, and body copy that stays readable. */}
      <div className="py-12 sm:py-16 md:py-20 px-4 text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4 sm:mb-6" aria-hidden="true">
          <Sparkles className="w-4 h-4" />
          Nail Art Gallery
        </div>
        {/* H1 — Primary page heading for the Gallery page */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 text-balance">
          Best Nail Art &amp;{' '}
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Design Gallery
          </span>
        </h1>
        {/* Page description / sub-heading */}
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Explore our luxury nail salon portfolio — gel nails, acrylic nail art, mehndi designs &amp; bridal collections, each piece crafted with passion by our expert technicians
        </p>
      </div>

      {/* pb clears the floating WhatsApp button (fixed, ~80px tall incl.
          offset) so it never sits on top of the last row or the CTA. */}
      <div className="container mx-auto max-w-7xl px-4 pb-28 sm:pb-24">
        {/* Main gallery container — frosted glass panel (.glass-panel in
            index.css, with a solid-background fallback where backdrop-filter
            is unsupported). The blur applies to this layer only, never to the
            photographs inside it. */}
        <section className="glass-panel rounded-2xl sm:rounded-3xl p-3 sm:p-6 lg:p-10">
          <GalleryFilters
            counts={counts}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />

          {filtered.length === 0 ? (
            loading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="w-10 h-10 animate-spin text-primary" aria-hidden="true" />
                <span className="sr-only">Loading gallery</span>
              </div>
            ) : (
              <div className="text-center py-24">
                <div className="text-6xl mb-4" aria-hidden="true">🎨</div>
                <h3 className="text-xl font-semibold mb-2">Gallery Coming Soon</h3>
                <p className="text-muted-foreground">We're uploading beautiful work — check back soon!</p>
              </div>
            )
          ) : (
            <>
              {/*
                Live photo count. Derived from the data on every render — the
                only place a count is rendered, so it can never drift out of
                sync. Announced to screen readers when the filter changes.
              */}
              <p
                className="mb-5 text-center text-sm text-muted-foreground"
                aria-live="polite"
              >
                Showing <span className="font-semibold text-foreground">{visible.length}</span>
                {' of '}
                <span className="font-semibold text-foreground">{filtered.length}</span>
                {' '}{categoryLabel}design{filtered.length === 1 ? '' : 's'}
              </p>

              <GalleryGrid
                items={visible}
                remaining={remaining}
                animationKey={selectedCategory}
                onOpen={openLightbox}
                onLoadMore={loadMore}
              />

              {/* Quiet hint that staff uploads are still loading */}
              {loading && (
                <p className="mt-8 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  Loading our latest work…
                </p>
              )}
            </>
          )}
        </section>

        {/* CTA — H2 section heading */}
        <div className="mt-16 sm:mt-20 text-center glass-card p-6 sm:p-12 rounded-2xl">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Book Your Nail Art Appointment</h2>
          <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Love our work? Book at our luxury nail salon and let our professional nail artists create your dream look
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/book')}
            className="bg-gradient-to-r from-primary to-accent text-white px-10 h-14 text-base font-semibold"
          >
            💅 Book My Appointment
          </Button>
        </div>
      </div>

      {lightboxItem && lightboxIndex !== null && (
        <GalleryLightbox
          item={lightboxItem}
          index={lightboxIndex}
          total={filtered.length}
          onClose={closeLightbox}
          onNext={showNext}
          onPrevious={showPrevious}
          onBook={() => navigate('/book')}
          onViewService={() => navigate('/services')}
        />
      )}
    </div>
  );
}
