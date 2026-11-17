import { TestBed } from '@angular/core/testing';
import { PRODUCT_SEED } from '../data/product-seed';
import { MAX_PRODUCT_PRICE_COP, MAX_PRODUCT_STOCK, Product } from '../models/product.model';
import { ProductStore } from './product.store';

describe('ProductStore', () => {
  beforeEach(() => {
    window.localStorage.clear();
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('stores the seed catalog on the first browser visit', () => {
    const store = TestBed.inject(ProductStore);

    expect(store.products()).toEqual(PRODUCT_SEED);
    expect(JSON.parse(window.localStorage.getItem('agrigo.products') ?? 'null')).toEqual(
      PRODUCT_SEED,
    );
  });

  it('restores saved products instead of replacing them with the seed', () => {
    const savedProduct: Product = {
      ...PRODUCT_SEED[0],
      id: 'saved-product',
      name: 'Producto guardado',
    };
    window.localStorage.setItem('agrigo.products', JSON.stringify([savedProduct]));

    const store = TestBed.inject(ProductStore);

    expect(store.products()).toEqual([savedProduct]);
  });

  it('persists new products before exposing the updated signal', () => {
    const store = TestBed.inject(ProductStore);
    const addedProduct: Product = {
      ...PRODUCT_SEED[0],
      id: 'new-product',
      name: 'Nuevo producto',
    };

    store.addProduct(addedProduct);

    expect(store.products()).toContainEqual(addedProduct);
    expect(JSON.parse(window.localStorage.getItem('agrigo.products') ?? 'null')).toContainEqual(
      addedProduct,
    );
  });

  it('trims product text and rejects required values made only of spaces', () => {
    const store = TestBed.inject(ProductStore);
    const paddedProduct: Product = {
      ...PRODUCT_SEED[0],
      id: 'trimmed-product',
      name: ' Producto nuevo ',
      description: ' Descripción del producto ',
      unit: ' kg ',
      location: ' Marinilla ',
      imageUrl: ' https://example.com/producto.jpg ',
    };

    store.addProduct(paddedProduct);

    expect(store.products().at(-1)).toMatchObject({
      name: 'Producto nuevo',
      description: 'Descripción del producto',
      unit: 'kg',
      location: 'Marinilla',
      imageUrl: 'https://example.com/producto.jpg',
    });
    expect(() =>
      store.addProduct({ ...paddedProduct, id: 'blank-name', name: '   ' }),
    ).toThrowError(/campos de texto/);
    expect(store.products()).toHaveLength(PRODUCT_SEED.length + 1);
  });

  it('rejects product amounts outside the safe COP and stock limits', () => {
    const store = TestBed.inject(ProductStore);
    const product = { ...PRODUCT_SEED[0], id: 'invalid-product' };
    const invalidProducts: Product[] = [
      { ...product, price: 12.5 },
      { ...product, price: -1 },
      { ...product, price: MAX_PRODUCT_PRICE_COP + 1 },
      { ...product, stock: 1.5 },
      { ...product, stock: Number.MAX_SAFE_INTEGER + 1 },
      { ...product, stock: MAX_PRODUCT_STOCK + 1 },
    ];

    for (const invalidProduct of invalidProducts) {
      expect(() => store.addProduct(invalidProduct)).toThrowError(/entero/);
    }

    expect(store.products()).toEqual(PRODUCT_SEED);
    expect(JSON.parse(window.localStorage.getItem('agrigo.products') ?? 'null')).toEqual(
      PRODUCT_SEED,
    );
  });

  it('reports invalid saved JSON instead of silently replacing it', () => {
    window.localStorage.setItem('agrigo.products', '{invalid');

    expect(() => TestBed.inject(ProductStore)).toThrowError(/localStorage no es JSON válido/);
  });
});
