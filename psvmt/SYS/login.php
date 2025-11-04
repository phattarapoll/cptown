<?php
session_start();

if ($_POST[op] != "ds") {
	$display_block = "
		<center><form method=POST action=\"$_SERVER[PHP_SELF]\">
		<table>
			<tr>
				<td>Username :</td>
				<td><input name=\"username\" type=\"text\" size=\"20\"></td>
			</tr>
			<tr>
				<td>Password :</td>
				<td><input name=\"password\" type=\"password\" size=\"20\"></td>
			</tr>
			<tr>
				<td>&nbsp;</td>
				<td>
					<input type=\"hidden\" name=\"op\" value=\"ds\">
					<input type=submit name=\"submit\" value=\"ok\">
                                                                                                           <input type=\"reset\" value=\"delete\" name=\"reset\">
				</td>
			</tr>
		</table>
	    </form></center>";

} else {
		include 'config.php';
		if ($_POST['username'] == "$adminuser" AND $_POST['password'] == "$adminpass") {
			$_SESSION[login] = "true";
			$_SESSION[username] = "$adminuser";
			header("Location: $redirectpage");
        		exit;
		} else {
		        $display_block = "<center><font face=\"Tahoma\" size=\"2\">You entered an incorrect username or password, please go back and enter again. <a href=\"$_SERVER[PHP_SELF]\">กลับไปกรอกใหม่ คลิ๊กที่นี่</a></font></center>";
		}
}

?>

<!-- เริ่มต้น Code HTML ไว้แก้ไขรูปแบบหน้าตาของหน้านี้ -->
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN">
<html>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<head>
  <title>ADMIN PSVMT</title>
<body>

  <style type="text/css">
body {
	padding-left: 2em;
	font-family: Georgia, "Times New Roman",
        Times, serif;
  color: purple;
  background-color: #CC99FF }
.image {
  height: 100px;
  width: 100px;  
  image-rendering: auto;
}
h1 {
  font-family: Helvetica, Geneva, Arial,
        SunSans-Regular, sans-serif }
td {
  margin-top: 0em;
  padding-top: 0em;
  border-bottom: 0px dotted blue;
  font-color: #CC00FF;
  }
 
  </style>
</head>
<style>
body, td
{
	font-family: Times New Roman;
	font-size: 10pt;
}
</style>
</head>

<body bgcolor="#FFFFCC">
<br><br>
<center><font face="Times New Roman" size="6" color="#FF0000">
Login For ADMIN</font></center>
<br><br>

<!-- หากต้องการให้แสดง FORM ไว้ LOGIN ที่ไหนก็นำ CODE บรรทัดด้านล่างไปไว้ที่นั่นครับ -->
<?php echo "$display_block"; ?>

</body>
</html>
<!-- สิ้นสุด Code HTML ไว้แก้ไขรูปแบบหน้าตาของหน้านี้ -->