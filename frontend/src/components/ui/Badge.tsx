import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export function Badge({ children, tone = 'neutral', className }: { children: ReactNode; tone?: 'neutral' | 'brand' | 'success' | 'dark' | 'light'; className?: string }) {
  const tones = {
    neutral: 'bg-cream text-ink-2',
    brand: 'bg-brand-600 text-white',
    success: 'bg-tint-mint text-success',
    dark: 'bg-ink text-white',
    light: 'bg-white/90 text-ink backdrop-blur',
  };
  return <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide', tones[tone], className)}>{children}</span>;
}
