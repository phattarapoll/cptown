document.addEventListener('DOMContentLoaded', function() {
    const appsScriptUrl = 'https://script.google.com/macros/s/AKfycbyHl1Bny2wB--upeU0PBwafooNrmddwVrzLZz70r3sRUn6ep9CfCyVSJidtw-f_kEZsUw/exec';

    // Elements for different sections
    const loginContainer = document.getElementById('login-container');
    const mainAppContainer = document.getElementById('main-app-container');
    const officerListContainer = document.getElementById('officer-list-container');

    // Collapsible elements
    const personalInfoCard = document.getElementById('personal-info-card');
    const workInfoCard = document.getElementById('work-info-card');
    const leaveFormSection = document.getElementById('leave-form-section');

    // Elements for dashboard
    const userNameElement = document.getElementById('user-name');
    const userPositionElement = document.getElementById('user-position');
    const userOrganizationElement = document.getElementById('user-organization');
    const userAddressElement = document.getElementById('user-address');
    const userPhoneElement = document.getElementById('user-phone');
    const workStartDateElement = document.getElementById('work-start-date');
    const oldWorkDurationElement = document.getElementById('old-work-duration');
    const newWorkDurationElement = document.getElementById('new-work-duration');
    const totalWorkDurationElement = document.getElementById('total-work-duration');

    // New leave info elements
    const sickLeaveUsedElement = document.getElementById('sick-leave-used');
    const sickLeaveRemainingElement = document.getElementById('sick-leave-remaining');
    const personalLeaveUsedElement = document.getElementById('personal-leave-used');
    const vacationLeaveUsedElement = document.getElementById('vacation-leave-used');
    const vacationLeaveRemainingElement = document.getElementById('vacation-leave-remaining');

    // Elements for leave form
    const leaveForm = document.getElementById('leave-form');
    const leaveTypeInput = document.getElementById('leave-type');
    const leaveStartDateInput = document.getElementById('leave-start-date');
    const leaveEndDateInput = document.getElementById('leave-end-date');
    const leavePhoneInput = document.getElementById('leave-phone');
    const leaveReasonInput = document.getElementById('leave-reason');

    // Floating panel elements
    const floatingHistoryButton = document.getElementById('floating-history-button');
    const floatingHistoryPanel = document.getElementById('floating-history-panel');
    const closeHistoryPanelButton = document.getElementById('close-history-panel');
    const printButton = document.getElementById('print-history-button'); // เพิ่ม element ของปุ่มพิมพ์

    // New modal elements
    const loginModal = document.getElementById('login-modal');
    const closeLoginModalButton = document.getElementById('close-login-modal');
    const loginOfficerNameElement = document.getElementById('login-officer-name');
    const loginFormModal = document.getElementById('login-form-modal');
    const loginOfficerIdInput = document.getElementById('login-officer-id');
    const passwordModalInput = document.getElementById('password-modal');
    const passwordDisplay = document.getElementById('password-display');
    const keypadContainer = document.getElementById('keypad-container');
    let currentPassword = '';

    // Elements for leave history
    const leaveHistoryTableBody = document.querySelector('#leave-history-table tbody');

    let currentUser = null;

    // ----- ส่วนของฟังก์ชันการทำงาน -----

    // ฟังก์ชันสำหรับจัดการการยุบ/ขยาย
    function setupCollapsible(cardElement) {
        const header = cardElement.querySelector('.collapsible-header');
        const content = cardElement.querySelector('.collapsible-content');
        if (header && content) {
            header.addEventListener('click', () => {
                header.classList.toggle('expanded');
                content.classList.toggle('expanded');
            });
        }
    }
    setupCollapsible(personalInfoCard);
    setupCollapsible(workInfoCard);
    setupCollapsible(leaveFormSection);

    // ฟังก์ชันสำหรับจัดรูปแบบวันที่
    function formatDateForDisplay(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return dateString;
        }
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${day}/${month}/${year}`;
    }

    // ฟังก์ชันสำหรับคำนวณอายุงาน
    function calculateWorkDuration(startDate, endDate) {
        if (!startDate || !endDate) return 'ไม่มีข้อมูล';
        const start = new Date(startDate);
        const end = new Date(endDate);

        let years = end.getFullYear() - start.getFullYear();
        let months = end.getMonth() - start.getMonth();
        let days = end.getDate() - start.getDate();

        if (days < 0) {
            months--;
            days += new Date(end.getFullYear(), end.getMonth(), 0).getDate();
        }
        if (months < 0) {
            years--;
            months += 12;
        }

        return `${years} ปี ${months} เดือน ${days} วัน`;
    }

    // ฟังก์ชันใหม่: คำนวณจำนวนวันทำงานโดยไม่นับวันเสาร์-อาทิตย์
    function calculateWorkingDays(startDate, endDate) {
        let count = 0;
        const start = new Date(startDate);
        const end = new Date(endDate);

        for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
            const day = d.getDay(); // 0 = Sunday, 6 = Saturday
            if (day !== 0 && day !== 6) {
                count++;
            }
        }
        return count;
    }

    // ฟังก์ชันสำหรับแสดงข้อมูลผู้ใช้งานบน Dashboard
    function renderDashboard(userData, leaveHistory) {
        if (!userData) return;

        currentUser = userData;
        userNameElement.textContent = userData.name;
        userPositionElement.textContent = userData.position;
        userOrganizationElement.textContent = userData.organization;
        userAddressElement.textContent = userData.address;
        userPhoneElement.textContent = userData.phone;

        workStartDateElement.textContent = formatDateForDisplay(userData.workStartDate);

        const oldWorkDuration = calculateWorkDuration(userData.workStartDate, userData.workTransferDate);
        const newWorkDuration = calculateWorkDuration(userData.workTransferDate, new Date().toISOString().split('T')[0]);
        const totalWorkDuration = calculateWorkDuration(userData.workStartDate, new Date().toISOString().split('T')[0]);

        oldWorkDurationElement.textContent = oldWorkDuration;
        newWorkDurationElement.textContent = newWorkDuration;
        totalWorkDurationElement.textContent = totalWorkDuration;

        const usedSickLeaveDays = leaveHistory.filter(l => l.leaveType === 'ลาป่วย' && l.status === 'อนุมัติแล้ว').reduce((sum, l) => sum + (parseInt(l.duration) || 0), 0);
        const usedPersonalLeaveDays = leaveHistory.filter(l => l.leaveType === 'ลากิจ' && l.status === 'อนุมัติแล้ว').reduce((sum, l) => sum + (parseInt(l.duration) || 0), 0);
        const usedVacationDays = leaveHistory.filter(l => l.leaveType === 'ลาพักผ่อน' && l.status === 'อนุมัติแล้ว').reduce((sum, l) => sum + (parseInt(l.duration) || 0), 0);

        const totalSickLeave = 30;
        const remainingSickLeave = totalSickLeave - usedSickLeaveDays;
        const remainingVacationDays = (userData.annualLeave + userData.accumulatedLeave) - usedVacationDays;

        sickLeaveUsedElement.textContent = usedSickLeaveDays;
        sickLeaveRemainingElement.textContent = remainingSickLeave;
        personalLeaveUsedElement.textContent = usedPersonalLeaveDays;
        vacationLeaveUsedElement.textContent = usedVacationDays;
        vacationLeaveRemainingElement.textContent = remainingVacationDays;

        renderLeaveHistory(leaveHistory);

        // Show the main app container and hide the login container
        loginContainer.style.display = 'none';
        mainAppContainer.style.display = 'block';
        floatingHistoryButton.classList.remove('hidden');
    }

    // ฟังก์ชันสำหรับแสดงประวัติการลา
    function renderLeaveHistory(history) {
        leaveHistoryTableBody.innerHTML = '';
        history.forEach(item => {
            const row = leaveHistoryTableBody.insertRow();
            row.innerHTML = `
                <td>${item.leaveType}</td>
                <td>${formatDateForDisplay(item.startDate)}</td>
                <td>${formatDateForDisplay(item.endDate)}</td>
                <td>${item.duration}</td>
                <td>${item.status}</td>
                <td>
                    ${item.status !== 'ยกเลิกแล้ว' ? `<button class="cancel-button" data-leave-id="${item.leaveId}"><i class="fa-solid fa-ban"></i> ยกเลิก</button>` : ''}
                </td>
            `;
        });

        document.querySelectorAll('.cancel-button').forEach(button => {
            button.addEventListener('click', handleCancelLeave);
        });
    }

    // ฟังก์ชันจัดการการยกเลิกวันลา
    async function handleCancelLeave(event) {
        const leaveId = event.target.closest('button').dataset.leaveId;
        const leaveStatus = event.target.closest('tr').children[4].textContent;

        let confirmationMessage;
        if (leaveStatus === 'รออนุมัติ') {
            confirmationMessage = 'ยืนยันการยกเลิกคำขอลาหรือไม่?';
        } else if (leaveStatus === 'อนุมัติแล้ว' || leaveStatus === 'รออนุมัติยกเลิก') {
            confirmationMessage = 'คำขอลาได้รับการอนุมัติแล้ว การยกเลิกต้องรอผู้ดูแลระบบอนุมัติอีกครั้ง ยืนยันการส่งคำขอยกเลิกหรือไม่?';
        } else {
            return;
        }

        if (!confirm(confirmationMessage)) return;

        const response = await fetch(appsScriptUrl, {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: `action=cancelLeave&leaveId=${leaveId}&cancellerName=${currentUser.name}`
        });
        const result = await response.json();

        if (result.success) {
            alert(result.message);
            fetchUserData(currentUser.id);
        } else {
            alert('ไม่สามารถยกเลิกได้: ' + result.message);
        }
    }

    // ฟังก์ชันสำหรับจัดการการส่งคำขอลา
    leaveForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const startDate = leaveStartDateInput.value;
        const endDate = leaveEndDateInput.value;

        const duration = calculateWorkingDays(startDate, endDate);

        const leaveData = {
            id: currentUser.id,
            leaveType: leaveTypeInput.value,
            startDate: startDate,
            endDate: endDate,
            phone: leavePhoneInput.value,
            reason: leaveReasonInput.value,
            duration: duration
        };

        const formData = new URLSearchParams(leaveData);
        formData.append('action', 'submitLeave');

        const response = await fetch(appsScriptUrl, {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: formData.toString()
        });
        const result = await response.json();

        if (result.success) {
            alert(result.message);
            leaveForm.reset();
            fetchUserData(currentUser.id);
        } else {
            alert('ไม่สามารถบันทึกคำขอได้: ' + result.message);
        }
    });

    // ฟังก์ชันสำหรับดึงรายชื่อเจ้าหน้าที่ทั้งหมดและแสดงเป็น Card
    async function fetchOfficerList() {
        const response = await fetch(appsScriptUrl, {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: `action=getOfficerList`
        });
        const result = await response.json();

        if (result.success) {
            officerListContainer.innerHTML = '';
            result.officers.forEach(officer => {
                const card = document.createElement('div');
                card.classList.add('officer-card');
                card.dataset.id = officer.id;
                card.dataset.name = officer.name;
                card.innerHTML = `<div class="icon-placeholder"><i class="fa-solid fa-user"></i></div><h4>${officer.name}</h4>`;
                officerListContainer.appendChild(card);
            });
            document.querySelectorAll('.officer-card').forEach(card => {
                card.addEventListener('click', handleOfficerCardClick);
            });
        } else {
            alert('ไม่สามารถดึงรายชื่อเจ้าหน้าที่ได้: ' + result.message);
        }
		document.querySelectorAll('.officer-card').forEach(card => {
    card.addEventListener('click', function (e) {
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');

        const rect = card.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';

        card.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

    }

    // ฟังก์ชันสำหรับจัดการการคลิกที่ Officer Card
    function handleOfficerCardClick(event) {
        const officerId = event.currentTarget.dataset.id;
        const officerName = event.currentTarget.dataset.name;

        // ตั้งค่า modal ด้วยข้อมูลที่เลือก
        loginOfficerIdInput.value = officerId;
        loginOfficerNameElement.textContent = officerName;
        currentPassword = ''; // Reset password
        passwordModalInput.value = ''; // Reset hidden password input
        passwordDisplay.textContent = ''; // Reset password display

        // แสดง modal
        loginModal.classList.add('visible');
    }

    // ฟังก์ชันสำหรับดึงข้อมูลผู้ใช้งานที่ถูกเลือก
    async function fetchUserData(officerId) {
        if (!officerId) {
            return;
        }

        const response = await fetch(appsScriptUrl, {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: `action=getUserData&id=${officerId}`
        });
        const result = await response.json();

        if (result.success) {
            renderDashboard(result.user, result.leaveHistory);
        } else {
            alert('ไม่สามารถดึงข้อมูลได้: ' + result.message);
        }
    }

    // Event Listeners for floating panels and modals
    floatingHistoryButton.addEventListener('click', () => {
        floatingHistoryPanel.classList.add('visible');
    });

    closeHistoryPanelButton.addEventListener('click', () => {
        floatingHistoryPanel.classList.remove('visible');
    });

    closeLoginModalButton.addEventListener('click', () => {
        loginModal.classList.remove('visible');
    });

    window.addEventListener('click', (event) => {
        if (event.target === loginModal) {
            loginModal.classList.remove('visible');
        }
    });
    
    // เพิ่ม Event Listener สำหรับปุ่มพิมพ์
    if (printButton) {
        printButton.addEventListener('click', () => {
            // Hide the floating button before printing
            const floatingButton = document.getElementById('floating-history-button');
            if (floatingButton) {
                floatingButton.style.display = 'none';
            }

            // Hide all elements on the page except the history panel
            const elementsToHide = document.querySelectorAll('body > *:not(#floating-history-panel)');
            elementsToHide.forEach(el => el.style.display = 'none');
            
            // Set the panel to be full screen for printing
            floatingHistoryPanel.style.position = 'static';
            floatingHistoryPanel.style.width = '100%';
            floatingHistoryPanel.style.maxHeight = 'none';

            // Use a timeout to ensure CSS changes are applied before printing
            setTimeout(() => {
                window.print();
                
                // Restore the original display of elements after printing
                elementsToHide.forEach(el => el.style.display = '');
                
                // Restore the original panel styles
                floatingHistoryPanel.style.position = '';
                floatingHistoryPanel.style.width = '';
                floatingHistoryPanel.style.maxHeight = '';
                
                // Restore the floating button's display
                if (floatingButton) {
                    floatingButton.style.display = '';
                }
            }, 500); // A short delay ensures a smoother print experience
        });
    }


    // Event listener for the keypad buttons
    keypadContainer.addEventListener('click', function(event) {
        if (event.target.classList.contains('keypad-button')) {
            const value = event.target.textContent.trim();
            if (!isNaN(parseInt(value))) {
                if (currentPassword.length < 4) { // จำกัดรหัสผ่านให้เป็น 4 หลัก
                    currentPassword += value;
                    passwordDisplay.textContent = '*'.repeat(currentPassword.length);
                    passwordModalInput.value = currentPassword; // Set the value of the hidden input
                    
                    if (currentPassword.length === 4) {
                        // ส่งฟอร์มอัตโนมัติเมื่อรหัสผ่านครบ 4 หลัก
                        loginFormModal.dispatchEvent(new Event('submit'));
                    }
                }
            } else if (event.target.classList.contains('backspace')) {
                currentPassword = currentPassword.slice(0, -1);
                passwordDisplay.textContent = '*'.repeat(currentPassword.length);
                passwordModalInput.value = currentPassword;
            } else if (event.target.classList.contains('clear')) {
                currentPassword = '';
                passwordDisplay.textContent = '';
                passwordModalInput.value = '';
            }
        }
    });

    // Event Listener สำหรับการเข้าสู่ระบบใน Modal พร้อมสถานะโหลด (แก้ไขแล้ว)
    loginFormModal.addEventListener('submit', async function(event) {
        event.preventDefault();

        // แสดงสถานะกำลังโหลด
        passwordDisplay.textContent = 'กำลังตรวจสอบ...';

        const selectedOfficerId = loginOfficerIdInput.value;
        const password = passwordModalInput.value;

        try {
            const response = await fetch(appsScriptUrl, {
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                body: `action=login&id=${selectedOfficerId}&password=${password}`
            });
            const result = await response.json();

            if (result.success) {
                await fetchUserData(selectedOfficerId);
                currentPassword = '';
                passwordModalInput.value = '';
                passwordDisplay.textContent = '';
                loginModal.classList.remove('visible'); // Close modal on success
            } else {
                alert(result.message);
                currentPassword = '';
                passwordModalInput.value = '';
                passwordDisplay.textContent = '';
                passwordDisplay.textContent = 'ไม่ถูกต้อง ลองอีกครั้ง';
            }
        } catch (error) {
            console.error('Login failed:', error);
            alert('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง');
        }
    });

    // เมื่อหน้าเว็บโหลดเสร็จ ให้ดึงรายชื่อเจ้าหน้าที่มาแสดงทันที
    fetchOfficerList();
});