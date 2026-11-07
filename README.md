# Brew & Bolt — Café & Bakery website

*A little pause. A fresh start.*

A single-page static website for Brew & Bolt: brand story, menu, gallery, opening hours and a table reservation form.

## Files

| File | What it does |
|---|---|
| `index.html` | Page content and structure |
| `styles.css` | Look and feel. Brand colours (Sunrise Roast) and fonts are tokens at the top |
| `script.js` | Menu tabs, mobile menu, open/closed status, reservation and newsletter forms |

No build step: open `index.html` in a browser to view it locally.

## Deploying

The site is hosted on Netlify. Once the Netlify project is connected to this repository, every push to `main` publishes automatically.

Netlify settings: **Build command:** *(leave empty)* · **Publish directory:** `.`

## Before launch / to do

- Replace placeholder address, phone, email and social links
- Confirm menu items and prices
- Connect the reservation form to a booking service (see the note in `script.js`)
- Re-enable the testimonials section in `index.html` once there are genuine reviews
- Swap the temporary wordmark for the final logo (see comments in `index.html`)
- Replace stock photos with the café's own photography
