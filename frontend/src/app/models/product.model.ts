export const MAX_PRODUCT_PRICE_COP = 10_000_000;
export const MAX_PRODUCT_STOCK = 100_000;

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  unit: string;
  stock: number;
  producerName: string;
  location: string;
  imageUrl: string;
}
