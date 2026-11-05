import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { OrderConfirmationPage } from './order-confirmation-page';
import { PurchaseOrder } from '../models/purchase-order.model';
import { OrderStore } from '../services/order.store';

describe('OrderConfirmationPage', () => {
  const routeParamMap = new BehaviorSubject(convertToParamMap({ id: 'order-confirm-1' }));

  beforeEach(async () => {
    window.localStorage.clear();
    routeParamMap.next(convertToParamMap({ id: 'order-confirm-1' }));
    await TestBed.configureTestingModule({
      imports: [OrderConfirmationPage],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: routeParamMap.value }, paramMap: routeParamMap },
        },
      ],
    }).compileComponents();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  const savedOrder: PurchaseOrder = {
    id: 'order-confirm-1',
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

  it('shows the saved order snapshot and simulation notice', () => {
    TestBed.inject(OrderStore).addOrder(savedOrder);
    const fixture = TestBed.createComponent(OrderConfirmationPage);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const displayedText = (compiled.textContent ?? '').replace(/[\s.,]/g, '');

    expect(compiled.textContent).toContain('¡Gracias, Ana Gómez!');
    expect(compiled.textContent).toContain('Papa criolla registrada');
    expect(displayedText).toContain('2kg');
    expect(displayedText).toContain('$4900');
    expect(displayedText).toContain('$9800');
    expect(compiled.textContent).toContain('No se realizó ningún cobro ni despacho real.');
    expect(compiled.querySelector('a[routerLink="/mis-pedidos"]')).not.toBeNull();
    expect(compiled.querySelector('a[routerLink="/marketplace"]')).not.toBeNull();
  });

  it('shows a useful message when the order id is not stored', () => {
    const fixture = TestBed.createComponent(OrderConfirmationPage);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'No encontramos ese pedido',
    );
  });

  it('updates the displayed order when the route id changes', () => {
    const secondOrder: PurchaseOrder = {
      ...savedOrder,
      id: 'order-confirm-2',
      customerName: 'Carlos Ruiz',
    };
    const orderStore = TestBed.inject(OrderStore);
    orderStore.addOrder(savedOrder);
    orderStore.addOrder(secondOrder);

    const fixture = TestBed.createComponent(OrderConfirmationPage);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('¡Gracias, Ana Gómez!');

    routeParamMap.next(convertToParamMap({ id: secondOrder.id }));
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('¡Gracias, Carlos Ruiz!');
  });
});
