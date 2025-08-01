document.addEventListener('DOMContentLoaded', function() {
    const appsScriptUrl = 'https://script.google.com/macros/s/AKfycbw3gsV4e3a4-98wL2fu0-xXg9D-zvTDBgyKu_xqBu4atmG2bHZZoteI2J4_qlLU3GhO-w/exec';

    // Elements for different sections
    const officerSelect = document.getElementById('officer-select');
    const contentSections = document.getElementById('content-sections');
    
    // Collapsible elements
    const personalInfoCard = document.getElementById('personal-info-card');
    const workInfoCard = document.getElementById('work-info-card');
    
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
        
        // แก้ไขการคำนวณระยะเวลาทำงานให้ถูกต้องตามโครงสร้างชีทของคุณ
        const oldWorkDuration = calculateWorkDuration(userData.workStartDate, userData.workTransferDate);
        const newWorkDuration = calculateWorkDuration(userData.workTransferDate, new Date().toISOString().split('T')[0]);
        const totalWorkDuration = calculateWorkDuration(userData.workStartDate, new Date().toISOString().split('T')[0]);
        
        oldWorkDurationElement.textContent = oldWorkDuration;
        newWorkDurationElement.textContent = newWorkDuration;
        totalWorkDurationElement.textContent = totalWorkDuration;
        
        const usedSickLeaveDays = leaveHistory.filter(l => l.leaveType === 'ลาป่วย' && l.status === 'อนุมัติแล้ว').reduce((sum, l) => sum + (parseInt(l.duration) || 0), 0);
        const usedPersonalLeaveDays = leaveHistory.filter(l => l.leaveType === 'ลากิจ' && l.status === 'อนุมัติแล้ว').reduce((sum, l) => sum + (parseInt(l.duration) || 0), 0);
        const usedVacationDays = leaveHistory.filter(l => l.leaveType === 'ลาพักผ่อน' && l.status === 'อนุมัติแล้ว').reduce((sum, l) => sum + (parseInt(l.duration) || 0), 0);
        
        // Assumption: Maximum sick leave days is 30. Please adjust this number if needed.
        const totalSickLeave = 30; 
        const remainingSickLeave = totalSickLeave - usedSickLeaveDays;
        const remainingVacationDays = (userData.annualLeave + userData.accumulatedLeave) - usedVacationDays;

        sickLeaveUsedElement.textContent = usedSickLeaveDays;
        sickLeaveRemainingElement.textContent = remainingSickLeave;
        personalLeaveUsedElement.textContent = usedPersonalLeaveDays;
        vacationLeaveUsedElement.textContent = usedVacationDays;
        vacationLeaveRemainingElement.textContent = remainingVacationDays;

        renderLeaveHistory(leaveHistory);
        contentSections.classList.remove('hidden');
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
            return; // ไม่ต้องทำอะไรถ้าสถานะเป็นอย่างอื่น
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

    // ฟังก์ชันสำหรับดึงรายชื่อเจ้าหน้าที่ทั้งหมด
    async function fetchOfficerList() {
        const response = await fetch(appsScriptUrl, {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: `action=getOfficerList`
        });
        const result = await response.json();
        
        if (result.success) {
            result.officers.forEach(officer => {
                const option = document.createElement('option');
                option.value = officer.id;
                option.textContent = officer.name;
                officerSelect.appendChild(option);
            });
        } else {
            alert('ไม่สามารถดึงรายชื่อเจ้าหน้าที่ได้: ' + result.message);
        }
    }
    
    // ฟังก์ชันสำหรับดึงข้อมูลผู้ใช้งานที่ถูกเลือก
    async function fetchUserData(officerId) {
        if (!officerId) {
            contentSections.classList.add('hidden');
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

    // Event Listener เมื่อมีการเลือกเจ้าหน้าที่
    officerSelect.addEventListener('change', function() {
        const selectedOfficerId = this.value;
        fetchUserData(selectedOfficerId);
    });

    // เมื่อหน้าเว็บโหลดเสร็จ ให้ดึงรายชื่อเจ้าหน้าที่มาแสดงทันที
    fetchOfficerList();
});