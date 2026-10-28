
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard')
        .then(m => m.Dashboard)
  },
  {
  path: 'create',
  loadComponent: () =>
    import('./pages/create-reel/create-reel')
      .then(m => m.CreateReel)
  },
  {
    path: 'reels',
    loadComponent: () =>
      import('./pages/reels/reels')
        .then(m => m.Reels)
  },
  {
  path: 'image-to-cartoon',
  loadComponent: () =>
    import('./pages/image-to-cartoon/image-to-cartoon')
      .then(m => m.ImageToCartoon)
  },
  {
    path: 'analytics',
    loadComponent: () =>
      import('./pages/analytics/analytics')
        .then(m => m.Analytics)
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./pages/settings/settings')
        .then(m => m.Settings)
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
