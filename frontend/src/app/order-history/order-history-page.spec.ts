import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { OrderHistoryPage } from './order-history-page';
import { PurchaseOrder } from '../models/purchase-order.model';
import { OrderStore } from '../services/order.store';

describe('OrderHistoryPage', () => {
  beforeEach(async () => {
    window.localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [OrderHistoryPage],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('shows an explicit empty state and a Marketplace link', () => {
    const fixture = TestBed.createComponent(OrderHistoryPage);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Aún no tienes pedidos');
    expect(compiled.querySelector('a[routerLink="/marketplace"]')).not.toBeNull();
  });

  it('renders persisted order snapshots without reading current product data', () => {
    const order: PurchaseOrder = {
      id: 'order-history-1',
      createdAt: '2026-11-04T20:00:00.000Z',
      customerName: 'Ana Gómez',
      phone: '3001234567',
      deliveryAddress: 'Calle 10 # 20-30',
      paymentPreference: 'transfer',
      items: [
        {
          productId: 'seed-papa',
          productName: 'Papa criolla registrada',
          unit: 'kg',
          unitPrice: 4900,
          quantity: 2,
          subtotal: 9800,
        },
      ],
      total: 9800,
    };
    TestBed.inject(OrderStore).addOrder(order);

    const fixture = TestBed.createComponent(OrderHistoryPage);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const displayedText = (compiled.textContent ?? '').replace(/[\s.,]/g, '');

    expect(compiled.textContent).toContain('Papa criolla registrada');
    expect(displayedText).toContain('2kg');
    expect(displayedText).toContain('$4900');
    expect(displayedText).toContain('$9800');
    expect(compiled.textContent).toContain('No se realizó ningún cobro ni despacho real.');
    expect(compiled.querySelector('.details-link')?.getAttribute('href')).toBe(
      '/pedido/order-history-1',
    );
  });

  it('shows a warning and keeps valid orders when local storage contains an invalid order', () => {
    const savedOrder: PurchaseOrder = {
      id: 'order-history-valid',
      createdAt: '2026-11-04T20:00:00.000Z',
      customerName: 'Ana Gómez',
      phone: '3001234567',
      deliveryAddress: 'Calle 10 # 20-30',
      paymentPreference: 'transfer',
      items: [],
      total: 0,
    };
    window.localStorage.setItem(
      'agrigo.orders',
      JSON.stringify([savedOrder, { ...savedOrder, id: 'order-history-invalid', total: Infinity }]),
    );

    const fixture = TestBed.createComponent(OrderHistoryPage);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Se omitieron pedidos con datos no válidos');
    expect(compiled.textContent).toContain('Pedido order-history-valid');
    expect(compiled.textContent).not.toContain('order-history-invalid');
  });
});
