import { Route } from '@angular/router';

export const playgroundRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./playground-index').then((m) => m.PlaygroundIndex),
    title: 'Playground · Rahul E',
  },
  {
    path: ':demo',
    loadComponent: () =>
      import('./playground-demo').then((m) => m.PlaygroundDemo),
  },
];
