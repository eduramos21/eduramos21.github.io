import { test, expect } from '@playwright/test';

const CASE_STUDIES = [
  'work/toolshop-contract.html',
  'work/toolshop-checkout.html',
  'work/toolshop-selection.html',
  'work/llm-determinism.html',
];

test.describe('case studies', () => {
  // Every page under work/ has to be reachable from the landing page, and the landing page
  // must not link to one that does not exist. Asserted across the whole page rather than one
  // section, so a case study added to a new section is still covered.
  test('the landing page links to every case study, and to no others', async ({ page }) => {
    await page.goto('/');

    const linked = await page
      .locator('main a[href^="work/"]')
      .evaluateAll((links) => links.map((link) => link.getAttribute('href')));

    expect([...new Set(linked)].sort()).toEqual([...CASE_STUDIES].sort());
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
      await expect(back).toHaveAttribute('href', /^\.\.\/index\.html#/);

      await back.click();
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Eduardo\s+Ramos/);
    });

    test(`${path} states its context up front`, async ({ page }) => {
      await page.goto(path);

      // Every case study opens with a facts block. The toolshop ones cite the decision
      // record they came from; the determinism one has no public repository to cite,
      // because that work is closed source.
      const facts = page.locator('.case__facts');
      await expect(facts).toBeVisible();
      expect(await facts.locator('dt').count()).toBeGreaterThanOrEqual(3);

      if (path.startsWith('work/toolshop-')) {
        const adr = facts.locator('a[href*="/docs/adr/"]');
        await expect(adr).toHaveCount(1);
        await expect(adr).toHaveAttribute('href', /toolshop-automation/);
      }
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
