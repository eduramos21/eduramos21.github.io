import { test, expect } from '@playwright/test';

test.describe('smoke', () => {
  test('the page loads with the right title and hero heading', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Eduardo Ramos/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Eduardo\s+Ramos/);
    await expect(page.locator('.hero__role')).toHaveText('QA Test Automation Engineer');
  });

  test('no console errors and no failed requests', async ({ page }) => {
    const problems = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') problems.push(`console: ${msg.text()}`);
    });
    page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`));
    page.on('requestfailed', (request) =>
      problems.push(`requestfailed: ${request.url()}`),
    );
    page.on('response', (response) => {
      if (response.status() >= 400) {
        problems.push(`${response.status()}: ${response.url()}`);
      }
    });

    await page.goto('/', { waitUntil: 'networkidle' });

    expect(problems).toEqual([]);
  });

  test('every section the nav points at exists', async ({ page }) => {
    await page.goto('/');

    const hrefs = await page
      .locator('#nav-menu a[href^="#"]')
      .evaluateAll((links) => links.map((link) => link.getAttribute('href')));

    expect(hrefs.length).toBeGreaterThan(0);

    for (const href of hrefs) {
      await expect(page.locator(href), `${href} should exist`).toHaveCount(1);
    }
  });
});
