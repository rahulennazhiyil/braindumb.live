import { describe, expect, it } from 'vitest';
import { appRoutes } from './app.routes';

describe('appRoutes', () => {
  it('exposes the blueprint top-level paths', () => {
    const paths = appRoutes.map((r) => r.path);
    expect(paths).toEqual([
      '',
      'about',
      'projects',
      'playground',
      'feed',
      'contact',
      'privacy',
      'admin',
      'sudo',
      '**',
    ]);
  });

  it('guards admin with authGuard', () => {
    const admin = appRoutes.find((r) => r.path === 'admin');
    expect(admin?.canActivate).toBeDefined();
    expect(admin?.canActivate).toHaveLength(1);
  });

  it('every non-wildcard route is lazy-loaded', () => {
    for (const route of appRoutes) {
      if (route.path === '**') continue;
      const isLazy =
        typeof route.loadComponent === 'function' ||
        typeof route.loadChildren === 'function';
      expect(isLazy, `route ${route.path} must be lazy-loaded`).toBe(true);
    }
  });

  it('every eager route sets a title', () => {
    for (const route of appRoutes) {
      if (route.loadChildren) continue;
      expect(route.title, `route ${route.path} missing title`).toBeDefined();
    }
  });
});
