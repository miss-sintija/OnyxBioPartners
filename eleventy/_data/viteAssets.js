/**
 * Reads dist/.vite/manifest.json (produced by `vite build`) and exposes the
 * hashed CSS/JS paths that the homepage uses, so blog templates can include
 * the same bundle. Falls back to the unhashed source files if the manifest
 * is missing (e.g. running Eleventy alone without a prior Vite build).
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, '../..');
const manifestPath = path.join(projectRoot, 'dist', '.vite', 'manifest.json');

// Fonts are now self-hosted via @font-face in styles.css — no external
// Google Fonts URL needed here.
const FALLBACK = {
    css: '/styles.css',
    js: '/script.js'
};

export default async function viteAssets() {
    try {
        const raw = await readFile(manifestPath, 'utf8');
        const manifest = JSON.parse(raw);

        const entry =
            manifest['index.html'] ||
            Object.values(manifest).find((m) => m.isEntry);

        if (!entry) return FALLBACK;

        const css = entry.css?.[0] ? `/${entry.css[0]}` : FALLBACK.css;
        const js = entry.file ? `/${entry.file}` : FALLBACK.js;

        return { ...FALLBACK, css, js };
    } catch (err) {
        if (err.code !== 'ENOENT') {
            console.warn(
                `[viteAssets] could not read ${manifestPath}: ${err.message}`
            );
        }
        return FALLBACK;
    }
}
