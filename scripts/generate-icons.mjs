/**
 * Rasterizes the SVG brand assets into the PNGs the modern web (and
 * social platforms / crawlers) actually use. Run with `npm run icons`.
 *
 * Generated files are committed to git so Netlify never needs to
 * install sharp during a build. Re-run this script whenever any of
 * the source SVGs change.
 *
 * Outputs (all dropped into public/, Vite passthrough-copies them):
 *
 *   logo.png              512x512   schema.org Organization.logo target.
 *                                   Must be a square raster image with
 *                                   minimum 112x112 per Google's guidelines.
 *
 *   apple-touch-icon.png  180x180   iOS home-screen icon.
 *
 *   favicon-32.png        32x32     Browser fallback for tabs that don't
 *                                   accept SVG favicons.
 *
 *   favicon-16.png        16x16     Same, smaller tab/bookmark size.
 *
 *   og-image.png          1200x630  Open Graph / Twitter share card.
 *                                   PNG (not SVG) for reliable rendering
 *                                   on LinkedIn, X, iMessage, Slack, etc.
 *
 * We density-render each SVG at the requested output size so gradient
 * banding and stroke aliasing stay tight at every scale.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'public');

// Each job: src SVG file, output PNG name, target pixel size, and the
// SVG's intrinsic viewBox length on its largest axis (used to compute
// the right `density` so librsvg renders crisply at the target size).
const JOBS = [
    { src: 'favicon.svg',   out: 'logo.png',             width: 512,  height: 512, svgAxis: 48 },
    { src: 'favicon.svg',   out: 'apple-touch-icon.png', width: 180,  height: 180, svgAxis: 48 },
    { src: 'favicon.svg',   out: 'favicon-32.png',       width: 32,   height: 32,  svgAxis: 48 },
    { src: 'favicon.svg',   out: 'favicon-16.png',       width: 16,   height: 16,  svgAxis: 48 },
    { src: 'og-image.svg',  out: 'og-image.png',         width: 1200, height: 630, svgAxis: 1200 }
];

for (const { src, out, width, height, svgAxis } of JOBS) {
    const srcPath = path.join(OUT_DIR, src);
    const outPath = path.join(OUT_DIR, out);
    const svgBuffer = await readFile(srcPath);

    // `density` (DPI) tells librsvg how to scale the vector during
    // rasterization. We aim for the target pixel size directly so we
    // never upscale a small render after the fact.
    const longestSide = Math.max(width, height);
    const density = Math.max(72, Math.round((longestSide / svgAxis) * 72));

    await sharp(svgBuffer, { density })
        .resize(width, height, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png({ compressionLevel: 9 })
        .toFile(outPath);

    console.log(`  ${path.relative(ROOT, outPath)} (${width}x${height}, from ${src})`);
}

console.log(`\n${JOBS.length} assets generated.`);
