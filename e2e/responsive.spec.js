import { test, expect } from '@playwright/test';

const WIDTHS = [360, 768, 1440];
const PAGES = [
  '/',
  'work/toolshop-contract.html',
  'work/toolshop-checkout.html',
  'work/toolshop-selection.html',
  'work/llm-determinism.html',
];

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

  // Wide content has to scroll inside its own box, and whatever box that is has to be
  // reachable from the keyboard — otherwise the part off-screen is unreachable without a
  // mouse. This asserts the invariant rather than one element, so a new wide table or
  // code block on any page is covered without anyone remembering to add a test.
  for (const path of PAGES) {
    test(`${path} at 360px: every sideways-scrolling box is focusable`, async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 900 });
      await page.goto(path);

      const unreachable = await page.evaluate(() => {
        const offenders = [];

        document.querySelectorAll('*').forEach((node) => {
          const overflowX = getComputedStyle(node).overflowX;
          const scrolls =
            (overflowX === 'auto' || overflowX === 'scroll') &&
            node.scrollWidth > node.clientWidth + 1;
          if (!scrolls) return;

          const focusable =
            node.tabIndex >= 0 || node.querySelector('a, button, input, [tabindex]');
          if (!focusable) offenders.push(String(node.className || '') || node.tagName);
        });

        return offenders;
      });

      expect(unreachable).toEqual([]);
    });
  }
});
