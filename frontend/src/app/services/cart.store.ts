import { isPlatformBrowser } from '@angular/common';
import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { CartItem } from '../models/cart-item.model';
import { Product } from '../models/product.model';
import { ProductStore } from './product.store';

const CART_STORAGE_KEY = 'agrigo.cart';

export interface CartLine {
  product: Product;
  quantity: number;
  subtotal: number;
}

@Injectable({ providedIn: 'root' })
export class CartStore {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly productStore = inject(ProductStore);
  private readonly cartState = signal<CartItem[]>([]);

  readonly cartItems = this.cartState.asReadonly();
  readonly lines = computed(() =>
    this.normalizeItems(this.cartItems()).map((item) => {
      const product = this.productStore.products().find((current) => current.id === item.productId);
      if (!product) {
        throw new Error(`No se encontró el producto "${item.productId}" del carrito.`);
      }

      return {
        product,
        quantity: item.quantity,
        subtotal: product.price * item.quantity,
      };
    }),
  );
  readonly total = computed(() => this.lines().reduce((sum, item) => sum + item.subtotal, 0));
  readonly totalQuantity = computed(() =>
    this.lines().reduce((sum, item) => sum + item.quantity, 0),
  );

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadCart();
    }
  }

  addProduct(productId: string): void {
    const product = this.findProduct(productId);
    const currentQuantity =
      this.normalizeItems(this.cartItems()).find((item) => item.productId === productId)
        ?.quantity ?? 0;

    if (product.stock < 1 || currentQuantity >= product.stock) {
      throw new Error(`No hay más unidades disponibles de "${product.name}".`);
    }

    this.commitItems([
      ...this.cartItems().filter((item) => item.productId !== productId),
      { productId, quantity: currentQuantity + 1 },
    ]);
  }

  setQuantity(productId: string, quantity: number): void {
    const product = this.findProduct(productId);
    if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > product.stock) {
      throw new Error(`La cantidad debe ser un número entero entre 1 y ${product.stock}.`);
    }

    this.commitItems([
      ...this.normalizeItems(this.cartItems()).filter((item) => item.productId !== productId),
      { productId, quantity },
    ]);
  }

  decreaseQuantity(productId: string): void {
    const currentQuantity = this.normalizeItems(this.cartItems()).find(
      (item) => item.productId === productId,
    )?.quantity;
    if (currentQuantity === undefined) {
      throw new Error(`El producto "${productId}" no está en el carrito.`);
    }
    if (currentQuantity > 1) {
      this.setQuantity(productId, currentQuantity - 1);
    }
  }

  removeProduct(productId: string): void {
    const nextItems = this.normalizeItems(this.cartItems()).filter(
      (item) => item.productId !== productId,
    );
    if (nextItems.length === this.normalizeItems(this.cartItems()).length) {
      throw new Error(`El producto "${productId}" no está en el carrito.`);
    }

    this.commitItems(nextItems);
  }

  clear(): void {
    this.commitItems([]);
  }

  quantityFor(productId: string): number {
    return (
      this.normalizeItems(this.cartItems()).find((item) => item.productId === productId)
        ?.quantity ?? 0
    );
  }

  private findProduct(productId: string): Product {
    const product = this.productStore.products().find((item) => item.id === productId);
    if (!product) {
      throw new Error(`No se encontró el producto "${productId}".`);
    }
    return product;
  }

  private loadCart(): void {
    const savedCart = window.localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart === null) {
      this.saveCart([]);
      return;
    }

    let parsedCart: unknown;
    try {
      parsedCart = JSON.parse(savedCart) as unknown;
    } catch (error) {
      throw new Error(
        'No se pudo leer el carrito guardado de AgriGo. El valor de localStorage no es JSON válido.',
        { cause: error },
      );
    }

    if (!isCartItemArray(parsedCart)) {
      throw new Error('El carrito guardado de AgriGo no tiene el formato esperado.');
    }

    const normalizedItems = this.normalizeItems(parsedCart);
    this.cartState.set(normalizedItems);
    if (JSON.stringify(parsedCart) !== JSON.stringify(normalizedItems)) {
      this.saveCart(normalizedItems);
    }
  }

  private normalizeItems(items: CartItem[]): CartItem[] {
    const quantities = new Map<string, number>();
    for (const item of items) {
      const product = this.productStore.products().find((current) => current.id === item.productId);
      if (!product || product.stock < 1) {
        continue;
      }

      const nextQuantity = (quantities.get(item.productId) ?? 0) + item.quantity;
      quantities.set(item.productId, Math.min(nextQuantity, product.stock));
    }

    return [...quantities].map(([productId, quantity]) => ({ productId, quantity }));
  }

  private commitItems(items: CartItem[]): void {
    const normalizedItems = this.normalizeItems(items);
    this.saveCart(normalizedItems);
    this.cartState.set(normalizedItems);
  }

  private saveCart(items: CartItem[]): void {
    if (isPlatformBrowser(this.platformId)) {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }
}

function isCartItemArray(value: unknown): value is CartItem[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        typeof item['productId'] === 'string' &&
        typeof item['quantity'] === 'number' &&
        Number.isSafeInteger(item['quantity']) &&
        item['quantity'] > 0,
    )
  );
}
