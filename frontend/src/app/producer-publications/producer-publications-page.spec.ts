import { TestBed } from '@angular/core/testing';
import { PRODUCT_SEED } from '../data/product-seed';
import { Product } from '../models/product.model';
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

  it('rejects non-positive prices and fractional stock quantities', () => {
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

  it('creates a product in the shared store and persists it', () => {
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
      imageUrl: 'https://example.com/fresa.jpg',
    });

    page.saveProduct();

    const savedProducts = JSON.parse(
      window.localStorage.getItem('agrigo.products') ?? '[]',
    ) as Product[];
    expect(page.producerProducts.some((product) => product.name === 'Fresa campesina')).toBe(true);
    expect(savedProducts.some((product) => product.name === 'Fresa campesina')).toBe(true);
    expect(page.feedback()).toContain('Se publicó');
  });

  it('updates and deletes a publication through the shared store', () => {
    const fixture = TestBed.createComponent(ProducerPublicationsPage);
    const page = fixture.componentInstance;
    const store = TestBed.inject(ProductStore);
    const product = PRODUCT_SEED.find((item) => item.producerName === 'Héctor Ramírez');

    if (!product) {
      throw new Error('La semilla debe incluir una publicación de Héctor Ramírez.');
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
