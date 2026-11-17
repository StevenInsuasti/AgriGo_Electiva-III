import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CartPage } from './cart-page';
import { CartStore } from '../services/cart.store';

describe('CartPage', () => {
  beforeEach(async () => {
    window.localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [CartPage],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('shows a clear empty-cart state', () => {
    const fixture = TestBed.createComponent(CartPage);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Tu carrito está vacío');
  });

  it('offers checkout from a non-empty cart', () => {
    TestBed.inject(CartStore).addProduct('seed-papa');
    const fixture = TestBed.createComponent(CartPage);
    fixture.detectChanges();

    const checkoutLink = (fixture.nativeElement as HTMLElement).querySelector(
      'a[routerLink="/checkout"]',
    );
    expect(checkoutLink?.textContent).toContain('Continuar al checkout');
  });

  it('renders cart totals and supports increasing, decreasing, and removing a product', () => {
    const cartStore = TestBed.inject(CartStore);
    cartStore.addProduct('seed-papa');
    cartStore.addProduct('seed-papa');

    const fixture = TestBed.createComponent(CartPage);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain('2 kg');
    expect(element.textContent).toContain('Resumen');

    element
      .querySelector<HTMLButtonElement>('button[aria-label="Aumentar cantidad de Papa criolla"]')
      ?.click();
    fixture.detectChanges();
    expect(cartStore.quantityFor('seed-papa')).toBe(3);

    element
      .querySelector<HTMLButtonElement>('button[aria-label="Disminuir cantidad de Papa criolla"]')
      ?.click();
    fixture.detectChanges();
    expect(cartStore.quantityFor('seed-papa')).toBe(2);

    element.querySelector<HTMLButtonElement>('.remove-button')?.click();
    fixture.detectChanges();
    expect(element.textContent).toContain('Tu carrito está vacío');
  });
});
