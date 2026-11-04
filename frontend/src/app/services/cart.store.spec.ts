import { TestBed } from '@angular/core/testing';
import { PRODUCT_SEED } from '../data/product-seed';
import { CartStore } from './cart.store';
import { ProductStore } from './product.store';

describe('CartStore', () => {
  beforeEach(() => {
    window.localStorage.clear();
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('initializes an empty cart and adds selected products to localStorage', () => {
    const store = TestBed.inject(CartStore);

    store.addProduct('seed-papa');

    expect(store.cartItems()).toEqual([{ productId: 'seed-papa', quantity: 1 }]);
    expect(JSON.parse(window.localStorage.getItem('agrigo.cart') ?? 'null')).toEqual([
      { productId: 'seed-papa', quantity: 1 },
    ]);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const restoredStore = TestBed.inject(CartStore);
    expect(restoredStore.cartItems()).toEqual([{ productId: 'seed-papa', quantity: 1 }]);
  });

  it('restores a saved cart and calculates the line subtotal and total', () => {
    window.localStorage.setItem(
      'agrigo.cart',
      JSON.stringify([{ productId: 'seed-papa', quantity: 2 }]),
    );
    const papa = PRODUCT_SEED.find((product) => product.id === 'seed-papa');
    if (!papa) {
      throw new Error('Falta el producto semilla usado por las pruebas.');
    }

    const store = TestBed.inject(CartStore);

    expect(store.lines()).toEqual([
      {
        product: papa,
        quantity: 2,
        subtotal: papa.price * 2,
      },
    ]);
    expect(store.total()).toBe(papa.price * 2);
    expect(store.totalQuantity()).toBe(2);
  });

  it('does not allow a quantity above the available stock', () => {
    const store = TestBed.inject(CartStore);
    const papa = PRODUCT_SEED.find((product) => product.id === 'seed-papa');
    if (!papa) {
      throw new Error('Falta el producto semilla usado por las pruebas.');
    }
    const stock = papa.stock;

    store.setQuantity('seed-papa', stock);

    expect(() => store.addProduct('seed-papa')).toThrowError(/No hay más unidades disponibles/);
    expect(() => store.setQuantity('seed-papa', stock + 1)).toThrowError(
      `La cantidad debe ser un número entero entre 1 y ${stock}.`,
    );
    expect(store.quantityFor('seed-papa')).toBe(stock);
  });

  it('updates, removes, and clears cart items persistently', () => {
    const store = TestBed.inject(CartStore);

    store.addProduct('seed-papa');
    store.addProduct('seed-papa');
    store.setQuantity('seed-papa', 3);
    store.decreaseQuantity('seed-papa');
    expect(store.quantityFor('seed-papa')).toBe(2);

    store.removeProduct('seed-papa');
    expect(store.cartItems()).toEqual([]);
    expect(JSON.parse(window.localStorage.getItem('agrigo.cart') ?? 'null')).toEqual([]);

    store.addProduct('seed-papa');
    store.clear();
    expect(store.cartItems()).toEqual([]);
  });

  it('clamps a restored quantity when the product stock has changed', () => {
    window.localStorage.setItem(
      'agrigo.cart',
      JSON.stringify([{ productId: 'seed-papa', quantity: 5 }]),
    );

    const store = TestBed.inject(CartStore);
    const productStore = TestBed.inject(ProductStore);
    const papa = PRODUCT_SEED.find((product) => product.id === 'seed-papa');
    if (!papa) {
      throw new Error('Falta el producto semilla usado por las pruebas.');
    }
    productStore.updateProduct({ ...papa, stock: 2 });

    expect(store.lines()[0].quantity).toBe(2);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const restoredStore = TestBed.inject(CartStore);

    expect(restoredStore.cartItems()).toEqual([{ productId: 'seed-papa', quantity: 2 }]);
  });

  it('reports invalid saved cart data instead of silently replacing it', () => {
    window.localStorage.setItem('agrigo.cart', '{invalid');

    expect(() => TestBed.inject(CartStore)).toThrowError(/localStorage no es JSON válido/);
  });
});
