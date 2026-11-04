function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // รับค่าจาก FormData ที่ส่งมาจาก Server ของคุณ
    var studentName = e.parameter.studentName;
    var gradeClass = e.parameter.gradeClass;
    var parentName = e.parameter.parentName;
    var consent = e.parameter.consent;
    var phone = e.parameter.phone || '-';
    var note = e.parameter.note || '-';
    
    // บันทึกลง Sheet
    sheet.appendRow([
      new Date(),
      studentName,
      gradeClass,
      parentName,
      consent,
      phone,
      note
    ]);
    
    // ส่งข้อความตอบกลับเป็น JSON
    return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    var result = [];
    
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var rawDate = row[0];
      var timeFormatted = '-';

      // แปลงเป็นรูปแบบ YYYY-MM-DD HH:mm น.
      if (rawDate instanceof Date) {
        timeFormatted = Utilities.formatDate(rawDate, "Asia/Bangkok", "yyyy-MM-dd HH:mm") + " น.";
      } else if (rawDate) {
        timeFormatted = String(rawDate);
      }
        
      result.push({
        id: i,
        timestamp: timeFormatted,
        studentName: row[1] || '',
        schoolName: row[2] || '',
        gradeLevel: row[3] || '',
        roomNo: row[4] || '',
        parentName: row[5] || '',
        phone: row[6] || '',
        consent: row[7] || '',
        note: row[8] || ''
      });
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: result }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}