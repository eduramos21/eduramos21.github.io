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
