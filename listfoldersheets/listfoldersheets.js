const { google } = require('googleapis');

async function listSheetsInSpreadsheets(folderId) {
    const auth = new google.auth.GoogleAuth({
        keyFile: '/Users/mitzvahcapital/Downloads/algebraic-ward-411306-f5019210a52a.json', 
        scopes: ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive'],
    });

    const drive = google.drive({
        version: 'v3',
        auth: await auth.getClient(),
    });

    const sheetsService = google.sheets({
        version: 'v4',
        auth: await auth.getClient(),
    });

    try {
        // List all spreadsheets in the folder
        const response = await drive.files.list({
            q: `'${folderId}' in parents and mimeType='application/vnd.google-apps.spreadsheet'`,
            fields: 'files(id, name)',
        });

        const spreadsheets = response.data.files;
        if (!spreadsheets.length) {
            console.log('No spreadsheets found.');
            return;
        }

        // For each spreadsheet, list its sheets
        for (const spreadsheet of spreadsheets) {
            console.log(`Sheets in spreadsheet: ${spreadsheet.name} (${spreadsheet.id})`);

            const sheetListResponse = await sheetsService.spreadsheets.get({
                spreadsheetId: spreadsheet.id,
                fields: 'sheets.properties.title',
            });

            const sheets = sheetListResponse.data.sheets;
            if (sheets.length) {
                sheets.forEach(sheet => console.log(` - ${sheet.properties.title}`));
            } else {
                console.log(' - No sheets found in this spreadsheet.');
            }
        }
    } catch (error) {
        console.error('The API returned an error:', error);
    }
}

const realdata = '1k0FhOtK-3_mGoH5CnC9axY2l2FsP7h1q'; // Variable containing the identifier of the folder containing 'real trades'.
const fakedata = '1z38V8POr9lXNAoFBM-7I5_8GG9t5E2wx'; // Variable containing the identifier of the folder containing 'fake trades'.
listSheetsInSpreadsheets(fakedata);
