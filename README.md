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
index.html                 Home (page 01 of the content document)
assets/
  css/style.css            Design tokens + all styles
  js/main.js               Header, menu, dropdown, reveals, count-up, parallax, therapies rail
  js/vendor/lenis.min.js   Smooth scrolling (Lenis 1.1.13, MIT)
  fonts/                   Lora + Inter (self-hosted, variable woff2)
  img/logo/                Logo layers cut from the master artwork (transparent PNG)
  img/photo/               Photography, WebP + JPEG at responsive sizes
  img/                     Favicons, Open Graph image
```

## Brand rules followed

- Palette: AYUVA Green `#0E3B2E`, Deep Green `#082419`, Champagne Gold `#C9A24B`, Warm Ivory `#F4EFE3`. Gold stays an accent.
- Type: Lora for headlines, quotes and numerals; Inter for body and labels. The wordmark is artwork, never retyped.
- Copy rules: no prices, no ™, no "cure" or guaranteed results; the medical disclaimer is in the footer.

## Pages still to build

`/about`, `/the-ayuva-model`, `/key-longevity-panel`, `/programmes` (+5 programme pages), `/therapies`, `/safety`, `/team`, `/academy`, `/faq`, `/book`, `/privacy`, `/terms`. The homepage already links to these URLs.

## Image credits

All photography is CC0 (public domain), except the founder portrait, which is AYUVA's own:

| File | Source |
|---|---|
| himalaya-sunrise | "Amazing views over the Himalayas" by Himalayancircuit, Wikimedia Commons, CC0 |
| yoga-dawn | "Yoga sunrise" by Dave Contreras (Unsplash), Wikimedia Commons, CC0 |
| turmeric-flower | "Turmeric Flower Maharashtra India" by Sankarshansen, Wikimedia Commons, CC0 |
| misty-forest | "Misty Morning" by Johannes Plenio, StockSnap, CC0 (spare, not used on Home) |
| founder-prabhu-chandra-mishra | From the AYUVA website content document |

Replace with AYUVA's own photography (real clients, clinicians, spaces) when it is available, as the brand guidelines recommend.
