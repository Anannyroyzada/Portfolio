# Ananny Royzada — Portfolio

Personal site for a backend engineering job search: seven systems case studies, a metrics-first
homepage, and an ATS-friendly résumé.

Built with plain HTML, CSS, and vanilla JS on top of Vite. No framework, no runtime dependencies —
the whole page ships as static files.

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static output in dist/
npm run preview  # preview the production build
```

Requires Node 18+.

## What's in here

```
Portfolio/
├── index.html                     # Homepage: hero, about, experience, projects, skills, contact
├── resume.html                    # Print/ATS résumé (source of the PDF)
├── vite.config.js                 # Multi-page build: index.html + resume.html
├── assets/
│   ├── css/style.css              # Design tokens, dark/light themes, layout, components
│   ├── js/script.js               # Theme, nav, filters, dialogs, counters, contact form
│   └── images/                    # Project diagrams, avatar, favicon
├── public/
│   ├── Ananny-Royzada-Resume.pdf  # Pre-generated PDF (linked from the header + contact)
│   ├── _headers                   # Security + cache headers (Cloudflare Pages / Netlify)
│   └── robots.txt
└── dist/                          # Build output (generated)
```

## Editing content

- **Projects.** Each card lives in `index.html` as `<article data-project-card>` with a matching
  `<template id="project-<id>">` holding the case-study body. The `data-category` attribute
  (`distributed`, `fullstack`, `cloud`) drives the filter buttons. Card copy, KPIs, and the
  dialog content are independent, so update both when you change a project.
- **Metrics.** Animated numbers use `data-counter` with `data-to`, `data-prefix`, `data-suffix`,
  and `data-decimals`. Keep them consistent with the numbers you quote in interviews.
- **Résumé.** Edit `resume.html`, then regenerate the PDF (below). The header and contact section
  link to `./Ananny-Royzada-Resume.pdf`.

### Regenerating the PDF

The PDF is printed from `resume.html` with headless Chrome so the layout matches the page:

```powershell
# with `npm run dev` running on port 5173
& "C:\Program Files\Google\Chrome\Application\chrome.exe" `
  --headless=new --disable-gpu --no-pdf-header-footer `
  --print-to-pdf="public\Ananny-Royzada-Resume.pdf" `
  "http://127.0.0.1:5173/resume.html"
```

You can also open `/resume.html` and use the **Download PDF** button (browser print dialog,
"Save as PDF", margins: none).

## Deploying

The build is fully static, so any host works. `base: './'` in `vite.config.js` keeps asset paths
relative, so the site also works from a subpath (e.g. a GitHub Pages project site).

**Cloudflare Pages**

| Setting | Value |
| --- | --- |
| Framework preset | None |
| Build command | `npm run build` |
| Build output directory | `dist` |

`public/_headers` is picked up automatically on Cloudflare Pages (and Netlify) to set
security headers and long-lived caching for hashed assets.

**GitHub Pages** — build, then publish `dist/`. For a project site
(`user.github.io/repo`), relative paths already work.

## Before you share this link

A few things only you can confirm:

- [ ] **Publish the systems repos.** The rate limiter, job queue, and benchmark projects link to
      your GitHub profile, not to repositories. Public repos turn "I built this" into verifiable
      proof — push them and point each card's `data-github` at the repo.
- [ ] **Re-run the benchmarks.** The homepage quotes 45K RPS, p99 < 1.8 ms, and +1,400% throughput
      from local Gatling/k6 and JMH runs. Re-run on the machine you'll demo on and keep the numbers
      you can defend line by line.
- [ ] **Check the résumé PDF is current** after any content edit (`public/Ananny-Royzada-Resume.pdf`).
- [ ] **Test on a phone** — the layout is built mobile-first below 900px, including the filter bar
      and case-study dialog.
- [ ] **Optional: replace the generated OG image.** `public/og-image.png` is a code-drawn card.
      Swap in a real photo or branded graphic (1200×630) for a stronger link preview.

## Accessibility & performance notes

- Semantic landmarks, a skip link, visible focus rings, and `aria-*` state on the menu, theme
  toggle, filters, and dialog.
- Case studies use the native `<dialog>` element, so focus trapping and <kbd>Esc</kbd> come from
  the browser; focus returns to the button that opened it.
- Scroll reveals are opt-in via an `html.js` class — if JavaScript fails, all content stays visible.
- `prefers-reduced-motion` disables transitions, counters, and terminal typing.
- No icon font, no CSS framework, no tracking scripts. Fonts load from Google Fonts with
  `display=swap`.
