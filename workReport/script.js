document.addEventListener('DOMContentLoaded', function() {
    // *** สำคัญมาก: เปลี่ยน URL นี้ด้วย URL ของ Google Apps Script Web App ของคุณ ***
    const apiUrl = 'https://script.google.com/macros/s/AKfycbwiDfG7KDZafQGUfJzygS8qhDeG4SSd_5TORcJclqDBERhsutX_y2Cstbvc9d0LyW5_/exec'; 

    const dataTable = document.getElementById('dataTable');
    const tableBody = dataTable.querySelector('tbody');
    const loadingDiv = document.getElementById('loading');
    const errorMessageDiv = document.getElementById('error-message');
    const currentYearSpan = document.getElementById('current-year');
    const printButton = document.getElementById('printButton'); // เพิ่มการเข้าถึงปุ่มพิมพ์

    // ฟังก์ชันสำหรับแปลงวันที่ให้เป็นรูปแบบ "วันจันทร์ ที่ DD เดือน 해당하는ปี พ.ศ."
    function formatDate(dateString) {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return dateString; 
        }

        const options = {
            weekday: 'long', 
            day: 'numeric',
            month: 'long',   
            year: 'numeric'
        };

        const formatter = new Intl.DateTimeFormat('th-TH', options);
        let formattedDate = formatter.format(date);
        
        return formattedDate;
    }

    // ฟังก์ชันสำหรับแสดงข้อความโหลด
    function showLoading() {
        loadingDiv.style.display = 'block';
        dataTable.style.display = 'none';
        errorMessageDiv.style.display = 'none';
    }

    // ฟังก์ชันสำหรับซ่อนข้อความโหลด
    function hideLoading() {
        loadingDiv.style.display = 'none';
    }

    // ฟังก์ชันสำหรับแสดงตาราง
    function showTable() {
        dataTable.style.display = 'table';
    }

    // ฟังก์ชันสำหรับแสดงข้อผิดพลาด
    function showErrorMessage() {
        errorMessageDiv.style.display = 'block';
        hideLoading();
    }

    // ดึงปีปัจจุบันและแสดงผล (พ.ศ.)
    const now = new Date();
    const currentBuddhistYear = now.getFullYear() + 543; // แปลงเป็น พ.ศ.
    if (currentYearSpan) {
        currentYearSpan.textContent = currentBuddhistYear;
    }

    // เพิ่ม Event Listener สำหรับปุ่มพิมพ์
    if (printButton) {
        printButton.addEventListener('click', function() {
            window.print(); // สั่งพิมพ์หน้าจอ
        });
    }

    // เริ่มต้นกระบวนการดึงข้อมูล
    showLoading();

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            hideLoading();
            if (data && Array.isArray(data) && data.length > 0) {
                data.forEach(row => {
                    const tr = document.createElement('tr');
                    if (Array.isArray(row) && row.length === 5) {
                        const rawDate = row[0];
                        const school = row[1];
                        const time = row[2];
                        const grade = row[3];
                        const note = row[4];

                        const displayDate = formatDate(rawDate);
                        
                        const tdDate = document.createElement('td');
                        tdDate.textContent = displayDate;
                        tr.appendChild(tdDate);

                        const tdSchool = document.createElement('td');
                        tdSchool.textContent = school;
                        tr.appendChild(tdSchool);

                        const tdTime = document.createElement('td');
                        tdTime.textContent = time; 
                        tr.appendChild(tdTime);

                        const tdGrade = document.createElement('td');
                        tdGrade.textContent = grade;
                        tr.appendChild(tdGrade);

                        const tdNote = document.createElement('td');
                        tdNote.textContent = note;
                        tr.appendChild(tdNote);

                        tableBody.appendChild(tr);
                    } else {
                        console.warn('Skipping malformed row:', row);
                    }
                });
                showTable();
            } else {
                loadingDiv.textContent = 'ไม่พบข้อมูลแผนการปฏิบัติงาน';
                loadingDiv.style.display = 'block';
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            showErrorMessage();
        });
});