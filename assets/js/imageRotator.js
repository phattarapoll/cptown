document.addEventListener('DOMContentLoaded', function() {
    // กำหนดไฟล์รูปภาพ (GIF) ที่จะใช้
    const imagePath = 'Image/01.gif'; 

    // รับอ้างอิงถึงองค์ประกอบรูปภาพใน HTML ที่มี id เป็น 'rotatingImage'
    const rotatingImage = document.getElementById('rotatingImage');

    // ตั้งค่า src และ alt text ของรูปภาพ
    rotatingImage.src = imagePath;
    rotatingImage.alt = 'ภาพกิจกรรม'; // ตั้งค่า alt text ที่เหมาะสม

    // เพิ่มคลาส 'visible' เพื่อให้ภาพแสดงขึ้นมา
    rotatingImage.classList.add('visible');

    // ไม่ต้องมีฟังก์ชันสำหรับการเปลี่ยนภาพหรือการสุ่ม 
    // เพราะเราต้องการแสดงภาพเดียวตลอดไป
});