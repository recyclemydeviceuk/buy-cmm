import { ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';

/** Minimal closing band: one line, two buttons. */
export function ClosingCta() {
  return (
    <div className="flex flex-col items-center gap-8 rounded-[36px] bg-tint-sky px-6 py-16 text-center md:flex-row md:justify-between md:px-14 md:py-14 md:text-left">
      <h2 className="text-3xl md:text-4xl">Find your next phone today.</h2>
      <div className="flex flex-wrap justify-center gap-3">
        <Button to="/shop?brand=Apple" size="lg" variant="dark">
          Shop iPhone <ArrowRight size={18} />
        </Button>
        <Button to="/shop?brand=Samsung" size="lg" variant="light">
          Shop Samsung
        </Button>
      </div>
    </div>
  );
}
