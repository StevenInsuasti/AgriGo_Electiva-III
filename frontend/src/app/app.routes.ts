import { Routes } from '@angular/router';
import { CartPage } from './cart/cart-page';
import { CheckoutPage } from './checkout/checkout-page';
import { requireDemoRole } from './guards/demo-role.guard';
import { MarketplacePage } from './marketplace/marketplace-page';
import { OrderConfirmationPage } from './order-confirmation/order-confirmation-page';
import { OrderHistoryPage } from './order-history/order-history-page';
import { ProductDetailPage } from './product-detail/product-detail-page';
import { ProducerPublicationsPage } from './producer-publications/producer-publications-page';
import { RoleSelectionPage } from './role-selection/role-selection-page';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'inicio',
  },
  {
    path: 'inicio',
    component: RoleSelectionPage,
  },
  {
    path: 'marketplace',
    component: MarketplacePage,
    canActivate: [requireDemoRole('buyer')],
  },
  {
    path: 'mis-publicaciones',
    component: ProducerPublicationsPage,
    canActivate: [requireDemoRole('producer')],
  },
  {
    path: 'carrito',
    component: CartPage,
    canActivate: [requireDemoRole('buyer')],
  },
  {
    path: 'checkout',
    component: CheckoutPage,
    canActivate: [requireDemoRole('buyer')],
  },
  {
    path: 'mis-pedidos',
    component: OrderHistoryPage,
    canActivate: [requireDemoRole('buyer')],
  },
  {
    path: 'pedido/:id',
    component: OrderConfirmationPage,
    canActivate: [requireDemoRole('buyer')],
  },
  {
    path: 'producto/:id',
    component: ProductDetailPage,
    canActivate: [requireDemoRole('buyer')],
  },
  {
    path: '**',
    redirectTo: 'inicio',
  },
];
