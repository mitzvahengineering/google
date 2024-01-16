const { google } = require('googleapis');

async function listfolderfiles(folderid) {
    const drive = google.drive({
        version: 'v3',
        auth: new google.auth.GoogleAuth({
            keyFile: '/Users/mitzvahcapital/Downloads/algebraic-ward-411306-f5019210a52a.json',
            scopes: ['https://www.googleapis.com/auth/drive'],
        }),
    });

    try {
        const { data: { files } } = await drive.files.list({ // Makes asynchronous request to the Google Drive API's "files.list" method.
            q: `'${folderid}' in parents`, // Use the Query Parameter ("q") in the request to search for files where the '${folderid}' specified is a parent.
            fields: 'files(id, name)', // Use the Fields Parameter ("fields") to specify that the response should include the id and name of each file.
            pageSize: 1000, // Maximum value must be specified since the default (100) is too small.
        });

        console.log(files.length ? `${files.length} files found: ` : 'No files found.');
        files.forEach(file => console.log(`${file.name}`));
    } catch (error) {
        console.error('The API returned an error:', error);
    }
}

const fakedata = '1z38V8POr9lXNAoFBM-7I5_8GG9t5E2wx';
const realdata = '1k0FhOtK-3_mGoH5CnC9axY2l2FsP7h1q';
listfolderfiles(realdata);