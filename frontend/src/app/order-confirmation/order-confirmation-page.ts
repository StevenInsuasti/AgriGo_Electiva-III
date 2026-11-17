import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrderStore } from '../services/order.store';

@Component({
  selector: 'app-order-confirmation-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './order-confirmation-page.html',
  styleUrl: './order-confirmation-page.scss',
})
export class OrderConfirmationPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly orderStore = inject(OrderStore);
  private readonly orderId = signal(this.route.snapshot.paramMap.get('id'));
  private readonly navigationState = this.router.getCurrentNavigation()?.extras.state;

  readonly loadWarning = this.orderStore.loadWarning;
  readonly order = computed(() => {
    const orderId = this.orderId();
    return orderId ? this.orderStore.findOrder(orderId) : undefined;
  });
  readonly cartClearWarning = signal(
    typeof this.navigationState?.['cartClearWarning'] === 'string'
      ? this.navigationState['cartClearWarning']
      : '',
  );

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const orderId = params.get('id');
      if (orderId !== this.orderId()) {
        this.cartClearWarning.set('');
      }
      this.orderId.set(orderId);
    });
  }
}
