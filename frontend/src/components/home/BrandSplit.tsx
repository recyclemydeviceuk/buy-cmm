import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useBrandMenus } from '../../store/catalog';

const STYLE: Record<string, { wrap: string; sub: string; btn: string }> = {
  Apple: { wrap: 'bg-ink text-white', sub: 'text-white/60', btn: 'bg-white text-ink hover:bg-cream' },
  Samsung: { wrap: 'bg-tint-sky text-ink', sub: 'text-ink-2', btn: 'bg-ink text-white hover:bg-ink-2' },
};

export function BrandSplit() {
  const BRAND_MENUS = useBrandMenus();
  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-5">
      {BRAND_MENUS.map((b) => {
        const s = STYLE[b.key];
        return (
          <Link key={b.key} to={b.to} className={`group relative flex min-h-[300px] overflow-hidden rounded-[32px] p-8 transition-transform duration-500 hover:-translate-y-1 md:min-h-[360px] md:p-10 ${s.wrap}`}>
            <div className="relative z-10 flex w-[56%] flex-col md:w-[58%]">
              <p className={`eyebrow ${s.sub}`}>{b.tagline.split(' · ')[0]}</p>
              <h3 className={`mt-3 text-3xl md:text-[2.5rem] ${b.key === 'Apple' ? 'text-white' : ''}`}>{b.label}</h3>
              <p className={`mt-2 max-w-[24ch] text-sm md:text-base ${s.sub}`}>{b.key === 'Apple' ? `${b.groups.reduce((n, g) => n + g.items.length, 0)} iPhone models, every grade.` : `${b.groups.reduce((n, g) => n + g.items.length, 0)} Galaxy models. Flagship for less.`}</p>
              <span className={`mt-auto inline-flex h-11 w-fit items-center gap-2 whitespace-nowrap rounded-full px-5 text-sm font-semibold transition-colors ${s.btn}`}>
                Shop {b.key === 'Apple' ? 'iPhone' : 'Samsung'} <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
            <img src={b.featured.image} alt={b.featured.title} loading="lazy" className={`absolute bottom-0 right-0 h-[64%] w-auto max-w-[46%] object-contain object-right-bottom transition-transform duration-700 group-hover:scale-105 group-hover:-rotate-2 md:right-2 md:h-[92%] md:max-w-[48%] ${b.key === 'Apple' ? 'rounded-2xl' : 'product-img'}`} />
          </Link>
        );
      })}
    </div>
  );
}
