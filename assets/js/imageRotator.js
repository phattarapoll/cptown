document.addEventListener('DOMContentLoaded', function() {
    const images = [
        'Image/01.gif',
        'Image/02.gif',
        'Image/03.gif',
        // คุณสามารถเพิ่มไฟล์ GIF อื่นๆ ที่มีอยู่ในโฟลเดอร์ Image/ ได้ที่นี่
        // เช่น 'Image/05.gif', 'Image/06.gif', etc.
    ];

    const rotatingImage = document.getElementById('rotatingImage');
    let currentIndex = -1; // เริ่มต้นที่ -1 เพื่อให้ภาพแรกที่แสดงเป็นภาพสุ่ม

    function showRandomImage() {
        rotatingImage.classList.add('fading'); // เริ่มต้นการเฟดออก

        setTimeout(() => {
            let randomIndex;
            do {
                randomIndex = Math.floor(Math.random() * images.length);
            } while (randomIndex === currentIndex); // ตรวจสอบให้แน่ใจว่าภาพไม่ซ้ำกับภาพที่แสดงอยู่

            currentIndex = randomIndex;
            rotatingImage.src = images[currentIndex]; // ใช้ currentIndex เพื่อเข้าถึงภาพ
            rotatingImage.alt = `ภาพกิจกรรม ${currentIndex + 1}`; // อัปเดต alt text

            // บังคับให้เบราว์เซอร์ทำการ reflow เพื่อให้ภาพเคลื่อนไหวได้อีกครั้ง หากโหลดภาพเดิมซ้ำอย่างรวดเร็ว
            void rotatingImage.offsetWidth;

            rotatingImage.classList.remove('fading'); // ลบคลาส fading
            rotatingImage.classList.add('visible'); // เฟดเข้า
        }, 500); // รอ 0.5 วินาทีเพื่อให้การเฟดออกเริ่มต้น
    }

    // แสดงภาพสุ่มแรกทันทีที่หน้าเว็บโหลด
    let initialIndex = Math.floor(Math.random() * images.length);
    currentIndex = initialIndex;
    rotatingImage.src = images[currentIndex];
    rotatingImage.alt = `ภาพกิจกรรม ${currentIndex + 1}`;
    rotatingImage.classList.add('visible');

    // ตั้งค่าการเปลี่ยนภาพทุก 4 วินาที (3 วินาทีแสดงภาพ + 1 วินาทีสำหรับการเปลี่ยนผ่าน)
    setInterval(showRandomImage, 4000);
});