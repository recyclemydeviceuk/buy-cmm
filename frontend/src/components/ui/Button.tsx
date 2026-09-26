import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'dark' | 'light';
type Size = 'sm' | 'md' | 'lg';

const base = 'inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-all duration-200 focus-ring disabled:opacity-50 disabled:pointer-events-none active:scale-[.98]';
const variants: Record<Variant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-[0_10px_24px_-10px_rgba(208,26,42,.6)]',
  dark: 'bg-ink text-white hover:bg-ink-2',
  light: 'bg-white text-ink hover:bg-cream',
  secondary: 'bg-white text-ink border border-line hover:border-ink',
  ghost: 'bg-transparent text-ink hover:bg-cream',
};
const sizes: Record<Size, string> = { sm: 'h-11 px-5 text-sm', md: 'h-12 px-6 text-[15px]', lg: 'h-14 px-8 text-base' };

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  to?: string;
  href?: string;
  children: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, Props>(function Button({ variant = 'primary', size = 'md', className, to, href, children, ...rest }, ref) {
  const cls = cn(base, variants[variant], sizes[size], className);
  if (to) {
    return (
      <Link to={to} className={cls}>
        {children}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    );
  }
  return (
    <button ref={ref} className={cls} {...rest}>
      {children}
    </button>
  );
});
