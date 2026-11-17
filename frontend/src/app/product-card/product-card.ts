import { CurrencyPipe, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from '../models/product.model';

@Component({
  selector: 'app-product-card',
  imports: [CurrencyPipe, NgIf],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCard {
  @Input({ required: true }) product!: Product;
  @Output() productSelected = new EventEmitter<string>();

  openDetails(): void {
    this.productSelected.emit(this.product.id);
  }
}
