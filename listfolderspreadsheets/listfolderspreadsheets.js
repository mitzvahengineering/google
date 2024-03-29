const { google } = require('googleapis');

async function listSpreadsheetsInFolder(folderId) {
    const drive = google.drive({
        version: 'v3',
        auth: new google.auth.GoogleAuth({
            keyFile: '/Users/mitzvahcapital/Downloads/algebraic-ward-411306-f5019210a52a.json',
            scopes: ['https://www.googleapis.com/auth/drive'],
        }),
    });

    try {
        const { data: { files } } = await drive.files.list({
            q: `'${folderId}' in parents and mimeType='application/vnd.google-apps.spreadsheet'`,
            fields: 'files(id, name)',
        });

        console.log(files.length ? 'Files:' : 'No files found.');
        files.forEach(file => console.log(`${file.name} (${file.id})`));
    } catch (error) {
        console.error('The API returned an error:', error);
    }
}

const realdata = '1k0FhOtK-3_mGoH5CnC9axY2l2FsP7h1q'; // Variable containing the identifier of the folder containing 'real trades'.
const fakedata = '1z38V8POr9lXNAoFBM-7I5_8GG9t5E2wx'; // Variable containing the identifier of the folder containing 'fake trades'.
listSpreadsheetsInFolder(fakedata);

