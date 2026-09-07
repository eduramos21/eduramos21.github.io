import { test, expect } from '@playwright/test';

const CASE_STUDIES = [
  'work/toolshop-contract.html',
  'work/toolshop-checkout.html',
  'work/toolshop-selection.html',
];

test.describe('case studies', () => {
  test('the landing page links to every case study, and to no others', async ({ page }) => {
    await page.goto('/');

    const hrefs = await page
      .locator('#work .cards a')
      .evaluateAll((links) => links.map((link) => link.getAttribute('href')));

    expect(hrefs.sort()).toEqual([...CASE_STUDIES].sort());
  });

  for (const path of CASE_STUDIES) {
    test(`${path} answers 200 and has a heading and a way back`, async ({ page, request }) => {
      const response = await request.get(path);
      expect(response.status()).toBe(200);

      await page.goto(path);

      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
      await expect(page.getByRole('heading', { level: 1 })).not.toBeEmpty();

      const back = page.locator('.case__back a');
      await expect(back).toBeVisible();

      await back.click();
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Eduardo\s+Ramos/);
    });

    test(`${path} links to its decision record`, async ({ page }) => {
      await page.goto(path);

      const adr = page.locator('.case__facts a[href*="/docs/adr/"]');
      await expect(adr).toHaveCount(1);
      await expect(adr).toHaveAttribute('href', /toolshop-automation/);
    });
  }

  test('the 404 page renders and offers a way home', async ({ page, request }) => {
    // GitHub Pages serves 404.html with a 404 status; the local static server serves
    // it as an ordinary file. Assert on the content, which is true in both.
    const response = await request.get('404.html');
    expect(response.ok()).toBeTruthy();

    await page.goto('404.html');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('404');
    await expect(page.locator('.case__back a')).toBeVisible();
  });
});
