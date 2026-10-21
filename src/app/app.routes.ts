import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component')
        .then(m => m.DashboardComponent)
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./pages/create-reel/create-reel.component')
        .then(m => m.CreateReelComponent)
  },
  {
    path: 'reels',
    loadComponent: () =>
      import('./pages/reels/reels.component')
        .then(m => m.ReelsComponent)
  },
  {
    path: 'analytics',
    loadComponent: () =>
      import('./pages/analytics/analytics.component')
        .then(m => m.AnalyticsComponent)
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./pages/settings/settings.component')
        .then(m => m.SettingsComponent)
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' }
];
