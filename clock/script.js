function updateClockAndDate() {
    const now = new Date();

    // สำหรับนาฬิกา
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    document.getElementById('digitalClock').textContent = `${hours}:${minutes}:${seconds}`;

    // สำหรับวันที่
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = now.toLocaleDateString('th-TH', options); // แสดงผลเป็นภาษาไทย
    document.getElementById('currentDate').textContent = dateString;
}

// อัปเดตทุก 1 วินาที
setInterval(updateClockAndDate, 1000);

// เรียกใช้ครั้งแรกเมื่อโหลดหน้า
updateClockAndDate();