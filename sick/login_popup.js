document.addEventListener('DOMContentLoaded', function() {
    const appsScriptUrl = 'https://script.google.com/macros/s/AKfycbyHl1Bny2wB--upeU0PBwafooNrmddwVrzLZz70r3sRUn6ep9CfCyVSJidtw-f_kEZsUw/exec';

    const loginModal = document.getElementById('login-modal');
    const officerSelect = document.getElementById('officer-select');
    const adminSelectionPart = document.getElementById('admin-selection-part');
    const keypadSection = document.getElementById('keypad-section');
    const numericKeypad = document.getElementById('numeric-keypad');
    const passwordDisplay = document.getElementById('password-display');
    const loginStatus = document.getElementById('login-status');
    const cancelLogin = document.getElementById('cancel-login');
    
    const loginInfo = document.getElementById('login-info');
    const loginMessage = document.getElementById('login-message');
    const logoutButton = document.getElementById('logout-button');
    const pendingRequestsSection = document.getElementById('pending-requests-section');

    let currentPassword = '';
    window.loggedInAdminId = null;

    // 1. เมื่อเลือกชื่อแล้ว ให้แสดง Keypad
    officerSelect.addEventListener('change', function() {
        if (this.value !== "") {
            adminSelectionPart.style.display = 'none';
            keypadSection.style.display = 'block';
            currentPassword = '';
            updatePasswordDisplay();
            loginStatus.textContent = '';
        }
    });

    // 2. ฟังก์ชันกดยกเลิก
    cancelLogin.addEventListener('click', function() {
        adminSelectionPart.style.display = 'block';
        keypadSection.style.display = 'none';
        officerSelect.value = "";
        currentPassword = '';
        loginStatus.textContent = '';
    });

    // 3. ฟังก์ชันอัปเดตรหัสผ่าน (ใช้ร่วมกันทั้งหน้าจอและคีย์บอร์ด)
    function updatePasswordDisplay() {
        passwordDisplay.textContent = currentPassword.length > 0 
            ? '*'.repeat(currentPassword.length) 
            : '____'; 
    }

    // 4. จัดการการกดจากหน้าจอ (Numeric Keypad)
    numericKeypad.addEventListener('click', function(event) {
        const target = event.target.closest('.key-modern');
        if (!target) return;

        const key = target.dataset.key;
        handleInput(key);
    });

    // 5. จัดการการกดจากคีย์บอร์ด (Physical Keyboard)
    document.addEventListener('keydown', function(event) {
        // ทำงานเฉพาะเมื่อหน้าใส่รหัสผ่านแสดงอยู่
        if (keypadSection.style.display === 'block') {
            const key = event.key;

            if (key >= '0' && key <= '9') {
                handleInput(key);
            } else if (key === 'Backspace') {
                handleInput('delete');
            } else if (key === 'Escape') {
                cancelLogin.click(); // กด Esc เพื่อกลับไปหน้าเลือกชื่อ
            }
        }
    });

    // 6. ฟังก์ชันกลางสำหรับจัดการ Input
    function handleInput(key) {
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

    // 7. ฟังก์ชันตรวจสอบการล็อกอิน
    async function handleLogin() {
        const userId = officerSelect.value;
        loginStatus.textContent = 'กำลังตรวจสอบ...';
        loginStatus.style.color = '#1e293b';
        
        try {
            const response = await fetch(appsScriptUrl, {
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                body: `action=login&id=${userId}&password=${currentPassword}`
            });
            const result = await response.json();
            
            if (result.success) {
                window.loggedInAdminId = userId;
                const selectedOfficerName = officerSelect.options[officerSelect.selectedIndex].text;
                loginModal.style.display = 'none';
                pendingRequestsSection.style.display = 'block';
                loginInfo.style.display = 'flex';
                loginMessage.innerHTML = `<span class="login-dot"></span>ผู้ดูแลระบบ: <strong>${selectedOfficerName}</strong>`;
                if (typeof window.fetchPendingRequests === 'function') {
                    window.fetchPendingRequests();
                }
            } else {
                loginStatus.textContent = 'รหัสผ่านไม่ถูกต้อง';
                loginStatus.style.color = '#ef4444';
                currentPassword = '';
                updatePasswordDisplay();
            }
        } catch (error) {
            loginStatus.textContent = 'การเชื่อมต่อล้มเหลว';
            currentPassword = '';
            updatePasswordDisplay();
        }
    }

    // โหลดรายชื่อเริ่มต้น
    async function fetchAdmins() {
        try {
            const response = await fetch(appsScriptUrl, {
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                body: `action=getAdmins`
            });
            const result = await response.json();
            if (result.success) {
                officerSelect.innerHTML = '<option value="">กรุณาเลือกชื่อ</option>';
                result.officers.forEach(officer => {
                    const option = document.createElement('option');
                    option.value = officer.id;
                    option.textContent = officer.name;
                    officerSelect.appendChild(option);
                });
            }
        } catch (e) { console.error(e); }
    }

    logoutButton.addEventListener('click', () => window.location.href = 'check.html');
    fetchAdmins();
});