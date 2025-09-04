document.addEventListener('DOMContentLoaded', function() {
    const appsScriptUrl = 'https://script.google.com/macros/s/AKfycbzHe6eIcMBN7O1PfZvXS1LXMzgrIC5ReWDDJiznzn6v3nOH6Qjum8inWxSqype_38Bchw/exec';

    const loginModal = document.getElementById('login-modal');
    const officerSelect = document.getElementById('officer-select');
    const passwordDisplay = document.getElementById('password-display');
    const numericKeypad = document.getElementById('numeric-keypad');
    const loginStatus = document.getElementById('login-status');
    const loginInfo = document.getElementById('login-info');
    const loginMessage = document.getElementById('login-message');
    const logoutButton = document.getElementById('logout-button');
    const pendingRequestsSection = document.getElementById('pending-requests-section');

    let currentPassword = '';

    // ฟังก์ชันสำหรับดึงรายชื่อผู้ดูแลระบบจาก Apps Script
    async function fetchAdmins() {
        try {
            const response = await fetch(appsScriptUrl, {
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                body: `action=getAdmins` // เรียกใช้ฟังก์ชันใหม่
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
                officerSelect.innerHTML = '<option value="">ไม่พบผู้ดูแลระบบ</option>';
                console.error('Failed to fetch admin list:', result.message);
            }
        } catch (error) {
            console.error('Error fetching admin list:', error);
            loginStatus.textContent = 'เกิดข้อผิดพลาดในการดึงรายชื่อผู้ดูแลระบบ';
        }
    }

    // ฟังก์ชันจัดการการคลิกแป้นพิมพ์
    numericKeypad.addEventListener('click', function(event) {
        if (event.target.classList.contains('key')) {
            const key = event.target.dataset.key;
            if (key === 'delete') {
                currentPassword = currentPassword.slice(0, -1);
            } else if (currentPassword.length < 4) {
                currentPassword += key;
            }
            updatePasswordDisplay();
            if (currentPassword.length === 4) {
                handleLogin();
            }
        }
    });

    // อัปเดตการแสดงผลรหัสผ่าน
    function updatePasswordDisplay() {
        passwordDisplay.textContent = '*'.repeat(currentPassword.length);
    }

    // ฟังก์ชันสำหรับจัดการการล็อกอิน
    async function handleLogin() {
        const userId = officerSelect.value;
        if (!userId) {
            loginStatus.textContent = 'กรุณาเลือกชื่อ';
            return;
        }

        loginStatus.textContent = 'กำลังตรวจสอบ...';
        
        try {
            const response = await fetch(appsScriptUrl, {
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                body: `action=login&id=${userId}&password=${currentPassword}`
            });
            const result = await response.json();
            if (result.success) {
                const selectedOfficerName = officerSelect.options[officerSelect.selectedIndex].text;
                loginModal.style.display = 'none';
                pendingRequestsSection.style.display = 'block';
                loginInfo.style.display = 'flex';
                loginMessage.innerHTML = `<span class="login-dot"></span>เข้าสู่ระบบในฐานะ: <strong>${selectedOfficerName}</strong> (ผู้ดูแลระบบ)`;
                if (typeof window.fetchPendingRequests === 'function') {
                    window.fetchPendingRequests();
                }
            } else {
                loginStatus.textContent = result.message;
                currentPassword = '';
                updatePasswordDisplay();
            }
        } catch (error) {
            loginStatus.textContent = 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง';
            console.error('Error during login:', error);
            currentPassword = '';
            updatePasswordDisplay();
        }
    }

    // เพิ่ม event listener สำหรับปุ่มออกจากระบบ
    logoutButton.addEventListener('click', function() {
        window.location.href = 'intro.html';
    });

    // เริ่มต้นหน้าด้วยการแสดงป๊อปอัปและดึงรายชื่อเจ้าหน้าที่
    loginModal.style.display = 'flex';
    pendingRequestsSection.style.display = 'none';
    loginInfo.style.display = 'none';
    fetchAdmins(); // เรียกใช้ฟังก์ชันใหม่
});