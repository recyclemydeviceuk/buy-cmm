// Shapes mirror the BuyUpon backend contract (see ../API_CONTRACT.md). Keep camelCase.

export type Brand = 'Apple' | 'Samsung';
export type Condition = 'excellent' | 'good' | 'fair';
export type Network = 'Unlocked' | 'EE' | 'Vodafone' | 'O2' | 'Three';

export interface Variant {
  storage: string;
  network: Network | string;
  condition: Condition;
  price: number; // GBP, whole pounds
  stock: number;
}

export interface ProductSpecs {
  display: string;
  chip: string;
  camera: string;
  battery: string;
  connectivity: string;
}

export interface Product {
  id: string;
  slug: string;
  brand: Brand | string;
  name: string;
  series: string;
  releaseYear: number;
  image: string;
  rrp: number;
  fromPrice: number;
  rating: number;
  reviewCount: number;
  specs: ProductSpecs;
  storages: string[];
  networks: string[];
  variants: Variant[];
}

export type SortKey = 'popular' | 'price-asc' | 'price-desc' | 'newest';

export interface ProductQuery {
  brand?: string[];
  series?: string[];
  network?: string[];
  condition?: Condition[];
  storage?: string[];
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: SortKey;
  page?: number;
  pageSize?: number;
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface FacetOption {
  value: string;
  label: string;
  count: number;
}

export interface Facets {
  brands: FacetOption[];
  series: FacetOption[];
  networks: FacetOption[];
  conditions: FacetOption[];
  storages: FacetOption[];
  priceRange: { min: number; max: number };
}

export interface BasketLine {
  lineId: string;
  productId: string;
  slug: string;
  name: string;
  brand: string;
  image: string;
  storage: string;
  network: string;
  condition: Condition;
  unitPrice: number;
  quantity: number;
}

export interface Address {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  postcode: string;
}

export type DeliveryMethod = 'standard' | 'next-day';

export interface CheckoutRequest {
  lines: Array<Pick<BasketLine, 'productId' | 'storage' | 'network' | 'condition' | 'quantity'>>;
  customer: Address;
  delivery: DeliveryMethod;
  paymentToken: string;
}

export interface Order {
  orderNumber: string;
  createdAt: string;
  status: 'confirmed' | 'dispatched' | 'delivered' | 'cancelled';
  lines: BasketLine[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  delivery: DeliveryMethod;
  customer: Address;
  estimatedDelivery: string;
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  verified: boolean;
}
