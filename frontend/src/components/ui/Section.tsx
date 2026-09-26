import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '../../lib/cn';

export function Section({ children, className, id, tone = 'white' }: { children: ReactNode; className?: string; id?: string; tone?: 'white' | 'cream' | 'ink' }) {
  const tones = { white: 'bg-white', cream: 'bg-cream', ink: 'bg-ink text-white' };
  return (
    <section id={id} className={cn('py-16 md:py-24', tones[tone], className)}>
      <div className="container">{children}</div>
    </section>
  );
}

export function SectionHeading({ eyebrow, title, blurb, action, align = 'left', dark = false, className }: { eyebrow?: string; title: ReactNode; blurb?: string; action?: { label: string; to: string }; align?: 'left' | 'center'; dark?: boolean; className?: string }) {
  return (
    <div className={cn('mb-10 flex flex-col gap-5 md:mb-12 md:flex-row md:items-end md:justify-between', align === 'center' && 'text-center md:flex-col md:items-center', className)}>
      <div className={cn('max-w-2xl', align === 'center' && 'mx-auto')}>
        {eyebrow && <p className={cn('eyebrow mb-3', dark ? 'text-white/50' : 'text-brand-600')}>{eyebrow}</p>}
        <h2 className={cn('text-3xl leading-[1.08] md:text-[2.6rem] text-balance', dark && 'text-white')}>{title}</h2>
        {blurb && <p className={cn('mt-4 max-w-xl text-base md:text-[17px] text-balance', dark ? 'text-white/60' : 'text-ink-3')}>{blurb}</p>}
      </div>
      {action && (
        <Link to={action.to} className={cn('group inline-flex h-11 shrink-0 items-center gap-2 rounded-full border px-5 text-sm font-semibold transition-colors', dark ? 'border-white/20 text-white hover:bg-white/10' : 'border-line text-ink hover:border-ink')}>
          {action.label}
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
