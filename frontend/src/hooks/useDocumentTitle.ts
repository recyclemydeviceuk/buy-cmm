import { useEffect } from 'react';

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    const base = 'CashMyMobile';
    document.title = title ? `${title} · ${base}` : `${base} · Buy phones`;
  }, [title]);
}
