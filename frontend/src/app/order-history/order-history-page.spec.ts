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
});
