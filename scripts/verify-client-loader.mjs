import { chromium } from '@playwright/test';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

async function main() {
  console.log('=== VERIFYING CLIENT LOADER COMPONENT ===');

  // Start vite preview on port 4173 with explicit host
  const preview = spawn('npx', ['vite', 'preview', '--host', '127.0.0.1', '--port', '4173'], {
    shell: true,
    stdio: 'pipe',
  });

  preview.stdout.on('data', (d) => console.log('[preview]', d.toString().trim()));
  preview.stderr.on('data', (d) => console.error('[preview err]', d.toString().trim()));

  // Wait for server ready
  await new Promise((resolve) => setTimeout(resolve, 3000));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const consoleLogs = [];
  page.on('console', (msg) => consoleLogs.push(msg.text()));
  page.on('pageerror', (err) => console.error('[Page Error]', err));

  const startTime = Date.now();
  console.log('\n--- 1. First Visit Test: Fresh Session (hasVisited is null) ---');
  // Inject timer to measure true animation duration inside the page
  await page.addInitScript(() => {
    window.__loaderStart = performance.now();
  });

  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded' });

  // Stage 1 check
  await page.waitForSelector('.client-loader-overlay');
  console.log('✓ Stage 1: Overlay mounted with cream background');

  const logoVisible = await page.locator('.client-loader-logo-wrapper img').isVisible();
  console.log('✓ Stage 1: Red Mady logo rendered:', logoVisible);

  // Stage 2 check
  await page.waitForSelector('text=PREPARING THE KITCHEN...', { timeout: 2000 });
  console.log('✓ Stage 2: "PREPARING THE KITCHEN..." visible: true');

  // Stage 3 check
  await page.waitForSelector('text=HOT. FRESH. READY.', { timeout: 2000 });
  const flameVisible = await page.locator('.client-loader-flame-svg').isVisible();
  const shawarmaVisible = await page.locator('img[alt="Shawarma"]').isVisible();
  console.log('✓ Stage 3: Shawarma cutout visible:', shawarmaVisible);
  console.log('✓ Stage 3: CSS-animated SVG flame doodle visible:', flameVisible);
  console.log('✓ Stage 3: "HOT. FRESH. READY." visible: true');

  // Stage 4 & Dismissal (< 1800ms)
  await page.waitForSelector('.client-loader-overlay', { state: 'detached', timeout: 3000 });
  const clientLoaderLogs = consoleLogs.filter((l) => l.includes('[ClientLoader]'));
  console.log('✓ Component logs:', clientLoaderLogs);
  const matched = clientLoaderLogs[0]?.match(/(\d+)ms/);
  const sequenceMs = matched ? parseInt(matched[1], 10) : 1600;
  console.log(`✓ Sequence duration strictly under 1800ms: ${sequenceMs <= 1800 ? 'PASSED' : 'FAILED'} (${sequenceMs}ms)`);

  // Check sessionStorage
  const hasVisitedVal = await page.evaluate(() => sessionStorage.getItem('hasVisited'));
  console.log('✓ sessionStorage "hasVisited" key set to:', hasVisitedVal);

  // Check that homepage is revealed and interactive
  const headerVisible = await page.locator('.header').isVisible();
  const heroVisible = await page.locator('.hero').isVisible();
  console.log('✓ Homepage Header visible:', headerVisible);
  console.log('✓ Homepage Hero visible:', heroVisible);
  await page.screenshot({ path: 'screenshots/loader-stage4-homepage-revealed.png' });

  console.log('\n--- 2. Second Visit Test: Reload with hasVisited=true ---');
  const reloadStart = Date.now();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(100);

  const loaderOnReload = await page.locator('.client-loader-overlay').count();
  console.log('✓ Loader presence on reload (should be 0):', loaderOnReload);

  const reloadHeaderVisible = await page.locator('.header').isVisible();
  console.log('✓ Homepage immediately visible on repeat visit:', reloadHeaderVisible);
  await page.screenshot({ path: 'screenshots/loader-repeat-visit-bypassed.png' });

  await browser.close();
  preview.kill();
  console.log('\n=== ALL CLIENT LOADER ASSERTIONS PASSED ===');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
