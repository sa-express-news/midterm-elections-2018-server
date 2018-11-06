require('dotenv').config();

import * as test from 'tape';

import createLogger from '../logger';

import { loadLocalJson, getTokenPath, authorize, fetchData } from './utils';

import { isHouston, mapCandidate, getCandidates, setIDBaseNumber, mapRace, parseData, getData } from './index';

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
    
    const result = response.data.map(hash => hash.range)[0].includes('HOUSTON!');
    const expected = true;
    t.equal(result, expected);

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

test('mapCandidate should take a 2 element array and return a Candidate object', t => {
    let incumbent = 'Frankie "Mr. Big" Sharp';
    let winner = '';

    const candidate = [
        'Luke Whyte',
        '300',
    ];

    let result = mapCandidate(candidate, incumbent, winner);
    let expected = {
        name: 'Luke Whyte',
        votes: 300,  
        incumbent: false,
        winner: false,
    };
    t.deepEqual(result, expected);

    winner = 'Luke Whyte';
    result = mapCandidate(candidate, incumbent, winner);
    expected = {
        name: 'Luke Whyte',
        votes: 300,  
        incumbent: false,
        winner: true,
    };
    t.deepEqual(result, expected);

    incumbent = 'Luke Whyte';
    result = mapCandidate(candidate, incumbent, winner);
    expected = {
        name: 'Luke Whyte',
        votes: 300,  
        incumbent: true,
        winner: true,
    };
    t.deepEqual(result, expected);

    t.end();
});

test('getCandidates takes array with first elements pointing to incumbent and winner followed by N candidate elements. Returns array of candidates', t => {
    const incumbent = 'Papa Smurf';
    const winner    = 'The Ultimate Warrior';

    const candidates = [
        incumbent,
        winner,
        'Luke Whyte',
        '300',
        'Papa Smurf',
        '500',
        'The Ultimate Warrior',
        '800',
    ];

    const result = getCandidates(candidates, []);
    const expected = [
        {
            name: 'Luke Whyte',
            votes: 300,      
            incumbent: false,
            winner: false,
        },
        {
            name: 'Papa Smurf',
            votes: 500,      
            incumbent: true,
            winner: false,
        },
        {
            name: 'The Ultimate Warrior',
            votes: 800,      
            incumbent: false,
            winner: true,
        },
    ];

    t.deepEqual(result, expected);
    t.end();
});

test('mapRace takes a race array of strings and returns a Race object. setIDBaseNumber adds ID digits based on market', t => {
    const race = [
        '1',
        'House Floor DJ',
        'Papa Smurf',
        '',
        'Luke Whyte',
        '300',
        'Papa Smurf',
        '500',
        'The Ultimate Warrior',
        '800',
    ];

    const result = mapRace(race, setIDBaseNumber('sa'));
    const expected = {
        id: 200001,
        title: 'House Floor DJ',
        isNational: false,
        candidates: [
            {
                name: 'Luke Whyte',
                votes: 300,          
                incumbent: false,
                winner: false,
            },
            {
                name: 'Papa Smurf',
                votes: 500,          
                incumbent: true,
                winner: false,
            },
            {
                name: 'The Ultimate Warrior',
                votes: 800,          
                incumbent: false,
                winner: false,
            },
        ],
    };

    t.deepEqual(result, expected);
    t.end();
});

test('parseData accepts an array GoogleSheet objects, which it iterates over to build a GoogleSheetData object', t => {
     const raceSA = [
        '1',
        'House Floor DJ',
        'Papa Smurf',
        '',
        'Luke Whyte',
        '300',
        'Papa Smurf',
        '500',
        'The Ultimate Warrior',
        '800',
    ];

    const raceHouston = [
        '1',
        'Senate Floor DJ',
        'Papa Smurf',
        'The Ultimate Warrior',
        'Luke Whyte',
        '300',
        'Papa Smurf',
        '500',
        'The Ultimate Warrior',
        '800',
    ];

    const sheets = [
        {
            range: 'HOUSTON!A1:AB986',
            majorDimension: 'ROWS',
            values: [raceHouston, raceHouston, raceHouston],
        },
        {
            range: 'SAN_ANTONIO!A1:Z1003',
            majorDimension: 'ROWS',
            values: [raceSA, raceSA, raceSA],
        },
    ];

    const data = parseData(sheets);

    const resultOne = data.houston[0].title;
    const expectedOne = 'Senate Floor DJ';
    t.equal(resultOne, expectedOne);

    const resultTwo = data.sa[1].id;
    const expectedTwo = 200001;
    t.equal(resultTwo, expectedTwo);

    const resultThree = data.houston[2].candidates[2].winner;
    const expectedThree = true;
    t.equal(resultThree, expectedThree);

    t.end();
});

test('getData performs above operations on live data after successful oAuth connection. On failure it returns empty GoogleSheetsData object', async t => {
    const data = await getData(process.env.SPREADSHEET_ID, ['HOUSTON!A2:AB', 'SAN_ANTONIO!A2:AB'], createLogger());
    const result = data.houston[0].id;
    const expected = 100013;
    t.equal(result, expected);

    const failedData = await getData('not_an_id', ['HOUSTON!A2:AB', 'SAN_ANTONIO!A2:AB'], createLogger());
    const failedResult = failedData.houston && failedData.houston.length === 0 && failedData.sa && failedData.sa.length === 0;
    const failedExpected = true;
    t.equal(failedResult, failedExpected);

    t.end();
});
