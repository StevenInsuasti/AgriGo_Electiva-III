import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ProductCard } from '../product-card/product-card';
import { ProductStore } from '../services/product.store';

@Component({
  selector: 'app-marketplace-page',
  imports: [CommonModule, ProductCard],
  templateUrl: './marketplace-page.html',
  styleUrl: './marketplace-page.scss',
})
export class MarketplacePage {
  readonly productStore = inject(ProductStore);
}
