# GitHub Pages design preview

In repository Settings > Pages, set Build and deployment > Source to GitHub Actions. Run the "GitHub Pages design preview" workflow from Actions if the first run took place before Pages was enabled.

Expected preview URL: https://dyia-alqaisi.github.io/UC-TECH-repository/

The workflow publishes a generated static preview from public/. It adjusts root-relative page and asset links for the repository URL, excludes PHP/admin/API files, disables form submission, and adds noindex metadata. No custom domain is configured. Production files in public/ keep their original cPanel paths and behavior.

Use the preview to review the design, mobile navigation, page links, address and maps. PHP, MySQL storage, administrator login and Resend delivery must be tested on cPanel. A successful preview deployment does not verify those services.
