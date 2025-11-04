<?php

session_start();
session_destroy();

// ใส่ URL ของหน้าที่ต้องการให้ไป หลังจากทำการ Logout แล้ว ลงไปครับ ตรงตำแหน่ง login.php)
header("Location: "http://psvmt.6te.net/login.php");

?>