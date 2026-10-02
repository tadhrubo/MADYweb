import { chromium } from '@playwright/test';

async function run() {
  console.log('🚀 Starting Next.js Image Optimization Verification...');

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  // Verify Homepage
  console.log('\n--- VERIFYING HOMEPAGE ---');
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 1. Verify Hero Shawarma has priority
  const heroShawarma = await page.$('.food-shell img');
  if (heroShawarma) {
    const loading = await heroShawarma.getAttribute('loading');
    const fetchPriority = await heroShawarma.getAttribute('fetchpriority');
    console.log(`✅ Hero Shawarma Image found! loading: "${loading}", fetchpriority: "${fetchPriority}"`);
    if (loading !== 'eager' || fetchPriority !== 'high') {
      throw new Error(`Hero shawarma missing priority props! loading=${loading}, fetchpriority=${fetchPriority}`);
    }
  } else {
    throw new Error('Hero shawarma image not found!');
  }

  // 2. Verify Header Logo has priority
  const headerLogo = await page.$('header a[aria-label="Mady home"] img');
  if (headerLogo) {
    const loading = await headerLogo.getAttribute('loading');
    const fetchPriority = await headerLogo.getAttribute('fetchpriority');
    console.log(`✅ Header Mady Logo found! loading: "${loading}", fetchpriority: "${fetchPriority}"`);
    if (loading !== 'eager' || fetchPriority !== 'high') {
      throw new Error(`Header logo missing priority props! loading=${loading}, fetchpriority=${fetchPriority}`);
    }
  } else {
    throw new Error('Header logo image not found!');
  }

  // 3. Scroll to Section 3 (Ingredients)
  console.log('\n--- VERIFYING SECTION 3 (PureQuality Ingredients) ---');
  await page.evaluate(() => {
    const el = document.getElementById('quality');
    if (el) el.scrollIntoView();
  });
  await page.waitForTimeout(800);

  const ingredientImgs = await page.$$('.quality-stage .sticker-img');
  console.log(`Found ${ingredientImgs.length} ingredient stickers.`);
  if (ingredientImgs.length < 8) {
    throw new Error(`Expected at least 8 ingredient stickers, found ${ingredientImgs.length}`);
  }
  for (const img of ingredientImgs) {
    const width = await img.getAttribute('width');
    const height = await img.getAttribute('height');
    const filter = await img.evaluate((el) => window.getComputedStyle(el).filter);
    if (!width || !height || !filter.includes('drop-shadow')) {
      throw new Error(`Ingredient sticker missing width/height or drop-shadow! width=${width}, height=${height}, filter=${filter}`);
    }
  }
  console.log('✅ Section 3: All ingredient stickers have explicit dimensions and drop-shadow filter!');

  // 4. Scroll to Section 4 (StoryBite)
  console.log('\n--- VERIFYING SECTION 4 (StoryBite Doodles & Photos) ---');
  await page.evaluate(() => {
    const el = document.getElementById('story');
    if (el) el.scrollIntoView();
  });
  await page.waitForTimeout(800);

  const doodles = await page.$$('.story-doodle-img');
  console.log(`Found ${doodles.length} story doodle stickers.`);
  if (doodles.length < 3) {
    throw new Error(`Expected 3 doodle stickers, found ${doodles.length}`);
  }
  for (const doodle of doodles) {
    const width = await doodle.getAttribute('width');
    const height = await doodle.getAttribute('height');
    const filter = await doodle.evaluate((el) => window.getComputedStyle(el).filter);
    if (!width || !height || !filter.includes('drop-shadow')) {
      throw new Error(`Doodle sticker missing width/height or drop-shadow! width=${width}, height=${height}, filter=${filter}`);
    }
  }
  console.log('✅ Section 4: All doodles have explicit dimensions and drop-shadow filter!');

  // 5. Scroll to Footer (FoodNinja)
  console.log('\n--- VERIFYING FOOTER (FoodNinja) ---');
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  await page.waitForTimeout(800);

  const footerLogo = await page.$('.footer-giant-logo');
  if (footerLogo) {
    const width = await footerLogo.getAttribute('width');
    const height = await footerLogo.getAttribute('height');
    console.log(`✅ Footer Mady logo found with width: ${width}, height: ${height}`);
  } else {
    throw new Error('Footer giant logo not found!');
  }

  // 6. Verify Menu Page
  console.log('\n--- VERIFYING MENU PAGE ---');
  await page.goto('http://localhost:4173/menu', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Check Menu Hero images (Shawarma wrap and Biryani)
  const menuHeroImgs = await page.$$('section.overflow-hidden img');
  console.log(`Found ${menuHeroImgs.length} images in Menu Hero.`);
  for (const img of menuHeroImgs) {
    const fetchPriority = await img.getAttribute('fetchpriority');
    const loading = await img.getAttribute('loading');
    const width = await img.getAttribute('width');
    const height = await img.getAttribute('height');
    console.log(`Menu hero image: width=${width}, height=${height}, loading=${loading}, fetchpriority=${fetchPriority}`);
  }

  // Check Category Images
  const categoryImgs = await page.$$('.group img');
  console.log(`Found ${categoryImgs.length} category images in Menu sections.`);
  if (categoryImgs.length < 5) {
    throw new Error(`Expected at least 5 category images, found ${categoryImgs.length}`);
  }

  // 7. Check Console Errors
  console.log('\n--- CONSOLE ERROR AUDIT ---');
  if (errors.length > 0) {
    console.error('Console errors found:', errors);
    throw new Error(`Found ${errors.length} console errors during audit!`);
  } else {
    console.log('✅ 0 console errors detected across all pages!');
  }

  console.log('\n====================================================');
  console.log('🎉 SITE-WIDE NEXT.JS IMAGE OPTIMIZATION VERIFIED 100%');
  console.log('====================================================');

  await browser.close();
  process.exit(0);
}

run().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
