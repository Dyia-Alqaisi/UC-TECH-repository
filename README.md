# UC-TECH website

Approved United Cloud Technology website with a PHP/MySQL consultation form and a protected enquiry dashboard, prepared for Namecheap hosting.

## Current state

Source is ready for staging. Live hosting configuration, database setup, HTTPS and inbox delivery must be verified before production launch. The old website must remain live during testing.

- Public pages: `public/`
- Database tables: `schema.sql`
- Configuration template: `config.example.php`
- Admin dashboard: `/admin/`
- Deployment instructions: `START-HERE.md`
- Automated checks: `.github/workflows/checks.yml`

Notification recipients are `info@uc-tech.cloud` and `H.jamal@uc-tech.com`. Mail is disabled by default until explicitly configured and tested. No SMS or WhatsApp provider is connected.

Do not commit `uc-tech-config.php`, credentials, backup archives or visitor records. Put the completed configuration file outside the web document root.

## Testing

Run PHP and JavaScript syntax checks and `python3 verify.py` (PHP CGI and PDO SQLite required). The integration fixture creates temporary data, checks validation, duplicate retries, access control, request updates, rate limits and failure handling, then removes its temporary directory. It does not send email. GitHub Actions runs these checks on pushes and pull requests.

Use an isolated Namecheap staging subdomain and a separate MySQL database to test the actual hosting environment and inbox delivery. GitHub Pages serves static files only and cannot run this PHP backend. Never use a Pages preview as evidence that login, database storage or email works.

## Source

Public pages and design assets were preserved from the approved UC-TECH Site on 31 October 2026. Client logo files are resized for web delivery; branding and layout are preserved. The enquiry backend and dashboard are maintained in this repository. Content edits require file changes; the dashboard manages enquiries, not website content.
