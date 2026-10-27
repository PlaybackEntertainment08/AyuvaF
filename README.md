# AYUVA Longevity Institute — website

Static website for **www.theayuva.com**. Plain HTML, CSS and JavaScript: no framework, no build step.

## Run locally

Double-click `index.html`. Every page is a flat file at the root with relative links, so the whole site works straight from disk, from GitHub Pages (including under a `/AyuvaF/` sub-path) and from any web host.

## Pages (18)

| File | Page |
|---|---|
| `index.html` | Home |
| `about.html` | About AYUVA (mission, vision, values, founder’s message) |
| `the-ayuva-model.html` | The AYUVA Model (five promises, Pancha Tattva, Ten Pillars) |
| `key-longevity-panel.html` | Key Longevity Panel (eight domains, what you receive, add-ons, preparation) |
| `programmes.html` | Programmes (finder, six pathways, coming soon, regenerative stack) |
| `ceo-cellular-week.html` | CEO Cellular Week |
| `meridian.html` | AYUVA Meridian |
| `sushupti.html` | SUSHUPTI — Sleep Reset |
| `ojas.html` | OJAS — Intimate Health |
| `sovereign.html` | AYUVA Sovereign |
| `therapies.html` | Therapies |
| `safety.html` | Safety & Governance |
| `team.html` | Team |
| `academy.html` | Academy |
| `faq.html` | FAQ |
| `book.html` | Book / Contact |
| `privacy.html` | Privacy policy — **draft**, not in the content document; needs legal review |
| `terms.html` | Terms of use — **draft**, not in the content document; needs legal review |

All copy comes from the website content document (v1, October 2026). Bracketed facts the client still has to supply (full address, opening hours, cancellation terms, doctors’ qualifications) are left out or marked.

## Booking form

`book.html` has no server behind it. On submit, the form opens WhatsApp (+91 96436 96969) with the request pre-filled, then shows the thank-you message; without JavaScript it falls back to a mailto to wellness@theayuva.com. `book.html?interest=ceo` (or `meridian`, `sushupti`, `ojas`, `sovereign`, `academy`, `waitlist`) pre-selects the programme. Swap the handler in `assets/js/main.js` (`bookForm`) for Formspree, a CRM endpoint or a backend when one exists.

## Structure

```
*.html                        18 pages, flat, relative links
assets/
  css/style.css               Design tokens, glass/aurora system, all components (home + inner pages)
  js/main.js                  Loader (home) / veil (inner pages), Lenis+GSAP sync, cursor, magnetic buttons,
                              hero aperture, scroll-scrubbed text, 183→30 matrix, domain tabs, stacking cards,
                              programmes slider, Pancha Tattva orbit, team roster, chapter rail, booking form
  vendor/                     Bootstrap 5.3.3, Bootstrap Icons 1.11.3, GSAP 3.13 (+ScrollTrigger,
                              SplitText), Lenis 1.1.13, Swiper 11.1.14 — all self-hosted
  fonts/                      Stack Sans Headline, Instrument Sans, Instrument Serif (woff2)
  img/logo/                   Logo layers cut from the master artwork (transparent PNG)
  img/photo/                  Photography (WebP + JPEG)
```

Stylesheet and script links carry a version query (`style.css?v=…`) that changes on every build, so GitHub Pages’ 10-minute asset cache never serves old CSS with new HTML.

Everything runs offline — no CDN calls. Motion is disabled automatically for visitors with
"reduce motion" turned on, and every page stays usable without JavaScript.

On touch devices the site switches to a lighter rendering mode: no smooth-scroll library, no custom
cursor or particles, no backdrop blurs or blend modes, and a shorter pinned hero — so scrolling stays
at a steady frame rate on mid-range phones. Everything else (layout, content, reveals) is identical.

## Image credits

All photography is CC0 (public domain), except the founder portrait, which is AYUVA's own:

| File | Source |
|---|---|
| himalaya-sunrise | "Amazing views over the Himalayas" by Himalayancircuit, Wikimedia Commons, CC0 |
| yoga-dawn | "Yoga sunrise" by Dave Contreras (Unsplash), Wikimedia Commons, CC0 |
| turmeric-flower | "Turmeric Flower Maharashtra India" by Sankarshansen, Wikimedia Commons, CC0 |
| fern-unfurl | "Fern - Dee Why" by Peter Woodard, Wikimedia Commons, CC0 |
| meditation-white | "Thai woman meditating" by Kochphon Onshawee, Wikimedia Commons, CC0 |
| dusk-meditation, yoga-balance, bioreboot-bowl, ice-cave, misty-forest | StockSnap, CC0 |
| water-drop, leaf-light, leaf-veins | rawpixel (public domain / CC0) |
| founder-prabhu-chandra-mishra | From the AYUVA website content document |

Replace with AYUVA's own photography (real clients, clinicians, spaces) when it is available, as the brand guidelines recommend.
