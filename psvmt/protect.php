<?php
session_start();

// เช็คว่า User ได้ผ่านการ Login มาหรือไม่ (ถ้าไม่ได้ Login มาให้ส่งต่อไปหน้าไหนก็ใส่ URL ลงไปครับ ตรงตำแหน่ง login.php)
if (!isset($_SESSION[login])) {
     header("Location: login.php");
     exit;
}

?>

<html>

<head>
<meta name="GENERATOR" content="Microsoft FrontPage 5.0">
<meta name="ProgId" content="FrontPage.Editor.Document">
<meta http-equiv="Content-Type" content="text/html; charset=windows-874">
<title>ยินดีต้อนรับ คุณ <?php echo "$username"; ?> ครับ</title>
</head>

<body bgcolor="#CCFFFF">

<p align="center"><b><font face="MS Sans Serif" size="5" color="#000080">ยินดีต้อนรับครับ คุณ <?php echo "$username"; ?> ครับ
</font></b></p>

<p align="center">&nbsp;</p>
<p align="center">
        <font face="MS Sans Serif" size="2" color="#000080">ในหน้านี้เรา</font><font face="MS Sans Serif" size="2" color="#800000">ควรจะทำปุ่ม
        LOGOUT ไว้ด้วยครับ</font><font face="MS Sans Serif" size="2" color="#000080"> 
        เพราะว่าไม่งั้นแล้วหากมีคนอื่นที่มาเล่นต่อจากเราจะสามารถเข้าหน้านี้ได้ครับ
        ส่วนวิธีทำก็ง่ายๆครับ<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </font>
        <font face="MS Sans Serif" size="2" color="#008080">แค่ทำ
        LINK ให้ชี้ไปที่ URL ของไฟล์ logout.php</font><font face="MS Sans Serif" size="2" color="#000080">
        ก็เป็นอันเสร็จสิ้นครับ</font></p>
<p align="center">&nbsp;</p>
<p align="center"><font face="MS Sans Serif" size="1"><a href="http://psvmt.6te.net/login.php">Logout ออกจากระบบ</a></font></p>

</body>

</html>