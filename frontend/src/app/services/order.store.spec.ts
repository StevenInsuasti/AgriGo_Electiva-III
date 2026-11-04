import { TestBed } from '@angular/core/testing';
import { PurchaseOrder } from '../models/purchase-order.model';
import { OrderStore } from './order.store';

describe('OrderStore', () => {
  beforeEach(() => {
    window.localStorage.clear();
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('starts empty and persists newly added orders', () => {
    const store = TestBed.inject(OrderStore);
    const order: PurchaseOrder = {
      id: 'order-test-1',
      createdAt: '2026-11-04T10:00:00.000Z',
      customerName: 'Ana Gómez',
      phone: '3001234567',
      deliveryAddress: 'Calle 10 # 20-30',
      paymentPreference: 'cash',
      items: [
        {
          productId: 'seed-papa',
          productName: 'Papa criolla',
          unit: 'kg',
          unitPrice: 5200,
          quantity: 2,
          subtotal: 10400,
        },
      ],
      total: 10400,
    };

    expect(store.orders()).toEqual([]);
    store.addOrder(order);

    expect(store.orders()).toEqual([order]);
    expect(store.findOrder(order.id)).toEqual(order);
    expect(JSON.parse(window.localStorage.getItem('agrigo.orders') ?? 'null')).toEqual([order]);
  });

  it('restores saved orders after the store is recreated', () => {
    const savedOrder: PurchaseOrder = {
      id: 'order-restored',
      createdAt: '2026-11-04T10:00:00.000Z',
      customerName: 'Ana Gómez',
      phone: '3001234567',
      deliveryAddress: 'Calle 10 # 20-30',
      paymentPreference: 'transfer',
      items: [],
      total: 0,
    };
    window.localStorage.setItem('agrigo.orders', JSON.stringify([savedOrder]));

    expect(TestBed.inject(OrderStore).orders()).toEqual([savedOrder]);
  });

  it('reports malformed saved JSON instead of overwriting it', () => {
    window.localStorage.setItem('agrigo.orders', '{invalid');

    expect(() => TestBed.inject(OrderStore)).toThrowError(/localStorage no es JSON válido/);
    expect(window.localStorage.getItem('agrigo.orders')).toBe('{invalid');
  });
});
