document.addEventListener('DOMContentLoaded', function() {
    const appsScriptUrl = 'https://script.google.com/macros/s/AKfycbyHaFWO8u7pfTpgZ1AZr23k6HrVKU5urRdySS-qaVhCIr-jPVD2gIqPg7pavzrzMAv-jQ/exec';
    const pendingLeaveTableBody = document.querySelector('#pending-leave-table tbody');

    // Elements for the new modal
    const modal = document.getElementById('approval-modal');
    const modalContent = document.getElementById('modal-content');

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

    // ฟังก์ชันสำหรับดึงและแสดงรายการคำขอลาที่รออนุมัติ
    async function fetchPendingRequests() {
        pendingLeaveTableBody.innerHTML = '<tr><td colspan="7">กำลังโหลด...</td></tr>';
        try {
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
        } catch (error) {
            console.error('Error fetching pending requests:', error);
            pendingLeaveTableBody.innerHTML = '<tr><td colspan="7">เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง</td></tr>';
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
            let statusBadge = '';
            let approveButtonText = 'อนุมัติ';
            let approveButtonClass = 'approve-button';

            if (request.status === 'รออนุมัติยกเลิก') {
                statusBadge = '<span class="status-badge-cancel"> (รออนุมัติยกเลิก)</span>';
                approveButtonText = 'อนุมัติการยกเลิก';
            }

            row.innerHTML = `
                <td>${request.name}</td>
                <td>${request.leaveType}${statusBadge}</td>
                <td>${request.duration}</td>
                <td>${formatDateForDisplay(request.startDate)}</td>
                <td>${formatDateForDisplay(request.endDate)}</td>
                <td>${request.reason}</td>
                <td>
                    <button class="${approveButtonClass}" data-leave-id="${request.leaveId}" data-status="${request.status}">${approveButtonText}</button>
                    <button class="reject-button" data-leave-id="${request.leaveId}" data-status="${request.status}">ไม่อนุมัติ</button>
                </td>
            `;
        });

        document.querySelectorAll('.approve-button').forEach(button => {
            button.addEventListener('click', handleApproveRequest);
        });
        document.querySelectorAll('.reject-button').forEach(button => {
            button.addEventListener('click', handleRejectRequest);
        });
    }

    // ฟังก์ชันสำหรับจัดการการอนุมัติ
    function handleApproveRequest(event) {
        const row = event.target.closest('tr');
        const leaveId = event.target.dataset.leaveId;
        const currentStatus = event.target.dataset.status;
        const name = row.children[0].textContent;
        const leaveType = row.children[1].textContent.replace(' (รออนุมัติยกเลิก)', '');
        const duration = row.children[2].textContent;
        const startDate = row.children[3].textContent;
        const endDate = row.children[4].textContent;
        const reason = row.children[5].textContent;

        showApprovalModal({ leaveId, name, leaveType, duration, startDate, endDate, reason, currentStatus });
    }

    // ฟังก์ชันสำหรับแสดง Modal
    function showApprovalModal(requestData) {
        if (!modal || !modalContent) return;

        let modalTitle = 'อนุมัติคำขอลา';
        let confirmButtonText = 'อนุมัติ';

        if (requestData.currentStatus === 'รออนุมัติยกเลิก') {
            modalTitle = 'อนุมัติการยกเลิกคำขอลา';
            confirmButtonText = 'ยืนยันการยกเลิก';
        }

        modalContent.innerHTML = `
            <h2>${modalTitle}</h2>
            <p><strong>ชื่อ:</strong> ${requestData.name}</p>
            <p><strong>ประเภทการลา:</strong> ${requestData.leaveType}</p>
            <p><strong>วันที่เริ่ม:</strong> ${requestData.startDate}</p>
            <p><strong>วันที่สิ้นสุด:</strong> ${requestData.endDate}</p>
            <p><strong>จำนวนวัน:</strong> ${requestData.duration} วัน</p>
            <p><strong>สาเหตุ:</strong> ${requestData.reason}</p>
            <div class="modal-buttons">
                <button id="confirm-approve-button" class="approve-button" data-leave-id="${requestData.leaveId}" data-status="${requestData.currentStatus}">${confirmButtonText}</button>
                <button id="cancel-modal-button" class="reject-button">ยกเลิก</button>
            </div>
        `;
        modal.style.display = 'flex';

        document.getElementById('confirm-approve-button').addEventListener('click', () => {
            sendApproval(requestData.leaveId);
        });

        document.getElementById('cancel-modal-button').addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    // ฟังก์ชันสำหรับส่งคำขออนุมัติจริง
    async function sendApproval(leaveId) {
        modal.style.display = 'none';
        const response = await fetch(appsScriptUrl, {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: `action=approveLeave&leaveId=${leaveId}`
        });
        const result = await response.json();

        if (result.success) {
            alert(result.message);
            fetchPendingRequests();
        } else {
            alert('ไม่สามารถอนุมัติได้: ' + result.message);
        }
    }


    // ฟังก์ชันสำหรับจัดการการไม่อนุมัติ
    async function handleRejectRequest(event) {
        const leaveId = event.target.dataset.leaveId;
        const currentStatus = event.target.dataset.status;
        let message = 'ยืนยันการไม่อนุมัติคำขอลาหรือไม่?';

        if (currentStatus === 'รออนุมัติยกเลิก') {
            message = 'ยืนยันการไม่อนุมัติการยกเลิกคำขอลาหรือไม่? คำขอจะกลับเป็นสถานะเดิม';
        }

        if (!confirm(message)) return;

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