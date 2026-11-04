import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { PaymentPreference, PurchaseOrder } from '../models/purchase-order.model';

const ORDER_STORAGE_KEY = 'agrigo.orders';

@Injectable({ providedIn: 'root' })
export class OrderStore {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly orderState = signal<PurchaseOrder[]>([]);

  readonly orders = this.orderState.asReadonly();

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadOrders();
    }
  }

  addOrder(order: PurchaseOrder): void {
    if (this.orders().some((current) => current.id === order.id)) {
      throw new Error(`Ya existe un pedido con el identificador "${order.id}".`);
    }

    const nextOrders = [...this.orders(), order];
    this.saveOrders(nextOrders);
    this.orderState.set(nextOrders);
  }

  findOrder(orderId: string): PurchaseOrder | undefined {
    return this.orders().find((order) => order.id === orderId);
  }

  private loadOrders(): void {
    const savedOrders = window.localStorage.getItem(ORDER_STORAGE_KEY);
    if (savedOrders === null) {
      this.saveOrders([]);
      return;
    }

    let parsedOrders: unknown;
    try {
      parsedOrders = JSON.parse(savedOrders) as unknown;
    } catch (error) {
      throw new Error(
        'No se pudieron leer los pedidos guardados de AgriGo. El valor de localStorage no es JSON válido.',
        { cause: error },
      );
    }

    if (!isPurchaseOrderArray(parsedOrders)) {
      throw new Error('Los pedidos guardados de AgriGo no tienen el formato esperado.');
    }

    this.orderState.set(parsedOrders);
  }

  private saveOrders(orders: PurchaseOrder[]): void {
    if (isPlatformBrowser(this.platformId)) {
      window.localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders));
    }
  }
}

function isPurchaseOrderArray(value: unknown): value is PurchaseOrder[] {
  return Array.isArray(value) && value.every(isPurchaseOrder);
}

function isPurchaseOrder(value: unknown): value is PurchaseOrder {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const order = value as Record<string, unknown>;
  return (
    typeof order['id'] === 'string' &&
    typeof order['createdAt'] === 'string' &&
    typeof order['customerName'] === 'string' &&
    typeof order['phone'] === 'string' &&
    typeof order['deliveryAddress'] === 'string' &&
    isPaymentPreference(order['paymentPreference']) &&
    Array.isArray(order['items']) &&
    order['items'].every(isPurchaseOrderItem) &&
    typeof order['total'] === 'number' &&
    Number.isFinite(order['total']) &&
    order['total'] >= 0
  );
}

function isPurchaseOrderItem(value: unknown): boolean {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const item = value as Record<string, unknown>;
  return (
    typeof item['productId'] === 'string' &&
    typeof item['productName'] === 'string' &&
    typeof item['unit'] === 'string' &&
    typeof item['quantity'] === 'number' &&
    Number.isSafeInteger(item['quantity']) &&
    item['quantity'] > 0 &&
    typeof item['unitPrice'] === 'number' &&
    Number.isFinite(item['unitPrice']) &&
    item['unitPrice'] >= 0 &&
    typeof item['subtotal'] === 'number' &&
    Number.isFinite(item['subtotal']) &&
    item['subtotal'] >= 0
  );
}

function isPaymentPreference(value: unknown): value is PaymentPreference {
  return value === 'cash' || value === 'transfer' || value === 'other';
}
