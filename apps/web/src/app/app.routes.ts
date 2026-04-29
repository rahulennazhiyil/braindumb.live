import { Route } from '@angular/router';
import { authGuard } from '@rahul-dev/core-auth';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
    title: 'Rahul E · frontend engineer',
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about').then((m) => m.About),
    title: 'About · Rahul E',
  },
  {
    path: 'projects',
    loadChildren: () =>
      import('./pages/projects/projects.routes').then((m) => m.projectsRoutes),
  },
  {
    path: 'playground',
    loadChildren: () =>
      import('./pages/playground/playground.routes').then(
        (m) => m.playgroundRoutes,
      ),
  },
  {
    path: 'feed',
    loadComponent: () => import('./pages/feed/feed').then((m) => m.Feed),
    title: 'Feed · Rahul E',
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./pages/contact/contact').then((m) => m.Contact),
    title: 'Contact · Rahul E',
  },
  {
    path: 'privacy',
    loadComponent: () =>
      import('./pages/privacy/privacy').then((m) => m.Privacy),
    title: 'Privacy · Rahul E',
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./pages/admin/admin.routes').then((m) => m.adminRoutes),
  },
  {
    path: 'sudo',
    loadComponent: () => import('./pages/sudo/sudo').then((m) => m.Sudo),
    title: 'sudo · Rahul E',
  },
  {
    path: '**',
    loadComponent: () =>
      import('./pages/not-found/not-found').then((m) => m.NotFound),
    title: '404 · Rahul E',
  },
];
