import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layouts/main-layout/main-layout')
        .then(m => m.MainLayout),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./pages/home/home')
            .then(m => m.Home),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/settings/settings')
            .then(m => m.Settings),
      },
      {
        path: 'chat',
        loadComponent: () =>
          import('./pages/chat/chat')
            .then(m => m.Chat),
      }
    ]
  }
];
