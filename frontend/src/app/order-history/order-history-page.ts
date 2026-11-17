import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OrderStore } from '../services/order.store';

@Component({
  selector: 'app-order-history-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './order-history-page.html',
  styleUrl: './order-history-page.scss',
})
export class OrderHistoryPage {
  private readonly orderStore = inject(OrderStore);

  readonly loadWarning = this.orderStore.loadWarning;
  readonly orders = computed(() =>
    [...this.orderStore.orders()].sort(
      (first, second) => Date.parse(second.createdAt) - Date.parse(first.createdAt),
    ),
  );
}
