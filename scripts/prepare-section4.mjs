import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const DOODLES = [
  { name: 'grill-doodle.png', slot: 'grill' },
  { name: 'roll-doodle.png', slot: 'roll' },
  { name: 'bite-doodle.png', slot: 'bite' }
];

const PHOTOS = [
  { name: 'grill-photo.jpg', slot: 'grill' },
  { name: 'roll-photo.jpg', slot: 'roll' },
  { name: 'bite-photo.jpg', slot: 'bite' }
];

const STICKER_SRC_DIR = path.resolve('asset/stickers');
const STICKER_OUT_DIR = path.resolve('public/assets/section4/stickers');
const PHOTO_SRC_DIR = path.resolve('asset/section4');
const PHOTO_OUT_DIR = path.resolve('public/assets/section4/photos');

fs.mkdirSync(STICKER_OUT_DIR, { recursive: true });
fs.mkdirSync(PHOTO_OUT_DIR, { recursive: true });

async function processDoodle(item) {
  const srcPath = path.join(STICKER_SRC_DIR, item.name);
  if (!fs.existsSync(srcPath)) {
    console.error(`ERROR: Missing doodle source file: ${srcPath}`);
    process.exit(1);
  }

  const outPath = path.join(STICKER_OUT_DIR, item.name);
  const image = sharp(srcPath);

  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const channels = info.channels;
  const totalPixels = info.width * info.height;

  let hasInitialAlpha = false;
  if (channels === 4) {
    let transCount = 0;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 250) transCount++;
    }
    if ((transCount / totalPixels) >= 0.02) {
      hasInitialAlpha = true;
    }
  }

  let method = 'direct-copy';

  if (hasInitialAlpha) {
    fs.copyFileSync(srcPath, outPath);
  } else {
    method = 'white-to-alpha';
    // Convert near-white background to transparent alpha preserving red line art
    const outBuf = Buffer.alloc(info.width * info.height * 4);
    for (let i = 0, j = 0; i < data.length; i += channels, j += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Difference from pure white (255, 255, 255)
      const diff = Math.max(255 - r, 255 - g, 255 - b);
      let alpha = 0;
      if (diff < 8) {
        alpha = 0;
      } else if (diff < 28) {
        alpha = Math.round(((diff - 8) / 20) * 255);
      } else {
        alpha = 255;
      }

      outBuf[j] = r;
      outBuf[j + 1] = g;
      outBuf[j + 2] = b;
      outBuf[j + 3] = alpha;
    }

    await sharp(outBuf, {
      raw: {
        width: info.width,
        height: info.height,
        channels: 4
      }
    })
      .png()
      .toFile(outPath);
  }

  // Verification on output file
  const verifyMeta = await sharp(outPath).metadata();
  const { data: vData } = await sharp(outPath).raw().toBuffer({ resolveWithObject: true });
  let transPixels = 0;
  for (let i = 3; i < vData.length; i += 4) {
    if (vData[i] < 250) transPixels++;
  }
  const transPct = (transPixels / (verifyMeta.width * verifyMeta.height)) * 100;

  if (transPct < 2.0) {
    console.error(`ERROR: Doodle ${item.name} has insufficient transparency: ${transPct.toFixed(2)}%`);
    process.exit(1);
  }

  return {
    name: item.name,
    method,
    dimensions: `${verifyMeta.width}x${verifyMeta.height}`,
    transparency: `${transPct.toFixed(2)}%`,
    status: 'OK'
  };
}

async function processPhoto(item) {
  const srcPath = path.join(PHOTO_SRC_DIR, item.name);
  if (!fs.existsSync(srcPath)) {
    console.error(`ERROR: Missing photo source file: ${srcPath}`);
    process.exit(1);
  }

  const outPath = path.join(PHOTO_OUT_DIR, item.name);
  fs.copyFileSync(srcPath, outPath);

  const meta = await sharp(outPath).metadata();
  return {
    name: item.name,
    dimensions: `${meta.width}x${meta.height}`,
    status: 'OK'
  };
}

async function main() {
  console.log('=== PREPARING SECTION 4 ASSETS ===');
  console.log('\n--- DOODLES ---');
  const doodleResults = [];
  for (const d of DOODLES) {
    const res = await processDoodle(d);
    doodleResults.push(res);
  }
  console.table(doodleResults);

  console.log('\n--- PHOTOS ---');
  const photoResults = [];
  for (const p of PHOTOS) {
    const res = await processPhoto(p);
    photoResults.push(res);
  }
  console.table(photoResults);
  console.log('\nAll Section 4 assets prepared successfully.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
