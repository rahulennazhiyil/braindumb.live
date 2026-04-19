import { Route } from '@angular/router';

export const projectsRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./projects-index').then((m) => m.ProjectsIndex),
    title: 'Projects · Rahul E',
  },
  {
    path: ':slug',
    loadComponent: () =>
      import('./project-detail').then((m) => m.ProjectDetail),
  },
];
