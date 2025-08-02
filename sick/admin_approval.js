document.addEventListener('DOMContentLoaded', function() {
    const appsScriptUrl = 'https://script.google.com/macros/s/AKfycbw3gsV4e3a4-98wL2fu0-xXg9D-zvTDBgyKu_xqBu4atmG2bHZZoteI2J4_qlLU3GhO-w/exec';
    const pendingLeaveTableBody = document.querySelector('#pending-leave-table tbody');

    // ฟังก์ชันสำหรับจัดรูปแบบวันที่
    function formatDateForDisplay(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) { // Check if date is valid
            return dateString;
        }
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${day}/${month}/${year}`;
    }

    // ฟังก์ชันสำหรับดึงและแสดงรายการคำขอลาที่รออนุมัติ
    async function fetchPendingRequests() {
        pendingLeaveTableBody.innerHTML = '<tr><td colspan="7">กำลังโหลด...</td></tr>';
        const response = await fetch(appsScriptUrl, {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: `action=getPendingLeaveRequests`
        });
        const result = await response.json();

        if (result.success) {
            renderPendingRequests(result.requests);
        } else {
            pendingLeaveTableBody.innerHTML = `<tr><td colspan="7">ไม่สามารถดึงข้อมูลได้: ${result.message}</td></tr>`;
        }
    }

    // ฟังก์ชันสำหรับแสดงรายการคำขอในตาราง
    function renderPendingRequests(requests) {
        pendingLeaveTableBody.innerHTML = '';
        if (requests.length === 0) {
            pendingLeaveTableBody.innerHTML = '<tr><td colspan="7">ไม่มีคำขอลาที่รออนุมัติ</td></tr>';
            return;
        }

        requests.forEach(request => {
            const row = pendingLeaveTableBody.insertRow();
            row.innerHTML = `
                <td>${request.name}</td>
                <td>${request.leaveType}</td>
                <td>${request.duration}</td>
                <td>${formatDateForDisplay(request.startDate)}</td>
                <td>${formatDateForDisplay(request.endDate)}</td>
                <td>${request.reason}</td>
                <td>
                    <button class="approve-button" data-leave-id="${request.leaveId}">อนุมัติ</button>
                    <button class="reject-button" data-leave-id="${request.leaveId}">ไม่อนุมัติ</button>
                </td>
            `;
        });

        // เพิ่ม Event Listeners สำหรับปุ่มอนุมัติ/ไม่อนุมัติ
        document.querySelectorAll('.approve-button').forEach(button => {
            button.addEventListener('click', handleApproveRequest);
        });
        document.querySelectorAll('.reject-button').forEach(button => {
            button.addEventListener('click', handleRejectRequest);
        });
    }

    // ฟังก์ชันสำหรับจัดการการอนุมัติ
    async function handleApproveRequest(event) {
        const leaveId = event.target.dataset.leaveId;
        if (!confirm('ยืนยันการอนุมัติคำขอลาหรือไม่?')) return;
        
        const response = await fetch(appsScriptUrl, {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: `action=approveLeave&leaveId=${leaveId}`
        });
        const result = await response.json();
        
        if (result.success) {
            alert(result.message);
            fetchPendingRequests(); // โหลดข้อมูลใหม่
        } else {
            alert('ไม่สามารถอนุมัติได้: ' + result.message);
        }
    }

    // ฟังก์ชันสำหรับจัดการการไม่อนุมัติ
    async function handleRejectRequest(event) {
        const leaveId = event.target.dataset.leaveId;
        if (!confirm('ยืนยันการไม่อนุมัติคำขอลาหรือไม่?')) return;

        const response = await fetch(appsScriptUrl, {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: `action=rejectLeave&leaveId=${leaveId}`
        });
        const result = await response.json();
        
        if (result.success) {
            alert(result.message);
            fetchPendingRequests(); // โหลดข้อมูลใหม่
        } else {
            alert('ไม่สามารถไม่อนุมัติได้: ' + result.message);
        }
    }

    // เมื่อโหลดหน้าเว็บเสร็จ ให้ดึงรายการคำขอที่รออนุมัติมาแสดง
    fetchPendingRequests();
});