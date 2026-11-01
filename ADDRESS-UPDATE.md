# Address update

The head-office address throughout the public pages is:

Building 67, 3rd Floor  
Queen Rania Street, Amman, Jordan

All seven page footers and the contact page use the same address. Clickable map links use the supplied location: https://maps.app.goo.gl/thBM6rXdyAVPKp1w5. The contact-page embedded map searches for Building 67, Queen Rania Street, Amman, Jordan; its pin should be checked visually against the supplied location before launch.

## Apply to the existing cPanel staging site

Upload only these files from the repository ZIP, preserving their paths relative to the `public/` folder:

- `public/index.html`
- `public/about/index.html`
- `public/ai/index.html`
- `public/clients/index.html`
- `public/cloud/index.html`
- `public/contact/index.html`
- `public/cybersecurity/index.html`

For example, `public/contact/index.html` replaces `test.uc-tech.cloud/contact/index.html`.

Keep the existing cPanel `api/`, `admin/`, assets, database and private configuration. The GitHub main branch used for this address update still contains the original mail() backend, whereas the hosting account was updated separately to Resend. This branch does not synchronize those backend changes. Do not replace the whole hosted site with this repository ZIP.

The example notification recipients in README.md and config.example.php now use h.jamal@uc-tech.cloud. Do not replace your actual private configuration with the example.

After upload, refresh each page and inspect its footer. Check both contact-page addresses, clickable map links and embedded map. Continue the production launch only after these checks.
