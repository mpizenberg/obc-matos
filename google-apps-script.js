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
    const data = JSON.parse(e.postData.contents);

    // Create a new row with the data
    // Adjust the order to match your form columns
    const newRow = [
      new Date(), // Timestamp
      data.memberName, // Nom de l'adhérent acheteur
      data.equipmentType, // Type de volant/équipement
      data.quantity, // Quantité
      // For Grip and Surgrip, you may need to adjust the logic
      data.equipmentType === 'Grip' ? data.quantity : 0, // Grip
      data.equipmentType === 'Surgrip' ? data.quantity : 0, // Surgrip
      data.location, // Lieu
      data.timeSlot, // Créneau
      data.paymentMethod // Moyen de paiement
    ];

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
        memberName: 'Test User',
        equipmentType: 'Vinastar',
        quantity: 2,
        location: 'Léo Lagrange',
        timeSlot: 'Mercredi',
        paymentMethod: 'Liquide'
      })
    }
  };

  const result = doPost(testData);
  Logger.log(result.getContent());
}
