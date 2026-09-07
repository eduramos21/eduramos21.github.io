import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1100, height: 900 } });
await p.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
const box = await p.locator('#ai-quality').boundingBox();
await p.screenshot({ path: process.argv[2] + '/tagline2.png',
  clip: { x: box.x, y: box.y, width: box.width, height: 300 } });
await b.close(); console.log('ok');
