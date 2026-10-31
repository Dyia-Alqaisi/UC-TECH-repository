# UC-TECH launch package — Namecheap

This package preserves the pages and assets fetched from the approved live Site on 31 October 2026. It adds PHP/MySQL enquiry handling and a protected request dashboard. It is prepared for Namecheap cPanel hosting; it is not deployed or connected to a database yet. Do not upload the entire package to public_html.

## Deployment order

1. Finish and download the full backup of the old account. Record the existing domain document root and email/DNS settings.
2. Create a separate MySQL database and database user using cPanel's Database Wizard. Grant the user access to this database. Import schema.sql with phpMyAdmin. Do not reuse or overwrite the old site's database.
3. Copy config.example.php to `uc-tech-config.php` in the parent of the new document root (normally `/home/CPANELUSER/uc-tech-config.php`). Enter the database credentials. Set a strong administrator password hash and a random application key. Never put this file in public_html. config.example.php shows the PHP commands for generating the hash and key. If using cPanel Terminal, read a password interactively rather than recording it in a command/history.
4. First test in an isolated staging document root. The app uses root-relative links, so staging must have its own subdomain/document root, not a subfolder. Put public/* in that document root, including .htaccess. Put config in its parent according to the directory structure. Keep staging protected from public visitors and search engines using cPanel Directory Privacy. Use PHP 8.2 or newer with PDO MySQL and sessions enabled.
5. Visit /admin/ and sign in. Verify the approved phone, email, address, pages, images, navigation and forms on mobile and desktop. Submit a clearly marked test request. Confirm exactly one database record appears and can be marked Contacted/Closed with notes. Try an invalid form and failed network request; success must only appear after a saved record.
6. Confirm info@uc-tech.cloud is an actual accessible mailbox. Set mail_enabled=true only when ready to test delivery from the hosting account. Submit a test request and check the actual inbox and spam folder. The dashboard's accepted status means the hosting mail server accepted the email, not confirmed delivery. Pending/failed mail can be retried from the dashboard. If the host mail path does not reliably reach the mailbox, configure authenticated SMTP through a mail library before launch. SMTP is not included in this package.
7. After staging passes, place the contents of public/ in the production document root using the backup and an agreed switch-over. Keep existing mailboxes and email DNS records. This deployment route uses the already purchased Namecheap hosting; no nameserver change is inherently required. If the domain points elsewhere, check the current DNS before changing web records.
8. Verify HTTPS, www/canonical redirect behavior, all pages, form save, admin access and inbox delivery using uc-tech.cloud. Remove test records via phpMyAdmin after testing if desired. Keep a rollback copy until the client accepts launch.

## What is stored

Requests: submitted name/company/email/phone/service/message; random reference; unique retry key; created/updated UTC timestamps; New/Contacted/Closed status; internal notes; email notification state; keyed address hash for rate limiting. Login attempts store a keyed address hash and timestamp. No public visitor accounts, payments, file uploads or content editor are added.

## Operations

- Dashboard: https://uc-tech.cloud/admin/ — administrator sign-in expires after 30 minutes idle. Five failed sign-ins per network address within 15 minutes temporarily block more attempts.
- Form: at most ten saved requests per network address within an hour. CSRF protection, server validation and a hidden spam field are included. This is basic abuse protection, not a bot detection service.
- The dashboard shows the newest 100 matching records. Search by name/company/email and filter by status.
- Retain database/account backups. Decide the enquiry retention period with the client and remove records that are no longer needed. Keep the application key stable while records are used for rate limiting.
- Store source in the client's private repository for future changes. Website content edits still require changing the files; the dashboard manages enquiries only.
- The new website has not been published by creating this archive. Database credentials, administrator password, live email delivery, browser QA and final switch-over remain deployment tasks.

## Full backup restoration

cPanel's Full Backup cannot be restored using its ordinary Backup Wizard. Ask Namecheap support about a full-account restore, or restore individual files/databases from suitable extracted/partial backups.
