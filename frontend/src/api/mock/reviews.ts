import type { Review } from '../../types';

// Generic verified-purchase reviews shown on every product in mock mode ('*').
export const REVIEWS: Review[] = [
  { id: 'r1', productId: '*', author: 'Hannah M.', rating: 5, title: 'Honestly looks brand new', body: 'Ordered in Excellent condition and I genuinely cannot find a mark on it. Battery was at 96%. Arrived next morning in a proper box with a cable.', date: '2026-09-02', verified: true },
  { id: 'r2', productId: '*', author: 'Daniel O.', rating: 5, title: 'Saved over £300 vs buying new', body: 'Went for Good condition to save a bit more. A couple of tiny scuffs on the frame, exactly as described. Works perfectly and the warranty gives peace of mind.', date: '2026-08-21', verified: true },
  { id: 'r3', productId: '*', author: 'Priya S.', rating: 4, title: 'Great phone, quick delivery', body: 'Phone is spotless and was well packaged. Only reason for 4 stars is I would have liked a charger included, but the price makes up for it.', date: '2026-08-14', verified: true },
  { id: 'r4', productId: '*', author: 'Tom R.', rating: 5, title: 'Second phone I have bought here', body: 'Bought one for my son last year and now one for myself. Both were exactly as graded. Easy to set up, unlocked as promised.', date: '2026-07-30', verified: true },
];
