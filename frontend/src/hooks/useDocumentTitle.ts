import { useSeo } from '../lib/seo';

/** Back-compat wrapper: pages that only need a title. Prefer `useSeo` with a description. */
export function useDocumentTitle(title?: string) {
  useSeo({ title });
}
