<?php
// Place a completed copy at /home/YOUR_CPANEL_USER/uc-tech-config.php,
// outside public_html. Never put real credentials in a public folder.
return [
    'dsn' => 'mysql:host=localhost;dbname=CPANELUSER_uctech;charset=utf8mb4',
    'db_user' => 'CPANELUSER_uctech',
    'db_password' => 'REPLACE_WITH_DATABASE_PASSWORD',
    'admin_email' => 'info@uc-tech.cloud',
    // Generate with: php -r "echo password_hash('YOUR_PASSWORD', PASSWORD_DEFAULT);"
    'admin_password_hash' => 'REPLACE_WITH_PASSWORD_HASH',
    // Generate with: php -r "echo bin2hex(random_bytes(32));"
    'app_key' => 'REPLACE_WITH_RANDOM_KEY',
    'notification_emails' => ['info@uc-tech.cloud', 'H.jamal@uc-tech.com'],
    'mail_from' => 'info@uc-tech.cloud',
    // Enable only after testing the hosting account's mail delivery.
    'mail_enabled' => false,
];
