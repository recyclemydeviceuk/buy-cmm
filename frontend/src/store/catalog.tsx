import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from '../api';
import type { MenuProduct, StoreConfig } from '../types';
import { buildBrandMenus, type BrandMenu } from '../data/menu';
import { DEFAULT_CONFIG, siteContact } from '../data/site';

interface Ctx {
  products: MenuProduct[];
  menus: BrandMenu[];
  config: StoreConfig;
  loaded: boolean;
  error: string | null;
}

const CatalogContext = createContext<Ctx | null>(null);

/** Loads the slim catalogue and store config once; the header, menus, search and footer read from here. */
export function CatalogProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<MenuProduct[]>([]);
  const [config, setConfig] = useState<StoreConfig>(DEFAULT_CONFIG);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    Promise.allSettled([api.getMenuProducts(), api.getConfig()]).then(([p, c]) => {
      if (!alive) return;
      if (p.status === 'fulfilled') setProducts(p.value);
      else setError(p.reason instanceof Error ? p.reason.message : 'Could not load the catalogue');
      if (c.status === 'fulfilled') setConfig({ ...c.value, paypal: { ...c.value.paypal, clientId: c.value.paypal.clientId || DEFAULT_CONFIG.paypal.clientId } });
      setLoaded(true);
    });
    return () => {
      alive = false;
    };
  }, []);
  const value = useMemo<Ctx>(() => ({ products, menus: buildBrandMenus(products), config, loaded, error }), [products, config, loaded, error]);
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('useCatalog must be used inside CatalogProvider');
  return ctx;
}
export const useMenuProducts = () => useCatalog().products;
export const useBrandMenus = () => useCatalog().menus;
export const useStoreConfig = () => useCatalog().config;
export const useCatalogState = () => useCatalog();
export function useSiteContact() {
  const config = useStoreConfig();
  return useMemo(() => siteContact(config), [config]);
}
