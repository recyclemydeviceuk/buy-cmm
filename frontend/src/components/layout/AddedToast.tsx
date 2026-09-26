import { useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { useBasket } from '../../store/basket';
import { money, conditionLabel } from '../../lib/format';
import { Button } from '../ui/Button';

export function AddedToast() {
  const { justAdded, dismissJustAdded, count } = useBasket();
  useEffect(() => {
    if (!justAdded) return;
    const t = setTimeout(dismissJustAdded, 6000);
    return () => clearTimeout(t);
  }, [justAdded, dismissJustAdded]);
  if (!justAdded) return null;
  return (
    <div role="status" className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md animate-rise rounded-3xl border border-line bg-white p-5 shadow-toast sm:bottom-6 sm:left-auto sm:right-6">
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-cream">
          <img src={justAdded.image} alt="" className="h-14 w-14 product-img" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-sm font-bold text-success">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-tint-mint"><Check size={12} strokeWidth={3} /></span> Added to basket
          </p>
          <p className="mt-1 truncate font-display font-bold">{justAdded.name}</p>
          <p className="text-sm text-ink-3">
            {justAdded.storage} · {justAdded.network} · {conditionLabel(justAdded.condition)} · {money(justAdded.unitPrice)}
          </p>
        </div>
        <button type="button" onClick={dismissJustAdded} className="rounded-full p-1.5 text-ink-3 hover:bg-cream focus-ring" aria-label="Dismiss">
          <X size={18} />
        </button>
      </div>
      <div className="mt-5 flex gap-3">
        <Button to="/basket" variant="secondary" size="sm" className="flex-1">
          View basket ({count})
        </Button>
        <Button to="/checkout" variant="dark" size="sm" className="flex-1">
          Checkout
        </Button>
      </div>
    </div>
  );
}
