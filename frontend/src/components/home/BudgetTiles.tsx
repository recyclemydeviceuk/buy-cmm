import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const STEPS = [
  { label: 'Under', price: '£200', to: '/shop?maxPrice=200', chips: ['iPhone 11', 'iPhone 12 mini', 'Galaxy A'], image: '/phones/apple-iphone-11.webp', tint: 'bg-tint-lemon' },
  { label: 'From £200 to', price: '£350', to: '/shop?minPrice=200&maxPrice=350', chips: ['iPhone 13', 'Galaxy S22', 'Z Flip 4'], image: '/phones/apple-iphone-13.webp', tint: 'bg-tint-mint' },
  { label: 'From £350 to', price: '£550', to: '/shop?minPrice=350&maxPrice=550', chips: ['iPhone 15', 'Galaxy S24', 'Z Flip 6'], image: '/phones/samsung-galaxy-z-flip-6.webp', tint: 'bg-tint-lilac' },
  { label: 'Flagship, over', price: '£550', to: '/shop?minPrice=550', chips: ['iPhone 17 Pro', 'Galaxy S25 Ultra', 'Z Fold 6'], image: '/phones/apple-iphone-17-pro.webp', tint: 'bg-tint-peach' },
];

/** "Price ladder": one white card, four hairline-divided steps, serif price labels, phones in tinted circular wells. */
export function BudgetTiles() {
  return (
    <div className="overflow-hidden rounded-[36px] border border-line bg-white">
      <div className="grid divide-y divide-line md:grid-cols-4 md:divide-x md:divide-y-0">
        {STEPS.map((s, i) => {
          return (
            <Link key={s.price + i} to={s.to} className="group flex flex-col p-7 transition-colors hover:bg-cream-2 md:p-8">
              <div className="flex items-start justify-between">
                <span className="eyebrow">Range 0{i + 1}</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink transition-all group-hover:border-ink group-hover:bg-ink group-hover:text-white">
                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
              <p className="mt-6 text-sm text-ink-3">{s.label}</p>
              <p className="serif-accent text-5xl leading-none text-ink md:text-[3.25rem]">{s.price}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {s.chips.map((c) => (
                  <span key={c} className="rounded-full bg-cream px-2.5 py-1 text-[11px] font-semibold text-ink-2">{c}</span>
                ))}
              </div>
              <div className={`mx-auto mt-8 flex aspect-square w-full max-w-[220px] items-center justify-center rounded-full transition-transform duration-500 group-hover:-translate-y-1 group-hover:shadow-card ${s.tint}`}>
                <img src={s.image} alt="" loading="lazy" className="h-[74%] w-[74%] product-img transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-3" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
