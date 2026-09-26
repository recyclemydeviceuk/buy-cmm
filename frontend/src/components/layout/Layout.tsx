import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { AddedToast } from './AddedToast';

/** Height reserved under the fixed floating header. Pages that want to run under it (the home hero) use `-mt-header`. */
export const HEADER_OFFSET = 'pt-[92px] md:pt-[104px]';

export function Layout() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      // Lazy pages mount after this effect runs, so poll briefly for the target before giving up.
      const id = hash.slice(1);
      let tries = 0;
      const timer = window.setInterval(() => {
        const el = document.getElementById(id);
        tries += 1;
        if (el) {
          window.clearInterval(timer);
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (tries > 40) {
          window.clearInterval(timer);
        }
      }, 50);
      return () => window.clearInterval(timer);
    }
    // Jump instantly, then let the new page fade in; smooth-scrolling across a long page while the content swaps looks broken.
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname, hash]);
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className={`flex-1 ${HEADER_OFFSET}`}>
        <div key={pathname} className="animate-page">
          <Outlet />
        </div>
      </main>
      <Footer />
      <AddedToast />
    </div>
  );
}
