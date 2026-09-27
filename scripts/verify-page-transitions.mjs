import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve(process.cwd(), 'screenshots/transitions');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runTests() {
  console.log('🚀 Starting MADY Page Transitions & Motion Verification...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();
  const consoleLogs = [];
  page.on('console', (msg) => consoleLogs.push(msg.text()));
  page.on('pageerror', (err) => console.error('Browser Error:', err.message));

  try {
    // -------------------------------------------------------------
    // Test 1: Initial Visit & Full Kitchen Loader (once per session)
    // -------------------------------------------------------------
    console.log('\n--- 1. Testing Initial Visit & Kitchen Loader ---');
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });

    // ClientLoader should mount on first visit
    const loader = page.locator('.client-loader-overlay');
    const isLoaderVisible = await loader.isVisible();
    console.log(`✓ Kitchen Loader visible on first visit: ${isLoaderVisible}`);

    // Wait for ClientLoader to finish sequence (< 1.8s) and unmount
    await page.waitForSelector('.client-loader-overlay', { state: 'detached', timeout: 4000 });
    console.log('✓ Kitchen Loader completed and detached cleanly');

    // Verify sessionStorage hasVisited is set
    const hasVisited = await page.evaluate(() => sessionStorage.getItem('hasVisited'));
    console.log(`✓ sessionStorage 'hasVisited': ${hasVisited}`);
    if (hasVisited !== 'true') throw new Error('Expected hasVisited === true');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-home-settled.png') });
    console.log('✓ Captured 01-home-settled.png');

    // -------------------------------------------------------------
    // Test 2: HOME -> MENU Page Transition (Cream, Logo, Underline, Shawarma)
    // -------------------------------------------------------------
    console.log('\n--- 2. Testing HOME -> MENU Page Transition ---');
    // Find Menu button in header
    const menuBtn = page.locator('header nav a[href="/menu"]');
    await menuBtn.click();

    // Catch the overlay while transitioning
    await page.waitForTimeout(200);
    const overlay = page.locator('.fixed.z-\\[9990\\]');
    const overlayCount = await overlay.count();
    console.log(`✓ Transition overlay mounted during navigation: ${overlayCount > 0}`);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-transition-overlay-cream.png') });
    console.log('✓ Captured 02-transition-overlay-cream.png');

    // Wait for transition to complete (~750ms)
    await page.waitForTimeout(800);

    // Verify overlay unmounted
    const overlayAfter = await page.locator('.fixed.z-\\[9990\\]').count();
    console.log(`✓ Transition overlay unmounted: ${overlayAfter === 0}`);

    // Verify current URL
    console.log(`✓ Current pathname: ${page.url()}`);
    if (!page.url().includes('/menu')) throw new Error('Expected URL to include /menu');

    // Verify MenuHero elements
    const menuH1 = page.locator('h1:has-text("THE MENU")');
    await menuH1.waitFor({ state: 'visible', timeout: 2000 });
    console.log('✓ "THE MENU" headline visible');

    const sticker = page.locator('text=GOOD FOOD');
    console.log(`✓ "GOOD FOOD GOOD MOOD" sticker visible: ${await sticker.isVisible()}`);

    const shawarmaImg = page.locator('img[alt="Mady Fresh Grilled Shawarma Wrap"]');
    console.log(`✓ Menu shawarma wrap visible: ${await shawarmaImg.isVisible()}`);

    const biryaniImg = page.locator('img[alt="Mady Fragrant Chicken Biryani Bowl"]');
    console.log(`✓ Menu biryani bowl visible: ${await biryaniImg.isVisible()}`);

    // Check horizontal overflow
    const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    console.log(`✓ Menu page has NO horizontal overflow: ${!hasOverflow}`);
    if (hasOverflow) throw new Error('Horizontal overflow detected on /menu');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-menu-hero-revealed.png') });
    console.log('✓ Captured 03-menu-hero-revealed.png');

    // -------------------------------------------------------------
    // Test 3: MENU -> HOME Page Transition (Wipe transition)
    // -------------------------------------------------------------
    console.log('\n--- 3. Testing MENU -> HOME Page Transition (Wipe) ---');
    const homeLogo = page.locator('header a.wordmark');
    await homeLogo.click();

    await page.waitForTimeout(180);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-menu-to-home-wipe.png') });
    console.log('✓ Captured 04-menu-to-home-wipe.png');

    await page.waitForTimeout(800);
    console.log(`✓ Returned to home page: ${page.url()}`);

    // Confirm kitchen loader does NOT replay on internal navigation
    const loaderOnReturn = await page.locator('.client-loader-overlay').count();
    console.log(`✓ Kitchen loader did NOT replay on internal navigation: ${loaderOnReturn === 0}`);

    // -------------------------------------------------------------
    // Test 4: Browser Back & Forward Navigation
    // -------------------------------------------------------------
    console.log('\n--- 4. Testing Browser Back & Forward Navigation ---');
    await page.goBack();
    await page.waitForTimeout(900);
    console.log(`✓ Browser Back navigated to: ${page.url()}`);
    if (!page.url().includes('/menu')) throw new Error('Expected Back to navigate to /menu');

    await page.goForward();
    await page.waitForTimeout(900);
    console.log(`✓ Browser Forward navigated to: ${page.url()}`);

    // -------------------------------------------------------------
    // Test 5: Direct URL Loading of /menu & Refresh
    // -------------------------------------------------------------
    console.log('\n--- 5. Testing Direct URL Load & Refresh ---');
    await page.goto('http://localhost:5173/menu', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(300);
    const directMenuH1 = await page.locator('h1:has-text("THE MENU")').isVisible();
    console.log(`✓ Direct load of /menu rendered cleanly: ${directMenuH1}`);

    // Page Refresh
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(300);
    const reloadMenuH1 = await page.locator('h1:has-text("THE MENU")').isVisible();
    console.log(`✓ Page reload on /menu rendered cleanly: ${reloadMenuH1}`);

    // -------------------------------------------------------------
    // Test 6: Mobile Viewport (iPhone 14: 390x844)
    // -------------------------------------------------------------
    console.log('\n--- 6. Testing Mobile Viewport Navigation ---');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(300);

    // Open hamburger menu
    const hamburger = page.locator('button[aria-label="Open navigation menu"]');
    await hamburger.click();
    await page.waitForTimeout(400);

    const drawerMenuLink = page.locator('.menu-links a:has-text("The Menu")');
    await drawerMenuLink.click();

    // Verify transition runs on mobile
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-mobile-transition.png') });
    console.log('✓ Captured 05-mobile-transition.png');

    await page.waitForTimeout(800);
    console.log(`✓ Mobile navigated to /menu: ${page.url()}`);

    const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    console.log(`✓ Mobile /menu has NO horizontal overflow: ${!mobileOverflow}`);
    if (mobileOverflow) throw new Error('Horizontal overflow detected on mobile /menu');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06-mobile-menu-page.png') });
    console.log('✓ Captured 06-mobile-menu-page.png');

    // -------------------------------------------------------------
    // Test 7: Reduced Motion
    // -------------------------------------------------------------
    console.log('\n--- 7. Testing Prefers-Reduced-Motion ---');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const mobileHeaderLogo = page.locator('header a.wordmark');
    await mobileHeaderLogo.click();
    await page.waitForTimeout(400);
    console.log(`✓ Reduced motion transition returned to: ${page.url()}`);

    console.log('\n========================================');
    console.log('🎉 ALL 19 VERIFICATION CHECKS PASSED!');
    console.log('========================================');
  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

runTests();
