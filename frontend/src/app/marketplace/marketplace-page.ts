import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
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
  private readonly router = inject(Router);
  readonly searchTerm = signal('');
  readonly selectedCategory = signal('');
  readonly categories = computed(() =>
    [...new Set(this.productStore.products().map((product) => product.category))].sort(),
  );
  readonly filteredProducts = computed(() => {
    const search = this.searchTerm().trim().toLocaleLowerCase();
    const category = this.selectedCategory();

    return this.productStore.products().filter((product) => {
      const matchesSearch =
        search.length === 0 ||
        product.name.toLocaleLowerCase().includes(search) ||
        product.producerName.toLocaleLowerCase().includes(search);
      const matchesCategory = category.length === 0 || product.category === category;

      return matchesSearch && matchesCategory;
    });
  });

  updateSearch(event: Event): void {
    const input = event.target;
    if (input instanceof HTMLInputElement) {
      this.searchTerm.set(input.value);
    }
  }

  updateCategory(event: Event): void {
    const select = event.target;
    if (select instanceof HTMLSelectElement) {
      this.selectedCategory.set(select.value);
    }
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedCategory.set('');
  }

  openProduct(productId: string): void {
    void this.router.navigate(['/producto', productId]);
  }
}
