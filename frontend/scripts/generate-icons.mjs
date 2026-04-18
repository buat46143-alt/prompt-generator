import sharp from 'sharp';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const svgPath = join(__dirname, '../public/icon.svg');
const outDir = join(__dirname, '../public');

const sizes = [192, 512];

for (const size of sizes) {
  const filename = size === 192 ? 'pwa-192x192.png' : 'pwa-512x512.png';
  await sharp(svgPath)
    .resize(size, size)
    .png()
    .toFile(join(outDir, filename));
  console.log(`Created ${filename}`);
}

console.log('Done!');