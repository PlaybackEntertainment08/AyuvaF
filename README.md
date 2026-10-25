# AYUVA Longevity Institute — website

Static website for **www.theayuva.com**. Plain HTML, CSS and JavaScript: no framework, no build step.

## Run locally

```bash
python -m http.server 8000
# open http://localhost:8000
```

Opening `index.html` straight from disk also works, but the nav links (`/about`, `/programmes`…) only resolve on a web server.

## Structure

```
index.html                    Home (v2, "Emerald Aurora")
assets/
  css/style.css               Design tokens, glass/aurora system, all components
  js/main.js                  Loader, Lenis+GSAP sync, cursor, magnetic buttons, hero reel,
                              scroll-scrubbed text, 183→30 matrix, domain tabs, stacking cards,
                              programmes slider, Pancha Tattva orbit
  vendor/                     Bootstrap 5.3.3, Bootstrap Icons 1.11.3, GSAP 3.13 (+ScrollTrigger,
                              SplitText), Lenis 1.1.13, Swiper 11.1.14 — all self-hosted
  fonts/                      Stack Sans Headline, Instrument Sans, Instrument Serif (woff2)
  img/logo/                   Logo layers cut from the master artwork (transparent PNG)
  img/photo/                  Photography (WebP + JPEG)
```

Everything runs offline — no CDN calls. Motion is disabled automatically for visitors with
"reduce motion" turned on, and the page stays fully usable without JavaScript.

## Pages still to build

`/about`, `/the-ayuva-model`, `/key-longevity-panel`, `/programmes` (+5 programme pages), `/therapies`, `/safety`, `/team`, `/academy`, `/faq`, `/book`, `/privacy`, `/terms`. The homepage already links to these URLs.

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
