# Onyx BioPartners — Website

Modern marketing site for **Onyx BioPartners**, an EU & GCC life sciences consultancy. Built with vanilla HTML/CSS/JS and bundled with [Vite](https://vitejs.dev/) for deployment.

---

## Getting started

Requires Node.js 20+ (see `.nvmrc`).

```bash
npm install        # install dependencies
npm run dev        # start dev server (http://localhost:5173) with hot reload
npm run build      # produce a production build in dist/
npm run preview    # preview the built dist/ locally (http://localhost:4173)
```

---

## Deploying to Netlify

This repo is ready to deploy. All build settings are pre-configured in `netlify.toml`.

### Option A — Git-based deploy (recommended)

1. Push this folder to a GitHub / GitLab / Bitbucket repo.
2. In Netlify, click **Add new site → Import an existing project**.
3. Pick the repository. Netlify auto-detects the settings from `netlify.toml`:
    - Build command: `npm run build`
    - Publish directory: `dist`
    - Node version: `20`
4. Click **Deploy**. First build completes in ~1 minute.

Every future push to `main` triggers an automatic deploy. Pull requests get preview URLs.

### Option B — Drag-and-drop deploy

If you don't want to connect a repo yet:

```bash
npm install
npm run build
```

Then drag the generated `dist/` folder onto the Netlify dashboard. Done.

### Option C — Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify init      # link to a new or existing site
netlify deploy    # deploys a preview
netlify deploy --prod   # deploys to production
```

---

## What's included

| File               | Purpose |
| ------------------ | ------- |
| `index.html`       | Single-page structure (hero, about, services, approach, contact, footer) |
| `styles.css`       | Design system + layout + responsive |
| `script.js`        | Nav scroll state, mobile menu, scroll reveals, contact form, animated DNA helix |
| `vite.config.js`   | Vite build configuration |
| `netlify.toml`     | Netlify build, redirects, caching, and security headers |
| `package.json`     | npm scripts & deps |
| `.nvmrc`           | Node version pin (20) |
| `.gitignore`       | Standard ignores (node_modules, dist, env files) |

After `npm run build`:

```
dist/
  index.html
  assets/
    index-[hash].css   (~17 KB, ~4 KB gzip)
    index-[hash].js    (~3 KB, ~2 KB gzip)
```

---

## SEO

The site ships with a complete metadata layer wired into both the Vite-built homepage and the Eleventy-built journal:

| File | Purpose |
| ---- | ------- |
| `eleventy/_data/site.js` | Site-wide metadata (URL, brand, default OG image, theme color). Override the canonical URL with the `SITE_URL` env var in Netlify. |
| `eleventy/_includes/partials/seo.njk` | Per-page meta block: title, description, canonical, Open Graph, Twitter cards, favicon, theme-color. Driven by page front matter with sensible fallbacks. |
| `index.html` (`<head>`) | Same SEO block, hand-written for the Vite-owned homepage. |
| `eleventy/sitemap.njk` | Emits `dist/sitemap.xml` covering `/`, `/blog/`, and every journal post. |
| `public/robots.txt` | Allows all crawlers, disallows `/admin/`, points to the sitemap. |
| `public/favicon.svg` | Branded helix mark on a rounded onyx tile. |
| `public/og-image.svg` | 1200×630 default share card used for any page without its own featured image. |

**Per-post SEO via Decap CMS.** Each journal post supports optional `seo_title`, `seo_description`, and `featured_image_alt` fields in `/admin/`. When blank, the post's `title`, `excerpt`, and `title` (for alt) are used.

**To-do when brand is final.** SVG favicons and OG images are widely supported but a couple of platforms (iOS home-screen, some legacy social previewers) want raster fallbacks. Drop these into `public/` when the client supplies the final brand mark and they'll be picked up automatically:

- `apple-touch-icon.png` — 180×180
- `og-image.png` — 1200×630 (if needed alongside `og-image.svg`)
- `favicon.ico` — multi-size legacy fallback

**Post-deploy checklist.** After the first production deploy:

1. Verify the site in **Google Search Console** (DNS or HTML tag method) and submit `sitemap.xml`.
2. Verify in **Bing Webmaster Tools** the same way.
3. Validate share cards: [opengraph.xyz](https://www.opengraph.xyz/), Twitter/X Card Validator, LinkedIn Post Inspector.
4. Run **Lighthouse** to confirm SEO score (target 100) and Performance ≥ 90.

---

## Design notes

- **Palette** — Deep onyx (`#0B0712`) with a violet→magenta brand gradient (`#5B2C91` → `#E85BC9`), warm ivory content surfaces (`#FAF6F0`).
- **Typography** — *Fraunces* serif for display, *Inter* sans for UI (both from Google Fonts).
- **Hero** — Dark section with canvas-animated DNA helix background and four brand facts.
- **Services** — Six cards with purple gradient hover-fill.
- **Approach** — Dark glass-morphism four-phase process (Discover → Design → Deliver → Deploy).
- **Motion** — Scroll-triggered reveals, `prefers-reduced-motion` honored.

---

## Contact form

The contact form on the homepage uses **Netlify Forms** — zero backend, free up to 100 submissions/month on the starter plan.

### How it's wired

- The `<form>` in `index.html` has `name="contact"`, `method="POST"`, `data-netlify="true"`, and `netlify-honeypot="bot-field"`.
- A hidden `form-name=contact` input matches Netlify's expected payload.
- A hidden `bot-field` input acts as a honeypot — bots will fill it, real users won't, and Netlify silently rejects those submissions.
- `script.js` intercepts the submit, POSTs to `/` as `application/x-www-form-urlencoded` via `fetch`, and shows an inline status message. No full-page redirect.
- On any network error it shows a fallback message with the contact email so the user is never stranded.

### One-time Netlify setup

After the first production deploy:

1. **Verify the form is detected.** In the Netlify dashboard go to **Forms**. You should see a form called `contact` listed after the next successful build.
2. **Add a notification.** Forms → contact → **Settings & usage → Form notifications** → add an email (or Slack webhook). Most clients want the inbound message delivered to `info@onyx-biopartners.com` or similar.
3. **Optional spam controls.** The honeypot is already on. If spam still gets through, enable Netlify's reCAPTCHA add-on (free) by adding `data-netlify-recaptcha="true"` to the `<form>` and a `<div data-netlify-recaptcha></div>` placeholder above the submit button.

### Local dev caveat

The form **will not submit locally** — Netlify's form handler only exists on `*.netlify.app` and the production domain. In dev, the fetch fails and you'll see the error fallback ("please email us directly"). To test the form end-to-end before launch, use a **Netlify Deploy Preview** (every PR/branch gets one automatically with full Forms support).

### Switching to a different provider later

If you ever move off Netlify Forms (Formspree, HubSpot, custom endpoint, etc.), the only change needed is the `fetch` URL inside the submit handler in `script.js`. The inline UX, honeypot, and form fields all stay the same.

---

## Browser support

Evergreen (Chrome, Edge, Firefox, Safari). Uses `IntersectionObserver`, `backdrop-filter`, CSS Grid, and `clamp()`.
