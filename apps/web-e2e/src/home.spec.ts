import { test, expect } from '@playwright/test';

test.describe('Home — KPR-verse smoke', () => {
  test('boot overlay dismisses and hero renders', async ({ page }) => {
    await page.addInitScript(() => {
      try {
        localStorage.removeItem('rahul-dev:boot-seen');
      } catch {
        // localStorage may be blocked — the boot still plays.
      }
    });

    await page.goto('/');

    const boot = page.locator('app-boot-sequence');
    await expect(boot).toBeVisible();

    await page.click('body');
    await expect(boot).toBeHidden();

    await expect(page.locator('.hero__name')).toBeVisible();
    await expect(
      page.locator('.hero__name app-kinetic-heading [aria-label="Rahul E"]'),
    ).toBeAttached();

    await expect(page.locator('app-hero-graph svg')).toBeAttached({ timeout: 5000 });
  });

  test('return visit skips boot overlay', async ({ page }) => {
    await page.addInitScript(() => {
      try {
        localStorage.setItem('rahul-dev:boot-seen', '1');
      } catch {
        // ignore
      }
    });

    await page.goto('/');

    await expect(page.locator('app-boot-sequence')).toHaveCount(0);
    await expect(page.locator('.hero__name')).toBeVisible();
  });
});
