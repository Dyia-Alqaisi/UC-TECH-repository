<?php
declare(strict_types=1);
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: strict-origin-when-cross-origin');
ini_set('display_errors', '0');
ini_set('session.use_strict_mode', '1');
ini_set('session.use_only_cookies', '1');
$secure = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
session_name('uctech_session');
session_set_cookie_params(['lifetime'=>0,'path'=>'/','secure'=>$secure,'httponly'=>true,'samesite'=>'Strict']);
session_start();
$_SESSION['csrf'] ??= bin2hex(random_bytes(32));

function config(): array {
    static $config;
    if ($config !== null) return $config;
    $path = dirname(__DIR__, 2) . '/uc-tech-config.php';
    if (!is_file($path)) throw new RuntimeException('Configuration missing');
    $config = require $path;
    if (!is_array($config) || strlen($config['app_key'] ?? '') < 32 || str_contains($config['app_key'], 'REPLACE')) throw new RuntimeException('Invalid configuration');
    return $config;
}
function db(): PDO {
    static $pdo;
    if (!$pdo) {
        $c=config();
        $pdo=new PDO($c['dsn'], $c['db_user'], $c['db_password'], [PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC,PDO::ATTR_EMULATE_PREPARES=>false]);
    }
    return $pdo;
}
function json_response(array $body, int $status=200): never {
    http_response_code($status); header('Content-Type: application/json; charset=utf-8');
    echo json_encode($body, JSON_INVALID_UTF8_SUBSTITUTE); exit;
}
function csrf_valid(?string $value): bool { return is_string($value) && hash_equals($_SESSION['csrf'], $value); }
function ip_hash(): string { return hash_hmac('sha256', $_SERVER['REMOTE_ADDR'] ?? 'unknown', config()['app_key']); }
function h(string $value): string { return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }
function admin_signed_in(): bool {
    if (empty($_SESSION['admin']) || time() - ($_SESSION['last_active'] ?? 0) > 1800) { unset($_SESSION['admin']); return false; }
    $_SESSION['last_active']=time(); return true;
}
function notify_request(array $r): string {
    $c=config();
    if (empty($c['mail_enabled'])) return 'pending';
    $recipients=$c['notification_emails'] ?? [$c['notification_email'] ?? ''];
    $from=$c['mail_from'] ?? '';
    if (!is_array($recipients) || !$recipients || !filter_var($from,FILTER_VALIDATE_EMAIL)) return 'failed';
    $body="A new UC-TECH consultation request was received.\n\nReference: ".$r['id']."\nName: ".$r['name']."\nCompany: ".$r['company']."\nEmail: ".$r['email']."\nPhone: ".$r['phone']."\nService: ".$r['service']."\n\n".$r['message']."\n\nManage requests: https://uc-tech.cloud/admin/\n";
    // 'accepted' means accepted by the local mail server, not confirmed inbox delivery.
    $states=[];
    foreach (array_unique($recipients) as $to) {
        if (!is_string($to) || !filter_var($to,FILTER_VALIDATE_EMAIL)) { $states[]='failed'; continue; }
        $q=db()->prepare('SELECT status FROM notification_deliveries WHERE request_id = ? AND recipient = ?');
        $q->execute([$r['id'],$to]); $previous=$q->fetchColumn();
        if ($previous==='accepted') { $states[]='accepted'; continue; }
        if ($previous===false) db()->prepare('INSERT INTO notification_deliveries (request_id, recipient, status) VALUES (?, ?, ?)')->execute([$r['id'],$to,'pending']);
        $ok=@mail($to,'UC-TECH consultation request '.$r['id'],$body,['From'=>'UC-TECH <'.$from.'>','Reply-To'=>$r['email'],'Content-Type'=>'text/plain; charset=UTF-8']);
        $state=$ok?'accepted':'failed';
        db()->prepare('UPDATE notification_deliveries SET status = ?, attempted_at = ? WHERE request_id = ? AND recipient = ?')->execute([$state,gmdate('Y-m-d H:i:s'),$r['id'],$to]);
        $states[]=$state;
    }
    if (!in_array('failed',$states,true)) return 'accepted';
    return in_array('accepted',$states,true)?'partial':'failed';
}
