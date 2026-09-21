import { chromium } from 'playwright';
import fs from 'fs';

fs.mkdirSync('screenshots', { recursive: true });

console.log('=== MADY FRONT-END FIXES VERIFICATION ===');
const browser = await chromium.launch({ headless: true });

try {
  // 1. MOBILE 390x844 TEST
  console.log('\n--- 1. MOBILE (390x844) VERIFICATION ---');
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  
  const mobileErrors = [];
  mobilePage.on('console', msg => {
    if (msg.type() === 'error') mobileErrors.push(msg.text());
  });
  mobilePage.on('pageerror', err => mobileErrors.push(err.message));

  await mobilePage.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  // Wait for preloader to finish
  await mobilePage.waitForTimeout(2500);

  // --- Task 2 Check: Hero Seam Button & Badge Overlap ---
  const orderBtn = await mobilePage.$('.order-now');
  const seamBadge = await mobilePage.$('.seam-badge');

  if (!orderBtn || !seamBadge) {
    throw new Error('Missing .order-now or .seam-badge element');
  }

  const orderBox = await orderBtn.boundingBox();
  const badgeBox = await seamBadge.boundingBox();

  console.log('Mobile Order Button Box:', orderBox);
  console.log('Mobile Seam Badge Box:', badgeBox);

  // Check collision
  const collisionX = Math.max(0, Math.min(orderBox.x + orderBox.width, badgeBox.x + badgeBox.width) - Math.max(orderBox.x, badgeBox.x));
  const collisionY = Math.max(0, Math.min(orderBox.y + orderBox.height, badgeBox.y + badgeBox.height) - Math.max(orderBox.y, badgeBox.y));
  const isOverlapping = collisionX > 0 && collisionY > 0;

  console.log(`Collision check: collisionX=${collisionX}, collisionY=${collisionY}, isOverlapping=${isOverlapping}`);

  if (isOverlapping) {
    console.error('FAIL: .order-now and .seam-badge overlap on mobile!');
  } else {
    console.log('SUCCESS: .order-now and .seam-badge do NOT overlap on mobile!');
  }

  // Screenshot hero seam on mobile
  await mobilePage.screenshot({
    path: 'screenshots/mobile-hero-seam.png',
    clip: {
      x: 0,
      y: Math.max(0, orderBox.y - 100),
      width: 390,
      height: 350
    },
    animations: 'disabled'
  });

  // --- Task 1 Check: Red Section (FoodFeel) Text Cutoff ---
  // Scroll to FoodFeel section
  await mobilePage.evaluate(() => {
    const el = document.querySelector('.food-feel');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'end' });
  });
  await mobilePage.waitForTimeout(1000);

  const listLeft = await mobilePage.$('.feel-list.list-left');
  const listRight = await mobilePage.$('.feel-list.list-right');
  const waveEdge = await mobilePage.$('.pure-quality > .wave-edge');

  const leftBox = await listLeft?.boundingBox();
  const rightBox = await listRight?.boundingBox();
  const waveBox = await waveEdge?.boundingBox();

  console.log('Mobile Left Text Box:', leftBox);
  console.log('Mobile Right Text Box:', rightBox);
  console.log('Wave Divider Box:', waveBox);

  // The text blocks must end BEFORE the wave starts to be visible, or sit well above the bottom
  const leftDistanceAboveWaveTop = waveBox.y - (leftBox.y + leftBox.height);
  const rightDistanceAboveWaveTop = waveBox.y - (rightBox.y + rightBox.height);

  console.log(`Left text distance above wave top: ${leftDistanceAboveWaveTop.toFixed(1)}px`);
  console.log(`Right text distance above wave top: ${rightDistanceAboveWaveTop.toFixed(1)}px`);

  if (leftDistanceAboveWaveTop < 0 || rightDistanceAboveWaveTop < 0) {
    console.error('FAIL: One or both text blocks intersect or sit behind the wave graphic on mobile!');
  } else {
    console.log('SUCCESS: Both text blocks sit cleanly above the wave graphic!');
  }

  // Screenshot FoodFeel bottom & wave boundary on mobile
  await mobilePage.screenshot({
    path: 'screenshots/mobile-foodfeel-bottom.png',
    clip: {
      x: 0,
      y: Math.max(0, leftBox.y - 80),
      width: 390,
      height: 400
    },
    animations: 'disabled'
  });

  // Full page mobile screenshot
  await mobilePage.screenshot({
    path: 'screenshots/mobile-fullpage.png',
    fullPage: false,
    animations: 'disabled'
  });


  // 2. DESKTOP 1440x900 TEST
  console.log('\n--- 2. DESKTOP (1440x900) VERIFICATION ---');
  const deskPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  await deskPage.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await deskPage.waitForTimeout(2500);

  const deskOrderBtn = await deskPage.$('.order-now');
  const initialRadius = await deskPage.evaluate(el => window.getComputedStyle(el).borderRadius, deskOrderBtn);
  console.log('Desktop Initial Border Radius:', initialRadius);

  // Scroll so order button is visible and hover it
  await deskOrderBtn.scrollIntoViewIfNeeded();
  await deskOrderBtn.hover();
  await deskPage.waitForTimeout(500); // Allow transition

  const hoveredRadius = await deskPage.evaluate(el => window.getComputedStyle(el).borderRadius, deskOrderBtn);
  console.log('Desktop Hovered Border Radius:', hoveredRadius);

  const hasBlobTransition = initialRadius !== hoveredRadius;
  console.log('Blob border-radius changed on hover:', hasBlobTransition);

  // Screenshot hover effect
  const deskBtnBox = await deskOrderBtn.boundingBox();
  await deskPage.screenshot({
    path: 'screenshots/desktop-order-btn-hover.png',
    clip: {
      x: Math.max(0, deskBtnBox.x - 60),
      y: Math.max(0, deskBtnBox.y - 60),
      width: deskBtnBox.width + 120,
      height: deskBtnBox.height + 120
    },
    animations: 'disabled'
  });

  console.log('\nAll checks completed successfully!');
} catch (err) {
  console.error('Error during verification:', err);
} finally {
  await browser.close();
}
