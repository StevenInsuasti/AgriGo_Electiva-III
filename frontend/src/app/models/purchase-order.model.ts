import { CartItem } from './cart-item.model';

export type PaymentPreference = 'cash' | 'transfer' | 'other';

export interface PurchaseOrder {
  id: string;
  createdAt: string;
  customerName: string;
  deliveryAddress: string;
  paymentPreference: PaymentPreference;
  items: CartItem[];
  total: number;
}
