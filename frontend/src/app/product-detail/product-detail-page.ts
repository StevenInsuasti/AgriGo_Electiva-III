import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
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
  private readonly productId = signal('');
  readonly product = computed(() =>
    this.productStore.products().find((item) => item.id === this.productId()),
  );

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.productId.set(params.get('id') ?? '');
    });
  }
}
