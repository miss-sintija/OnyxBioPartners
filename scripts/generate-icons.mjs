/**
 * Rasterizes public/favicon.svg into the PNGs the modern web (and
 * structured-data crawlers) actually use. Run with `npm run icons`.
 *
 * The generated files are committed to git so Netlify never needs to
 * install sharp during a build. Re-run this script whenever the source
 * SVG changes.
 *
 * Outputs (all dropped into public/, Vite passthrough-copies them):
 *
 *   logo.png              512x512   schema.org Organization.logo target.
 *                                   Must be a square raster image with
 *                                   minimum 112x112 per Google's guidelines.
 *
 *   apple-touch-icon.png  180x180   iOS home-screen icon (already
 *                                   referenced in index.html and the
 *                                   Eleventy SEO partial).
 *
 *   favicon-32.png        32x32     Browser fallback for tabs that don't
 *                                   accept SVG favicons (older Safari,
 *                                   some Android Chrome contexts).
 *
 *   favicon-16.png        16x16     Same, smaller tab/bookmark size.
 *
 * We density-render the SVG at the requested output size so gradient
 * banding and stroke aliasing stay tight at every scale.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'public', 'favicon.svg');
const OUT_DIR = path.join(ROOT, 'public');

const TARGETS = [
    { name: 'logo.png', size: 512 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'favicon-32.png', size: 32 },
    { name: 'favicon-16.png', size: 16 }
];

const svgBuffer = await readFile(SRC);

for (const { name, size } of TARGETS) {
    const out = path.join(OUT_DIR, name);
    // `density` controls how sharp tells librsvg to rasterize. We aim
    // for ~size-pixel resolution rather than upscaling later.
    const density = Math.max(72, Math.round((size / 48) * 72));
    await sharp(svgBuffer, { density })
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png({ compressionLevel: 9 })
        .toFile(out);
    console.log(`  ${path.relative(ROOT, out)} (${size}x${size})`);
}

console.log(`\n${TARGETS.length} icons generated from ${path.relative(ROOT, SRC)}.`);
