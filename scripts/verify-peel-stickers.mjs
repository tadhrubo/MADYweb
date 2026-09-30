import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve(process.cwd(), 'screenshots/peel-stickers');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const INGREDIENTS = [
  'chicken',
  'lettuce',
  'tomato',
  'pickles',
  'red-onion',
  'garlic-sauce',
  'chili',
  'flatbread',
];

async function runVerification() {
  console.log('🚀 Starting Peel Sticker Effect Verification at 1440px wide...\n');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', (err) => {
    consoleErrors.push(err.message);
  });

  // Bypass intro loader
  await page.addInitScript(() => {
    sessionStorage.setItem('hasVisited', 'true');
  });

  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  // Scroll to Pure Quality section
  const pureQuality = page.locator('.pure-quality');
  await pureQuality.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  console.log('📸 Capturing before & after screenshots for the 8 ingredient stickers:');

  let lettuceRestWidth = 0;
  let lettuceHoverWidth = 0;

  for (const slot of INGREDIENTS) {
    const selector = `.sticker-peel-${slot}`;
    const stickerWrapper = page.locator(selector).first();
    
    // Scroll smoothly into view without Playwright stability check
    await page.evaluate((sel) => {
      document.querySelector(sel)?.scrollIntoView({ block: 'center', inline: 'center' });
    }, selector);
    await page.waitForTimeout(200);

    // Measure rest width for lettuce
    if (slot === 'lettuce') {
      const restWidthStr = await stickerWrapper.evaluate((el) => {
        return window.getComputedStyle(el, '::before').getPropertyValue('width');
      });
      lettuceRestWidth = parseFloat(restWidthStr);
    }

    // Capture before screenshot
    const beforeBox = await stickerWrapper.boundingBox();
    if (beforeBox) {
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `before-hover-${slot}.png`),
        clip: {
          x: Math.max(0, beforeBox.x - 20),
          y: Math.max(0, beforeBox.y - 20),
          width: beforeBox.width + 40,
          height: beforeBox.height + 40,
        },
      });
    }

    // Hover with force: true to skip infinite-float stability check
    await stickerWrapper.hover({ force: true });
    await page.waitForTimeout(400); // Allow 0.35s transition to complete

    // Measure hover width for lettuce
    if (slot === 'lettuce') {
      const hoverWidthStr = await stickerWrapper.evaluate((el) => {
        return window.getComputedStyle(el, '::before').getPropertyValue('width');
      });
      lettuceHoverWidth = parseFloat(hoverWidthStr);
    }

    // Capture after screenshot
    if (beforeBox) {
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `after-hover-${slot}.png`),
        clip: {
          x: Math.max(0, beforeBox.x - 20),
          y: Math.max(0, beforeBox.y - 20),
          width: beforeBox.width + 40,
          height: beforeBox.height + 40,
        },
      });
    }

    console.log(`  ✓ ${slot}: before & after captured`);

    // Move mouse away to reset hover state
    await page.mouse.move(0, 0);
    await page.waitForTimeout(200);
  }

  console.log('\n----------------------------------------');
  console.log(`🥬 Lettuce sticker ::before width:`);
  console.log(`   Rest state:  ${lettuceRestWidth.toFixed(2)}px`);
  console.log(`   Hover state: ${lettuceHoverWidth.toFixed(2)}px`);
  const diff = lettuceHoverWidth - lettuceRestWidth;
  console.log(`   Difference:  ${diff.toFixed(2)}px`);
  console.log('----------------------------------------\n');

  if (diff < 8) {
    throw new Error(`FAIL: Computed ::before width difference (${diff.toFixed(2)}px) is less than 8px!`);
  } else {
    console.log(`✅ SUCCESS: Lettuce ::before width difference is ${diff.toFixed(2)}px (>= 8px requirement met!)`);
  }

  // Verify Section 4 doodle stickers
  console.log('\n🎨 Verifying Section 4 Doodle Stickers:');
  const storyBite = page.locator('.story-section, #story-bite').first();
  if (await storyBite.count() > 0) {
    await storyBite.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    const doodles = ['grill', 'roll', 'bite'];
    for (const d of doodles) {
      const doodlePeel = page.locator(`.sticker-peel-${d}`).first();
      const count = await doodlePeel.count();
      console.log(`  ✓ Section 4 doodle sticker [${d}] has StickerPeel: ${count > 0}`);

      if (count > 0) {
        await page.evaluate((sel) => {
          document.querySelector(sel)?.scrollIntoView({ block: 'center', inline: 'center' });
        }, `.sticker-peel-${d}`);
        await page.waitForTimeout(200);

        const box = await doodlePeel.boundingBox();
        if (box) {
          await page.screenshot({
            path: path.join(SCREENSHOT_DIR, `before-hover-doodle-${d}.png`),
            clip: {
              x: Math.max(0, box.x - 20),
              y: Math.max(0, box.y - 20),
              width: box.width + 40,
              height: box.height + 40,
            },
          });

          await doodlePeel.hover({ force: true });
          await page.waitForTimeout(400);

          await page.screenshot({
            path: path.join(SCREENSHOT_DIR, `after-hover-doodle-${d}.png`),
            clip: {
              x: Math.max(0, box.x - 20),
              y: Math.max(0, box.y - 20),
              width: box.width + 40,
              height: box.height + 40,
            },
          });
          console.log(`    Captured doodle-${d} before & after hover screenshots`);
          await page.mouse.move(0, 0);
          await page.waitForTimeout(200);
        }
      }
    }
  }

  // Console error check
  console.log('\n🔍 Console error check:');
  if (consoleErrors.length > 0) {
    console.error('❌ Console errors detected:', consoleErrors);
    throw new Error(`Console errors found: ${consoleErrors.join(', ')}`);
  } else {
    console.log('✅ No console errors detected!');
  }

  console.log('\n🎉 ALL VERIFICATIONS PASSED SUCCESSFULLY!\n');
  await browser.close();
}

runVerification().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
