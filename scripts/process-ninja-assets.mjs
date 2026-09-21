import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const SRC_DIR = 'asset/foodNinja';
const PUBLIC_DIR = 'public/assets/foodNinja';

// Ensure directories exist
fs.mkdirSync(SRC_DIR, { recursive: true });
fs.mkdirSync(PUBLIC_DIR, { recursive: true });

console.log('--- STARTING ASSET PROCESSING FOR FOOD NINJA ---');

/**
 * Flood fill from image borders to find background mask
 */
function floodFillBackground(data, width, height, channels, targetColor, tolerance) {
  const isBg = new Uint8Array(width * height);
  const visited = new Uint8Array(width * height);
  const queue = [];

  const [tR, tG, tB] = targetColor;

  function isMatch(x, y) {
    const idx = (y * width + x) * channels;
    const r = data[idx], g = data[idx + 1], b = data[idx + 2];
    const dr = r - tR, dg = g - tG, db = b - tB;
    return Math.sqrt(dr * dr + dg * dg + db * db) <= tolerance;
  }

  // Seed with all border pixels
  for (let x = 0; x < width; x++) {
    if (isMatch(x, 0)) {
      const idx = x;
      visited[idx] = 1;
      isBg[idx] = 1;
      queue.push(idx);
    }
    if (isMatch(x, height - 1)) {
      const idx = (height - 1) * width + x;
      visited[idx] = 1;
      isBg[idx] = 1;
      queue.push(idx);
    }
  }

  for (let y = 0; y < height; y++) {
    if (!visited[y * width] && isMatch(0, y)) {
      const idx = y * width;
      visited[idx] = 1;
      isBg[idx] = 1;
      queue.push(idx);
    }
    const rightIdx = y * width + width - 1;
    if (!visited[rightIdx] && isMatch(width - 1, y)) {
      visited[rightIdx] = 1;
      isBg[rightIdx] = 1;
      queue.push(rightIdx);
    }
  }

  // BFS
  let head = 0;
  while (head < queue.length) {
    const curr = queue[head++];
    const cx = curr % width;
    const cy = Math.floor(curr / width);

    const neighbors = [
      [cx + 1, cy],
      [cx - 1, cy],
      [cx, cy + 1],
      [cx, cy - 1]
    ];

    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nidx = ny * width + nx;
        if (!visited[nidx]) {
          visited[nidx] = 1;
          if (isMatch(nx, ny)) {
            isBg[nidx] = 1;
            queue.push(nidx);
          }
        }
      }
    }
  }

  return isBg;
}

/**
 * Trim RGBA buffer to bounding box of non-transparent pixels
 */
async function trimRgba(rgbaBuffer, width, height, pad = 8) {
  let minX = width, maxX = 0, minY = height, maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = rgbaBuffer[(y * width + x) * 4 + 3];
      if (alpha > 10) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (minX > maxX || minY > maxY) {
    // Empty image fallback
    return sharp(rgbaBuffer, { raw: { width, height, channels: 4 } }).png().toBuffer();
  }

  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(width - 1, maxX + pad);
  maxY = Math.min(height - 1, maxY + pad);

  const cropW = maxX - minX + 1;
  const cropH = maxY - minY + 1;

  return sharp(rgbaBuffer, { raw: { width, height, channels: 4 } })
    .extract({ left: minX, top: minY, width: cropW, height: cropH })
    .png()
    .toBuffer();
}

/**
 * Save buffer to both asset/foodNinja and public/assets/foodNinja
 */
function saveAsset(filename, buffer) {
  fs.writeFileSync(path.join(SRC_DIR, filename), buffer);
  fs.writeFileSync(path.join(PUBLIC_DIR, filename), buffer);
  console.log(`[SAVED] ${filename} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

// ==========================================
// 1. PROCESS BOMB.JPG -> bomb.png & bombWhole.png
// ==========================================
async function processBomb() {
  console.log('\nProcessing bomb.jpg...');
  const { data, info } = await sharp(path.join(SRC_DIR, 'bomb.jpg')).raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  
  // Sample corner grey
  const bgR = data[0], bgG = data[1], bgB = data[2];
  const isBg = floodFillBackground(data, width, height, 3, [bgR, bgG, bgB], 20);

  const rgba = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const srcIdx = i * 3;
    const dstIdx = i * 4;
    rgba[dstIdx] = data[srcIdx];
    rgba[dstIdx + 1] = data[srcIdx + 1];
    rgba[dstIdx + 2] = data[srcIdx + 2];
    rgba[dstIdx + 3] = isBg[i] ? 0 : 255;
  }

  const trimmed = await trimRgba(rgba, width, height, 12);
  saveAsset('bomb.png', trimmed);
  saveAsset('bombWhole.png', trimmed);
}

// ==========================================
// 2. PROCESS BOMBEXPLODE.JPG -> bombExplode.png
// ==========================================
async function processBombExplode() {
  console.log('\nProcessing bombExplode.jpg...');
  const { data, info } = await sharp(path.join(SRC_DIR, 'bombExplode.jpg')).raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;

  // The explosion center is ~[1408, 768].
  // Anything outside bounding box x:[750, 2100], y:[200, 1350] is background.
  const rgba = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x);
      const srcIdx = idx * 3;
      const dstIdx = idx * 4;

      const r = data[srcIdx];
      const g = data[srcIdx + 1];
      const b = data[srcIdx + 2];

      // Inside explosion region
      if (x >= 750 && x <= 2100 && y >= 200 && y <= 1350) {
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const sat = max === 0 ? 0 : (max - min) / max;
        
        // Check if pixel is fire (high sat, orange/yellow)
        if (sat > 0.12 && r > 120 && g > 60) {
          rgba[dstIdx] = r;
          rgba[dstIdx + 1] = g;
          rgba[dstIdx + 2] = b;
          rgba[dstIdx + 3] = 255;
        } else if (max < 80) {
          // Smoke (dark)
          const smokeAlpha = Math.min(255, Math.floor((80 - max) * 3.5));
          rgba[dstIdx] = r;
          rgba[dstIdx + 1] = g;
          rgba[dstIdx + 2] = b;
          rgba[dstIdx + 3] = smokeAlpha;
        } else {
          // Gray background
          rgba[dstIdx] = r;
          rgba[dstIdx + 1] = g;
          rgba[dstIdx + 2] = b;
          rgba[dstIdx + 3] = 0;
        }
      } else {
        rgba[dstIdx] = r;
        rgba[dstIdx + 1] = g;
        rgba[dstIdx + 2] = b;
        rgba[dstIdx + 3] = 0;
      }
    }
  }

  const trimmed = await trimRgba(rgba, width, height, 16);
  saveAsset('bombExplode.png', trimmed);
}

// ==========================================
// 3. PROCESS CHICKENWHOLE.JPG -> chickenWhole.png
// ==========================================
async function processChickenWhole() {
  console.log('\nProcessing chickenWhole.jpg...');
  const { data, info } = await sharp(path.join(SRC_DIR, 'chickenWhole.jpg')).raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;

  // Background is pure black [0, 0, 0]
  const isBg = floodFillBackground(data, width, height, 3, [0, 0, 0], 18);

  const rgba = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const srcIdx = i * 3;
    const dstIdx = i * 4;
    rgba[dstIdx] = data[srcIdx];
    rgba[dstIdx + 1] = data[srcIdx + 1];
    rgba[dstIdx + 2] = data[srcIdx + 2];
    rgba[dstIdx + 3] = isBg[i] ? 0 : 255;
  }

  const trimmed = await trimRgba(rgba, width, height, 12);
  saveAsset('chickenWhole.png', trimmed);
}

// ==========================================
// 4. PROCESS CUT IMAGES SPLITTING (Cut_A & Cut_B)
// ==========================================
async function processCutImageVertical(name, baseFilename, splitX) {
  console.log(`\nProcessing vertical cut: ${baseFilename}...`);
  const { data, info } = await sharp(path.join(SRC_DIR, baseFilename)).raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;

  const bgR = data[0], bgG = data[1], bgB = data[2];
  const isBg = floodFillBackground(data, width, height, 3, [bgR, bgG, bgB], 22);

  const rgbaA = Buffer.alloc(width * height * 4);
  const rgbaB = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const srcIdx = idx * 3;
      const dstIdx = idx * 4;

      if (isBg[idx]) continue;

      if (x < splitX) {
        rgbaA[dstIdx] = data[srcIdx];
        rgbaA[dstIdx + 1] = data[srcIdx + 1];
        rgbaA[dstIdx + 2] = data[srcIdx + 2];
        rgbaA[dstIdx + 3] = 255;
      } else {
        rgbaB[dstIdx] = data[srcIdx];
        rgbaB[dstIdx + 1] = data[srcIdx + 1];
        rgbaB[dstIdx + 2] = data[srcIdx + 2];
        rgbaB[dstIdx + 3] = 255;
      }
    }
  }

  const trimmedA = await trimRgba(rgbaA, width, height, 8);
  const trimmedB = await trimRgba(rgbaB, width, height, 8);

  saveAsset(`${name}Cut_A.png`, trimmedA);
  saveAsset(`${name}Cut_B.png`, trimmedB);
}

// Special pickle processor (handles floor shadow)
async function processPickleCut() {
  console.log('\nProcessing pickleCut.jpg...');
  const { data, info } = await sharp(path.join(SRC_DIR, 'pickleCut.jpg')).raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;

  const rgbaA = Buffer.alloc(width * height * 4);
  const rgbaB = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const srcIdx = idx * 3;
      const dstIdx = idx * 4;

      const r = data[srcIdx];
      const g = data[srcIdx + 1];
      const b = data[srcIdx + 2];

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const sat = max === 0 ? 0 : (max - min) / max;

      // Pickle is greenish/yellowish: sat > 0.12, g > b + 15, and g > 30
      const isPickle = sat > 0.12 && g > b + 15 && g > 30;

      if (!isPickle) continue;

      if (x < 1024) {
        rgbaA[dstIdx] = r;
        rgbaA[dstIdx + 1] = g;
        rgbaA[dstIdx + 2] = b;
        rgbaA[dstIdx + 3] = 255;
      } else {
        rgbaB[dstIdx] = r;
        rgbaB[dstIdx + 1] = g;
        rgbaB[dstIdx + 2] = b;
        rgbaB[dstIdx + 3] = 255;
      }
    }
  }

  const trimmedA = await trimRgba(rgbaA, width, height, 8);
  const trimmedB = await trimRgba(rgbaB, width, height, 8);

  saveAsset('pickleCut_A.png', trimmedA);
  saveAsset('pickleCut_B.png', trimmedB);
}

// Component-based separator for lettuceCut & redChiliCut
async function processCutImageConnected(name, baseFilename, isForegroundFn) {
  console.log(`\nProcessing connected component cut: ${baseFilename}...`);
  const { data, info } = await sharp(path.join(SRC_DIR, baseFilename)).raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;

  // Mark foreground
  const isFg = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const srcIdx = idx * 3;
      if (isForegroundFn(data[srcIdx], data[srcIdx + 1], data[srcIdx + 2], x, y, width, height)) {
        isFg[idx] = 1;
      }
    }
  }

  // Connected components
  const label = new Int32Array(width * height);
  let currentLabel = 1;
  const componentSizes = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (isFg[idx] && label[idx] === 0) {
        const queue = [idx];
        label[idx] = currentLabel;
        let size = 0;
        let head = 0;

        while (head < queue.length) {
          const curr = queue[head++];
          size++;
          const cx = curr % width;
          const cy = Math.floor(curr / width);

          const neighbors = [
            [cx + 1, cy],
            [cx - 1, cy],
            [cx, cy + 1],
            [cx, cy - 1]
          ];

          for (const [nx, ny] of neighbors) {
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nidx = ny * width + nx;
              if (isFg[nidx] && label[nidx] === 0) {
                label[nidx] = currentLabel;
                queue.push(nidx);
              }
            }
          }
        }

        componentSizes.push({ label: currentLabel, size });
        currentLabel++;
      }
    }
  }

  // Sort top 2 largest components
  componentSizes.sort((a, b) => b.size - a.size);
  const compA = componentSizes[0]?.label;
  const compB = componentSizes[1]?.label;

  console.log(`Components for ${name}: label A=${compA} (${componentSizes[0]?.size} px), label B=${compB} (${componentSizes[1]?.size} px)`);

  const rgbaA = Buffer.alloc(width * height * 4);
  const rgbaB = Buffer.alloc(width * height * 4);

  for (let i = 0; i < width * height; i++) {
    const srcIdx = i * 3;
    const dstIdx = i * 4;
    if (label[i] === compA) {
      rgbaA[dstIdx] = data[srcIdx];
      rgbaA[dstIdx + 1] = data[srcIdx + 1];
      rgbaA[dstIdx + 2] = data[srcIdx + 2];
      rgbaA[dstIdx + 3] = 255;
    } else if (label[i] === compB) {
      rgbaB[dstIdx] = data[srcIdx];
      rgbaB[dstIdx + 1] = data[srcIdx + 1];
      rgbaB[dstIdx + 2] = data[srcIdx + 2];
      rgbaB[dstIdx + 3] = 255;
    }
  }

  const trimmedA = await trimRgba(rgbaA, width, height, 8);
  const trimmedB = await trimRgba(rgbaB, width, height, 8);

  saveAsset(`${name}Cut_A.png`, trimmedA);
  saveAsset(`${name}Cut_B.png`, trimmedB);
}

// Copy whole transparent PNGs to standardize naming
async function standardizeWholePngs() {
  console.log('\nStandardizing whole ingredients...');
  const mappings = [
    { from: 'flatbread.png', to: 'flatbreadWhole.png' },
    { from: 'lettuce.png', to: 'lettuceWhole.png' },
    { from: 'red-onion.png', to: 'onionWhole.png' },
    { from: 'pickles.png', to: 'pickleWhole.png' },
    { from: 'chili.png', to: 'redChiliWhole.png' },
    { from: 'tomato.png', to: 'tomatoWhole.png' },
  ];

  for (const { from, to } of mappings) {
    const fromPath = path.join(SRC_DIR, from);
    if (fs.existsSync(fromPath)) {
      const buffer = fs.readFileSync(fromPath);
      saveAsset(to, buffer);
    }
  }
}

// Execute all processing
await processBomb();
await processBombExplode();
await processChickenWhole();

// Vertical cuts
await processCutImageVertical('chicken', 'chickenCut.jpg', 1024);
await processCutImageVertical('flatbread', 'flatbreadCut.jpg', 1380);
await processCutImageVertical('onion', 'onionCut.jpg', 1024);
await processPickleCut();

// Connected cuts
await processCutImageConnected('lettuce', 'lettuceCut.jpg', (r, g, b) => {
  const dr = r - 130, dg = g - 130, db = b - 130;
  return Math.sqrt(dr * dr + dg * dg + db * db) > 22 && g > b + 10;
});

await processCutImageConnected('redChili', 'redChiliCut.jpg', (r, g, b) => {
  const dr = r - 136, dg = g - 136, db = b - 136;
  return Math.sqrt(dr * dr + dg * dg + db * db) > 20;
});

await standardizeWholePngs();

console.log('\n--- ASSET PROCESSING COMPLETE! ---');
