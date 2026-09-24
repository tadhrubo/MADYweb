import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const inputDir = 'C:\\Users\\Gateway\\.gemini\\antigravity-ide\\brain\\38a868ba-7ef8-4e0e-8ae9-b2a988434011';
const outputDir = path.resolve('public/assets/menu');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const images = [
  { name: 'hero-shawarma', file: 'menu_hero_shawarma_1790262568881.jpg' },
  { name: 'biryani', file: 'menu_biryani_1790262601080.jpg' },
  { name: 'gravy', file: 'menu_gravy_1790262628995.jpg' },
  { name: 'naan', file: 'menu_naan_1790262662792.jpg' },
  { name: 'kabab', file: 'menu_kabab_1790262692634.jpg' },
  { name: 'cta-shawarma', file: 'menu_cta_shawarma_1790262742682.jpg' }
];

async function removeBackground(inputPath, outputPathPng, outputPathWebp) {
  console.log(`Processing: ${path.basename(inputPath)}...`);
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  const width = metadata.width;
  const height = metadata.height;

  // Extract raw RGBA buffer
  const { data, info } = await image
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const totalPixels = width * height;
  const visited = new Uint8Array(totalPixels);
  const queue = new Int32Array(totalPixels);
  let queueHead = 0;
  let queueTail = 0;

  // Check if pixel at (x, y) is background-like (high brightness, low saturation)
  function isBgPixel(x, y) {
    const idx = (y * width + x) * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const minVal = Math.min(r, g, b);
    const maxVal = Math.max(r, g, b);
    // Background is near white: high minimum, small delta
    return minVal >= 235 && (maxVal - minVal) <= 25;
  }

  // Enqueue border pixels that are white
  for (let x = 0; x < width; x++) {
    if (isBgPixel(x, 0)) {
      const idx = 0 * width + x;
      visited[idx] = 1;
      queue[queueTail++] = idx;
    }
    if (isBgPixel(x, height - 1)) {
      const idx = (height - 1) * width + x;
      visited[idx] = 1;
      queue[queueTail++] = idx;
    }
  }

  for (let y = 0; y < height; y++) {
    if (isBgPixel(0, y)) {
      const idx = y * width + 0;
      if (!visited[idx]) {
        visited[idx] = 1;
        queue[queueTail++] = idx;
      }
    }
    if (isBgPixel(width - 1, y)) {
      const idx = y * width + (width - 1);
      if (!visited[idx]) {
        visited[idx] = 1;
        queue[queueTail++] = idx;
      }
    }
  }

  // 4-way Flood Fill BFS
  while (queueHead < queueTail) {
    const curr = queue[queueHead++];
    const cx = curr % width;
    const cy = Math.floor(curr / width);

    // Neighbors
    const neighbors = [
      cx > 0 ? curr - 1 : -1,
      cx < width - 1 ? curr + 1 : -1,
      cy > 0 ? curr - width : -1,
      cy < height - 1 ? curr + width : -1
    ];

    for (let i = 0; i < 4; i++) {
      const nIdx = neighbors[i];
      if (nIdx !== -1 && !visited[nIdx]) {
        const nx = nIdx % width;
        const ny = Math.floor(nIdx / width);
        if (isBgPixel(nx, ny)) {
          visited[nIdx] = 1;
          queue[queueTail++] = nIdx;
        }
      }
    }
  }

  // Set alpha = 0 for all connected background pixels
  for (let i = 0; i < totalPixels; i++) {
    if (visited[i] === 1) {
      data[i * 4 + 3] = 0;
    }
  }

  // Feather the alpha mask slightly along edges (1-2px)
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      if (visited[idx] === 0) {
        // Check if adjacent to background
        const hasBgNeighbor =
          visited[idx - 1] === 1 ||
          visited[idx + 1] === 1 ||
          visited[idx - width] === 1 ||
          visited[idx + width] === 1;

        if (hasBgNeighbor) {
          const pIdx = idx * 4;
          const r = data[pIdx];
          const g = data[pIdx + 1];
          const b = data[pIdx + 2];
          const minVal = Math.min(r, g, b);
          if (minVal > 220) {
            // Semi-transparent edge transition
            data[pIdx + 3] = Math.round(data[pIdx + 3] * 0.6);
          }
        }
      }
    }
  }

  // Save as PNG
  await sharp(data, { raw: { width, height, channels: 4 } })
    .png({ quality: 95, compressionLevel: 8 })
    .toFile(outputPathPng);

  // Save as WebP
  await sharp(data, { raw: { width, height, channels: 4 } })
    .webp({ quality: 92, effort: 5 })
    .toFile(outputPathWebp);

  console.log(`Saved -> ${outputPathWebp}`);
}

async function main() {
  for (const item of images) {
    const inputPath = path.join(inputDir, item.file);
    const outPng = path.join(outputDir, `${item.name}.png`);
    const outWebp = path.join(outputDir, `${item.name}.webp`);
    await removeBackground(inputPath, outPng, outWebp);
  }
  console.log('All menu food images successfully processed with alpha cutouts!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
