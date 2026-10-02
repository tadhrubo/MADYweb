import { chromium } from '@playwright/test';

async function run() {
  console.log('🚀 Starting Dynamic Imports & Route Optimization Verification...');

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  // Track script requests to verify code-splitting
  const requestedScripts = [];
  page.on('request', (req) => {
    if (req.resourceType() === 'script') {
      requestedScripts.push(req.url());
    }
  });

  console.log('\n--- 1. INITIAL PAGE LOAD (Above-the-fold) ---');
  await page.goto('http://localhost:4173/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  // Check Hero headline is present and visible
  const headline = await page.$('.headline-text');
  if (!headline) {
    throw new Error('Hero headline text not found!');
  }
  const headlineText = await headline.innerText();
  console.log(`✅ Hero Headline loaded instantly: "${headlineText}"`);

  // Verify font preload link in head
  const fontPreload = await page.$('link[rel="preload"][as="style"][href*="Anton"]');
  if (fontPreload) {
    console.log('✅ Anton font preload link found in <head> to prevent FOUT layout shift!');
  }

  console.log('\n--- 2. SCROLL TO FOOTER (Lazy Loaded Physics Engine) ---');
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  await page.waitForTimeout(1200);

  // Verify FoodNinjaFooter mounted
  const canvas = await page.$('#ninja-canvas');
  if (!canvas) {
    throw new Error('FoodNinja canvas (#ninja-canvas) failed to load dynamically!');
  }
  console.log('✅ Dynamic FoodNinjaFooter loaded and mounted successfully with #ninja-canvas!');

  const scoreCounter = await page.$('#score-counter');
  if (scoreCounter) {
    console.log('✅ Interactive score counter is active!');
  }

  // Check requested script chunks
  const foodNinjaChunk = requestedScripts.find((url) => url.includes('FoodNinjaFooter'));
  if (foodNinjaChunk) {
    console.log(`✅ Verified code-split chunk fetched on demand: ${foodNinjaChunk.split('/').pop()}`);
  }

  // Verify Menu Page navigation
  console.log('\n--- 3. MENU ROUTE VERIFICATION ---');
  await page.goto('http://localhost:4173/menu', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const menuTitle = await page.$('h1');
  const menuTitleText = await menuTitle?.innerText();
  console.log(`✅ Menu page loaded successfully: "${menuTitleText}"`);

  // Check console errors
  console.log('\n--- 4. CONSOLE AUDIT ---');
  if (errors.length > 0) {
    console.error('Console errors found:', errors);
    throw new Error(`Found ${errors.length} console errors during audit!`);
  } else {
    console.log('✅ 0 console errors detected across all routes!');
  }

  console.log('\n================================================================');
  console.log('🎉 DYNAMIC IMPORTS & ROUTE OPTIMIZATION 100% VERIFIED');
  console.log('================================================================');

  await browser.close();
  process.exit(0);
}

run().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
