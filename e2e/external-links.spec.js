import { test, expect } from '@playwright/test';

const PAGES = [
  '/',
  'work/toolshop-contract.html',
  'work/toolshop-checkout.html',
  'work/toolshop-selection.html',
  'work/llm-determinism.html',
];

test.describe('external links', () => {
  test('contact points at the right LinkedIn and GitHub profiles', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('#contact a[href*="linkedin.com"]')).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/eduardo-ramos-anderson/',
    );
    await expect(page.locator('#contact a[href*="github.com"]')).toHaveAttribute(
      'href',
      'https://github.com/eduramos21',
    );
  });

  for (const path of PAGES) {
    test(`${path}: every new-tab link is https and carries rel=noopener`, async ({ page }) => {
      await page.goto(path);

      const links = await page.locator('a[target="_blank"]').evaluateAll((nodes) =>
        nodes.map((node) => ({
          href: node.getAttribute('href'),
          rel: node.getAttribute('rel') || '',
        })),
      );

      expect(links.length).toBeGreaterThan(0);

      for (const link of links) {
        expect(link.href, `${link.href} should be https`).toMatch(/^https:\/\//);
        expect(link.rel, `${link.href} is missing rel=noopener`).toContain('noopener');
      }
    });

    test(`${path}: exposes no email address and no phone number`, async ({ page }) => {
      await page.goto(path);

      // The site deliberately publishes no address. A mailto: appearing here means
      // that decision was reverted by accident.
      await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);

      const html = await page.content();
      expect(html).not.toMatch(/mailto:/i);
      expect(html).not.toMatch(/[\w.+-]+@[\w-]+\.[a-z]{2,}/i);
      expect(html).not.toMatch(/\+\d[\d\s().-]{8,}/);
    });

    // Edu does not write em dashes. Asserted rather than remembered, because the tell of
    // someone else having written a page is exactly the kind of thing that creeps back in.
    test(`${path}: contains no em dashes`, async ({ page }) => {
      await page.goto(path);

      const text = await page.evaluate(() => document.documentElement.outerHTML);
      const found = [...text.matchAll(/.{0,40}\u2014.{0,40}/g)].map((m) => m[0]);

      expect(found).toEqual([]);
    });

    test(`${path}: every internal link is relative, so the site can move`, async ({ page }) => {
      await page.goto(path);

      const internal = await page
        .locator('a[href]:not([target="_blank"])')
        .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href')));

      for (const href of internal) {
        expect(href, `${href} should not be an absolute URL`).not.toMatch(/^https?:\/\//);
      }
    });
  }
});
