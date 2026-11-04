import { TestBed } from '@angular/core/testing';
import { PRODUCT_SEED } from '../data/product-seed';
import { Product } from '../models/product.model';
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

    expect(store.products()).toContain(addedProduct);
    expect(JSON.parse(window.localStorage.getItem('agrigo.products') ?? 'null')).toContainEqual(
      addedProduct,
    );
  });

  it('reports invalid saved JSON instead of silently replacing it', () => {
    window.localStorage.setItem('agrigo.products', '{invalid');

    expect(() => TestBed.inject(ProductStore)).toThrowError(/localStorage no es JSON válido/);
  });
});
