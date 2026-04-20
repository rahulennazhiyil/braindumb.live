import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'about', renderMode: RenderMode.Prerender },
  { path: 'projects', renderMode: RenderMode.Prerender },
  { path: 'playground', renderMode: RenderMode.Prerender },
  { path: 'feed', renderMode: RenderMode.Prerender },
  { path: 'contact', renderMode: RenderMode.Prerender },
  { path: 'privacy', renderMode: RenderMode.Prerender },

  // Dynamic slugs / demos — rendered per-request.
  { path: 'projects/:slug', renderMode: RenderMode.Server },
  { path: 'playground/:demo', renderMode: RenderMode.Server },

  // Admin is auth-gated; always render server-side so the guard can redirect.
  { path: 'admin', renderMode: RenderMode.Server },
  { path: 'admin/**', renderMode: RenderMode.Server },

  { path: '**', renderMode: RenderMode.Server },
];
