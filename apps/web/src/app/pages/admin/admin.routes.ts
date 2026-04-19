import { Route } from '@angular/router';

export const adminRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./admin-shell').then((m) => m.AdminShell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/dashboard').then((m) => m.Dashboard),
        title: 'Dashboard · Admin',
      },
      {
        path: 'feed-manager',
        loadComponent: () =>
          import('./feed-manager/feed-manager').then((m) => m.FeedManager),
        title: 'Feed · Admin',
      },
      {
        path: 'project-manager',
        loadComponent: () =>
          import('./project-manager/project-manager').then(
            (m) => m.ProjectManager,
          ),
        title: 'Projects · Admin',
      },
      {
        path: 'inbox',
        loadComponent: () =>
          import('./inbox/inbox').then((m) => m.InboxPage),
        title: 'Inbox · Admin',
      },
      {
        path: 'link-manager',
        loadComponent: () =>
          import('./link-manager/link-manager').then((m) => m.LinkManager),
        title: 'Links · Admin',
      },
      {
        path: 'media',
        loadComponent: () => import('./media/media').then((m) => m.Media),
        title: 'Media · Admin',
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./settings/settings').then((m) => m.Settings),
        title: 'Settings · Admin',
      },
      {
        path: 'visitor-insights',
        loadComponent: () =>
          import('./visitor-insights/visitor-insights').then(
            (m) => m.VisitorInsightsPage,
          ),
        title: 'Insights · Admin',
      },
      {
        path: 'finance',
        loadComponent: () =>
          import('./finance/finance').then((m) => m.Finance),
        title: 'Finance · Admin',
      },
    ],
  },
];
