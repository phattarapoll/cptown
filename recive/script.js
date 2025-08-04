document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('satisfactionForm');
    // const responseMessage = document.getElementById('responseMessage'); // ลบออกเมื่อใช้ SweetAlert2

    // *** สำคัญ: แทนที่ด้วย URL ของ Web App ที่คุณ Deploy จาก Google Apps Script ***
    // ดูวิธีการ Deploy ด้านล่างในส่วนของ Google Apps Script
    const GOOGLE_APPS_SCRIPT_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzBKuod5FWjhYGQzBbPc2ZJ2VMBKj9_LyVRoMW1R7m_BxyzQ5rKlmtI_TgSulLOdt5e0g/exec'; // เปลี่ยนตรงนี้

    // ฟังก์ชันสำหรับปุ่ม "เลือก 5 ทั้งหมด"
    document.querySelectorAll('.btn-fill-5').forEach(button => {
        button.addEventListener('click', function() {
            const section = this.dataset.section; // 'part2' หรือ 'part3'
            const ratingGroups = document.querySelectorAll(`.rating-group[data-section="${section}"]`);

            ratingGroups.forEach(group => {
                // หา input radio ที่มี value เป็น '5' ภายในแต่ละ rating-group และสั่งให้ถูกเลือก
                const input5 = group.querySelector('input[type="radio"][value="5"]');
                if (input5) {
                    input5.checked = true;
                }
            });
        });
    });

    // ฟังเหตุการณ์เมื่อฟอร์มถูกส่ง
    form.addEventListener('submit', function(e) {
        e.preventDefault(); // ป้องกันการ Submit แบบปกติของฟอร์ม

        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });

        // แสดง SweetAlert2 Loading
        Swal.fire({
            title: 'กำลังส่งข้อมูล...',
            text: 'กรุณารอสักครู่',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        fetch(GOOGLE_APPS_SCRIPT_WEB_APP_URL, {
            method: 'POST',
            mode: 'no-cors', // สำคัญมากสำหรับ Google Apps Script เพื่อหลีกเลี่ยง CORS
            headers: {
                'Content-Type': 'application/json', // เปลี่ยนเป็น application/json
            },
            body: JSON.stringify(data) // แปลง Object เป็น JSON string
        })
        .then(response => {
            // เนื่องจาก 'no-cors' จะไม่สามารถตรวจสอบ response.ok ได้โดยตรง
            // เราจะถือว่าสำเร็จหากไม่มีข้อผิดพลาดในการ fetch
            Swal.close(); // ปิด loading

            // แสดง SweetAlert2 สำหรับข้อความสำเร็จ
            Swal.fire({
                title: 'ซาบซึ้งใจยิ่งนัก!',
                html: 'ทีมงานรู้สึกปลาบปลื้มเป็นอย่างยิ่งสำหรับคำแนะนำอันทรงคุณค่าที่ท่านได้มอบให้<br>ทุกความคิดเห็นของท่านคือแรงขับเคลื่อนสำคัญที่ช่วยให้เรามุ่งมั่นพัฒนาบริการให้ดียิ่งขึ้นไป<br><br>ขอขอบพระคุณเป็นอย่างสูงที่ท่านได้สละเวลาอันมีค่านั่งตอบแบบสอบถามนี้ ความร่วมมือจากท่านคือกำลังใจอันยิ่งใหญ่ของเราอย่างแท้จริง',
                icon: 'success',
                confirmButtonText: 'รับทราบ',
                customClass: {
                    title: 'swal2-title-custom',
                    htmlContainer: 'swal2-html-container-custom'
                }
            }).then(() => {
                form.reset(); // ล้างฟอร์มหลังจากผู้ใช้กด OK
            });
        })
        .catch(error => {
            Swal.close(); // ปิด loading
            console.error('Error!', error.message);
            // แสดง SweetAlert2 สำหรับข้อความผิดพลาด
            Swal.fire({
                title: 'เกิดข้อผิดพลาด!',
                text: 'ไม่สามารถส่งข้อมูลได้ กรุณาลองใหม่อีกครั้ง หรือติดต่อผู้ดูแลระบบ',
                icon: 'error',
                confirmButtonText: 'ตกลง'
            });
        });
    });
});