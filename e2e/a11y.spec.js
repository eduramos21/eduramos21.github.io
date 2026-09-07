import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PAGES = [
  '/',
  'work/toolshop-contract.html',
  'work/toolshop-checkout.html',
  'work/toolshop-selection.html',
  '404.html',
];

test.describe('accessibility', () => {
  for (const path of PAGES) {
    test(`${path} has no serious or critical axe violations`, async ({ page }) => {
      await page.goto(path);

      const { violations } = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      const blocking = violations.filter(
        (violation) => violation.impact === 'critical' || violation.impact === 'serious',
      );

      expect(
        blocking.map((violation) => `${violation.id}: ${violation.help}`),
      ).toEqual([]);
    });

    test(`${path} has exactly one h1 and no skipped heading levels`, async ({ page }) => {
      await page.goto(path);

      const levels = await page
        .locator('h1, h2, h3, h4, h5, h6')
        .evaluateAll((nodes) => nodes.map((node) => Number(node.tagName[1])));

      expect(levels.filter((level) => level === 1)).toHaveLength(1);
      expect(levels[0]).toBe(1);

      for (let i = 1; i < levels.length; i++) {
        expect(
          levels[i] - levels[i - 1],
          `heading jumped from h${levels[i - 1]} to h${levels[i]}`,
        ).toBeLessThanOrEqual(1);
      }
    });

    test(`${path} gives every image alt text`, async ({ page }) => {
      await page.goto(path);

      const missing = await page
        .locator('img')
        .evaluateAll((nodes) =>
          nodes
            .filter((node) => node.getAttribute('alt') === null)
            .map((node) => node.getAttribute('src')),
        );

      expect(missing).toEqual([]);
    });
  }

  test('keyboard focus is visible, not suppressed', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');

    const outline = await page.locator(':focus-visible').evaluate((node) => {
      const style = getComputedStyle(node);
      return { width: style.outlineWidth, style: style.outlineStyle };
    });

    expect(outline.style).not.toBe('none');
    expect(parseFloat(outline.width)).toBeGreaterThan(0);
  });

  test('the document declares its language', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });
});
