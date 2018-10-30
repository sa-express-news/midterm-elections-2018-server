require('dotenv').config();

import * as test from 'tape';

import { loadLocalJson, getTokenPath, authorize, fetchData } from './utils';

test('loadLocalJson pulls and parses the google sheet credentials from project root or throws error', async t => {
    let credentials = await loadLocalJson('.google-sheets-credentials.json');
    let result = credentials.installed.auth_uri;
    let expected = 'https://accounts.google.com/o/oauth2/auth';
    t.equal(result, expected);

    try {
        credentials = await loadLocalJson('.bing-sheets-credentials.json');
    } catch (error) {
        result = error.toString()
        expected = 'Error: ENOENT: no such file or directory, open \'.bing-sheets-credentials.json\'';
        t.equal(result, expected);
    }

    t.end();
});

test('getTokenDir should write the directory where the credentials are stored to a string', t => {
    const credMatch = '.credentials/';
    const tokenDir = getTokenPath();
    const result = tokenDir.slice(tokenDir.indexOf(credMatch) + credMatch.length);
    const expected = '2018-midterm-elections.json';
    t.equal(result, expected);
    t.end();
});

test('authorize should return oauth2Client object', async t => {
    const credentials = await loadLocalJson('.google-sheets-credentials.json');
    const oauth2Client = await authorize(credentials);
    const result = oauth2Client.credentials.scope
    const expected = 'https://www.googleapis.com/auth/spreadsheets.readonly';
    t.equal(result, expected);
    t.end();
});

test('fetchData should return the google sheet data', async t => {
    const credentials = await loadLocalJson('.google-sheets-credentials.json');
    const oauth2Client = await authorize(credentials);
    const result = await fetchData(oauth2Client, process.env.SPREADSHEET_ID as string, "HOUSTON!A1:N")
    console.log(result);
    t.end();
});
