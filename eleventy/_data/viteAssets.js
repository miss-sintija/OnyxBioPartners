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

const FALLBACK = {
    css: '/styles.css',
    js: '/script.js',
    fontsHref:
        'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@300;400;500;600;700&display=swap'
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
