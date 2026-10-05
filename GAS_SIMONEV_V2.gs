/**
 * ============================================================================
 * SKRIP GOOGLE APPS SCRIPT - SIMONEV V2 (MURNI GOOGLE SHEETS & GOOGLE DRIVE)
 * ============================================================================
 * 
 * CARA MEMASANG:
 * 1. Buka Google Spreadsheet "Database_Simonev" Anda di Google Drive.
 * 2. Klik menu "Ekstensi" -> pilih "Apps Script".
 * 3. Hapus seluruh isi editor, lalu Tempel (Paste) seluruh kode di bawah ini.
 * 4. Klik ikon Simpan (Disk).
 * 5. Klik tombol "Terapkan" (Deploy) -> "Penerapan baru" (New Deployment).
 * 6. Pilih Jenis: "Aplikasi Web" (Web App).
 * 7. Isikan Opsi:
 *    - Deskripsi: Simonev V2 Web App API
 *    - Jalankan sebagai: Saya (Me)
 *    - Yang memiliki akses: Siapa saja (Anyone)  <-- SANGAT PENTING!
 * 8. Klik "Terapkan" (Deploy) dan Beri Izin (Authorize Access).
 * 9. Salin URL Aplikasi Web (berakhiran /exec) dan tempelkan di menu Pengaturan Aplikasi Simonev.
 * ============================================================================
 */

function doGet(e) {
  try {
    var sheetName = (e && e.parameter && e.parameter.sheet) ? e.parameter.sheet : 'activities';
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) return responseJSON([]);
    
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return responseJSON([]);
    
    var headers = data[0];
    var result = [];
    
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var obj = {};
      var hasData = false;
      
      for (var j = 0; j < headers.length; j++) {
        var key = headers[j];
        if (!key) continue;
        var val = row[j];
        
        if (val !== "" && val !== null && val !== undefined) hasData = true;
        if (val === "TRUE" || val === true) val = true;
        if (val === "FALSE" || val === false) val = false;
        
        obj[key] = val;
      }
      if (hasData) result.push(obj);
    }
    return responseJSON(result);
  } catch (err) {
    return responseJSON({ status: "error", message: err.toString() });
  }
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return responseJSON({ status: "error", message: "No post data received" });
    }
    
    var postData = JSON.parse(e.postData.contents);
    var action = postData.action || 'set';
    
    // --- 1. UPLOAD FILE PDF / GAMBAR KE GOOGLE DRIVE ---
    if (action === 'upload') {
      var folderName = postData.folder || 'Database_Simonev_Uploads';
      var fileName = postData.fileName || ('FILE_' + Date.now() + '.pdf');
      var mimeType = postData.mimeType || 'application/pdf';
      var base64Data = postData.base64Data;
      
      if (!base64Data) return responseJSON({ status: "error", message: "Missing base64Data" });
      
      var folderIter = DriveApp.getFoldersByName(folderName);
      var folder;
      if (folderIter.hasNext()) {
        folder = folderIter.next();
      } else {
        folder = DriveApp.createFolder(folderName);
        folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      }
      
      var decodedBytes = Utilities.base64Decode(base64Data);
      var blob = Utilities.newBlob(decodedBytes, mimeType, fileName);
      var file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      
      var fileId = file.getId();
      var fileUrl = "https://lh3.googleusercontent.com/d/" + fileId;
      var driveUrl = "https://drive.google.com/uc?id=" + fileId + "&export=download";
      
      return responseJSON({
        status: "success",
        fileId: fileId,
        fileUrl: fileUrl,
        downloadUrl: driveUrl
      });
    }
    
    // --- 2. UPDATE / SIMPAN DATA TABEL SPREADSHEET ---
    var sheetName = postData.sheet || 'activities';
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) sheet = ss.insertSheet(sheetName);
    
    var dataRange = sheet.getDataRange();
    var values = dataRange.getValues();
    var headers = values[0] || [];
    
    if (action === 'delete') {
      var targetId = postData.id;
      for (var i = 1; i < values.length; i++) {
        if (values[i][0] == targetId) {
          sheet.deleteRow(i + 1);
          return responseJSON({ status: 'success', action: 'delete', id: targetId });
        }
      }
      return responseJSON({ status: 'success', action: 'delete_not_found', id: targetId });
    }
    
    if (action === 'set') {
      var rowData = postData.data;
      var id = postData.id || rowData.id;
      
      if (headers.length === 0 || (headers.length === 1 && headers[0] === "")) {
        headers = Object.keys(rowData);
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        values = [headers];
      }
      
      var foundRow = -1;
      for (var k = 1; k < values.length; k++) {
        if (values[k][0] == id) {
          foundRow = k + 1;
          break;
        }
      }
      
      var newRow = headers.map(function(h) {
        var val = rowData[h];
        if (val === undefined || val === null) return "";
        if (typeof val === 'object') return JSON.stringify(val);
        return val;
      });
      
      if (foundRow > 0) {
        sheet.getRange(foundRow, 1, 1, newRow.length).setValues([newRow]);
      } else {
        sheet.appendRow(newRow);
      }
      
      return responseJSON({ status: 'success', action: 'set', id: id });
    }
    
    return responseJSON({ status: "error", message: "Unknown action" });
  } catch (err) {
    return responseJSON({ status: "error", message: err.toString() });
  }
}

function responseJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
