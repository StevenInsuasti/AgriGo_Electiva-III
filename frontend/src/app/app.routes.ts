import { Routes } from '@angular/router';
import { CartPage } from './cart/cart-page';
import { CheckoutPage } from './checkout/checkout-page';
import { MarketplacePage } from './marketplace/marketplace-page';
import { OrderConfirmationPage } from './order-confirmation/order-confirmation-page';
import { OrderHistoryPage } from './order-history/order-history-page';
import { ProductDetailPage } from './product-detail/product-detail-page';
import { ProducerPublicationsPage } from './producer-publications/producer-publications-page';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'marketplace',
  },
  {
    path: 'marketplace',
    component: MarketplacePage,
  },
  {
    path: 'mis-publicaciones',
    component: ProducerPublicationsPage,
  },
  {
    path: 'carrito',
    component: CartPage,
  },
  {
    path: 'checkout',
    component: CheckoutPage,
  },
  {
    path: 'mis-pedidos',
    component: OrderHistoryPage,
  },
  {
    path: 'pedido/:id',
    component: OrderConfirmationPage,
  },
  {
    path: 'producto/:id',
    component: ProductDetailPage,
  },
  {
    path: '**',
    redirectTo: 'marketplace',
  },
];
