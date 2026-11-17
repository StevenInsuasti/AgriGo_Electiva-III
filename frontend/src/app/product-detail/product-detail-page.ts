import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CartStore } from '../services/cart.store';
import { ProductStore } from '../services/product.store';

@Component({
  selector: 'app-product-detail-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './product-detail-page.html',
  styleUrl: './product-detail-page.scss',
})
export class ProductDetailPage {
  private readonly route = inject(ActivatedRoute);
  readonly productStore = inject(ProductStore);
  readonly cartStore = inject(CartStore);
  readonly cartMessage = signal('');
  readonly cartActionSucceeded = signal(false);
  private readonly productId = signal('');
  readonly product = computed(() =>
    this.productStore.products().find((item) => item.id === this.productId()),
  );

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.productId.set(params.get('id') ?? '');
    });
  }

  addToCart(productId: string): void {
    this.cartActionSucceeded.set(false);
    try {
      this.cartStore.addProduct(productId);
      this.cartMessage.set('Producto agregado al carrito.');
      this.cartActionSucceeded.set(true);
    } catch (error) {
      this.cartMessage.set(
        error instanceof Error ? error.message : 'No se pudo agregar el producto al carrito.',
      );
    }
  }
}
