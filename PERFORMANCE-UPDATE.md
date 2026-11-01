# Mobile loading update

Baseline supplied by the client: Lighthouse mobile performance 77, LCP 6.6 s,
FCP 0.9 s, TBT 0 ms, CLS 0.032. No real-user data was available.

## Changes

- Preload the orange hero graphic with high priority on pages using light-field.
- Convert the two existing variable fonts to WOFF2 without subsetting or changing
  glyphs, weights, or typography. Font bytes drop from 1,013,252 to 399,716 (60.6%).
- Serve versioned CSS and JS, with versioned fonts referenced by the CSS.
- Cache only content-addressed CSS, JS, and WOFF2 files for a year. HTML and
  PHP/API responses do not receive this immutable caching policy.
- Include the WOFF2 files and versioned JS in the GitHub Pages preview builder.

Original CSS, JS and TTF files remain as regeneration sources and for older pages.
To regenerate: install fonttools[woff], then run python scripts/optimize_assets.py.
The image and all animations remain unchanged.

## Deploy after review

The cPanel backend has changes that are not present in this repository. Do not
replace the entire public_html folder with a repository ZIP.

1. Back up the live files.
2. Upload the new assets first: the two hashed WOFF2 files, hashed CSS and hashed
   JS from public/assets. Retain existing assets so cached older pages still work.
3. Upload the eight updated HTML files to their matching paths under public_html.
4. Add the new FilesMatch cache block from public/.htaccess to the live file's
   existing mod_headers block; preserve any hosting or custom settings.
5. Preserve api/, admin/, private config, database, .well-known, and the Google
   ownership verification HTML file already on the server.
6. Verify desktop and mobile navigation, service pages and consultation flow;
   rerun PageSpeed on the live site. Check response headers for a hashed asset
   and confirm the new fonts load as WOFF2. PHP/HTML must not be immutable.

## Validation limits

Static page/asset checks, font equivalence and preview generation can be checked
locally. Actual cPanel caching and PageSpeed improvement require deployment.
This update does not claim a new Lighthouse score before that measurement.
