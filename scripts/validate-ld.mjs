/**
 * Pulls every <script type="application/ld+json"> block out of the
 * built HTML files in dist/ and runs JSON.parse on each. Bails with a
 * non-zero exit code on any failure. Intended to be run after
 * `npm run build` as a quick CI guardrail against templating mistakes
 * that produce syntactically-broken structured data.
 */
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const DIST = path.resolve('dist');

async function walk(dir) {
    const out = [];
    for (const entry of await readdir(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            out.push(...(await walk(full)));
        } else if (entry.name.endsWith('.html')) {
            out.push(full);
        }
    }
    return out;
}

const LD_RE =
    /<script\s+type=["']application\/ld\+json["']\s*>([\s\S]*?)<\/script>/gi;

let failed = 0;
let blocks = 0;

for (const file of await walk(DIST)) {
    const html = await readFile(file, 'utf8');
    let match;
    let i = 0;
    while ((match = LD_RE.exec(html)) !== null) {
        i += 1;
        blocks += 1;
        const raw = match[1].trim();
        try {
            const parsed = JSON.parse(raw);
            const type = Array.isArray(parsed)
                ? parsed.map((p) => p['@type']).join(',')
                : parsed['@type'];
            const rel = path.relative(DIST, file);
            console.log(`  ok  ${rel} #${i} (@type: ${type})`);
        } catch (err) {
            failed += 1;
            console.error(
                `FAIL  ${path.relative(DIST, file)} #${i}: ${err.message}`
            );
            console.error('----- raw block -----');
            console.error(raw);
            console.error('---------------------');
        }
    }
}

console.log(`\n${blocks - failed}/${blocks} JSON-LD blocks parsed cleanly.`);
process.exit(failed > 0 ? 1 : 0);
