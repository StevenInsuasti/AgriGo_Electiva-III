import { Routes } from '@angular/router';
import { MarketplacePage } from './marketplace/marketplace-page';

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
    path: '**',
    redirectTo: 'marketplace',
  },
];
