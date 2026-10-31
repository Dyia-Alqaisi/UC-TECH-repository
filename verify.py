import http.cookiejar, json, os, pathlib, re, secrets, shutil, socket, sqlite3, subprocess, tempfile, time, urllib.request, urllib.error, urllib.parse

root = pathlib.Path(__file__).parent
with tempfile.TemporaryDirectory(prefix='uc-tech-check-', dir=root.parent) as td:
    temp = pathlib.Path(td)
    assert temp.resolve().is_relative_to(root.parent.resolve())
    shutil.copytree(root / 'public', temp / 'public')
    bootstrap=temp/'public'/'api'/'bootstrap.php'
    source=bootstrap.read_text()
    source=source.replace("session_start();", "ini_set('session.save_path', '"+str(temp).replace('\\','/')+"');\nsession_start();")
    bootstrap.write_text(source)
    dbfile = temp / 'test.sqlite'
    conn = sqlite3.connect(dbfile)
    conn.executescript('''CREATE TABLE requests (id TEXT PRIMARY KEY, submission_key TEXT UNIQUE, name TEXT, company TEXT, email TEXT, phone TEXT, service TEXT, message TEXT, status TEXT, notes TEXT, notification_status TEXT, ip_hash TEXT, created_at TEXT, updated_at TEXT);
    CREATE TABLE login_attempts (ip_hash TEXT, attempted_at TEXT);
    CREATE TABLE notification_deliveries (request_id TEXT, recipient TEXT, status TEXT, attempted_at TEXT, PRIMARY KEY(request_id,recipient));''')
    test_password=secrets.token_urlsafe(32)
    test_key=secrets.token_hex(32)
    password_hash = subprocess.check_output(['php','-r',"echo password_hash(trim(stream_get_contents(STDIN)), PASSWORD_DEFAULT);"],input=test_password,text=True)
    config = "<?php return ['dsn'=>'sqlite:"+str(dbfile).replace('\\','/')+"','db_user'=>'','db_password'=>'','admin_email'=>'admin@example.test','admin_password_hash'=>'"+password_hash+"','app_key'=>'"+test_key+"','mail_enabled'=>false];"
    (temp/'uc-tech-config.php').write_text(config)
    cookie=''
    cgi=shutil.which('php-cgi') or str(pathlib.Path(shutil.which('php')).with_name('php-cgi.exe'))
    def call(path, data=None, headers=None):
        global cookie
        parsed=urllib.parse.urlsplit(path)
        script=parsed.path
        if script.endswith('/'): script+='index.php'
        env=os.environ.copy()
        env.update(REDIRECT_STATUS='200',REQUEST_METHOD='POST' if data is not None else 'GET',SCRIPT_FILENAME=str(temp/'public'/script.lstrip('/')),SCRIPT_NAME=script,REQUEST_URI=path,QUERY_STRING=parsed.query,SERVER_PROTOCOL='HTTP/1.1',SERVER_NAME='localhost',REMOTE_ADDR='127.0.0.1',HTTP_COOKIE=cookie,CONTENT_LENGTH=str(len(data or b'')),CONTENT_TYPE=(headers or {}).get('Content-Type','application/x-www-form-urlencoded'))
        for k,v in (headers or {}).items():
            if k.lower()!='content-type': env['HTTP_'+k.upper().replace('-','_')]=v
        run=subprocess.run([cgi,'-d','session.save_path='+str(temp)],input=data or b'',env=env,stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=10)
        raw=run.stdout.decode().replace('\r\n','\n')
        if run.stderr: print(run.stderr.decode())
        head,_,body=raw.partition('\n\n')
        for line in head.splitlines():
            if line.lower().startswith('set-cookie:'): cookie=line.split(':',1)[1].strip().split(';',1)[0]
        status=re.search(r'^Status: (\d+)',head,re.M)
        code=int(status.group(1)) if status else 200
        location=re.search(r'^Location: (.+)',head,re.M)
        if location and code in (302,303): return call(location.group(1).strip())
        return code,body
    def post_request(data, token):
        return call('/api/requests.php',json.dumps(data).encode(),{'Content-Type':'application/json','X-CSRF-Token':token})
    def form(data): return call('/admin/',urllib.parse.urlencode(data).encode())
    try:
        token=json.loads(call('/api/csrf.php')[1])['token']
        payload=dict(name='<script>alert(1)</script>',company='Test Company',email='test@example.com',phone='+962795030661',service='Cloud',message='Clearly marked integration test request.',submission_key='11111111-1111-4111-8111-111111111111',website='')
        assert post_request(payload,'wrong')[0]==403
        bad=payload|{'phone':'abc'}; result=post_request(bad,token); assert result[0]==422,result
        bad=payload|{'website':'spam.example'}; assert post_request(bad,token)[0]==422
        code,body=post_request(payload,token); assert code==201,(code,body)
        ref=json.loads(body)['id']
        code,body=post_request(payload,token); assert code==200 and json.loads(body)['id']==ref
        assert conn.execute('SELECT COUNT(*) FROM requests').fetchone()[0]==1
        assert conn.execute('SELECT notification_status FROM requests').fetchone()[0]=='pending'
        code,body=call('/admin/'); assert code==200 and 'Test Company' not in body
        assert form(dict(csrf=token,action='update',id=ref,status='Closed',notes='unauthorised'))[0]==401
        code,body=form(dict(csrf=token,action='login',email='admin@example.test',password=test_password))
        assert code==200 and 'Test Company' in body
        assert '&lt;script&gt;alert(1)&lt;/script&gt;' in body and '<script>alert(1)</script>' not in body
        csrf=re.search('name="csrf" value="([a-f0-9]+)"',body).group(1)
        code,body=form(dict(csrf=csrf,action='update',id=ref,status='Contacted',notes='Called the visitor.'))
        assert code==200 and 'Called the visitor.' in body
        assert conn.execute('SELECT status FROM requests WHERE id=?',(ref,)).fetchone()[0]=='Contacted'
        assert form(dict(csrf='wrong',action='update',id=ref,status='Closed',notes='bad'))[0]==403
        for n in range(2,11):
            p=payload|{'submission_key':f'{n:08d}-1111-4111-8111-111111111111'}
            code,body=post_request(p,csrf); assert code==201,(n,code,body)
        assert post_request(payload|{'submission_key':'99999999-1111-4111-8111-111111111111'},csrf)[0]==429
        form(dict(csrf=csrf,action='logout'))
        token=json.loads(call('/api/csrf.php')[1])['token']
        for _ in range(5):
            assert form(dict(csrf=token,action='login',email='info@uc-tech.cloud',password='wrong'))[0]==200
        assert form(dict(csrf=token,action='login',email='info@uc-tech.cloud',password='wrong'))[0]==429
        (temp/'uc-tech-config.php').unlink()
        # Storage failure must not return success.
        code,body=post_request(payload|{'submission_key':'88888888-1111-4111-8111-111111111111'},token)
        assert code==503 and 'saved' not in json.loads(body),(code,body)
        print('PASS: save, idempotent retry, server validation, CSRF, spam field, access control, XSS escaping, admin updates, submission limit, login limit, and storage failure.')
        print('Email intentionally disabled. PHP CGI and SQLite integration fixture used; MySQL deployment and browser QA remain to be verified.')
    finally:
        conn.close()
