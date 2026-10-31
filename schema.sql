CREATE TABLE requests (
    id CHAR(32) PRIMARY KEY,
    submission_key CHAR(36) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    company VARCHAR(150) NOT NULL,
    email VARCHAR(180) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    service VARCHAR(40) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'New',
    notes TEXT NOT NULL,
    notification_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    ip_hash CHAR(64) NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    INDEX requests_created (created_at),
    INDEX requests_ip_created (ip_hash, created_at)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE login_attempts (
    ip_hash CHAR(64) NOT NULL,
    attempted_at DATETIME NOT NULL,
    INDEX attempts_ip_time (ip_hash, attempted_at)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE notification_deliveries (
    request_id CHAR(32) NOT NULL,
    recipient VARCHAR(180) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    attempted_at DATETIME NULL,
    PRIMARY KEY (request_id, recipient),
    FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
