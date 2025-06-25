// Version: 1.0.1 - Updated for GitHub tracking
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  currency: string;
  image: string;
  images?: string[];
  brand?: string;
  category: string;
  tags: string[];
  rating?: number;
  reviewCount?: number;
  availability: 'in_stock' | 'out_of_stock' | 'limited';
  url: string;
  affiliate_url?: string;
  discount_percentage?: number;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  products?: Product[];
}

export interface UserProfile {
  preferences: {
    style: string[];
    budget_range: [number, number];
    sizes: string[];
    brands: string[];
  };
  wishlist: Product[];
  chat_history: ChatMessage[];
}

export interface SiteContext {
  domain: string;
  platform: 'shopify' | 'woocommerce' | 'magento' | 'custom' | 'unknown';
  current_product?: Product;
  detected_products: Product[];
}