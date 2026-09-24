import { chromium } from 'playwright';

async function verifyMenu() {
  console.log('Launching browser to verify Menu Page...');
  const browser = await chromium.launch({ headless: true });

  const viewports = [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'mobile', width: 390, height: 844 },
    { name: 'tablet', width: 768, height: 1024 }
  ];

  for (const vp of viewports) {
    console.log(`\nTesting viewport ${vp.name} (${vp.width}x${vp.height})...`);
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });

    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('http://localhost:5173/menu', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Verify title
    const title = await page.title();
    console.log(`Page title: "${title}"`);

    // Verify images
    const imagesStatus = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs.map(img => ({
        src: img.src,
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight
      }));
    });
    console.log(`Total images on page: ${imagesStatus.length}`);
    const broken = imagesStatus.filter(i => !i.complete || i.naturalWidth === 0);
    if (broken.length > 0) {
      console.warn('Broken images:', broken);
    } else {
      console.log('All images loaded successfully!');
    }

    // Check horizontal overflow
    const overflow = await page.evaluate(() => {
      return {
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
      };
    });
    console.log(`Overflow check: scrollWidth=${overflow.scrollWidth}, clientWidth=${overflow.clientWidth}, hasOverflow=${overflow.hasOverflow}`);

    // Take full page screenshot
    const screenshotPath = `public/test-menu-${vp.name}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Saved screenshot to ${screenshotPath}`);

    if (errors.length > 0) {
      console.warn('Console/Page errors:', errors);
    }

    await page.close();
  }

  await browser.close();
  console.log('\nVerification complete!');
}

verifyMenu().catch(err => {
  console.error(err);
  process.exit(1);
});
