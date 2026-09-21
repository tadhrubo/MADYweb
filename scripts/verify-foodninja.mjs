import { chromium } from 'playwright';
import fs from 'fs';

fs.mkdirSync('screenshots', { recursive: true });

console.log('=== FOOD NINJA FOOTER VERIFICATION SUITE ===');
const browser = await chromium.launch({ headless: true });

try {
  // 1. DESKTOP 1440x900 TEST
  console.log('\n--- 1. DESKTOP 1440x900 TEST ---');
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => consoleErrors.push(err.message));

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Scroll to footer
  await page.evaluate(() => {
    const footer = document.querySelector('.footer-container');
    if (footer) footer.scrollIntoView({ behavior: 'instant' });
  });
  await page.waitForTimeout(1000);

  // Check DOM elements
  const hasFooter = await page.$('.footer-container');
  const hasCanvas = await page.$('#ninja-canvas');
  const hasScore = await page.$('#score-counter');
  const hasLogo = await page.$('.footer-bg-logo');

  console.log('Elements present:', {
    hasFooter: !!hasFooter,
    hasCanvas: !!hasCanvas,
    hasScore: !!hasScore,
    hasLogo: !!hasLogo
  });

  if (!hasFooter || !hasCanvas || !hasScore || !hasLogo) {
    throw new Error('Required Food Ninja footer elements missing from DOM');
  }

  // Initial score
  let initialScore = await page.$eval('#score', el => el.textContent);
  console.log('Initial score:', initialScore);

  // Wait for some items to spawn (wait 2.5 seconds)
  await page.waitForTimeout(2500);

  // Capture overview screenshot
  await page.screenshot({ path: 'screenshots/foodninja-footer-overview.png' });
  console.log('Saved screenshots/foodninja-footer-overview.png');

  // Perform multiple slicing swipes across the canvas arena
  const canvasBox = await page.$eval('#ninja-canvas', el => {
    const r = el.getBoundingClientRect();
    return { x: r.left, y: r.top, width: r.width, height: r.height };
  });
  console.log('Canvas box:', canvasBox);

  // Swipe back and forth across middle area
  for (let s = 0; s < 8; s++) {
    const startX = canvasBox.x + canvasBox.width * (0.2 + (s % 3) * 0.25);
    const startY = canvasBox.y + canvasBox.height * (0.3 + (s % 2) * 0.3);
    const endX = startX + (Math.random() > 0.5 ? 260 : -260);
    const endY = startY + (Math.random() - 0.5) * 120;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    // Drag across with intermediate steps
    for (let step = 1; step <= 8; step++) {
      const curX = startX + (endX - startX) * (step / 8);
      const curY = startY + (endY - startY) * (step / 8);
      await page.mouse.move(curX, curY);
      await page.waitForTimeout(16);
    }
    await page.mouse.up();
    await page.waitForTimeout(300);
  }

  // Check score after slicing swipes
  const slicedScore = await page.$eval('#score', el => el.textContent);
  console.log('Score after slicing attempts:', slicedScore);

  // Take screenshot of sliced state with active particles / split pieces
  await page.screenshot({ path: 'screenshots/foodninja-slicing.png' });
  console.log('Saved screenshots/foodninja-slicing.png');

  if (consoleErrors.length > 0) {
    console.error('Console errors encountered:', consoleErrors);
    throw new Error(`Console errors: ${JSON.stringify(consoleErrors)}`);
  }

  await page.close();

  // 2. MOBILE 390x844 TEST
  console.log('\n--- 2. MOBILE 390x844 TEST ---');
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobilePage.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1200);

  await mobilePage.evaluate(() => {
    document.querySelector('.footer-container')?.scrollIntoView({ behavior: 'instant' });
  });
  await mobilePage.waitForTimeout(1000);

  await mobilePage.screenshot({ path: 'screenshots/foodninja-mobile-390x844.png' });
  console.log('Saved screenshots/foodninja-mobile-390x844.png');

  await mobilePage.close();

  console.log('\n>>> ALL FOOD NINJA TESTS PASSED SUCCESSFULLY! <<<');
} finally {
  await browser.close();
}
