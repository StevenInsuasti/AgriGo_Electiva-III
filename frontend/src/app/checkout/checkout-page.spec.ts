import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { CheckoutPage } from './checkout-page';
import { CartStore } from '../services/cart.store';
import { ProductStore } from '../services/product.store';
import { OrderStore } from '../services/order.store';

describe('CheckoutPage', () => {
  beforeEach(async () => {
    window.localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [CheckoutPage],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  function fillValidForm(page: CheckoutPage): void {
    page.checkoutForm.patchValue({
      customerName: '  Ana Gómez  ',
      phone: '+57 300 123 4567',
      deliveryAddress: '  Calle 10 # 20-30  ',
      paymentPreference: 'transfer',
    });
  }

  it('shows an empty-cart message instead of a checkout form', () => {
    const fixture = TestBed.createComponent(CheckoutPage);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('No hay productos para confirmar');
    expect(compiled.querySelector('form')).toBeNull();
  });

  it('does not save an order when delivery fields are invalid', async () => {
    TestBed.inject(CartStore).addProduct('seed-papa');
    const fixture = TestBed.createComponent(CheckoutPage);
    const page = fixture.componentInstance;

    await page.confirmOrder();

    expect(page.checkoutForm.invalid).toBe(true);
    expect(page.errorMessage()).toContain('Revisa los datos de entrega');
    expect(TestBed.inject(OrderStore).orders()).toEqual([]);
    expect(TestBed.inject(CartStore).quantityFor('seed-papa')).toBe(1);
  });

  it('saves a price snapshot, clears the cart, and navigates to its confirmation', async () => {
    const cartStore = TestBed.inject(CartStore);
    const productStore = TestBed.inject(ProductStore);
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    cartStore.addProduct('seed-papa');
    cartStore.addProduct('seed-papa');

    const fixture = TestBed.createComponent(CheckoutPage);
    const page = fixture.componentInstance;
    fillValidForm(page);
    await page.confirmOrder();

    const order = TestBed.inject(OrderStore).orders()[0];
    expect(order.customerName).toBe('Ana Gómez');
    expect(order.phone).toBe('+57 300 123 4567');
    expect(order.deliveryAddress).toBe('Calle 10 # 20-30');
    expect(order.paymentPreference).toBe('transfer');
    expect(order.items).toEqual([
      {
        productId: 'seed-papa',
        productName: 'Papa criolla',
        unit: 'kg',
        unitPrice: 5200,
        quantity: 2,
        subtotal: 10400,
      },
    ]);
    expect(order.total).toBe(10400);
    expect(JSON.parse(window.localStorage.getItem('agrigo.orders') ?? '[]')).toEqual([order]);
    expect(JSON.parse(window.localStorage.getItem('agrigo.cart') ?? 'null')).toEqual([]);
    expect(cartStore.cartItems()).toEqual([]);
    expect(productStore.products().find((product) => product.id === 'seed-papa')?.stock).toBe(42);
    expect(navigateSpy).toHaveBeenCalledWith(['/pedido', order.id], { state: undefined });
  });

  it('does not save the same checkout twice if confirmation navigation fails', async () => {
    const cartStore = TestBed.inject(CartStore);
    cartStore.addProduct('seed-papa');
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(false);
    const page = TestBed.createComponent(CheckoutPage).componentInstance;
    fillValidForm(page);

    await page.confirmOrder();
    await page.confirmOrder();

    expect(TestBed.inject(OrderStore).orders()).toHaveLength(1);
    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(page.errorMessage()).toContain('se guardó');
  });

  it('rejects an order if current stock is lower than the cart quantity', async () => {
    const cartStore = TestBed.inject(CartStore);
    const productStore = TestBed.inject(ProductStore);
    cartStore.addProduct('seed-papa');
    cartStore.addProduct('seed-papa');

    const papa = productStore.products().find((product) => product.id === 'seed-papa');
    if (!papa) {
      throw new Error('Falta el producto semilla usado por las pruebas.');
    }
    productStore.updateProduct({ ...papa, stock: 1 });

    const fixture = TestBed.createComponent(CheckoutPage);
    const page = fixture.componentInstance;
    fillValidForm(page);
    await page.confirmOrder();

    expect(page.errorMessage()).toContain('supera el stock actual');
    expect(TestBed.inject(OrderStore).orders()).toEqual([]);
    expect(cartStore.cartItems()).toEqual([{ productId: 'seed-papa', quantity: 2 }]);
  });

  it('rejects a phone number with too few digits', async () => {
    TestBed.inject(CartStore).addProduct('seed-papa');
    const fixture = TestBed.createComponent(CheckoutPage);
    const page = fixture.componentInstance;
    fillValidForm(page);
    page.checkoutForm.controls.phone.setValue('123');

    await page.confirmOrder();

    expect(page.checkoutForm.controls.phone.hasError('phone')).toBe(true);
    expect(TestBed.inject(OrderStore).orders()).toEqual([]);
  });
});
