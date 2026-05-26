import { defineConfig } from 'vite';

// Vite handles the homepage (index.html) and bundles styles.css + script.js.
// Eleventy then runs against the same dist/ to add /blog/ pages, reusing
// the hashed CSS/JS that Vite emits (see eleventy/_data/viteAssets.js).
export default defineConfig({
    root: '.',
    base: '/',
    publicDir: 'public',
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        assetsDir: 'assets',
        sourcemap: false,
        target: 'es2019',
        minify: 'esbuild',
        // Emit dist/.vite/manifest.json so Eleventy can resolve hashed
        // CSS/JS filenames when generating /blog/ pages.
        manifest: true,
        rollupOptions: {
            output: {
                entryFileNames: 'assets/[name]-[hash].js',
                chunkFileNames: 'assets/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash][extname]'
            }
        }
    },
    server: {
        port: 5173,
        open: false,
        host: true
    },
    preview: {
        port: 4173,
        host: true
    }
});
