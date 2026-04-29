import { test, expect } from '@playwright/test';

const ROUTES: ReadonlyArray<{ path: string; kineticTitle: string }> = [
  { path: '/about', kineticTitle: 'Rahul E' },
  { path: '/projects', kineticTitle: 'Projects' },
  { path: '/playground', kineticTitle: 'Visualization playground' },
  { path: '/feed', kineticTitle: 'Feed' },
  { path: '/contact', kineticTitle: 'Contact' },
  { path: '/privacy', kineticTitle: 'Privacy' },
];

test.describe('Public routes — kinetic-title smoke', () => {
  for (const route of ROUTES) {
    test(`${route.path} renders ${route.kineticTitle}`, async ({ page }) => {
      await page.addInitScript(() => {
        try {
          localStorage.setItem('rahul-dev:boot-seen', '1');
        } catch {
          // ignore
        }
      });

      await page.goto(route.path);

      await expect(
        page.locator(`app-kinetic-heading [aria-label="${route.kineticTitle}"]`),
      ).toBeAttached();
    });
  }
});
