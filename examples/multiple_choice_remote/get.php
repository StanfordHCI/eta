<?php

header('Access-Control-Allow-Origin: '.$_SERVER['HTTP_ORIGIN']);
header('Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/javascript');

$data = file_get_contents('data.json');

$callback_name = "callback";
if (isset($_GET['callback'])) {
  $callback_name = $_GET['callback'];
}
echo $callback_name . "(\n";
echo $data;
echo ");";

?>
