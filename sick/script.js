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
    const printButton = document.getElementById('print-history-button');

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
    
    // Elements ที่เพิ่ม/แก้ไขสำหรับตัวกรองช่วงปี
    const historyStartYearFilter = document.getElementById('history-start-year-filter');
    const historyEndYearFilter = document.getElementById('history-end-year-filter');
    const applyFilterButton = document.getElementById('apply-filter-button'); 

    let currentUser = null;
    let allLeaveHistory = []; // เพิ่มตัวแปรเพื่อเก็บประวัติการลาทั้งหมด

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
    
    // *** เริ่มส่วนของฟังก์ชันที่เพิ่ม/แก้ไขสำหรับปีงบประมาณ ***

    // ฟังก์ชันใหม่: คำนวณช่วงปีงบประมาณปัจจุบัน (ต.ค. - ก.ย.)
    function getCurrentFiscalYearDates() {
        const today = new Date();
        let startYear, endYear;

        // ปีงบประมาณเริ่ม 1 ตุลาคม (เดือน 9)
        if (today.getMonth() >= 9) { // เดือน 9 คือ ตุลาคม (0=ม.ค., 9=ต.ค.)
            startYear = today.getFullYear(); // ต.ค. ปีปัจจุบัน
            endYear = today.getFullYear() + 1; // ก.ย. ปีหน้า
        } else {
            startYear = today.getFullYear() - 1; // ต.ค. ปีที่แล้ว
            endYear = today.getFullYear(); // ก.ย. ปีปัจจุบัน
        }

        // วันที่เริ่มต้น: 1 ตุลาคม ของปีเริ่มต้น
        const startDate = new Date(startYear, 9, 1); // 9 = ตุลาคม

        // วันที่สิ้นสุด: 30 กันยายน ของปีสิ้นสุด
        const endDate = new Date(endYear, 8, 30); // 8 = กันยายน
        
        // แปลงเป็น ISO String เพื่อความเข้ากันได้กับข้อมูลอื่น ๆ
        const startISODate = startDate.toISOString().split('T')[0];
        const endISODate = endDate.toISOString().split('T')[0];

        return { start: startISODate, end: endISODate };
    }

    // ฟังก์ชันสำหรับตรวจสอบว่าวันลาคาบเกี่ยวกับช่วงปีงบประมาณที่กำหนดหรือไม่
    function isLeaveInFiscalYear(leaveItem, fiscalYearStart, fiscalYearEnd) {
        if (!leaveItem.startDate || !leaveItem.endDate) return false;

        const leaveStart = new Date(leaveItem.startDate);
        const leaveEnd = new Date(leaveItem.endDate);
        const fiscalStart = new Date(fiscalYearStart);
        const fiscalEnd = new Date(fiscalYearEnd);
        
        // เงื่อนไข: วันลาเริ่มต้นก่อน/ตรงกับวันสิ้นสุดงบประมาณ AND วันลาสิ้นสุดหลัง/ตรงกับวันเริ่มต้นงบประมาณ
        return leaveStart <= fiscalEnd && leaveEnd >= fiscalStart;
    }

    // *** สิ้นสุดส่วนของฟังก์ชันที่เพิ่ม/แก้ไขสำหรับปีงบประมาณ ***
    
    // ฟังก์ชันสำหรับสร้างตัวเลือกปีในตัวกรอง (สำหรับ Start Year และ End Year)
    function populateYearFilter(history) {
        const years = new Set();
        history.forEach(item => {
            if (item.startDate) {
                // เก็บปี ค.ศ. ของทุกการลา
                years.add(new Date(item.startDate).getFullYear()); 
            }
            if (item.endDate) {
                // เก็บปี ค.ศ. ของทุกการลา
                years.add(new Date(item.endDate).getFullYear()); 
            }
        });

        const sortedYears = Array.from(years).sort((a, b) => b - a); // เรียงจากมากไปน้อย (ปีล่าสุดอยู่หน้าสุด)

        if (!historyStartYearFilter || !historyEndYearFilter) return;

        // ล้างตัวเลือกเดิม
        historyStartYearFilter.innerHTML = '';
        historyEndYearFilter.innerHTML = '';

        // เพิ่มปีตามข้อมูลที่มีอยู่ (ทั้ง Start และ End)
        sortedYears.forEach(year => {
            const phYear = year + 543; // พ.ศ.

            // ตัวเลือกสำหรับปีเริ่มต้น
            const startOption = document.createElement('option');
            startOption.value = year;
            startOption.textContent = phYear;
            historyStartYearFilter.appendChild(startOption);

            // ตัวเลือกสำหรับปีสิ้นสุด
            const endOption = document.createElement('option');
            endOption.value = year;
            endOption.textContent = phYear;
            historyEndYearFilter.appendChild(endOption);
        });

        // ตั้งค่าตัวเลือกเริ่มต้น: เริ่มต้นเป็นปีที่น้อยที่สุด, สิ้นสุดเป็นปีที่มากที่สุด
        if (sortedYears.length > 0) {
            historyStartYearFilter.value = sortedYears[sortedYears.length - 1]; // ปีที่เก่าที่สุด
            historyEndYearFilter.value = sortedYears[0]; // ปีที่ใหม่ที่สุด
        }
    }

    // ฟังก์ชันสำหรับกรองข้อมูลประวัติและแสดงผล
    function filterAndRenderHistory() {
        if (!historyStartYearFilter || !historyEndYearFilter) {
            renderLeaveHistory(allLeaveHistory); // แสดงทั้งหมดหากตัวกรองไม่พร้อม
            return;
        }
        
        const startYear = parseInt(historyStartYearFilter.value);
        const endYear = parseInt(historyEndYearFilter.value);

        // ตรวจสอบความถูกต้องของช่วงปี
        if (startYear > endYear) {
            alert('ปีเริ่มต้นต้องไม่มากกว่าปีสิ้นสุด กรุณาเลือกช่วงปีใหม่');
            return;
        }

        const filteredHistory = allLeaveHistory.filter(item => {
            if (!item.startDate || !item.endDate) return false;

            const leaveStartYear = new Date(item.startDate).getFullYear();
            const leaveEndYear = new Date(item.endDate).getFullYear();

            // เงื่อนไข: วันลาจะถูกแสดงหากช่วงปีของวันลา 'คาบเกี่ยว' กับช่วงปีที่เลือก
            // คือ วันลาเริ่มต้นก่อน/ตรงกับปีสิ้นสุดที่เลือก AND วันลาสิ้นสุดหลัง/ตรงกับปีเริ่มต้นที่เลือก
            return leaveStartYear <= endYear && leaveEndYear >= startYear;
        });
        
        // แสดงผลลัพธ์
        renderLeaveHistory(filteredHistory);
    }

    // ฟังก์ชันสำหรับแสดงข้อมูลผู้ใช้งานบน Dashboard (มีการแก้ไขส่วนคำนวณวันลา)
    function renderDashboard(userData, leaveHistory) {
        if (!userData) return;

        currentUser = userData;
        allLeaveHistory = leaveHistory; // เก็บประวัติทั้งหมดไว้
        
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
        
        // *** ส่วนที่แก้ไข: กรองประวัติการลาตามปีงบประมาณปัจจุบันก่อนคำนวณ ***
        const fiscalYearDates = getCurrentFiscalYearDates();
        
        const currentFiscalLeaveHistory = leaveHistory.filter(item => {
            return isLeaveInFiscalYear(item, fiscalYearDates.start, fiscalYearDates.end);
        });

        // คำนวณวันลาที่ใช้ไปจาก currentFiscalLeaveHistory เท่านั้น
        const usedSickLeaveDays = currentFiscalLeaveHistory.filter(l => l.leaveType === 'ลาป่วย' && l.status === 'อนุมัติแล้ว').reduce((sum, l) => sum + (parseInt(l.duration) || 0), 0);
        const usedPersonalLeaveDays = currentFiscalLeaveHistory.filter(l => l.leaveType === 'ลากิจ' && l.status === 'อนุมัติแล้ว').reduce((sum, l) => sum + (parseInt(l.duration) || 0), 0);
        const usedVacationDays = currentFiscalLeaveHistory.filter(l => l.leaveType === 'ลาพักผ่อน' && l.status === 'อนุมัติแล้ว').reduce((sum, l) => sum + (parseInt(l.duration) || 0), 0);
        
        // วันลาป่วยคงเหลือจะอ้างอิงตามปีงบประมาณปัจจุบัน (30 วัน/ปี)
        const totalSickLeave = 30; 
        const remainingSickLeave = totalSickLeave - usedSickLeaveDays;
        
        // วันลาพักผ่อนคงเหลือจะคำนวณตามสิทธิ์คงเหลือ (สมมติว่าค่า annualLeave และ accumulatedLeave คือสิทธิ์วันลาพักผ่อนประจำปีที่ได้รับมา ณ วันที่ 1 ต.ค.)
        const remainingVacationDays = (userData.annualLeave + userData.accumulatedLeave) - usedVacationDays;

        sickLeaveUsedElement.textContent = usedSickLeaveDays;
        sickLeaveRemainingElement.textContent = remainingSickLeave;
        personalLeaveUsedElement.textContent = usedPersonalLeaveDays;
        vacationLeaveUsedElement.textContent = usedVacationDays;
        vacationLeaveRemainingElement.textContent = remainingVacationDays;
        // *** สิ้นสุดส่วนที่แก้ไข ***

        // สร้างตัวเลือกปีและแสดงผลประวัติการลาที่กรองแล้ว
        populateYearFilter(allLeaveHistory);
        filterAndRenderHistory(); // แสดงประวัติการลาตามปีที่ถูกตั้งค่าเริ่มต้น (ปีที่เก่าที่สุด - ปีที่ใหม่ที่สุด)

        // Show the main app container and hide the login container
        loginContainer.style.display = 'none';
        mainAppContainer.style.display = 'block';
        floatingHistoryButton.classList.remove('hidden');
    }

    // ฟังก์ชันสำหรับแสดงประวัติการลา
    function renderLeaveHistory(history) {
        leaveHistoryTableBody.innerHTML = '';
        if (history.length === 0) {
            const row = leaveHistoryTableBody.insertRow();
            row.innerHTML = `<td colspan="6" style="text-align: center;">ไม่พบประวัติการลาในรอบปีที่เลือก</td>`;
            return;
        }

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
    
    // Event Listener สำหรับปุ่ม "กรองตามช่วงปี"
    if (applyFilterButton) {
        applyFilterButton.addEventListener('click', filterAndRenderHistory);
    }
    // Event Listener สำหรับปุ่มพิมพ์
    if (printButton) {
        printButton.addEventListener('click', () => {
            // ซ่อนปุ่ม Floating, ตัวควบคุมการกรอง และ Close Button ก่อนพิมพ์
            const floatingButton = document.getElementById('floating-history-button');
            const panelHeader = document.querySelector('#floating-history-panel .floating-panel-header');

            // ซ่อนปุ่มและตัวควบคุมที่ไม่ต้องการให้ปรากฏในการพิมพ์
            if (floatingButton) floatingButton.style.display = 'none';
            if (panelHeader) {
                // ซ่อนส่วนของ Filter และ Action ที่ไม่ต้องการให้พิมพ์
                const closeBtn = panelHeader.querySelector('.floating-panel-close');
                if (closeBtn) closeBtn.style.display = 'none';
                
                // ซ่อนส่วนของปุ่มกรองทั้งหมดและปุ่มพิมพ์ (เพื่อให้เหลือแค่หัวข้อกับตาราง)
                const filterControls = panelHeader.querySelector('.filter-controls');
                const printBtn = document.getElementById('print-history-button');
                if (filterControls) filterControls.style.display = 'none';
                if (printBtn) printBtn.style.display = 'none'; // ซ่อนปุ่มพิมพ์ตัวมันเอง

            }
            
            // ซ่อนทุกองค์ประกอบยกเว้นพาเนลประวัติ
            const elementsToHide = document.querySelectorAll('body > *:not(#floating-history-panel)');
            elementsToHide.forEach(el => el.style.display = 'none');
            
            // ตั้งค่าพาเนลให้เต็มจอสำหรับการพิมพ์
            floatingHistoryPanel.style.position = 'static';
            floatingHistoryPanel.style.width = '100%';
            floatingHistoryPanel.style.maxHeight = 'none';
            floatingHistoryPanel.style.boxShadow = 'none'; // เอาเงาออก

            // ใช้ timeout เพื่อให้มั่นใจว่า CSS ถูกนำไปใช้ก่อนพิมพ์
            setTimeout(() => {
                window.print();
                
                // กู้คืนการแสดงผลเดิมหลังพิมพ์
                elementsToHide.forEach(el => el.style.display = '');
                
                // กู้คืนสไตล์พาเนลเดิม
                floatingHistoryPanel.style.position = '';
                floatingHistoryPanel.style.width = '';
                floatingHistoryPanel.style.maxHeight = '';
                floatingHistoryPanel.style.boxShadow = ''; // กู้คืนเงา

                // กู้คืนการแสดงผลของปุ่ม Floating
                if (floatingButton) floatingButton.style.display = '';

                // กู้คืนการแสดงผลของ Action ต่างๆ ใน Header
                if (panelHeader) {
                    const closeBtn = panelHeader.querySelector('.floating-panel-close');
                    if (closeBtn) closeBtn.style.display = '';
                    
                    const filterControls = panelHeader.querySelector('.filter-controls');
                    const printBtn = document.getElementById('print-history-button');
                    if (filterControls) filterControls.style.display = '';
                    if (printBtn) printBtn.style.display = ''; // กู้คืนปุ่มพิมพ์
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