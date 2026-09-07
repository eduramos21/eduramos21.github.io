import { test, expect } from '@playwright/test';

const WIDTHS = [360, 768, 1440];
const PAGES = ['/', 'work/toolshop-contract.html', 'work/toolshop-selection.html'];

test.describe('responsive', () => {
  for (const width of WIDTHS) {
    for (const path of PAGES) {
      test(`${path} at ${width}px does not scroll horizontally`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(path);

        const overflow = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        }));

        // 1px of tolerance for sub-pixel rounding on fractional layouts.
        expect(
          overflow.scrollWidth - overflow.clientWidth,
          `${path} overflows by ${overflow.scrollWidth - overflow.clientWidth}px`,
        ).toBeLessThanOrEqual(1);
      });
    }
  }

  test('the nav collapses behind a button on a narrow viewport', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 900 });
    await page.goto('/');

    await expect(page.locator('.nav__toggle')).toBeVisible();
    await expect(page.locator('#nav-menu')).toBeHidden();
  });

  test('the nav is laid out in full on a wide viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    await expect(page.locator('.nav__toggle')).toBeHidden();
    await expect(page.locator('#nav-menu')).toBeVisible();
  });

  test('a wide table scrolls inside itself rather than widening the page', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 900 });
    await page.goto('work/toolshop-selection.html');

    const table = page.locator('.case__table');
    await expect(table).toBeVisible();

    const contained = await table.evaluate((node) => {
      const style = getComputedStyle(node);
      return style.overflowX === 'auto' || style.overflowX === 'scroll';
    });
    expect(contained).toBe(true);
  });
});
