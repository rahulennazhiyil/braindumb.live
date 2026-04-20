import { Route } from '@angular/router';

export const playgroundRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./playground-index').then((m) => m.PlaygroundIndex),
    title: 'Playground · Rahul E',
  },
  {
    path: 'kubernetes',
    loadComponent: () =>
      import('./demos/k8s-cluster').then((m) => m.K8sCluster),
    title: 'Kubernetes · Playground · Rahul E',
  },
  {
    path: 'cicd',
    loadComponent: () =>
      import('./demos/cicd-sankey').then((m) => m.CicdSankey),
    title: 'CI/CD · Playground · Rahul E',
  },
  {
    path: 'bundle',
    loadComponent: () =>
      import('./demos/bundle-treemap').then((m) => m.BundleTreemap),
    title: 'Bundle · Playground · Rahul E',
  },
  {
    path: ':demo',
    loadComponent: () =>
      import('./playground-demo').then((m) => m.PlaygroundDemo),
  },
];
