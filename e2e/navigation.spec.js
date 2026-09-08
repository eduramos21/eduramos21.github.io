import { test, expect } from '@playwright/test';

test.describe('main navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('every nav link brings its section into the viewport', async ({ page }) => {
    const links = page.locator('#nav-menu a[href^="#"]');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const link = links.nth(i);
      const href = await link.getAttribute('href');

      // On mobile the menu has to be opened before its links can be clicked.
      const toggle = page.locator('.nav__toggle');
      if (await toggle.isVisible()) await toggle.click();

      await link.click();
      await expect(page.locator(href)).toBeInViewport();
    }
  });

  test('the nav link for the section on screen is marked current', async ({ page }) => {
    const contact = page.locator('#nav-menu a[href="#contact"]');

    const toggle = page.locator('.nav__toggle');
    if (await toggle.isVisible()) await toggle.click();

    await contact.click();
    await expect(contact).toHaveAttribute('aria-current', 'true');

    // And it moves: back to the top and contact is no longer current.
    await page.locator('.nav__brand').click();
    await expect(contact).not.toHaveAttribute('aria-current', 'true');
  });

  test('the skip link is the first thing the keyboard reaches', async ({ page, browserName }) => {
    test.skip(
      browserName === 'webkit',
      'WebKit moves focus to links with Tab only when the Safari preference '
      + '"press Tab to highlight each item" is on, and the iPhone profile has no '
      + 'keyboard at all. Tab order is asserted in Chromium.',
    );

    await page.keyboard.press('Tab');

    const focused = page.locator(':focus');
    await expect(focused).toHaveClass(/skip-link/);
    await expect(focused).toBeVisible();

    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main$/);
  });
});

test.describe('mobile menu', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('opens and closes', async ({ page }) => {
    await page.goto('/');

    const toggle = page.locator('.nav__toggle');
    const menu = page.locator('#nav-menu');

    await expect(toggle).toBeVisible();
    await expect(menu).toBeHidden();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await toggle.click();
    await expect(menu).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await toggle.click();
    await expect(menu).toBeHidden();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('closes itself after a link is followed', async ({ page }) => {
    await page.goto('/');

    const toggle = page.locator('.nav__toggle');
    const menu = page.locator('#nav-menu');

    await toggle.click();
    await menu.locator('a[href="#work"]').click();

    await expect(menu).toBeHidden();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });
});

test.describe('back to top', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('appears only after the first screenful, and returns to the top', async ({ page }) => {
    await page.goto('/');

    const button = page.locator('.to-top');
    await expect(button).toBeHidden();

    await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2));
    await expect(button).toBeVisible();

    await button.click();
    await expect
      .poll(() => page.evaluate(() => window.pageYOffset), { timeout: 5000 })
      .toBeLessThan(200);
  });

  // The whole reason it is parked in the gutter rather than floated over the corner.
  test('never overlaps the content column', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2));

    const button = page.locator('.to-top');
    await expect(button).toBeVisible();

    const overlaps = await page.evaluate(() => {
      const btn = document.querySelector('.to-top').getBoundingClientRect();
      const hits = [];

      document.querySelectorAll('main *').forEach((node) => {
        if (!node.textContent.trim() && !node.matches('img, svg, table')) return;
        const r = node.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) return;
        const intersects =
          r.left < btn.right && r.right > btn.left && r.top < btn.bottom && r.bottom > btn.top;
        if (intersects) hits.push(node.tagName + '.' + node.className);
      });

      return hits;
    });

    expect(overlaps).toEqual([]);
  });

  test('below the gutter width it becomes a footer link instead', async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 900 });
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2));

    await expect(page.locator('.to-top')).toBeHidden();

    const footerLink = page.locator('.site-footer__top a');
    await expect(footerLink).toBeVisible();
    await expect(footerLink).toHaveAttribute('href', '#main');
  });
});
