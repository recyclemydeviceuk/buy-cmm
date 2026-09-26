import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { BasketProvider } from './store/basket';
import { Layout } from './components/layout/Layout';
import Home from './pages/Home';

const Shop = lazy(() => import('./pages/Shop'));
const Product = lazy(() => import('./pages/Product'));
const Basket = lazy(() => import('./pages/Basket'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderConfirmed = lazy(() => import('./pages/OrderConfirmed'));
const HowItWorks = lazy(() => import('./pages/HowItWorks'));
const Faq = lazy(() => import('./pages/Faq'));
const Contact = lazy(() => import('./pages/Contact'));
const NotFound = lazy(() => import('./pages/NotFound'));
const TrackOrder = lazy(() => import('./pages/TrackOrder'));

export default function App() {
  return (
    <BrowserRouter>
      <BasketProvider>
        <Suspense fallback={<div className="container py-24 text-center text-ink-3">Loading…</div>}>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="shop" element={<Shop />} />
              <Route path="phones/:slug" element={<Product />} />
              <Route path="basket" element={<Basket />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="order/:orderNumber" element={<OrderConfirmed />} />
              <Route path="how-it-works" element={<HowItWorks />} />
              <Route path="grading" element={<Navigate to="/how-it-works#grades" replace />} />
              <Route path="faq" element={<Faq />} />
              <Route path="contact" element={<Contact />} />
              <Route path="track" element={<TrackOrder />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </BasketProvider>
    </BrowserRouter>
  );
}
