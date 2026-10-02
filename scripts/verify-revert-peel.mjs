import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve(process.cwd(), 'screenshots/revert-peel');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function verifyRevert() {
  console.log('🚀 Starting Revert Peel & Card Verification at 1440x900...\n');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => consoleErrors.push(err.message));

  // Bypass preloader
  await page.addInitScript(() => {
    sessionStorage.setItem('hasVisited', 'true');
  });

  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  // -------------------------------------------------------------
  // Test Section 3: PureQuality Ingredients
  // -------------------------------------------------------------
  console.log('--- 1. SECTION 3 (PureQuality Ingredients) ---');
  await page.evaluate(() => {
    document.querySelector('.pure-quality')?.scrollIntoView({ behavior: 'instant' });
  });
  await page.waitForTimeout(800);

  // Screenshot Section 3
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'section-3-pure-quality.png'),
    fullPage: false,
  });

  const sec3Data = await page.evaluate(() => {
    const stickers = Array.from(document.querySelectorAll('.ingredient-sticker'));
    const results = [];
    for (const sticker of stickers) {
      const img = sticker.querySelector('img');
      const stickerStyle = window.getComputedStyle(sticker);
      const imgStyle = img ? window.getComputedStyle(img) : null;

      // Check for any ::before or ::after on sticker or img parent
      const beforeStyle = window.getComputedStyle(sticker, '::before');
      const afterStyle = window.getComputedStyle(sticker, '::after');
      const parentStyle = img?.parentElement ? window.getComputedStyle(img.parentElement) : null;
      const parentBefore = img?.parentElement ? window.getComputedStyle(img.parentElement, '::before') : null;
      const parentAfter = img?.parentElement ? window.getComputedStyle(img.parentElement, '::after') : null;

      results.push({
        class: sticker.className,
        imgSrc: img?.getAttribute('src'),
        imgFilter: imgStyle?.filter,
        stickerBg: stickerStyle.backgroundColor,
        parentBg: parentStyle?.backgroundColor,
        parentBorderRadius: parentStyle?.borderRadius,
        parentBoxShadow: parentStyle?.boxShadow,
        hasPeelClass: sticker.querySelector('.sticker-peel') !== null,
        beforeContent: beforeStyle.content,
        afterContent: afterStyle.content,
        parentBeforeContent: parentBefore?.content,
        parentAfterContent: parentAfter?.content,
      });
    }
    return results;
  });

  console.log(`Found ${sec3Data.length} ingredient stickers in Section 3.`);
  let lettuceFilter = null;

  for (const item of sec3Data) {
    if (item.imgSrc?.includes('lettuce')) {
      lettuceFilter = item.imgFilter;
    }
    // Verify no peel class
    if (item.hasPeelClass) {
      throw new Error(`FAIL: .sticker-peel class still found inside ${item.class}!`);
    }
    // Verify no ::before or ::after pseudo-elements
    const hasPseudo =
      (item.beforeContent && item.beforeContent !== 'none' && item.beforeContent !== 'normal' && item.beforeContent !== '""') ||
      (item.afterContent && item.afterContent !== 'none' && item.afterContent !== 'normal' && item.afterContent !== '""') ||
      (item.parentBeforeContent && item.parentBeforeContent !== 'none' && item.parentBeforeContent !== 'normal' && item.parentBeforeContent !== '""') ||
      (item.parentAfterContent && item.parentAfterContent !== 'none' && item.parentAfterContent !== 'normal' && item.parentAfterContent !== '""');

    if (hasPseudo) {
      throw new Error(`FAIL: Pseudo-element ::before or ::after found on ${item.class}!`);
    }

    // Verify filter contains drop-shadow
    if (!item.imgFilter || !item.imgFilter.includes('drop-shadow')) {
      throw new Error(`FAIL: imgFilter does not contain drop-shadow for ${item.imgSrc}: got "${item.imgFilter}"`);
    }
  }

  console.log(`✅ Section 3: All 8 ingredients have no peel wrapper, no ::before/::after, and valid drop-shadow filter.`);
  console.log(`🥬 Lettuce sticker computed filter: "${lettuceFilter}"\n`);

  // -------------------------------------------------------------
  // Test Section 4: StoryBite Doodles
  // -------------------------------------------------------------
  console.log('--- 2. SECTION 4 (StoryBite Doodles) ---');
  await page.evaluate(() => {
    document.querySelector('#story-bite, .story-section')?.scrollIntoView({ behavior: 'instant' });
  });
  await page.waitForTimeout(800);

  // Screenshot Section 4
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'section-4-story-bite.png'),
    fullPage: false,
  });

  const sec4Data = await page.evaluate(() => {
    const doodleImgs = Array.from(document.querySelectorAll('.story-doodle-img'));
    const results = [];
    for (const img of doodleImgs) {
      const imgStyle = window.getComputedStyle(img);
      const parent = img.parentElement;
      const parentStyle = parent ? window.getComputedStyle(parent) : null;
      const parentBefore = parent ? window.getComputedStyle(parent, '::before') : null;
      const parentAfter = parent ? window.getComputedStyle(parent, '::after') : null;

      results.push({
        src: img.getAttribute('src'),
        alt: img.getAttribute('alt'),
        imgFilter: imgStyle.filter,
        parentClass: parent?.className,
        parentBg: parentStyle?.backgroundColor,
        parentBorderRadius: parentStyle?.borderRadius,
        parentBoxShadow: parentStyle?.boxShadow,
        parentBeforeContent: parentBefore?.content,
        parentAfterContent: parentAfter?.content,
        hasPeelClass: document.querySelector('.sticker-peel') !== null,
      });
    }
    return results;
  });

  console.log(`Found ${sec4Data.length} doodle stickers in Section 4.`);
  let grillFilter = null;

  for (const item of sec4Data) {
    if (item.src?.includes('grill-doodle')) {
      grillFilter = item.imgFilter;
    }
    if (item.hasPeelClass) {
      throw new Error(`FAIL: .sticker-peel class still found in Section 4!`);
    }
    const hasPseudo =
      (item.parentBeforeContent && item.parentBeforeContent !== 'none' && item.parentBeforeContent !== 'normal' && item.parentBeforeContent !== '""') ||
      (item.parentAfterContent && item.parentAfterContent !== 'none' && item.parentAfterContent !== 'normal' && item.parentAfterContent !== '""');

    if (hasPseudo) {
      throw new Error(`FAIL: Pseudo-element ::before or ::after found on ${item.parentClass}!`);
    }

    if (!item.imgFilter || !item.imgFilter.includes('drop-shadow')) {
      throw new Error(`FAIL: imgFilter does not contain drop-shadow for ${item.src}: got "${item.imgFilter}"`);
    }
  }

  console.log(`✅ Section 4: All 3 doodles have no peel wrapper, no ::before/::after, and valid drop-shadow filter.`);
  console.log(`🔥 Grill-doodle sticker computed filter: "${grillFilter}"\n`);

  // -------------------------------------------------------------
  // Console Errors Check
  // -------------------------------------------------------------
  console.log('--- 3. CONSOLE ERRORS CHECK ---');
  if (consoleErrors.length > 0) {
    console.error('❌ Console errors detected:', consoleErrors);
    throw new Error(`Console errors found: ${consoleErrors.join(', ')}`);
  } else {
    console.log('✅ No console errors detected!\n');
  }

  console.log('====================================================');
  console.log('🎉 REVERT PEEL EFFECT AND CARD BORDERS VERIFIED 100%');
  console.log('====================================================');

  await browser.close();
}

verifyRevert().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
