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

  it('keeps finite historical order snapshots with decimal COP prices', () => {
    const historicalOrder: PurchaseOrder = {
      id: 'order-historical-decimal',
      createdAt: '2026-11-04T10:00:00.000Z',
      customerName: 'Ana Gómez',
      phone: '3001234567',
      deliveryAddress: 'Calle 10 # 20-30',
      paymentPreference: 'cash',
      items: [
        {
          productId: 'legacy-product',
          productName: 'Producto anterior',
          unit: 'kg',
          unitPrice: 12.5,
          quantity: 2,
          subtotal: 25,
        },
      ],
      total: 25,
    };
    window.localStorage.setItem('agrigo.orders', JSON.stringify([historicalOrder]));

    expect(TestBed.inject(OrderStore).orders()).toEqual([historicalOrder]);
  });

  it('reports malformed saved JSON instead of overwriting it', () => {
    window.localStorage.setItem('agrigo.orders', '{invalid');

    const store = TestBed.inject(OrderStore);

    expect(store.orders()).toEqual([]);
    expect(store.loadWarning()).toContain('datos no son válidos');
    expect(window.localStorage.getItem('agrigo.orders')).toBe('{invalid');
  });

  it('rejects non-finite subtotals and totals without persisting the order', () => {
    const store = TestBed.inject(OrderStore);
    const validOrder: PurchaseOrder = {
      id: 'order-non-finite',
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

    expect(() => store.addOrder({ ...validOrder, total: Infinity })).toThrowError(/datos/);
    expect(() =>
      store.addOrder({
        ...validOrder,
        items: [{ ...validOrder.items[0], subtotal: Infinity }],
      }),
    ).toThrowError(/datos/);

    expect(store.orders()).toEqual([]);
    expect(JSON.parse(window.localStorage.getItem('agrigo.orders') ?? 'null')).toEqual([]);
  });

  it('loads valid orders and skips invalid persisted orders without breaking the store', () => {
    const savedOrder: PurchaseOrder = {
      id: 'order-restored',
      createdAt: '2026-11-04T10:00:00.000Z',
      customerName: 'Ana Gómez',
      phone: '3001234567',
      deliveryAddress: 'Calle 10 # 20-30',
      paymentPreference: 'transfer',
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
    const invalidTotalOrder = { ...savedOrder, id: 'order-invalid-total', total: Infinity };
    const invalidSubtotalOrder = {
      ...savedOrder,
      id: 'order-invalid-subtotal',
      items: [{ ...savedOrder.items[0], subtotal: Infinity }],
      total: Infinity,
    };
    window.localStorage.setItem(
      'agrigo.orders',
      JSON.stringify([savedOrder, invalidTotalOrder, invalidSubtotalOrder]),
    );

    const store = TestBed.inject(OrderStore);

    expect(store.orders()).toEqual([savedOrder]);
    expect(store.loadWarning()).toContain('Se omitieron pedidos');
    expect(window.localStorage.getItem('agrigo.orders')).toContain('"subtotal":null');
  });
});
