document.addEventListener('DOMContentLoaded', function() {
    // *** สำคัญมาก: เปลี่ยน URL นี้ด้วย URL ของ Google Apps Script Web App ของคุณ ***
    const apiUrl = 'https://script.google.com/macros/s/AKfycbwiDfG7KDZafQGUfJzygS8qhDeG4SSd_5TORcJclqDBERhsutX_y2Cstbvc9d0LyW5_/exec'; 

    const dataTable = document.getElementById('dataTable');
    const tableBody = dataTable.querySelector('tbody');
    const loadingDiv = document.getElementById('loading');
    const errorMessageDiv = document.getElementById('error-message');
    const currentYearSpan = document.getElementById('current-year');
    const printButton = document.getElementById('printButton');

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

    function showLoading() {
        loadingDiv.style.display = 'block';
        dataTable.style.display = 'none';
        errorMessageDiv.style.display = 'none';
    }

    function hideLoading() {
        loadingDiv.style.display = 'none';
    }

    function showTable() {
        dataTable.style.display = 'table';
    }

    function showErrorMessage() {
        errorMessageDiv.style.display = 'block';
        hideLoading();
    }

    const now = new Date();
    const currentBuddhistYear = now.getFullYear() + 543;
    if (currentYearSpan) {
        currentYearSpan.textContent = currentBuddhistYear;
    }

    if (printButton) {
        printButton.addEventListener('click', function() {
            window.print();
        });
    }

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
                // สร้าง Object วันที่ปัจจุบัน (ตัดเวลาออกเพื่อให้เทียบเฉพาะวันได้ถูกต้อง)
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                data.forEach(row => {
                    const tr = document.createElement('tr');
                    if (Array.isArray(row) && row.length === 5) {
                        const rawDate = row[0];
                        const school = row[1];
                        const time = row[2];
                        const grade = row[3];
                        const note = row[4];

                        // แปลงข้อมูลวันที่ดิบเพื่อนำมาเช็คสถานะ
                        const rowDate = new Date(rawDate);
                        rowDate.setHours(0, 0, 0, 0);

                        // ตรวจสอบว่าพ้นกำหนดหรือยัง (วันของแถว < วันปัจจุบัน)
                        const isCompleted = !isNaN(rowDate.getTime()) && rowDate < today;

                        if (isCompleted) {
                            tr.classList.add('completed-row'); // เพิ่มคลาสสำหรับแถวที่เสร็จแล้ว
                        }

                        const displayDate = formatDate(rawDate);
                        
                        const tdDate = document.createElement('td');
                        tdDate.textContent = displayDate;
                        tr.appendChild(tdDate);

                        const tdSchool = document.createElement('td');
                        
                        // ถ้าเสร็จแล้ว ให้ใส่ป้ายสัญลักษณ์ Completed ต่อท้ายชื่อโรงเรียนหรือในช่องโรงเรียน
                        if (isCompleted) {
                            tdSchool.innerHTML = `${school} <span class="completed-badge">✅ Completed</span>`;
                        } else {
                            tdSchool.textContent = school;
                        }
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