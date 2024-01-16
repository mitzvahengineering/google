const { google } = require('googleapis');

async function createSpreadsheetAndLog(ipfolderid, opfolderid) {
    const sheetsService = google.sheets({ version: 'v4', auth: await getGoogleClient() });
    const drive = google.drive({ version: 'v3', auth: await getGoogleClient() });

    try {
        const inputFolderName = (await drive.files.get({ fileId: ipfolderid, fields: 'name' })).data.name.toLowerCase().replace(/ /g, '-');
        const dateStamp = new Date().toISOString().replace(/[-:.TZ]/g, '');
        const newSpreadsheet = await sheetsService.spreadsheets.create({
            resource: { properties: { title: `summary-of-${inputFolderName}-${dateStamp}` }, sheets: [{ properties: { title: 'SUMMARY' } }] }
        });

        await moveFileToFolder(newSpreadsheet.data.spreadsheetId, opfolderid, drive);

        const files = (await drive.files.list({
            q: `'${ipfolderid}' in parents and mimeType='application/vnd.google-apps.spreadsheet'`,
            fields: 'files(id, name)',
        })).data.files;

        const summaryData = [['UNDERLYING', 'TRADE', 'RETURN']];
        for (const { id, name } of files) {
            const sheets = (await sheetsService.spreadsheets.get({ spreadsheetId: id, fields: 'sheets.properties.title' })).data.sheets;
            for (const sheet of sheets) {
                summaryData.push([name, sheet.properties.title, await findTotalValue(id, sheet.properties.title, sheetsService)]);
            }
        }

        await sheetsService.spreadsheets.values.update({
            spreadsheetId: newSpreadsheet.data.spreadsheetId,
            range: 'SUMMARY!A1',
            valueInputOption: 'USER_ENTERED',
            resource: { values: summaryData }
        });

        await applyFormattingAndAddStatsSheet(newSpreadsheet.data.spreadsheetId, sheetsService, summaryData.length);
    } catch (error) {
        console.error('The API returned an error:', error);
    }
}

async function getGoogleClient() {
    const auth = new google.auth.GoogleAuth({
        keyFile: '/Users/mitzvahcapital/Downloads/algebraic-ward-411306-f5019210a52a.json',
        scopes: ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive'],
    });
    return auth.getClient();
}

async function findTotalValue(spreadsheetId, sheetTitle, sheetsService) {
    try {
        const { data: { values } } = await sheetsService.spreadsheets.values.get({
            spreadsheetId,
            range: `${sheetTitle}!A:B`,
        });

        for (const row of values || []) {
            if (row[0] === 'Total' && row[1]) {
                return row[1];
            }
        }
        return '';
    } catch (error) {
        console.error('Error finding Total:', error);
        return 'Error';
    }
}

async function moveFileToFolder(fileId, folderId, drive) {
    const { data: { parents } } = await drive.files.get({ fileId, fields: 'parents' });
    await drive.files.update({
        fileId,
        addParents: folderId,
        removeParents: parents.join(','),
        fields: 'id, parents'
    });
}

async function applyFormattingAndAddStatsSheet(spreadsheetId, sheetsService, rowCount) {
    const requests = [
        { addSheet: { properties: { title: 'STATISTICS' } } },
    ];

    await sheetsService.spreadsheets.batchUpdate({
        spreadsheetId: spreadsheetId,
        resource: { requests }
    });

    const statisticsFormulas = [
        ['NUM', 'SUM', 'AVE', 'MAX', 'MIN', 'DEV'],
        [
            `=COUNTA(SUMMARY!C2:C${rowCount})`,
            `=SUM(SUMMARY!C2:C${rowCount})`,
            `=AVERAGE(SUMMARY!C2:C${rowCount})`,
            `=MAX(SUMMARY!C2:C${rowCount})`,
            `=MIN(SUMMARY!C2:C${rowCount})`,
            `=STDEV.P(SUMMARY!C2:C${rowCount})`
        ]
    ];

    await sheetsService.spreadsheets.values.update({
        spreadsheetId: spreadsheetId,
        range: 'STATISTICS!A1',
        valueInputOption: 'USER_ENTERED',
        resource: { values: statisticsFormulas }
    });
}

const realdata = '1k0FhOtK-3_mGoH5CnC9axY2l2FsP7h1q'; // Variable containing the identifier of the folder containing 'real trades'.
const fakedata = '1z38V8POr9lXNAoFBM-7I5_8GG9t5E2wx'; // Variable containing the identifier of the folder containing 'fake trades'.
const datadump = '1zFsCLutd5pboDamsClZZBRsvPHB6QDwu'; // Variable containing the identifier of the folder containing summarization.
createSpreadsheetAndLog(fakedata, datadump);