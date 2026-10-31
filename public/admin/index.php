<?php
require dirname(__DIR__).'/api/bootstrap.php';
header("Content-Security-Policy: default-src 'self'; style-src 'self'; script-src 'none'; frame-ancestors 'none'; form-action 'self'; base-uri 'none'");
$error=''; $message='';
try {
    $pdo=db(); $c=config();
    if ($_SERVER['REQUEST_METHOD']==='POST') {
        if (!csrf_valid($_POST['csrf'] ?? null)) { http_response_code(403); throw new RuntimeException('Session expired. Refresh and try again.'); }
        $action=$_POST['action'] ?? '';
        if ($action==='login') {
            $hash=ip_hash(); $since=gmdate('Y-m-d H:i:s',time()-900);
            $check=$pdo->prepare('SELECT COUNT(*) FROM login_attempts WHERE ip_hash = ? AND attempted_at >= ?'); $check->execute([$hash,$since]);
            if ((int)$check->fetchColumn()>=5) { http_response_code(429); $error='Too many attempts. Try again in 15 minutes.'; }
            elseif (is_string($_POST['email'] ?? null) && is_string($_POST['password'] ?? null) && strtolower(trim($_POST['email']))===strtolower($c['admin_email']) && password_verify($_POST['password'],$c['admin_password_hash'])) {
                session_regenerate_id(true); $_SESSION['admin']=true; $_SESSION['last_active']=time(); $_SESSION['csrf']=bin2hex(random_bytes(32));
                $pdo->prepare('DELETE FROM login_attempts WHERE ip_hash = ?')->execute([$hash]);
                header('Location: /admin/',true,303); exit;
            } else {
                $pdo->prepare('DELETE FROM login_attempts WHERE attempted_at < ?')->execute([$since]);
                $pdo->prepare('INSERT INTO login_attempts (ip_hash,attempted_at) VALUES (?,?)')->execute([$hash,gmdate('Y-m-d H:i:s')]);
                $error='Incorrect email or password.';
            }
        } elseif (admin_signed_in()) {
            if ($action==='logout') { $_SESSION=[]; session_destroy(); header('Location: /admin/',true,303); exit; }
            $id=$_POST['id'] ?? '';
            if (!is_string($id) || !preg_match('/^[a-f0-9]{32}$/',$id)) throw new RuntimeException('Invalid request.');
            if ($action==='update') {
                $status=$_POST['status'] ?? ''; $notes=$_POST['notes'] ?? '';
                if (!in_array($status,['New','Contacted','Closed'],true) || !is_string($notes) || strlen($notes)>12000) throw new RuntimeException('Invalid status or notes.');
                $pdo->prepare('UPDATE requests SET status = ?, notes = ?, updated_at = ? WHERE id = ?')->execute([$status,$notes,gmdate('Y-m-d H:i:s'),$id]);
                header('Location: /admin/?saved=1',true,303); exit;
            }
            if ($action==='notify') {
                $q=$pdo->prepare('SELECT * FROM requests WHERE id = ?'); $q->execute([$id]); $r=$q->fetch();
                if (!$r) throw new RuntimeException('Request not found.');
                // Retry only pending/failed notifications to avoid accidental duplicate mail.
                if ($r['notification_status']!=='accepted') {
                    $state=notify_request($r); $pdo->prepare('UPDATE requests SET notification_status = ? WHERE id = ?')->execute([$state,$id]);
                }
                header('Location: /admin/?saved=1',true,303); exit;
            }
        } else { http_response_code(401); $error='Please sign in.'; }
    }
    $logged=admin_signed_in(); $rows=[];
    if ($logged) {
        $search=is_string($_GET['q'] ?? null)?substr(trim($_GET['q']),0,180):'';
        $filter=is_string($_GET['status'] ?? null)?$_GET['status']:'';
        $where=[]; $params=[];
        if ($search!=='') { $where[]='(name LIKE ? OR company LIKE ? OR email LIKE ?)'; $params=array_fill(0,3,'%'.$search.'%'); }
        if (in_array($filter,['New','Contacted','Closed'],true)) { $where[]='status = ?'; $params[]=$filter; }
        $sql='SELECT * FROM requests'.($where?' WHERE '.implode(' AND ',$where):'').' ORDER BY created_at DESC LIMIT 100';
        $q=$pdo->prepare($sql); $q->execute($params); $rows=$q->fetchAll();
    }
} catch (Throwable $e) {
    $logged=false; http_response_code(http_response_code()>=400?http_response_code():503);
    $error=$e instanceof PDOException?'The dashboard database is unavailable.':($e->getMessage()==='Session expired. Refresh and try again.'?$e->getMessage():'The dashboard is not configured yet.');
    error_log('UC-TECH dashboard: '.get_class($e));
}
?><!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Requests | UC-TECH</title><link rel="stylesheet" href="/assets/admin.css"></head><body><main>
<header><a href="/">UC-TECH</a><h1>Consultation requests</h1><?php if ($logged): ?><form method="post"><input type="hidden" name="csrf" value="<?=h($_SESSION['csrf'])?>"><button name="action" value="logout">Sign out</button></form><?php endif ?></header>
<?php if ($error): ?><p class="notice" role="alert"><?=h($error)?></p><?php endif ?>
<?php if (!$logged): ?><section class="login"><h2>Client sign in</h2><form method="post"><input type="hidden" name="csrf" value="<?=h($_SESSION['csrf'])?>"><label>Email<input type="email" name="email" autocomplete="username" required maxlength="180"></label><label>Password<input type="password" name="password" autocomplete="current-password" required maxlength="200"></label><button name="action" value="login">Sign in</button></form></section>
<?php else: ?>
<?php if (isset($_GET['saved'])): ?><p class="notice">Request updated.</p><?php endif ?>
<form class="filters" method="get"><label>Search<input name="q" value="<?=h($search)?>" placeholder="Name, company or email"></label><label>Status<select name="status"><option value="">All</option><?php foreach (['New','Contacted','Closed'] as $s): ?><option <?= $filter===$s?'selected':'' ?>><?=h($s)?></option><?php endforeach ?></select></label><button>Filter</button></form>
<p>Showing up to 100 most recent matching requests. Times are UTC.</p>
<?php if (!$rows): ?><section class="request"><h2>No requests found</h2><p>New consultation requests will appear here.</p></section><?php endif ?>
<?php foreach ($rows as $r): ?><article class="request"><div class="request-head"><h2><?=h($r['name'])?></h2><span class="badge"><?=h($r['status'])?></span></div><p><?=h($r['company'])?> · <?=h($r['service'])?></p><p><a href="mailto:<?=h($r['email'])?>"><?=h($r['email'])?></a> · <?=h($r['phone'])?></p><p class="message"><?=h($r['message'])?></p><p class="meta">Reference <?=h($r['id'])?> · <?=h($r['created_at'])?> UTC</p>
<form method="post"><input type="hidden" name="csrf" value="<?=h($_SESSION['csrf'])?>"><input type="hidden" name="id" value="<?=h($r['id'])?>"><label>Status<select name="status"><?php foreach (['New','Contacted','Closed'] as $s): ?><option <?= $r['status']===$s?'selected':'' ?>><?=h($s)?></option><?php endforeach ?></select></label><label>Internal notes<textarea name="notes" rows="3" maxlength="4000"><?=h($r['notes'])?></textarea></label><button name="action" value="update">Save changes</button></form>
<p class="meta">Email notification: <?=h($r['notification_status'])?>. “Accepted” means accepted by the mail server; inbox delivery is not confirmed.</p>
<?php $deliveryQuery=$pdo->prepare('SELECT recipient, status FROM notification_deliveries WHERE request_id = ?'); $deliveryQuery->execute([$r['id']]); foreach ($deliveryQuery->fetchAll() as $delivery): ?><p class="meta"><?=h($delivery['recipient'])?>: <?=h($delivery['status'])?></p><?php endforeach ?>
<?php if ($r['notification_status']!=='accepted'): ?><form method="post"><input type="hidden" name="csrf" value="<?=h($_SESSION['csrf'])?>"><input type="hidden" name="id" value="<?=h($r['id'])?>"><button class="secondary" name="action" value="notify">Retry email notification</button></form><?php endif ?></article><?php endforeach ?>
<?php endif ?></main></body></html>
