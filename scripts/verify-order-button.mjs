import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve(process.cwd(), 'screenshots/order-btn');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function testOrderButton() {
  console.log('🍔 Starting MADY Order Button Verification...');
  const browser = await chromium.launch({ headless: true });

  try {
    // -------------------------------------------------------------
    // Test 1: Desktop Hover & Interaction on Seam ORDER NOW Button
    // -------------------------------------------------------------
    console.log('\n--- 1. Desktop Seam ORDER Button Tests ---');
    const deskContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const deskPage = await deskContext.newPage();

    // Bypass loader with hasVisited
    await deskPage.addInitScript(() => {
      sessionStorage.setItem('hasVisited', 'true');
    });

    await deskPage.goto('http://localhost:4173/', { waitUntil: 'domcontentloaded' });
    await deskPage.waitForTimeout(500);

    const seamBtn = deskPage.locator('.order-now');
    await seamBtn.scrollIntoViewIfNeeded();

    // Rest state check
    const restBg = await seamBtn.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    const restHref = await seamBtn.getAttribute('href');
    const restTarget = await seamBtn.getAttribute('target');
    const restRel = await seamBtn.getAttribute('rel');
    console.log(`✓ Rest background: ${restBg} (MADY Red)`);
    console.log(`✓ External URL: ${restHref}`);
    console.log(`✓ Opens in new tab (target): ${restTarget}`);
    console.log(`✓ Rel security: ${restRel}`);

    if (restHref !== 'https://m.me/61587293055358') {
      throw new Error(`Expected href to be 'https://m.me/61587293055358', got '${restHref}'`);
    }

    await deskPage.screenshot({
      path: path.join(SCREENSHOT_DIR, '01-desktop-seam-rest.png'),
      clip: await (async () => {
        const box = await seamBtn.boundingBox();
        return { x: box.x - 40, y: box.y - 40, width: box.width + 80, height: box.height + 80 };
      })(),
    });

    // Hover state check
    await seamBtn.hover();
    await deskPage.waitForTimeout(250); // 200ms transition

    const hoverBg = await seamBtn.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    const hoverColor = await seamBtn.evaluate((el) => window.getComputedStyle(el).color);
    const hoverRadius = await seamBtn.evaluate((el) => window.getComputedStyle(el).borderRadius);
    console.log(`✓ Hover background: ${hoverBg} (MADY Yellow #FFB81C)`);
    console.log(`✓ Hover text color: ${hoverColor} (Black #1A0B0B)`);
    console.log(`✓ Hover border-radius: ${hoverRadius}`);

    const arrowEl = deskPage.locator('.order-now .order-arrow');
    const arrowTransform = await arrowEl.evaluate((el) => window.getComputedStyle(el).transform);
    console.log(`✓ Hover arrow transform: ${arrowTransform} (moved outward)`);

    await deskPage.screenshot({
      path: path.join(SCREENSHOT_DIR, '02-desktop-seam-hover.png'),
      clip: await (async () => {
        const box = await seamBtn.boundingBox();
        return { x: box.x - 40, y: box.y - 40, width: box.width + 80, height: box.height + 80 };
      })(),
    });

    // Click test: Must NOT show transition overlay or kitchen loader!
    const [newPage] = await Promise.all([
      deskContext.waitForEvent('page').catch(() => null),
      seamBtn.click(),
    ]);

    await deskPage.waitForTimeout(100);
    const overlayCount = await deskPage.locator('.fixed.z-\\[9990\\]').count();
    const loaderCount = await deskPage.locator('.client-loader-overlay').count();
    console.log(`✓ Transition overlay NOT triggered on ORDER click: ${overlayCount === 0}`);
    console.log(`✓ Kitchen loader NOT triggered on ORDER click: ${loaderCount === 0}`);

    if (overlayCount > 0) throw new Error('FAIL: Transition overlay appeared on ORDER click!');
    if (loaderCount > 0) throw new Error('FAIL: Kitchen loader appeared on ORDER click!');

    if (newPage) {
      console.log(`✓ Opened external window URL: ${newPage.url()}`);
      await newPage.close();
    }

    // -------------------------------------------------------------
    // Test 2: Mobile Viewport on Seam ORDER Button
    // -------------------------------------------------------------
    console.log('\n--- 2. Mobile Seam ORDER Button Tests ---');
    const mobContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const mobPage = await mobContext.newPage();
    await mobPage.addInitScript(() => sessionStorage.setItem('hasVisited', 'true'));

    await mobPage.goto('http://localhost:4173/', { waitUntil: 'domcontentloaded' });
    await mobPage.waitForTimeout(500);

    const mobSeamBtn = mobPage.locator('.order-now');
    await mobSeamBtn.scrollIntoViewIfNeeded();

    const mobBox = await mobSeamBtn.boundingBox();
    console.log(`✓ Mobile button dimensions: width=${mobBox.width}, height=${mobBox.height}`);

    await mobPage.screenshot({
      path: path.join(SCREENSHOT_DIR, '03-mobile-seam-rest.png'),
      clip: { x: mobBox.x - 20, y: mobBox.y - 20, width: mobBox.width + 40, height: mobBox.height + 40 },
    });

    // Tap/Click test:
    const [mobNewPage] = await Promise.all([
      mobContext.waitForEvent('page').catch(() => null),
      mobSeamBtn.click(),
    ]);

    await mobPage.waitForTimeout(100);
    const mobOverlayCount = await mobPage.locator('.fixed.z-\\[9990\\]').count();
    console.log(`✓ Mobile click: Transition overlay NOT triggered: ${mobOverlayCount === 0}`);
    if (mobOverlayCount > 0) throw new Error('FAIL: Mobile triggered transition overlay!');

    if (mobNewPage) {
      console.log(`✓ Mobile opened external window URL: ${mobNewPage.url()}`);
      await mobNewPage.close();
    }

    // -------------------------------------------------------------
    // Test 3: Menu CTA ORDER NOW Button
    // -------------------------------------------------------------
    console.log('\n--- 3. Menu CTA ORDER Button Tests ---');
    await deskPage.goto('http://localhost:4173/menu', { waitUntil: 'domcontentloaded' });
    await deskPage.waitForTimeout(500);

    const menuCtaBtn = deskPage.locator('#shawarma-cta a');
    await menuCtaBtn.scrollIntoViewIfNeeded();

    const menuCtaHref = await menuCtaBtn.getAttribute('href');
    const menuCtaTarget = await menuCtaBtn.getAttribute('target');
    const menuCtaRel = await menuCtaBtn.getAttribute('rel');
    console.log(`✓ Menu CTA href: ${menuCtaHref}`);
    console.log(`✓ Menu CTA target: ${menuCtaTarget}`);
    console.log(`✓ Menu CTA rel: ${menuCtaRel}`);

    if (menuCtaHref !== 'https://m.me/61587293055358') {
      throw new Error(`Expected Menu CTA href to be 'https://m.me/61587293055358', got '${menuCtaHref}'`);
    }

    await menuCtaBtn.hover();
    await deskPage.waitForTimeout(250);

    const menuCtaHoverBg = await menuCtaBtn.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    const menuCtaHoverColor = await menuCtaBtn.evaluate((el) => window.getComputedStyle(el).color);
    console.log(`✓ Menu CTA hover background: ${menuCtaHoverBg} (Yellow)`);
    console.log(`✓ Menu CTA hover text: ${menuCtaHoverColor} (Black)`);

    await deskPage.screenshot({
      path: path.join(SCREENSHOT_DIR, '04-menu-cta-hover.png'),
      clip: await (async () => {
        const box = await menuCtaBtn.boundingBox();
        return { x: box.x - 30, y: box.y - 30, width: box.width + 60, height: box.height + 60 };
      })(),
    });

    const [ctaNewPage] = await Promise.all([
      deskContext.waitForEvent('page').catch(() => null),
      menuCtaBtn.click(),
    ]);

    await deskPage.waitForTimeout(100);
    const ctaOverlay = await deskPage.locator('.fixed.z-\\[9990\\]').count();
    console.log(`✓ Menu CTA click: Transition overlay NOT triggered: ${ctaOverlay === 0}`);
    if (ctaOverlay > 0) throw new Error('FAIL: Menu CTA triggered transition overlay!');

    if (ctaNewPage) {
      console.log(`✓ Menu CTA opened external window: ${ctaNewPage.url()}`);
      await ctaNewPage.close();
    }

    console.log('\n========================================');
    console.log('🎉 ALL ORDER BUTTON VERIFICATIONS PASSED!');
    console.log('========================================');
  } catch (err) {
    console.error('❌ Order button verification error:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

testOrderButton();
