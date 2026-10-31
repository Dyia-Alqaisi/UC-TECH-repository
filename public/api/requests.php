<?php
require __DIR__.'/bootstrap.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_response(['error'=>'Method not allowed'],405);
if (!csrf_valid($_SERVER['HTTP_X_CSRF_TOKEN'] ?? null)) json_response(['error'=>'Your session expired. Refresh this page and try again.'],403);
if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0)>16384) json_response(['error'=>'Request too large'],413);
$raw=file_get_contents('php://input',false,null,0,16385);
if (strlen($raw)>16384) json_response(['error'=>'Request too large'],413);
$input=json_decode($raw,true);
if (!is_array($input)) json_response(['error'=>'Invalid request'],400);
if (!empty($input['website'])) json_response(['error'=>'Unable to accept this request'],422);
$r=[]; $limits=['name'=>100,'company'=>150,'email'=>180,'phone'=>30,'service'=>40,'message'=>2000];
foreach ($limits as $field=>$limit) {
    if (!isset($input[$field]) || !is_string($input[$field])) json_response(['error'=>'Please complete every required field.'],422);
    $value=trim($input[$field]);
    if ($value==='' || preg_match('//u',$value)!==1 || preg_match('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/',$value) || preg_match_all('/./us',$value)>$limit) json_response(['error'=>'Please check the '.$field.' field.'],422);
    $r[$field]=$value;
}
if (!filter_var($r['email'],FILTER_VALIDATE_EMAIL) || preg_match('/[\r\n]/',$r['email'])) json_response(['error'=>'Enter a valid email address.'],422);
$digits=preg_replace('/\D/','',$r['phone']);
if (!preg_match('/^\+?[\d\s().-]+$/',$r['phone']) || strlen($digits)<7 || strlen($digits)>15) json_response(['error'=>'Enter a valid phone number.'],422);
if (preg_match_all('/./us',$r['message'])<10 || !in_array($r['service'],['Cloud','AI','Cybersecurity','Multiple services','Help me choose'],true)) json_response(['error'=>'Please check your service and message.'],422);
$key=$input['submission_key'] ?? '';
if (!is_string($key) || !preg_match('/^[a-f0-9-]{36}$/i',$key)) json_response(['error'=>'Invalid submission reference'],422);
try {
    $pdo=db();
    $find=$pdo->prepare('SELECT id FROM requests WHERE submission_key = ?'); $find->execute([$key]);
    if ($existing=$find->fetch()) json_response(['id'=>$existing['id'],'saved'=>true]);
    $hash=ip_hash();
    $count=$pdo->prepare('SELECT COUNT(*) FROM requests WHERE ip_hash = ? AND created_at >= ?');
    $count->execute([$hash,gmdate('Y-m-d H:i:s',time()-3600)]);
    if ((int)$count->fetchColumn()>=10) { header('Retry-After: 3600'); json_response(['error'=>'Too many requests. Please call or email us, or try again later.'],429); }
    $r['id']=bin2hex(random_bytes(16)); $now=gmdate('Y-m-d H:i:s');
    $insert=$pdo->prepare('INSERT INTO requests (id, submission_key, name, company, email, phone, service, message, status, notes, notification_status, ip_hash, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
    try { $insert->execute([$r['id'],$key,$r['name'],$r['company'],$r['email'],$r['phone'],$r['service'],$r['message'],'New','','pending',$hash,$now,$now]); }
    catch (PDOException $e) {
        $find->execute([$key]);
        if ($existing=$find->fetch()) json_response(['id'=>$existing['id'],'saved'=>true]);
        throw $e;
    }
    try { $state=notify_request($r); $pdo->prepare('UPDATE requests SET notification_status = ? WHERE id = ?')->execute([$state,$r['id']]); }
    catch (Throwable $e) { error_log('UC-TECH notification failed for '.$r['id']); }
    json_response(['id'=>$r['id'],'saved'=>true],201);
} catch (Throwable $e) {
    error_log('UC-TECH request storage unavailable: '.get_class($e));
    json_response(['error'=>'We could not save your request. Please try again or contact info@uc-tech.cloud.'],503);
}
