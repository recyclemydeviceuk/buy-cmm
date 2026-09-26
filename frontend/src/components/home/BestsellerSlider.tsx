import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import type { Product } from '../../types';
import { money } from '../../lib/format';
import { Stars } from '../ui/Rating';
import { ProductCardSkeleton } from '../ui/Skeleton';
import { cn } from '../../lib/cn';

const TINTS = ['bg-tint-sky', 'bg-tint-lilac', 'bg-tint-peach', 'bg-tint-mint', 'bg-tint-lemon', 'bg-tint-sand'];

/**
 * Horizontal snap slider. As the track scrolls, each card's phone is translated
 * against the scroll direction (parallax) based on how far the card is from the
 * viewport centre, so the phones glide a little slower than the cards.
 */
export function BestsellerSlider({ products, loading }: { products: Product[]; loading?: boolean }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setProgress(max > 0 ? el.scrollLeft / max : 0);
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft >= max - 4);
    const mid = el.scrollLeft + el.clientWidth / 2;
    el.querySelectorAll<HTMLElement>('[data-parallax]').forEach((img) => {
      const card = img.closest<HTMLElement>('[data-card]');
      if (!card) return;
      const centre = card.offsetLeft + card.offsetWidth / 2;
      const offset = (centre - mid) / el.clientWidth; // -1 … 1
      img.style.transform = `translateX(${(-offset * 28).toFixed(1)}px) translateY(${(Math.abs(offset) * 8).toFixed(1)}px) scale(${(1 - Math.abs(offset) * 0.06).toFixed(3)})`;
    });
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', update);
      cancelAnimationFrame(raf);
    };
  }, [update, products.length]);

  const step = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>('[data-card]');
    const w = card ? card.offsetWidth + 16 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * w * 2, behavior: 'smooth' });
  };

  return (
    <div>
      <div ref={trackRef} className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-5 pb-4 pt-2 no-scrollbar md:-mx-10 md:px-10">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-[76%] shrink-0 sm:w-[46%] lg:w-[31%] xl:w-[23.5%]">
                <ProductCardSkeleton />
              </div>
            ))
          : products.map((p, i) => (
              <Link
                key={p.id}
                to={`/phones/${p.slug}`}
                data-card
                className="group relative w-[76%] shrink-0 snap-start overflow-hidden rounded-[28px] border border-line bg-white transition-shadow duration-300 hover:shadow-card sm:w-[46%] lg:w-[31%] xl:w-[23.5%]"
              >
                <div className={cn('relative flex aspect-[4/4.2] items-center justify-center overflow-hidden', TINTS[i % TINTS.length])}>
                  <img data-parallax src={p.image} alt={`${p.brand} ${p.name}`} loading={i < 4 ? 'eager' : 'lazy'} className="h-[78%] w-auto product-img will-change-transform transition-transform duration-300 ease-out" />
                  <span className="absolute left-4 top-4 rounded-full bg-ink px-2.5 py-1 text-[11px] font-bold text-white">{money(p.rrp - p.fromPrice)} off new</span>
                  <span className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-ink opacity-0 backdrop-blur transition-all duration-300 group-hover:opacity-100">
                    <ArrowUpRight size={16} />
                  </span>
                </div>
                <div className="p-5">
                  <p className="eyebrow">{p.brand} · {p.releaseYear}</p>
                  <h3 className="mt-1.5 font-display text-[17px] font-bold leading-snug">{p.name}</h3>
                  <div className="mt-2 flex items-center gap-1.5 text-xs">
                    <Stars value={p.rating} size={12} />
                    <span className="font-semibold">{p.rating.toFixed(1)}</span>
                    <span className="text-ink-3">({p.reviewCount.toLocaleString('en-GB')})</span>
                  </div>
                  <div className="mt-5 flex items-end justify-between">
                    <div>
                      <p className="text-[11px] text-ink-3">Starting at</p>
                      <p className="font-display text-[22px] font-bold leading-none tracking-tighter">{money(p.fromPrice)}</p>
                    </div>
                    <p className="text-xs text-ink-3"><span className="line-through">{money(p.rrp)}</span> new</p>
                  </div>
                </div>
              </Link>
            ))}
      </div>

      <div className="mt-6 flex items-center justify-between gap-6">
        <div className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-line">
          <div className="absolute inset-y-0 left-0 rounded-full bg-ink transition-[width] duration-150 ease-out" style={{ width: `${Math.max(12, progress * 100)}%` }} />
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => step(-1)} disabled={atStart} aria-label="Previous" className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink transition-all hover:border-ink hover:bg-ink hover:text-white disabled:opacity-30 disabled:hover:border-line disabled:hover:bg-transparent disabled:hover:text-ink focus-ring">
            <ArrowLeft size={18} />
          </button>
          <button type="button" onClick={() => step(1)} disabled={atEnd} aria-label="Next" className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink transition-all hover:border-ink hover:bg-ink hover:text-white disabled:opacity-30 disabled:hover:border-line disabled:hover:bg-transparent disabled:hover:text-ink focus-ring">
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
