<?php
require __DIR__.'/bootstrap.php';
if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_response(['error'=>'Method not allowed'],405);
json_response(['token'=>$_SESSION['csrf']]);
