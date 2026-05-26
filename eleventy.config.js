/**
 * Eleventy configuration.
 *
 * Two modes:
 *
 *   1. Production build (`eleventy`, run after `vite build`).
 *      Vite owns `dist/index.html`, hashed CSS, and hashed JS. Eleventy
 *      writes only the blog pages and copies the /admin/ folder through,
 *      and ignores the source homepage so it doesn't overwrite Vite's
 *      hashed version.
 *
 *   2. Local development (`eleventy --serve`).
 *      Vite is not running. Eleventy is the only dev server, so it must
 *      also serve the homepage, styles.css, script.js, and uploaded
 *      media. We passthrough-copy them in this mode only.
 *
 * Inputs Eleventy cares about either way:
 *   - posts/*.md          -> /blog/[slug]/index.html
 *   - eleventy/blog.njk   -> /blog/index.html
 *   - admin/**            -> /admin/** (passthrough)
 */
const isServe =
    process.env.ELEVENTY_RUN_MODE === 'serve' ||
    process.argv.includes('--serve') ||
    process.argv.includes('--watch');

export default function (eleventyConfig) {
    eleventyConfig.setTemplateFormats(['md', 'njk']);

    // Things that should never be processed as templates.
    eleventyConfig.ignores.add('README.md');
    eleventyConfig.ignores.add('node_modules/**');
    eleventyConfig.ignores.add('dist/**');
    eleventyConfig.ignores.add('public/**');
    eleventyConfig.ignores.add('admin/**');

    if (!isServe) {
        // In production, Vite emits the hashed homepage. Don't let
        // Eleventy clobber it.
        eleventyConfig.ignores.add('index.html');
    }

    // Decap CMS interface — always passthrough so /admin/ resolves.
    eleventyConfig.addPassthroughCopy({ admin: 'admin' });

    if (isServe) {
        // Vite is not running in dev. Pass the source homepage and
        // Vite-owned static files through so the Eleventy dev server
        // can render the complete site at one URL — including links
        // from the homepage to /blog/ and /admin/.
        eleventyConfig.addPassthroughCopy('index.html');
        eleventyConfig.addPassthroughCopy('styles.css');
        eleventyConfig.addPassthroughCopy('script.js');
        // Everything in public/ (favicon, og-image, robots.txt, uploads,
        // …) lands at the site root. In production Vite handles this via
        // publicDir.
        eleventyConfig.addPassthroughCopy({ 'public': '/' });

        eleventyConfig.setServerOptions({
            port: 5173,
            showAllHosts: false,
            showVersion: false
        });
    }

    // Format helpers used in templates.
    // readableDate emits DD.MM.YYYY (EU numeric style) so all rendered
    // dates across the site stay consistent with the legal pages. The
    // raw ISO date stays available via the isoDate filter for <time>
    // attributes and JSON-LD.
    eleventyConfig.addFilter('readableDate', (value) => {
        if (!value) return '';
        const d = new Date(value);
        const dd = String(d.getUTCDate()).padStart(2, '0');
        const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
        const yyyy = d.getUTCFullYear();
        return `${dd}.${mm}.${yyyy}`;
    });

    eleventyConfig.addFilter('isoDate', (value) => {
        if (!value) return '';
        return new Date(value).toISOString();
    });

    eleventyConfig.addFilter('excerptify', (value, length = 200) => {
        if (!value) return '';
        // Strip markdown / HTML loosely for card excerpts.
        const text = String(value)
            .replace(/!\[[^\]]*]\([^)]*\)/g, '')
            .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
            .replace(/[#>*_`~-]/g, '')
            .replace(/<[^>]+>/g, '')
            .replace(/\s+/g, ' ')
            .trim();
        if (text.length <= length) return text;
        return text.slice(0, length).replace(/\s+\S*$/, '') + '…';
    });

    return {
        dir: {
            input: '.',
            output: 'dist',
            includes: 'eleventy/_includes',
            data: 'eleventy/_data'
        },
        markdownTemplateEngine: 'njk',
        htmlTemplateEngine: 'njk',
        templateFormats: ['md', 'njk']
    };
}
