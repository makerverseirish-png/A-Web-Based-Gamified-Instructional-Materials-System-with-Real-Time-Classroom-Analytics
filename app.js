const SHEET_ID = '1qPEZhwGdFpSyMGpBd3j-qJhhimUt3B37Ya0HvrcsnX4';

function doGet(e) {
  const result = handleRequest(e);
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const result = handleRequest(e);
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleRequest(e) {
  const params = e.parameter;
  const action = params.action;
  
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(params.section);

  if (!sheet) {
    return { success: false, message: 'Sheet section tab not found: ' + params.section };
  }

  if (action === 'login') {
    return loginOrRegister(sheet, params.username, params.password);
  }
  if (action === 'getStudents') {
    return getStudents(sheet);
  }
  if (action === 'updatePoints') {
    return updatePoints(sheet, params.username, params.quest, params.points);
  }
  if (action === 'awardBonus') {
    return awardBonus(sheet, params.username, params.bonus);
  }
  
  return { success: false, message: 'Unknown action request' };
}

// 🚀 AUTO-REGISTRATION ENGINE
function loginOrRegister(sheet, username, password) {
  try {
    const data = sheet.getDataRange().getValues();
    
    // 1. Check if the student already exists on the sheet layout
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] == username) {
        // If they exist, verify their password matching parameters
        if (data[i][1] == password) {
          return { success: true, username: username, message: 'Logged in successfully' };
        } else {
          return { success: false, message: 'Invalid credentials' };
        }
      }
    }
    
    // 2. If the loop completes and the name wasn't found, AUTOMATICALLY create them!
    // Row matching layout structure: [Student Name, Password, Quest 1, Rank, Quest 2, Rank, Quest 3, Rank, Total Points]
    sheet.appendRow([username, password, 0, "", 0, "", 0, "", 0]);
    
    return { success: true, username: username, message: 'Account auto-created and logged in!' };
    
  } catch(err) {
    return { success: false, message: err.toString() };
  }
}

function getStudents(sheet) {
  try {
    const data = sheet.getDataRange().getValues();
    const students = [];
    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        students.push({
          name: data[i][0],
          quest1: data[i][2], 
          quest2: data[i][4],
          quest3: data[i][6],
          total: data[i][8]
        });
      }
    }
    return students;
  } catch(err) {
    return { error: err.toString() };
  }
}

function updatePoints(sheet, username, quest, points) {
  try {
    const data = sheet.getDataRange().getValues();
    const questCol = { 'quest1': 2, 'quest2': 4, 'quest3': 6 };
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] == username) {
        sheet.getRange(i + 1, questCol[quest] + 1).setValue(points);
        return { success: true };
      }
    }
    return { success: false, message: 'Student not found' };
  } catch(err) {
    return { success: false, message: err.toString() };
  }
}

function awardBonus(sheet, username, bonus) {
  try {
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] == username) {
        const current = data[i][8] || 0;
        sheet.getRange(i + 1, 9).setValue(parseInt(current) + parseInt(bonus));
        return { success: true };
      }
    }
    return { success: false, message: 'Student not found' };
  } catch(err) {
    return { success: false, message: err.toString() };
  }
}
