# vamsikrishna1.com

Personal portfolio for **Vamsi Krishna Patta** — Full Stack Developer.
Static HTML/CSS with ~1 KB of vanilla JavaScript. No framework, no build step,
no dependencies. Deployed on GitHub Pages behind a Cloudflare-registered domain.

---

## Why this stack

A seven-page portfolio is static content. A framework (Next.js, Astro, Gatsby)
would add a `node_modules` tree, a build pipeline, a deploy workflow, and a
patching obligation, in exchange for nothing a recruiter or Lighthouse would
notice. Hand-written HTML means:

- **`git push` is the deploy.** GitHub Pages serves the repository as-is.
- **Zero supply-chain surface.** No packages, no lockfile, no transitive CVEs.
- **Nothing to relearn.** In six months you edit an HTML file, not a config.
- **Fast by construction.** One 12 KB stylesheet and one 1 KB script, both
  cached. No render-blocking third-party requests, no web fonts.

The one cost is that the header and footer markup are repeated in each page.
See [Editing the site](#editing-the-site) for how to change them.

---

## Structure

```
.
├── index.html              Home
├── about/index.html        About
├── experience/index.html   Experience
├── projects/index.html     Projects
├── skills/index.html       Skills
├── resume/index.html       Résumé  →  https://vamsikrishna1.com/resume
├── contact/index.html      Contact
├── 404.html                Custom not-found page
├── assets/
│   ├── resume.pdf          ← replace this file to update the résumé
│   ├── css/site.css
│   ├── js/nav.js           Mobile navigation only
│   ├── favicon.svg
│   ├── apple-touch-icon.png
│   └── og.png              1200×630 social preview
├── CNAME                   vamsikrishna1.com
├── robots.txt
├── sitemap.xml
├── .nojekyll               Serve files verbatim, skip Jekyll processing
└── .gitignore
```

Each page is a directory containing `index.html`, which is what gives clean
extensionless URLs (`/resume`, not `/resume.html`) on GitHub Pages with no
redirect rules or routing tricks.

---

## 1. Run locally

Any static file server works. The site uses root-relative paths (`/assets/...`),
so it must be served from a server root — **opening `index.html` directly from
the filesystem will not load the CSS.**

```bash
# Python 3 (already installed on macOS and most Linux)
python3 -m http.server 8000

# or Node
npx serve .
```

Then open <http://localhost:8000>.

Note: `http.server` does not rewrite `/resume` to `/resume/index.html`, so
locally use the trailing slash: <http://localhost:8000/resume/>. GitHub Pages
resolves both forms in production.

## 2. Build

There is no build step. What is in the repository is what is served.

## 3. Deploy to GitHub Pages

**Recommended repository name: `misterVK31.github.io`.** A repository with that
exact name is served from the domain root (`https://mistervk31.github.io/`),
which matches the root-relative paths this site uses. Any other repository name
is served from a subpath (`/portfolio/`) and every asset link will 404 *until*
the custom domain is live — workable, but confusing while you set things up.

```bash
git init
git add .
git commit -m "Portfolio site"
git branch -M main
git remote add origin https://github.com/misterVK31/misterVK31.github.io.git
git push -u origin main
```

Then in the repository on GitHub:

1. **Settings → Pages**
2. **Source:** `Deploy from a branch`
3. **Branch:** `main`, folder `/ (root)` → **Save**
4. Wait for the green check on the Actions tab (usually under a minute).
5. **Settings → Pages → Custom domain:** enter `vamsikrishna1.com` → **Save**
   (the `CNAME` file already in the repository sets this, but confirm it here).
6. Once the DNS check passes, tick **Enforce HTTPS**.

Every later change is `git add . && git commit && git push`. GitHub redeploys
automatically.

## 4. Connect the Cloudflare domain

In the Cloudflare dashboard → your account → **vamsikrishna1.com** → **DNS →
Records**, create these. Delete any existing A, AAAA, or CNAME record on `@` or
`www` first (Cloudflare adds parking records on new registrations).

| Type  | Name  | Content                  | Proxy status |
|-------|-------|--------------------------|--------------|
| A     | `@`   | `185.199.108.153`        | DNS only     |
| A     | `@`   | `185.199.109.153`        | DNS only     |
| A     | `@`   | `185.199.110.153`        | DNS only     |
| A     | `@`   | `185.199.111.153`        | DNS only     |
| AAAA  | `@`   | `2606:50c0:8000::153`    | DNS only     |
| AAAA  | `@`   | `2606:50c0:8001::153`    | DNS only     |
| AAAA  | `@`   | `2606:50c0:8002::153`    | DNS only     |
| AAAA  | `@`   | `2606:50c0:8003::153`    | DNS only     |
| CNAME | `www` | `mistervk31.github.io`   | DNS only     |

**Start with "DNS only" (grey cloud), not proxied (orange cloud).** GitHub has
to reach your domain directly to verify it and issue the Let's Encrypt
certificate. With the proxy on from the start, GitHub's DNS check fails and
"Enforce HTTPS" stays greyed out — the single most common failure in this setup.

Then, under **SSL/TLS → Overview**, set the encryption mode to **Full (strict)**.
Never use *Flexible*: it makes Cloudflare talk to GitHub over plain HTTP, which
causes an infinite redirect loop.

**Order of operations:**

1. Add the DNS records above, all set to DNS only.
2. In GitHub → Settings → Pages, set the custom domain and wait for the DNS
   check to go green (minutes, occasionally up to 24 hours).
3. Tick **Enforce HTTPS** in GitHub.
4. Confirm `https://vamsikrishna1.com` and `https://www.vamsikrishna1.com` both
   load over HTTPS.
5. *Optional:* switch the records to Proxied (orange cloud) for Cloudflare's CDN
   and analytics. Do this only after step 4 succeeds, and keep SSL/TLS on
   **Full (strict)**. If anything breaks, switch back to DNS only.

The `www` CNAME points at `mistervk31.github.io` **without** the repository
name — GitHub resolves the repository from the `CNAME` file. GitHub also
redirects `www` → apex (or the reverse) automatically once the custom domain is
set, so both spellings work.

### Optional Cloudflare hardening

GitHub Pages cannot send custom response headers. If you proxy through
Cloudflare, you can add them under **Rules → Transform Rules → Modify Response
Header**:

| Header | Value |
|---|---|
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `X-Frame-Options` | `SAMEORIGIN` |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |

Also turn on **SSL/TLS → Edge Certificates → Always Use HTTPS**.

Do not enable Cloudflare's Rocket Loader or "Auto Minify" on this site — the
assets are already minimal and Rocket Loader defers `nav.js` in a way that can
briefly break the mobile menu.

## 5. Update the résumé

This is the whole workflow:

```bash
# Overwrite the file — keep the name exactly resume.pdf
cp ~/Downloads/my-new-resume.pdf assets/resume.pdf

git add assets/resume.pdf
git commit -m "Update resume"
git push
```

GitHub Pages redeploys in under a minute and `https://vamsikrishna1.com/resume`
serves the new document. **The URL never changes, so any QR code that points at
`https://vamsikrishna1.com/resume` keeps working forever.**

Rules that keep this true:

- The filename must stay `assets/resume.pdf`. Never `resume-2026.pdf`,
  `resume-final.pdf`, or any other variant.
- Point QR codes at `https://vamsikrishna1.com/resume` — the **page**, never at
  `/assets/resume.pdf` directly. The page gives you a branded landing surface,
  a download button, and the freedom to change how the résumé is presented later
  without invalidating printed codes.

### Cache safety

Three layers could serve a stale PDF. All three are handled:

1. **Browser cache** — `/resume/` appends a coarse `?v=` timestamp (10-minute
   buckets) to the embed and both buttons, so a returning visitor never sees a
   week-old copy. Plain links still work with JavaScript disabled.
2. **GitHub Pages** — sends a short `max-age` and an ETag; it revalidates on
   its own.
3. **Cloudflare edge** (only if you enable the proxy) — Cloudflare caches PDFs
   aggressively. Add **Rules → Caching Rules → Create rule**: if
   `URI Path equals /assets/resume.pdf` then **Bypass cache**. Alternatively,
   run **Caching → Configuration → Purge Everything** after each résumé update.

---

## Editing the site

- **Text content** — edit the relevant `index.html` directly. Everything is
  plain semantic HTML.
- **Colours, spacing, type** — all design tokens are CSS custom properties at
  the top of `assets/css/site.css` under `:root`. Changing `--gold` restyles
  every accent on the site.
- **Navigation** — the `<header>` block is repeated in all eight HTML files. If
  you add or rename a page, update it in each one, and add the new URL to
  `sitemap.xml`.
- **Project links** — each project in `projects/index.html` has a commented-out
  block showing exactly where to paste a GitHub or live-demo link.
- **Social preview** — replace `assets/og.png` (1200×630).

## Accessibility and SEO notes

- Semantic landmarks (`header`, `nav`, `main`, `footer`), one `h1` per page,
  and an unbroken heading hierarchy.
- Skip-to-content link, visible focus rings, keyboard-operable mobile menu with
  `aria-expanded` / `aria-controls`, Escape to close.
- Body text meets WCAG AA contrast against the dark background; the gold accent
  is used for large text, icons, and borders.
- `prefers-reduced-motion` and `forced-colors` are both honoured.
- Per-page `<title>`, meta description, canonical URL, Open Graph and Twitter
  cards; `Person` JSON-LD on the home page; `sitemap.xml` and `robots.txt`.
- `404.html` is `noindex` and carries no canonical tag.

## Licence

Content (résumé, biography, project descriptions) © 2026 Vamsi Krishna Patta.
