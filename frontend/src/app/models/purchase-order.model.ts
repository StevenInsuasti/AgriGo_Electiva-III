import { CartItem } from './cart-item.model';

export type PaymentPreference = 'cash' | 'transfer' | 'other';

export interface PurchaseOrderItem extends CartItem {
  productName: string;
  unit: string;
  unitPrice: number;
  subtotal: number;
}

export interface PurchaseOrder {
  id: string;
  createdAt: string;
  customerName: string;
  phone: string;
  deliveryAddress: string;
  paymentPreference: PaymentPreference;
  items: PurchaseOrderItem[];
  total: number;
}
