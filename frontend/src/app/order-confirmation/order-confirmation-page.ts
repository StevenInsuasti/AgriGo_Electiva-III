import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
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
  private readonly orderId = this.route.snapshot.paramMap.get('id');
  private readonly navigationState = this.router.getCurrentNavigation()?.extras.state;

  readonly loadWarning = this.orderStore.loadWarning;
  readonly order = computed(() =>
    this.orderId ? this.orderStore.findOrder(this.orderId) : undefined,
  );
  readonly cartClearWarning =
    typeof this.navigationState?.['cartClearWarning'] === 'string'
      ? this.navigationState['cartClearWarning']
      : '';
}
