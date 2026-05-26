/**
 * Site-wide metadata used by SEO templates (canonical URLs, Open Graph,
 * Twitter cards, sitemap, structured data).
 *
 * Override the production URL by setting SITE_URL in Netlify's environment.
 * Falls back to the canonical domain for local dev so that built HTML
 * always carries absolute URLs Google can resolve.
 */
const PRODUCTION_URL = 'https://www.onyx-biopartners.com';

const url = (process.env.SITE_URL || PRODUCTION_URL).replace(/\/$/, '');

export default {
    name: 'Onyx BioPartners',
    shortName: 'Onyx BioPartners',
    tagline: 'Science from concept to market.',
    description:
        'Making life-science innovations approvable, accessible, and scalable across the EU and GCC through evidence-driven strategy and execution.',
    url,
    locale: 'en_US',
    language: 'en',
    themeColor: '#0B0712',
    // 1200x630 share card used as the default OG / Twitter image for
    // any page that doesn't specify its own. PNG (not SVG) because
    // LinkedIn, X, iMessage, and Slack render PNG reliably and SVG
    // inconsistently. Regenerate via `npm run icons` whenever the
    // source og-image.svg changes.
    defaultOgImage: '/og-image.png',
    defaultOgImageAlt: 'Onyx BioPartners — Science from concept to market.',
    favicon: '/favicon.svg',
    twitterHandle: '', // e.g. '@onyxbiopartners' once a profile exists
    organization: {
        // Registered legal name in the Latvian Commercial Register
        // (Uzņēmumu reģistrs). The brand-facing `name` above is what
        // appears in headings, Knowledge Graph, and OG previews; this
        // `legalName` is what shows in JSON-LD's strict legal field.
        legalName: '"Onyx BioPartners" SIA',
        email: 'info@onyx-biopartners.com',
        regions: ['European Union', 'GCC'],
        // Google's Organization schema prefers a square raster logo.
        // logo.png is a 512x512 PNG rasterized from favicon.svg via
        // `npm run icons` — re-run that script if the SVG ever changes.
        logo: '/logo.png',
        // Social / external profile URLs. Schema.org `sameAs` is how
        // Google links the entity across the web. Leave empty strings
        // out; only emit populated URLs in JSON-LD.
        sameAs: []
        // Example once profiles exist:
        // sameAs: [
        //     'https://www.linkedin.com/company/onyx-biopartners',
        //     'https://x.com/onyxbiopartners'
        // ]
    }
};
