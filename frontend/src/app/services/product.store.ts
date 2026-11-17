import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { PRODUCT_SEED } from '../data/product-seed';
import { MAX_PRODUCT_PRICE_COP, MAX_PRODUCT_STOCK, Product } from '../models/product.model';

const PRODUCT_STORAGE_KEY = 'agrigo.products';

@Injectable({ providedIn: 'root' })
export class ProductStore {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly productState = signal<Product[]>(PRODUCT_SEED);

  readonly products = this.productState.asReadonly();

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadProducts();
    }
  }

  addProduct(product: Product): void {
    const normalizedProduct = this.normalizeProduct(product);

    if (this.products().some((current) => current.id === normalizedProduct.id)) {
      throw new Error(`Ya existe un producto con el identificador "${normalizedProduct.id}".`);
    }

    this.commitProducts([...this.products(), normalizedProduct]);
  }

  updateProduct(updatedProduct: Product): void {
    const normalizedProduct = this.normalizeProduct(updatedProduct);

    const exists = this.products().some((product) => product.id === normalizedProduct.id);
    if (!exists) {
      throw new Error(`No se encontró el producto "${normalizedProduct.id}" para actualizarlo.`);
    }

    this.commitProducts(
      this.products().map((product) =>
        product.id === normalizedProduct.id ? normalizedProduct : product,
      ),
    );
  }

  deleteProduct(productId: string): void {
    const nextProducts = this.products().filter((product) => product.id !== productId);
    if (nextProducts.length === this.products().length) {
      throw new Error(`No se encontró el producto "${productId}" para eliminarlo.`);
    }

    this.commitProducts(nextProducts);
  }

  private loadProducts(): void {
    const savedProducts = window.localStorage.getItem(PRODUCT_STORAGE_KEY);
    if (savedProducts === null) {
      this.saveProducts(PRODUCT_SEED);
      return;
    }

    let parsedProducts: unknown;
    try {
      parsedProducts = JSON.parse(savedProducts) as unknown;
    } catch (error) {
      throw new Error(
        'No se pudieron leer los productos guardados de AgriGo. El valor de localStorage no es JSON válido.',
        { cause: error },
      );
    }

    if (!isProductArray(parsedProducts)) {
      throw new Error('Los productos guardados de AgriGo no tienen el formato esperado.');
    }

    this.productState.set(parsedProducts);
  }

  private commitProducts(products: Product[]): void {
    this.saveProducts(products);
    this.productState.set(products);
  }

  private saveProducts(products: Product[]): void {
    if (isPlatformBrowser(this.platformId)) {
      window.localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(products));
    }
  }

  private normalizeProduct(product: Product): Product {
    const normalizedProduct: Product = {
      ...product,
      name: product.name.trim(),
      description: product.description.trim(),
      category: product.category.trim(),
      unit: product.unit.trim(),
      producerName: product.producerName.trim(),
      location: product.location.trim(),
      imageUrl: product.imageUrl.trim(),
    };

    if (
      !normalizedProduct.name ||
      !normalizedProduct.description ||
      !normalizedProduct.category ||
      !normalizedProduct.unit ||
      !normalizedProduct.producerName ||
      !normalizedProduct.location ||
      !normalizedProduct.imageUrl
    ) {
      throw new Error('Los campos de texto del producto son obligatorios.');
    }

    if (
      !Number.isSafeInteger(normalizedProduct.price) ||
      normalizedProduct.price < 1 ||
      normalizedProduct.price > MAX_PRODUCT_PRICE_COP
    ) {
      throw new Error(`El precio debe ser un entero entre $1 y $${MAX_PRODUCT_PRICE_COP} COP.`);
    }

    if (
      !Number.isSafeInteger(normalizedProduct.stock) ||
      normalizedProduct.stock < 1 ||
      normalizedProduct.stock > MAX_PRODUCT_STOCK
    ) {
      throw new Error(`La cantidad debe ser un entero entre 1 y ${MAX_PRODUCT_STOCK}.`);
    }

    return normalizedProduct;
  }
}

function isProductArray(value: unknown): value is Product[] {
  return Array.isArray(value) && value.every(isProduct);
}

function isProduct(value: unknown): value is Product {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const product = value as Record<string, unknown>;
  return (
    typeof product['id'] === 'string' &&
    typeof product['name'] === 'string' &&
    typeof product['description'] === 'string' &&
    typeof product['category'] === 'string' &&
    typeof product['price'] === 'number' &&
    Number.isFinite(product['price']) &&
    typeof product['unit'] === 'string' &&
    typeof product['stock'] === 'number' &&
    Number.isFinite(product['stock']) &&
    typeof product['producerName'] === 'string' &&
    typeof product['location'] === 'string' &&
    typeof product['imageUrl'] === 'string'
  );
}
