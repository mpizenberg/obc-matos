// Google Apps Script to add entries to the form response sheet
// This script should be deployed as a Web App

function doPost(e) {
  try {
    // Get the spreadsheet and sheet
    // Replace 'YOUR_SPREADSHEET_ID' with your actual spreadsheet ID
    const spreadsheetId = 'YOUR_SPREADSHEET_ID';
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);

    // Get the first sheet (or specify the sheet name if different)
    const sheet = spreadsheet.getSheets()[0];

    // Parse the incoming data
    const payload = JSON.parse(e.postData.contents);
    const data = payload.data;
    const expectedHeaders = payload.headers;

    // Get actual headers from the spreadsheet (row 1)
    const actualHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    // Normalize headers for comparison (trim whitespace, case-insensitive)
    const normalizeHeader = (h) => String(h).trim().toLowerCase();
    const normalizedActual = actualHeaders.map(normalizeHeader);
    const normalizedExpected = expectedHeaders.map(normalizeHeader);

    // Validate headers match
    if (normalizedActual.length !== normalizedExpected.length) {
      return ContentService.createTextOutput(JSON.stringify({
        'status': 'error',
        'message': 'Header mismatch: different number of columns',
        'expected': expectedHeaders,
        'actual': actualHeaders
      })).setMimeType(ContentService.MimeType.JSON);
    }

    for (let i = 0; i < normalizedActual.length; i++) {
      if (normalizedActual[i] !== normalizedExpected[i]) {
        return ContentService.createTextOutput(JSON.stringify({
          'status': 'error',
          'message': `Header mismatch at column ${i + 1}: expected "${expectedHeaders[i]}", got "${actualHeaders[i]}"`,
          'expected': expectedHeaders,
          'actual': actualHeaders
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    // Headers match! Build the row from the data object
    // The data object keys should match the header names
    const newRow = expectedHeaders.map(header => {
      const normalizedHeader = normalizeHeader(header);

      // Special case: timestamp
      if (normalizedHeader === 'timestamp' || normalizedHeader === 'horodateur') {
        return new Date();
      }

      // Find matching key in data (case-insensitive)
      const dataKey = Object.keys(data).find(key =>
        normalizeHeader(key) === normalizedHeader
      );

      return dataKey ? data[dataKey] : '';
    });

    // Append the row to the sheet
    sheet.appendRow(newRow);

    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      'status': 'success',
      'message': 'Data added successfully'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Return error response
    return ContentService.createTextOutput(JSON.stringify({
      'status': 'error',
      'message': error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Test function to verify the script works
function testDoPost() {
  const testData = {
    postData: {
      contents: JSON.stringify({
        headers: [
          'Timestamp',
          'Nom de l\'adhérent acheteur',
          'Type de volant',
          'Quantité',
          'Grip',
          'Surgrip',
          'Lieu',
          'Créneau',
          'Moyen de paiement'
        ],
        data: {
          'Nom de l\'adhérent acheteur': 'Test User',
          'Type de volant': 'Vinastar',
          'Quantité': 2,
          'Grip': 0,
          'Surgrip': 0,
          'Lieu': 'Léo Lagrange',
          'Créneau': 'Mercredi',
          'Moyen de paiement': 'Liquide'
        }
      })
    }
  };

  const result = doPost(testData);
  Logger.log(result.getContent());
}
