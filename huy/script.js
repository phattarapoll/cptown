// ** ชุดข้อมูลสถิติหวยรัฐบาลย้อนหลัง 1 ปี (24 งวด) **
// ** ข้อมูลจริง (พ.ย. 67 - ต.ค. 68) **
let governmentLottoData = [
    // ข้อมูลจากภาพที่คุณให้มา
    { date: "01 พ.ย. 2568", R1: 345898, twoD: 87, F3_1: 449, F3_2: 328, B3_1: 111, B3_2: 690 },
    { date: "16 ต.ค. 2568", R1: 059696, twoD: 61, F3_1: 531, F3_2: 955, B3_1: 476, B3_2: 889 },
    { date: "01 ต.ค. 2568", R1: 876978, twoD: 77, F3_1: 843, F3_2: 532, B3_1: 280, B3_2: 605 },
    { date: "16 ก.ย. 2568", R1: 074646, twoD: 58, F3_1: 512, F3_2: 740, B3_1: 308, B3_2: 703 },
    { date: "01 ก.ย. 2568", R1: 506356, twoD: 31, F3_1: 131, F3_2: 012, B3_1: 022, B3_2: 209 },
    { date: "16 ส.ค. 2568", R1: 994865, twoD: 63, F3_1: 247, F3_2: 602, B3_1: 834, B3_2: 989 },
    { date: "01 ส.ค. 2568", R1: 432429, twoD: 10, F3_1: 897, F3_2: 124, B3_1: 303, B3_2: 801 },
    { date: "16 ก.ค. 2568", R1: 169556, twoD: 83, F3_1: 173, F3_2: 248, B3_1: 780, B3_2: 372 },
    { date: "01 ก.ค. 2568", R1: 593643, twoD: 94, F3_1: 287, F3_2: 241, B3_1: 432, B3_2: 739 },
    { date: "16 มิ.ย. 2568", R1: 943566, twoD: 47, F3_1: 902, F3_2: 444, B3_1: 852, B3_2: 783 },
    { date: "01 มิ.ย. 2568", R1: 569738, twoD: 15, F3_1: 869, F3_2: 124, B3_1: 062, B3_2: 706 },
    { date: "16 พ.ค. 2568", R1: 205634, twoD: 23, F3_1: 341, F3_2: 672, B3_1: 809, B3_2: 216 },
    { date: "01 พ.ค. 2568", R1: 843849, twoD: 80, F3_1: 752, F3_2: 508, B3_1: 712, B3_2: 204 },
    { date: "16 เม.ย. 2568", R1: 980187, twoD: 58, F3_1: 800, F3_2: 147, B3_1: 574, B3_2: 651 },
    { date: "01 เม.ย. 2568", R1: 983190, twoD: 67, F3_1: 757, F3_2: 955, B3_1: 586, B3_2: 446 },
    { date: "16 มี.ค. 2568", R1: 673943, twoD: 14, F3_1: 531, F3_2: 504, B3_1: 742, B3_2: 973 },
    { date: "01 มี.ค. 2568", R1: 479007, twoD: 97, F3_1: 792, F3_2: 890, B3_1: 320, B3_2: 871 },
    { date: "16 ก.พ. 2568", R1: 077560, twoD: 09, F3_1: 982, F3_2: 950, B3_1: 844, B3_2: 512 },
    { date: "01 ก.พ. 2568", R1: 457885, twoD: 59, F3_1: 292, F3_2: 554, B3_1: 746, B3_2: 593 },
    { date: "16 ม.ค. 2568", R1: 105979, twoD: 71, F3_1: 828, F3_2: 025, B3_1: 018, B3_2: 218 },
    { date: "30 ธ.ค. 2567", R1: 625539, twoD: 53, F3_1: 948, F3_2: 600, B3_1: 570, B3_2: 787 },
    { date: "16 ธ.ค. 2567", R1: 356757, twoD: 12, F3_1: 778, F3_2: 521, B3_1: 503, B3_2: 345 },
    { date: "01 ธ.ค. 2567", R1: 088569, twoD: 91, F3_1: 429, F3_2: 561, B3_1: 031, B3_2: 476 },
    { date: "16 พ.ย. 2567", R1: 557990, twoD: 13, F3_1: 483, F3_2: 365, B3_1: 382, B3_2: 808 },
];

// ข้อมูลหวยหุ้น (คงเดิม)
const stockLottoData = [
    // [Format: { date: "วันที่", twoD: เลข 2 ตัวล่าง (ปิด), result: ผลดัชนีปิด, twoD_top: เลข 2 ตัวบน (เปิด/ปิด), result_top: ผลดัชนีเปิด/ปิด }]
    { date: "12 พ.ย.", twoD: 91, result: "1598.91", twoD_top: 04, result_top: "1600.04" }, 
    { date: "11 พ.ย.", twoD: 45, result: "1603.45", twoD_top: 22, result_top: "1604.22" }, 
    { date: "10 พ.ย.", twoD: 83, result: "1628.83", twoD_top: 88, result_top: "1629.88" }, 
    { date: "09 พ.ย.", twoD: 10, result: "1631.10", twoD_top: 05, result_top: "1635.05" }, 
    { date: "08 พ.ย.", twoD: 55, result: "1620.55", twoD_top: 22, result_top: "1622.22" }, 
];
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// **********************************************
//              การจัดการสถานะการทำงาน
// **********************************************

function showLoading() { 
    document.getElementById('analyzeButton').disabled = true;
    document.getElementById('submitNewData').disabled = true;
    document.getElementById('recommendation-section').classList.add('hidden');
    document.getElementById('history-section').classList.add('hidden');
    document.getElementById('loading-status').classList.remove('hidden');
}

function hideLoading() { 
    document.getElementById('loading-status').classList.add('hidden');
    document.getElementById('analyzeButton').disabled = false;
    document.getElementById('submitNewData').disabled = false;
}

// **********************************************
//              ฟังก์ชันคำนวณความถี่พื้นฐาน
// **********************************************

function calculateFrequency(numbers, size = 100) {
    const frequencyMap = new Array(size).fill(0);
    numbers.forEach(number => {
        // ต้องตรวจสอบให้แน่ใจว่าเป็นตัวเลข
        if (!isNaN(number) && number >= 0 && number < size) {
            frequencyMap[number]++;
        }
    });
    return frequencyMap;
}

function getTopNumbers(frequencyMap, N = 5, padLength = 2) {
    const size = frequencyMap.length;
    const numbersWithFrequency = frequencyMap.map((count, index) => ({
        number: index.toString().padStart(padLength, '0'),
        count: count
    }));
    
    // เรียง Top 5
    numbersWithFrequency.sort((a, b) => b.count - a.count);
    const topNumbers = numbersWithFrequency.slice(0, N);
    
    // เรียง Bottom 5 (เลขที่ออกน้อยที่สุด/ยังไม่ออก)
    const bottomNumbers = numbersWithFrequency
        .slice()
        .sort((a, b) => {
            // เรียงตามจำนวนครั้งที่ออกน้อยที่สุด
            if (a.count !== b.count) {
                return a.count - b.count;
            }
            // หากจำนวนครั้งเท่ากัน ให้เรียงตามเลขจากน้อยไปมาก
            return parseInt(a.number) - parseInt(b.number);
        })
        .slice(0, N);
    
    return { topNumbers, bottomNumbers };
}

// **********************************************
//              การวิเคราะห์ทุกรางวัล
// **********************************************

function analyzeLottoNumbers(data, selectedPrize) {
    let numbers = [];
    let padLength = 2; // Default for 2D

    if (selectedPrize === 'R1') {
        // รางวัลที่ 1: วิเคราะห์เลข 3 ตัวท้าย (000-999)
        numbers = data.map(item => item.R1 % 1000); 
        padLength = 3;
    } else if (selectedPrize === 'B2') {
        // เลขท้าย 2 ตัว (00-99)
        numbers = data.map(item => item.twoD);
        padLength = 2;
    } else if (selectedPrize === 'F3') {
        // เลขหน้า 3 ตัว: รวมทั้ง F3_1 และ F3_2 (000-999)
        numbers = data.flatMap(item => [item.F3_1, item.F3_2]);
        padLength = 3;
    } else if (selectedPrize === 'B3') {
        // เลขท้าย 3 ตัว: รวมทั้ง B3_1 และ B3_2 (000-999)
        numbers = data.flatMap(item => [item.B3_1, item.B3_2]);
        padLength = 3;
    } 
    
    // คำนวณความถี่และ Top/Bottom
    const size = padLength === 3 ? 1000 : 100;
    const frequency = calculateFrequency(numbers, size);
    const { topNumbers, bottomNumbers } = getTopNumbers(frequency, 5, padLength);

    return { topNumbers, bottomNumbers, padLength };
}

// **********************************************
//              การวิเคราะห์ผลรวม (เฉพาะ 2 ตัว)
// **********************************************

function calculateSumFrequency(data) {
    // ใช้เฉพาะข้อมูลที่มี twoD
    const twoDNumbers = data.map(item => item.twoD).filter(n => !isNaN(n));
    const sumFrequencyMap = new Array(19).fill(0); 

    twoDNumbers.forEach(number => {
        const tens = Math.floor(number / 10);
        const units = number % 10;
        const sum = tens + units;
        
        if (sum >= 0 && sum <= 18) {
            sumFrequencyMap[sum]++;
        }
    });
    return sumFrequencyMap;
}

function analyzeTopSums(sumFrequencyMap) {
    const sumsWithFrequency = sumFrequencyMap.map((count, index) => ({
        sum: index,
        count: count
    }));

    sumsWithFrequency.sort((a, b) => b.count - a.count);
    const filteredSums = sumsWithFrequency.filter(item => item.count > 0);

    return filteredSums.slice(0, 3);
}


// **********************************************
//              ฟังก์ชันรวมสำหรับวิเคราะห์
// **********************************************

async function runAnalysis(selectedType) {
    const dateInput = document.getElementById('nextLottoDate').value;
    const selectedPrize = document.getElementById('prizeSelector').value;
    
    if (!dateInput && selectedType === 'government') {
        alert("กรุณาเลือก 'งวดที่จะถึงวันที่' ก่อนเริ่มวิเคราะห์หวยรัฐบาล");
        hideLoading(); // ต้องซ่อน Loading หากมี Error
        return;
    }
    
    const analysisDate = dateInput ? new Date(dateInput).toLocaleDateString('th-TH', { 
        year: 'numeric', month: 'long', day: 'numeric' 
    }) : 'สถิติรวม';

    const dataToAnalyze = selectedType === 'government' ? governmentLottoData : stockLottoData;
    
    showLoading(); 
    await delay(1500); 

    let topNumbers, bottomNumbers, topSums, reason, analysisMessage, padLength;
    let finalDataForTable = dataToAnalyze;

    if (selectedType === 'government') {
        // 1. กรองข้อมูลเฉพาะงวด (1 หรือ 16)
        const dateObj = new Date(dateInput);
        const targetDay = dateObj.getDate();
        
        const filteredData = dataToAnalyze.filter(item => {
            const dayMatch = item.date.match(/(\d+)\s/); 
            return dayMatch && dayMatch[1] == targetDay;
        });
        
        const dataForPrize = (filteredData.length > 0) ? filteredData : dataToAnalyze;
        
        // 2. วิเคราะห์รางวัลที่เลือก
        const analysisResult = analyzeLottoNumbers(dataForPrize, selectedPrize);
        topNumbers = analysisResult.topNumbers;
        bottomNumbers = analysisResult.bottomNumbers;
        padLength = analysisResult.padLength;

        // 3. วิเคราะห์ผลรวม (เฉพาะ 2 ตัว)
        const data2D = dataToAnalyze.map(item => ({ twoD: item.twoD }));
        const sumFrequency = calculateSumFrequency(data2D);
        topSums = analyzeTopSums(sumFrequency);
        
        // 4. กำหนดเหตุผล
        const prizeName = document.getElementById('prizeSelector').options[document.getElementById('prizeSelector').selectedIndex].text;
        const numberType = padLength === 3 ? "เลข 3 ตัว" : "เลข 2 ตัว";
        
        reason = `เป็นเลข ${numberType} ที่ออกบ่อยที่สุดในสถิติ **${filteredData.length > 0 ? `งวดวันที่ ${targetDay} ย้อนหลัง (${filteredData.length} งวด)` : `ทั้งหมด`}**`;
        analysisMessage = `✅ วิเคราะห์ความถี่ ${prizeName}`;

        finalDataForTable = dataToAnalyze;
        
    } else { // หวยหุ้น (วิเคราะห์ 2 ตัวล่างเท่านั้น)
        const result = analyzeLottoNumbers(dataToAnalyze.map(item => ({ twoD: item.twoD })), 'B2');
        const sumResult = analyzeTopSums(calculateSumFrequency(dataToAnalyze.map(item => ({ twoD: item.twoD }))));
        topNumbers = result.topNumbers;
        bottomNumbers = result.bottomNumbers;
        topSums = sumResult;
        padLength = 2;
        reason = 'เป็นเลขที่ออกบ่อยที่สุดจากสถิติหวยหุ้นทั้งหมด';
        analysisMessage = `✅ วิเคราะห์จากสถิติหวยหุ้นทั้งหมด ${dataToAnalyze.length} งวด`;
    }

    // 5. แสดงผลลัพธ์
    displayAnalysisResults(topNumbers, bottomNumbers, topSums, analysisDate, reason, analysisMessage, selectedPrize, padLength);
    displayHistoryTable(finalDataForTable, selectedType);
    
    hideLoading(); 
}


// **********************************************
//              การจัดการข้อมูลใหม่
// **********************************************

document.getElementById('submitNewData').addEventListener('click', async () => {
    const lastDate = document.getElementById('lastLottoDate').value.trim();
    const twoDStr = document.getElementById('lastLottoResult').value.trim();
    const R1Str = document.getElementById('r1Result').value.trim();
    
    const twoD = parseInt(twoDStr);
    const R1 = parseInt(R1Str);

    if (lastDate === "" || isNaN(twoD) || twoD < 0 || twoD > 99 || isNaN(R1) || R1Str.length !== 6) {
        document.getElementById('submissionStatus').innerHTML = "⚠️ **ป้อนข้อมูลไม่ถูกต้อง**: รางวัลที่ 1 ต้องมี 6 หลัก, 2 ตัว ต้องอยู่ระหว่าง 00-99";
        return;
    }

    const newEntry = {
        date: lastDate,
        R1: R1,
        twoD: twoD,
        // ข้อมูล 3 ตัวอื่น ๆ ถูกละไว้เพื่อให้ป้อนง่าย (ต้องอัปเดตเองในโค้ดหากต้องการความแม่นยำ 100%)
        F3_1: 0, F3_2: 0,
        B3_1: 0, B3_2: 0
    };

    governmentLottoData.unshift(newEntry);
    document.getElementById('submissionStatus').innerHTML = `✅ **เพิ่มข้อมูลสำเร็จ!** กำลังวิเคราะห์...`;
    
    document.getElementById('lottoTypeSelector').value = 'government';
    // รันการวิเคราะห์ล่าสุด
    await runAnalysis('government'); 
});


// **********************************************
//              การแสดงผลลัพธ์ (ฟังก์ชัน)
// **********************************************

function displayHistoryTable(data, type) {
    const tableHead = document.querySelector('#history-table thead tr');
    const tableBody = document.querySelector('#history-table tbody');
    tableBody.innerHTML = ''; 
    tableHead.innerHTML = '';

    let headers;
    if (type === 'government') {
        headers = ['งวดวันที่', 'รางวัลที่ 1', 'เลขท้าย 2 ตัว', 'เลขหน้า 3 ตัว (ค.1)', 'เลขหน้า 3 ตัว (ค.2)', 'เลขท้าย 3 ตัว (ค.1)', 'เลขท้าย 3 ตัว (ค.2)'];
    } else {
        headers = ['วันที่', 'เลข 2 ตัวล่าง (ปิด)', 'ผลดัชนีปิด', 'เลข 2 ตัวบน (เปิด/ปิด)'];
    }

    headers.forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        tableHead.appendChild(th);
    });

    data.forEach(item => {
        const row = tableBody.insertRow();
        row.insertCell().textContent = item.date;
        
        if (type === 'government') {
            row.insertCell().textContent = item.R1.toString().padStart(6, '0');
            row.insertCell().textContent = item.twoD.toString().padStart(2, '0');
            row.insertCell().textContent = item.F3_1.toString().padStart(3, '0');
            row.insertCell().textContent = item.F3_2.toString().padStart(3, '0');
            row.insertCell().textContent = item.B3_1.toString().padStart(3, '0');
            row.insertCell().textContent = item.B3_2.toString().padStart(3, '0');
        } else {
            row.insertCell().textContent = item.twoD.toString().padStart(2, '0');
            row.insertCell().textContent = item.result;
            row.insertCell().textContent = item.twoD_top.toString().padStart(2, '0');
        }
    });
}

function displayAnalysisResults(topNumbers, bottomNumbers, topSums, analysisDate, reason, analysisMessage, selectedPrize, padLength) {
    const formatNumbers = (items) => {
        return items.map(item => 
            `<span class="number-item">${item.number.toString().padStart(padLength, '0')} (${item.count} ครั้ง)</span>`
        ).join('\n');
    };

    document.getElementById('currentAnalysisDate').textContent = analysisDate;
    document.getElementById('top-numbers-display').innerHTML = formatNumbers(topNumbers);
    document.getElementById('bottom-numbers-display').innerHTML = formatNumbers(bottomNumbers);

    const shouldPlayNumber = topNumbers[0]?.number || 'N/A';
    document.getElementById('should-play-display').textContent = `${shouldPlayNumber}`;
    
    // แสดงเหตุผลและการวิเคราะห์
    const reasonElement = document.getElementById('submissionStatus');
    reasonElement.innerHTML = `⭐ **เลขเด่น** ${shouldPlayNumber}: ${reason}`;
    reasonElement.style.color = 'var(--primary-color)';

    // แสดงผลรวมเด่น (เฉพาะ 2 ตัว)
    const isTwoDigit = (selectedPrize === 'B2' || selectedPrize === 'stock');
    document.getElementById('top-sums-display').textContent = isTwoDigit ? 
        topSums.map(item => `ผลรวม ${item.sum} (${item.count} ครั้ง)`).join(', ') : 'วิเคราะห์เฉพาะเลข 2 ตัว';

    document.getElementById('recommendation-section').classList.remove('hidden');
    document.getElementById('history-section').classList.remove('hidden');
}


// **********************************************
//              Event Listener หลัก
// **********************************************

document.getElementById('analyzeButton').addEventListener('click', () => {
    const selectedType = document.getElementById('lottoTypeSelector').value;
    runAnalysis(selectedType);
});

// กำหนดวันที่เริ่มต้นเมื่อโหลดหน้าเว็บ
document.addEventListener('DOMContentLoaded', () => {
    const today = new Date();
    let nextLottoDay = 1; 
    
    if (today.getDate() < 16) {
        nextLottoDay = 16;
    } else {
        nextLottoDay = 1;
        today.setMonth(today.getMonth() + 1);
    }

    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    
    document.getElementById('nextLottoDate').value = `${year}-${month}-${nextLottoDay.toString().padStart(2, '0')}`;

    // ซ่อน/แสดงตัวเลือกรางวัลตามประเภทหวย
    document.getElementById('lottoTypeSelector').addEventListener('change', (event) => {
        const prizeSelector = document.getElementById('prizeSelector');
        if (event.target.value === 'stock') {
            prizeSelector.value = 'B2';
            prizeSelector.disabled = true;
        } else {
            prizeSelector.disabled = false;
        }
    });
});