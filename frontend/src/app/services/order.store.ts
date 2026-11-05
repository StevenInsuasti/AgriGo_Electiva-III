import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import {
  PaymentPreference,
  PurchaseOrder,
  PurchaseOrderItem,
} from '../models/purchase-order.model';

const ORDER_STORAGE_KEY = 'agrigo.orders';

@Injectable({ providedIn: 'root' })
export class OrderStore {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly orderState = signal<PurchaseOrder[]>([]);
  private readonly loadWarningState = signal('');

  readonly orders = this.orderState.asReadonly();
  readonly loadWarning = this.loadWarningState.asReadonly();

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadOrders();
    }
  }

  addOrder(order: PurchaseOrder): void {
    if (!isPurchaseOrder(order)) {
      throw new Error('No se puede guardar el pedido porque sus datos o valores no son válidos.');
    }

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
    } catch {
      this.loadWarningState.set(
        'No se pudieron leer los pedidos guardados porque sus datos no son válidos. No se modificó el almacenamiento.',
      );
      return;
    }

    if (!Array.isArray(parsedOrders)) {
      this.loadWarningState.set(
        'Los pedidos guardados no tienen el formato esperado. No se modificó el almacenamiento.',
      );
      return;
    }

    const validOrders = parsedOrders.filter(isPurchaseOrder);
    this.orderState.set(validOrders);
    if (validOrders.length !== parsedOrders.length) {
      this.loadWarningState.set(
        'Se omitieron pedidos con datos no válidos. Los pedidos válidos siguen disponibles.',
      );
    }
  }

  private saveOrders(orders: PurchaseOrder[]): void {
    if (isPlatformBrowser(this.platformId)) {
      window.localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders));
    }
  }
}

function isPurchaseOrder(value: unknown): value is PurchaseOrder {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const order = value as Record<string, unknown>;
  const items = order['items'];
  const total = order['total'];
  if (
    typeof order['id'] !== 'string' ||
    typeof order['createdAt'] !== 'string' ||
    typeof order['customerName'] !== 'string' ||
    typeof order['phone'] !== 'string' ||
    typeof order['deliveryAddress'] !== 'string' ||
    !isPaymentPreference(order['paymentPreference']) ||
    !Array.isArray(items) ||
    !items.every(isPurchaseOrderItem) ||
    typeof total !== 'number' ||
    !Number.isFinite(total) ||
    total < 0
  ) {
    return false;
  }

  const calculatedTotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  return Number.isFinite(calculatedTotal) && total === calculatedTotal;
}

function isPurchaseOrderItem(value: unknown): value is PurchaseOrderItem {
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
    item['subtotal'] >= 0 &&
    item['subtotal'] === item['unitPrice'] * item['quantity']
  );
}

function isPaymentPreference(value: unknown): value is PaymentPreference {
  return value === 'cash' || value === 'transfer' || value === 'other';
}
