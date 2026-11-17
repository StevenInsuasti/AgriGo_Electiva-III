import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartStore } from '../services/cart.store';

@Component({
  selector: 'app-cart-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './cart-page.html',
  styleUrl: './cart-page.scss',
})
export class CartPage {
  readonly cartStore = inject(CartStore);
  readonly actionMessage = signal('');

  increase(productId: string): void {
    this.updateCart(() => this.cartStore.addProduct(productId));
  }

  decrease(productId: string): void {
    this.updateCart(() => this.cartStore.decreaseQuantity(productId));
  }

  remove(productId: string): void {
    this.updateCart(() => this.cartStore.removeProduct(productId));
  }

  private updateCart(action: () => void): void {
    try {
      action();
      this.actionMessage.set('');
    } catch (error) {
      this.actionMessage.set(
        error instanceof Error ? error.message : 'No se pudo actualizar el carrito.',
      );
    }
  }
}
