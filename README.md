# eduramos21.github.io

Personal portfolio. Plain HTML, CSS and vanilla JavaScript, no build step.
Served by GitHub Pages from `main` at the repository root.

The Playwright suite in `e2e/` tests this site.

## Local

```sh
npm ci
npx playwright install --with-deps chromium webkit
npm run serve   # http://127.0.0.1:4173
npm test
```
