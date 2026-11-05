import { TestBed } from '@angular/core/testing';
import { PRODUCT_SEED } from '../data/product-seed';
import { MAX_PRODUCT_PRICE_COP, MAX_PRODUCT_STOCK, Product } from '../models/product.model';
import { ProductStore } from '../services/product.store';
import { ProducerPublicationsPage } from './producer-publications-page';

describe('ProducerPublicationsPage', () => {
  beforeEach(async () => {
    window.localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [ProducerPublicationsPage],
    }).compileComponents();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows only the current producer publications', () => {
    const fixture = TestBed.createComponent(ProducerPublicationsPage);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Papa criolla');
    expect(compiled.textContent).not.toContain('Tomate chonto');
  });

  it('requires valid fields before publishing', () => {
    const fixture = TestBed.createComponent(ProducerPublicationsPage);
    const page = fixture.componentInstance;

    page.saveProduct();

    expect(page.productForm.invalid).toBe(true);
    expect(page.errorMessage()).toContain('Revisa los campos');
    expect(page.producerProducts).toHaveLength(1);
  });

  it('rejects non-positive prices and fractional prices or stock quantities', () => {
    const fixture = TestBed.createComponent(ProducerPublicationsPage);
    const page = fixture.componentInstance;
    page.productForm.patchValue({
      name: 'Fresa campesina',
      description: 'Fresas frescas cosechadas esta semana.',
      category: 'Frutas',
      price: 0,
      unit: 'kg',
      stock: 1.5,
      location: 'La Ceja, Antioquia',
      imageUrl: 'https://example.com/fresa.jpg',
    });

    page.saveProduct();

    expect(page.productForm.controls.price.hasError('min')).toBe(true);
    expect(page.productForm.controls.stock.hasError('wholeNumber')).toBe(true);
    expect(page.producerProducts).toHaveLength(1);
  });

  it('rejects decimal, negative, excessive, and unsafe product amounts', () => {
    const page = TestBed.createComponent(ProducerPublicationsPage).componentInstance;
    const validFields = {
      name: 'Fresa campesina',
      description: 'Fresas frescas cosechadas esta semana.',
      category: 'Frutas',
      unit: 'kg',
      location: 'La Ceja, Antioquia',
      imageUrl: 'https://example.com/fresa.jpg',
    };
    const invalidAmounts = [
      { price: 12.5, stock: 1 },
      { price: -1, stock: 1 },
      { price: MAX_PRODUCT_PRICE_COP + 1, stock: 1 },
      { price: 6000, stock: 1.5 },
      { price: 6000, stock: MAX_PRODUCT_STOCK + 1 },
      { price: 6000, stock: Number.MAX_SAFE_INTEGER + 1 },
    ];

    for (const amounts of invalidAmounts) {
      page.productForm.patchValue({ ...validFields, ...amounts });
      page.saveProduct();
      expect(page.productForm.invalid).toBe(true);
      expect(page.producerProducts).toHaveLength(1);
    }

    expect(page.productForm.controls.price.hasError('wholeNumber')).toBe(false);
    page.productForm.patchValue({
      ...validFields,
      price: 6000,
      stock: Number.MAX_SAFE_INTEGER + 1,
    });
    expect(page.productForm.controls.stock.hasError('wholeNumber')).toBe(true);
  });

  it('accepts the configured amount limits', () => {
    const page = TestBed.createComponent(ProducerPublicationsPage).componentInstance;
    page.productForm.patchValue({
      name: 'Fresa campesina',
      description: 'Fresas frescas cosechadas esta semana.',
      category: 'Frutas',
      price: MAX_PRODUCT_PRICE_COP,
      unit: 'kg',
      stock: MAX_PRODUCT_STOCK,
      location: 'La Ceja, Antioquia',
      imageUrl: 'https://example.com/fresa.jpg',
    });

    page.saveProduct();

    expect(page.producerProducts[1]?.price).toBe(MAX_PRODUCT_PRICE_COP);
    expect(page.producerProducts[1]?.stock).toBe(MAX_PRODUCT_STOCK);
  });

  it('rejects whitespace-only text and descriptions shorter than eight trimmed characters', () => {
    const fixture = TestBed.createComponent(ProducerPublicationsPage);
    const page = fixture.componentInstance;
    page.productForm.patchValue({
      name: '   ',
      description: '   corto   ',
      category: 'Frutas',
      price: 6000,
      unit: ' kg ',
      stock: 12,
      location: '   ',
      imageUrl: 'https://example.com/fresa.jpg',
    });

    page.saveProduct();

    expect(page.productForm.controls.name.hasError('required')).toBe(true);
    expect(page.productForm.controls.description.hasError('minlength')).toBe(true);
    expect(page.productForm.controls.location.hasError('required')).toBe(true);
    expect(page.producerProducts).toHaveLength(1);
  });

  it('rejects malformed or non-http image URLs', () => {
    const fixture = TestBed.createComponent(ProducerPublicationsPage);
    const page = fixture.componentInstance;
    page.productForm.patchValue({
      name: 'Fresa campesina',
      description: 'Fresas frescas cosechadas esta semana.',
      category: 'Frutas',
      price: 6000,
      unit: 'kg',
      stock: 12,
      location: 'La Ceja, Antioquia',
      imageUrl: 'javascript:alert(1)',
    });

    page.saveProduct();

    expect(page.productForm.controls.imageUrl.hasError('url')).toBe(true);
    expect(page.producerProducts).toHaveLength(1);
  });

  it('creates a product in the shared store and persists it', () => {
    const fixture = TestBed.createComponent(ProducerPublicationsPage);
    const page = fixture.componentInstance;
    page.productForm.patchValue({
      name: ' Fresa campesina ',
      description: ' Fresas frescas cosechadas esta semana. ',
      category: 'Frutas',
      price: 6000,
      unit: ' kg ',
      stock: 12,
      location: ' La Ceja, Antioquia ',
      imageUrl: ' https://example.com/fresa.jpg ',
    });

    page.saveProduct();

    const savedProducts = JSON.parse(
      window.localStorage.getItem('agrigo.products') ?? '[]',
    ) as Product[];
    expect(page.producerProducts.some((product) => product.name === 'Fresa campesina')).toBe(true);
    expect(savedProducts.some((product) => product.name === 'Fresa campesina')).toBe(true);
    expect(savedProducts.find((product) => product.name === 'Fresa campesina')).toMatchObject({
      description: 'Fresas frescas cosechadas esta semana.',
      unit: 'kg',
      location: 'La Ceja, Antioquia',
      imageUrl: 'https://example.com/fresa.jpg',
    });
    expect(page.feedback()).toContain('Se publicó');
  });

  it('updates and deletes a publication through the shared store', () => {
    const fixture = TestBed.createComponent(ProducerPublicationsPage);
    const page = fixture.componentInstance;
    const store = TestBed.inject(ProductStore);
    const product = PRODUCT_SEED.find((item) => item.producerName === 'Héctor Riascos');

    if (!product) {
      throw new Error('La semilla debe incluir una publicación de Héctor Riascos.');
    }

    page.editProduct(product);
    page.productForm.patchValue({ name: 'Papa criolla seleccionada' });
    page.saveProduct();
    expect(page.producerProducts[0].name).toBe('Papa criolla seleccionada');

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    page.deleteProduct(page.producerProducts[0]);

    expect(store.products().some((item) => item.id === product.id)).toBe(false);
    expect(JSON.parse(window.localStorage.getItem('agrigo.products') ?? '[]')).toHaveLength(
      PRODUCT_SEED.length - 1,
    );
    expect(page.feedback()).toContain('Se eliminó');
  });
});
