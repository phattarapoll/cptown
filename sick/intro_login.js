document.addEventListener('DOMContentLoaded', function() {
    const appsScriptUrl = 'https://script.google.com/macros/s/AKfycbyHl1Bny2wB--upeU0PBwafooNrmddwVrzLZz70r3sRUn6ep9CfCyVSJidtw-f_kEZsUw/exec';

    const loginModal = document.getElementById('login-modal');
    const officerSelect = document.getElementById('officer-select');
    const loginStatus = document.getElementById('login-status');
    const loginInfo = document.getElementById('login-info');
    const loginMessage = document.getElementById('login-message');
    
    // ฟังก์ชันสำหรับดึงรายชื่อบุคลากรทั้งหมด
    async function fetchAllOfficers() {
        try {
            const response = await fetch(appsScriptUrl, {
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                body: `action=getOfficerList` // เรียกใช้ฟังก์ชันที่ดึงรายชื่อทั้งหมด
            });
            const result = await response.json();
            if (result.success && result.officers.length > 0) {
                officerSelect.innerHTML = '<option value="">กรุณาเลือกชื่อ</option>';
                result.officers.forEach(officer => {
                    const option = document.createElement('option');
                    option.value = officer.id;
                    option.textContent = officer.name;
                    officerSelect.appendChild(option);
                });
            } else {
                officerSelect.innerHTML = '<option value="">ไม่พบรายชื่อบุคลากร</option>';
                console.error('Failed to fetch officer list:', result.message);
            }
        } catch (error) {
            console.error('Error fetching officer list:', error);
            loginStatus.textContent = 'เกิดข้อผิดพลาดในการดึงรายชื่อ';
        }
    }

    // เมื่อเลือกชื่อแล้ว ให้ล็อกอินอัตโนมัติ
    officerSelect.addEventListener('change', function() {
        const userId = this.value;
        if (userId) {
            loginStatus.textContent = 'กำลังเข้าสู่ระบบ...';
            // ในที่นี้สมมติว่าไม่มีการใช้รหัสผ่าน
            loginModal.style.display = 'none';
            const selectedOfficerName = officerSelect.options[officerSelect.selectedIndex].text;
            loginInfo.style.display = 'block';
            loginMessage.innerHTML = `เข้าสู่ระบบในฐานะ: <strong>${selectedOfficerName}</strong>`;
            
            // เรียกฟังก์ชันสำหรับดึงข้อมูลผู้ใช้เพื่อแสดงฟอร์ม
            if (typeof window.showLeaveForm === 'function') {
                window.showLeaveForm(userId);
            }
        }
    });

    // แสดงป๊อปอัปเมื่อโหลดหน้าเสร็จ
    loginModal.style.display = 'flex';
    fetchAllOfficers();
});