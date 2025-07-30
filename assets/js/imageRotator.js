document.addEventListener('DOMContentLoaded', function() {
    // กำหนดลิสต์ของไฟล์รูปภาพ (GIF) ที่จะใช้ในการหมุนเวียน
    const images = [
        'Image/01.gif',
        'Image/02.gif',
        'Image/03.gif',
        // คุณสามารถเพิ่มไฟล์ GIF อื่นๆ ที่มีอยู่ในโฟลเดอร์ Image/ ได้ที่นี่
        // เช่น 'Image/05.gif', 'Image/06.gif', etc.
    ];

    // รับอ้างอิงถึงองค์ประกอบรูปภาพใน HTML ที่มี id เป็น 'rotatingImage'
    const rotatingImage = document.getElementById('rotatingImage');
    // กำหนดดัชนีปัจจุบันของรูปภาพที่แสดงอยู่ เริ่มต้นที่ -1 เพื่อให้ภาพแรกเป็นภาพสุ่ม
    let currentIndex = -1; 
    // ตัวแปรสำหรับเก็บ ID ของ setTimeout เพื่อใช้ในการยกเลิก (clear) การเปลี่ยนภาพครั้งถัดไป
    let imageChangeTimeout; 

    // สำคัญ: ประมาณการระยะเวลาเล่นสูงสุดของไฟล์ GIF ทั้งหมดของคุณในหน่วยมิลลิวินาที
    // ตัวอย่างเช่น หาก GIF ที่ยาวที่สุดของคุณใช้เวลา 3 วินาที ให้ตั้งค่านี้เป็น 3000
    // คุณอาจต้องการเพิ่มเวลาบัฟเฟอร์เล็กน้อย (เช่น 500ms) เพื่อให้แน่ใจว่า GIF เล่นจนจบ
    const GIF_PLAY_DURATION = 10000; // ตัวอย่าง: 10 วินาที (ปรับค่านี้ตามความยาว GIF ของคุณ)

    // ฟังก์ชันสำหรับแสดงภาพสุ่มถัดไป
    function showRandomImage() {
        // ยกเลิก setTimeout ที่ค้างอยู่ (ถ้ามี) เพื่อป้องกันการเรียกซ้ำซ้อน
        clearTimeout(imageChangeTimeout);

        // เพิ่มคลาส 'fading' เพื่อเริ่มการเฟดภาพออกไป
        rotatingImage.classList.add('fading'); 

        // ตั้งเวลาหน่วง 0.5 วินาที เพื่อให้ภาพค่อยๆ เฟดออก
        setTimeout(() => {
            let randomIndex;
            do {
                // สุ่มหาดัชนีของภาพใหม่
                randomIndex = Math.floor(Math.random() * images.length);
            } while (randomIndex === currentIndex); // ตรวจสอบให้แน่ใจว่าภาพไม่ซ้ำกับภาพที่แสดงอยู่ปัจจุบัน

            // อัปเดตดัชนีปัจจุบันเป็นภาพใหม่ที่สุ่มได้
            currentIndex = randomIndex;
            // ตั้งค่า src ของรูปภาพเป็นภาพใหม่
            rotatingImage.src = images[currentIndex]; 
            // อัปเดต alt text สำหรับรูปภาพ (สำคัญสำหรับ SEO และการเข้าถึง)
            rotatingImage.alt = `ภาพกิจกรรม ${currentIndex + 1}`; 

            // บังคับให้เบราว์เซอร์ทำการ "reflow" เพื่อให้ภาพเคลื่อนไหวได้อีกครั้ง
            // โดยเฉพาะอย่างยิ่งหากโหลดภาพเดิมซ้ำอย่างรวดเร็ว (ป้องกันปัญหา caching)
            void rotatingImage.offsetWidth;

            // ลบคลาส 'fading' ออก
            rotatingImage.classList.remove('fading'); 
            // เพิ่มคลาส 'visible' เพื่อเริ่มการเฟดภาพเข้า
            rotatingImage.classList.add('visible'); 

            // เมื่อภาพใหม่โหลดเสร็จสมบูรณ์ (หรือเกือบจะทันทีหากอยู่ในแคช)
            // ตั้งเวลาสำหรับแสดงภาพถัดไป โดยจะเปลี่ยนหลังจาก 'GIF_PLAY_DURATION' ผ่านไป
            rotatingImage.onload = () => {
                imageChangeTimeout = setTimeout(showRandomImage, GIF_PLAY_DURATION);
            };

            // หากรูปภาพถูกโหลดมาจากแคชแล้ว (onload อาจไม่ทำงานอย่างน่าเชื่อถือสำหรับภาพในแคช)
            // ให้ตั้ง setTimeout ทันที
            if (rotatingImage.complete) {
                imageChangeTimeout = setTimeout(showRandomImage, GIF_PLAY_DURATION);
            }

        }, 500); // รอ 0.5 วินาทีเพื่อให้การเฟดออกเริ่มต้น
    }

    // ส่วนนี้จะทำงานทันทีที่หน้าเว็บโหลด:

    // สุ่มเลือกภาพแรกที่จะแสดง
    let initialIndex = Math.floor(Math.random() * images.length);
    // กำหนดให้เป็นภาพปัจจุบัน
    currentIndex = initialIndex;
    // กำหนด src และ alt text ของภาพแรก
    rotatingImage.src = images[currentIndex];
    rotatingImage.alt = `ภาพกิจกรรม ${currentIndex + 1}`;
    // เพิ่มคลาส 'visible' เพื่อให้ภาพแรกแสดงขึ้นมา
    rotatingImage.classList.add('visible');

    // เริ่มการหมุนเวียนภาพหลังจากภาพแรกโหลดเสร็จสมบูรณ์และแสดงขึ้นมา
    rotatingImage.onload = () => {
        imageChangeTimeout = setTimeout(showRandomImage, GIF_PLAY_DURATION);
    };

    // Fallback สำหรับกรณีที่ภาพแรกถูกโหลดจากแคช (onload อาจไม่ทำงาน)
    if (rotatingImage.complete) {
        imageChangeTimeout = setTimeout(showRandomImage, GIF_PLAY_DURATION);
    }
});