import { Routes } from '@angular/router';
import { MarketplacePage } from './marketplace/marketplace-page';
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
    path: 'producto/:id',
    component: ProductDetailPage,
  },
  {
    path: '**',
    redirectTo: 'marketplace',
  },
];
