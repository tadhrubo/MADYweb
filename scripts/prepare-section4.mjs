import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const DOODLES = [
  { name: 'grill-doodle.png', slot: 'grill', envelopeBlur: 80, borderBlur: 26 },
  { name: 'roll-doodle.png', slot: 'roll', envelopeBlur: 60, borderBlur: 24 },
  { name: 'bite-doodle.png', slot: 'bite', envelopeBlur: 90, borderBlur: 26 }
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

async function processDoodleSticker(item) {
  const srcPath = path.join(STICKER_SRC_DIR, item.name);
  if (!fs.existsSync(srcPath)) {
    console.error(`ERROR: Missing doodle source file: ${srcPath}`);
    process.exit(1);
  }

  const outPath = path.join(STICKER_OUT_DIR, item.name);
  const image = sharp(srcPath);
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height, ch = info.channels;

  // 1. Identify red ink pixels
  const inkMask = Buffer.alloc(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * ch;
      const g = data[idx + 1], b = data[idx + 2];
      // Red ink has distinct distance from white
      if (Math.max(255 - g, 255 - b) > 30) {
        inkMask[y * w + x] = 255;
      }
    }
  }

  // 2. Dilate ink to bridge strokes and create outer boundary
  const envelope = await sharp(inkMask, { raw: { width: w, height: h, channels: 1 } })
    .blur(item.envelopeBlur)
    .extractChannel(0)
    .toBuffer();

  const solidMask = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) {
    if (envelope[i] > 2) solidMask[i] = 1;
  }

  // 3. Flood-fill from borders to find exterior background
  const visited = new Uint8Array(w * h);
  const queue = [];
  function enqueue(x, y) {
    const idx = y * w + x;
    if (!visited[idx] && solidMask[idx] === 0) {
      visited[idx] = 1;
      queue.push(idx);
    }
  }
  for (let x = 0; x < w; x++) {
    enqueue(x, 0);
    enqueue(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    enqueue(0, y);
    enqueue(w - 1, y);
  }

  let head = 0;
  while (head < queue.length) {
    const curr = queue[head++];
    const cx = curr % w;
    const cy = Math.floor(curr / w);
    if (cx > 0) enqueue(cx - 1, cy);
    if (cx < w - 1) enqueue(cx + 1, cy);
    if (cy > 0) enqueue(cx, cy - 1);
    if (cy < h - 1) enqueue(cx, cy + 1);
  }

  // Body mask: everything enclosed inside the sticker
  const bodyMask = Buffer.alloc(w * h);
  for (let i = 0; i < w * h; i++) {
    if (!visited[i]) bodyMask[i] = 255;
  }

  // 4. Create smooth white die-cut sticker border
  const borderMask = await sharp(bodyMask, { raw: { width: w, height: h, channels: 1 } })
    .blur(item.borderBlur)
    .extractChannel(0)
    .toBuffer();

  // 5. Composite sticker: Red ink on white background and white die-cut border, transparent outside
  const finalBuf = Buffer.alloc(w * h * 4);
  let transPixels = 0;
  for (let i = 0, j = 0; i < w * h; i++, j += 4) {
    const bmVal = borderMask[i];
    if (bmVal > 15) {
      // Solid white sticker interior & border
      const srcIdx = i * ch;
      const g = data[srcIdx + 1], b = data[srcIdx + 2];
      const isInk = Math.max(255 - g, 255 - b) > 30;
      if (isInk) {
        // Red line art
        finalBuf[j] = data[srcIdx];
        finalBuf[j + 1] = data[srcIdx + 1];
        finalBuf[j + 2] = data[srcIdx + 2];
        finalBuf[j + 3] = 255;
      } else {
        // Solid white sticker background
        finalBuf[j] = 255;
        finalBuf[j + 1] = 255;
        finalBuf[j + 2] = 255;
        finalBuf[j + 3] = 255;
      }
    } else if (bmVal > 2) {
      // Smooth anti-aliased edge
      const alpha = Math.round(((bmVal - 2) / 13) * 255);
      finalBuf[j] = 255;
      finalBuf[j + 1] = 255;
      finalBuf[j + 2] = 255;
      finalBuf[j + 3] = alpha;
      if (alpha < 250) transPixels++;
    } else {
      // Transparent outside
      finalBuf[j] = 0;
      finalBuf[j + 1] = 0;
      finalBuf[j + 2] = 0;
      finalBuf[j + 3] = 0;
      transPixels++;
    }
  }

  // Trim transparent padding and save PNG
  await sharp(finalBuf, { raw: { width: w, height: h, channels: 4 } })
    .trim()
    .png()
    .toFile(outPath);

  // Verification on generated file
  const verifyMeta = await sharp(outPath).metadata();
  const { data: vData } = await sharp(outPath).raw().toBuffer({ resolveWithObject: true });
  let verifiedTrans = 0;
  for (let i = 3; i < vData.length; i += 4) {
    if (vData[i] < 250) verifiedTrans++;
  }
  const transPct = (verifiedTrans / (verifyMeta.width * verifyMeta.height)) * 100;

  if (transPct < 2.0) {
    console.error(`ERROR: Sticker ${item.name} has insufficient transparency: ${transPct.toFixed(2)}%`);
    process.exit(1);
  }

  return {
    name: item.name,
    type: 'die-cut white sticker',
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
  console.log('=== PREPARING SECTION 4 ASSETS (WITH WHITE STICKER BACKGROUND & BORDER) ===');
  console.log('\n--- DOODLE STICKERS ---');
  const stickerResults = [];
  for (const d of DOODLES) {
    const res = await processDoodleSticker(d);
    stickerResults.push(res);
  }
  console.table(stickerResults);

  console.log('\n--- PHOTOS ---');
  const photoResults = [];
  for (const p of PHOTOS) {
    const res = await processPhoto(p);
    photoResults.push(res);
  }
  console.table(photoResults);
  console.log('\nAll Section 4 sticker and photo assets prepared successfully.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
