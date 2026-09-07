# eduramos21.github.io

[![e2e](https://github.com/eduramos21/eduramos21.github.io/actions/workflows/e2e.yml/badge.svg)](https://github.com/eduramos21/eduramos21.github.io/actions/workflows/e2e.yml)

My portfolio, live at **<https://eduramos21.github.io/>**.

Plain HTML, CSS and vanilla JavaScript. No framework, no build step, no analytics.
GitHub Pages serves it from `main` at the repository root, so what is in this repository
is exactly what is on the site.

The Playwright suite in [`e2e/`](e2e/) tests this site, and runs on every push and pull
request. That is the point of the QA Lab section: the portfolio of a test automation
engineer should be tested.

## What the suite checks

| Spec | Checks |
|---|---|
| [`smoke`](e2e/smoke.spec.js) | page loads, title, hero heading, no console errors, no failed requests |
| [`navigation`](e2e/navigation.spec.js) | every anchor link brings its section into the viewport, active state follows the scroll, mobile menu opens and closes, skip link is first in the tab order |
| [`case-studies`](e2e/case-studies.spec.js) | each case study answers 200, has one `h1`, a way back, and a link to its decision record |
| [`external-links`](e2e/external-links.spec.js) | LinkedIn and GitHub links are exact, every new-tab link is https with `rel="noopener"`, internal links stay relative, **no page exposes an email address or phone number**, and no page contains an em dash |
| [`responsive`](e2e/responsive.spec.js) | no horizontal scroll at 360, 768 and 1440 pixels, nav collapses on mobile, wide tables scroll inside themselves |
| [`a11y`](e2e/a11y.spec.js) | one `h1`, no skipped heading levels, image alt text, visible keyboard focus, declared language, zero serious or critical axe violations |

Both a desktop Chromium and an iPhone 13 WebKit profile run every spec.

## Running it

```sh
npm ci
npx playwright install --with-deps chromium webkit

npm run serve     # http://127.0.0.1:4173
npm test          # starts the server itself if it is not already up
npm run test:ui   # for debugging a spec
npm run test:prod # the same suite against the deployed site
```

## Layout

```
index.html          the whole page, anchor sections
work/               one case study per file
                      three from an open-source framework I built,
                      one on testing generative-AI output for determinism
css/                reset, then tokens and components
js/main.js          mobile nav and active-section highlight, nothing else
e2e/                the suite above
.nojekyll           so Pages serves these files as they are
```

Smooth scrolling is `scroll-behavior` in CSS rather than JavaScript, and the site has no
dependencies at runtime. Everything in `package.json` is for the tests.
