require('dotenv').config();

import * as test from 'tape';

import { loadLocalJson, getTokenPath, authorize, fetchData } from './utils';

import { isHouston, mapCandidate } from './index';

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
    const response = await fetchData(oauth2Client, process.env.SPREADSHEET_ID, ['HOUSTON!A2:AB', 'SAN_ANTONIO!A2:AB']);
    
    const result = response.data.map(hash => hash.range);
    const expected = ['HOUSTON!A2:AB986', 'SAN_ANTONIO!A2:Z1003'];
    t.deepEqual(result, expected);

    t.end();
});

test('isHouston should detect if data comes from Houston or SA sheet', t => {
    let result = isHouston('HOUSTON!A2:AB986');
    let expected = true;
    t.equal(result, expected);

    result = isHouston('SAN_ANTONIO!A2:Z1003');
    expected = false;
    t.equal(result, expected);

    t.end();
});

test('mapCandidate should take a 3 element array and return a Candidate object', t => {
    let incumbent = 'Frank Sharp';
    let winner = '';

    const candidate = [
        'Luke Whyte',
        '300',
        'Pickle'
    ];

    let result = mapCandidate(candidate, incumbent, winner);
    let expected = {
        name: 'Luke Whyte',
        votes: 300,
        party: 'Pickle',
        incumbent: false,
        winner: false,
    };
    t.deepEqual(result, expected);

    winner = 'Luke Whyte';
    result = mapCandidate(candidate, incumbent, winner);
    expected = {
        name: 'Luke Whyte',
        votes: 300,
        party: 'Pickle',
        incumbent: false,
        winner: true,
    };
    t.deepEqual(result, expected);

    incumbent = 'Luke Whyte';
    result = mapCandidate(candidate, incumbent, winner);
    expected = {
        name: 'Luke Whyte',
        votes: 300,
        party: 'Pickle',
        incumbent: true,
        winner: true,
    };
    t.deepEqual(result, expected);

    t.end();
});
