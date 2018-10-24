require('dotenv').config();

import * as test from 'tape';

import createLogger from '../logger';

import {
    buildURL,
    fetchJSON,
    setName,
    mapParty,
    addPropIfExists,
    mapCandidate,
    mapRace
} from './index';

test('buildURL constructs query URL', t => {
    const apiKey   = process.env.AP_KEY;
    const raceIDs  = process.env.RACE_IDS;

    const result = buildURL();
    const expected = `https://api.ap.org/v2/elections/2018-11-06?format=json&raceID=${raceIDs}&apiKey=${apiKey}`;
    
    t.equal(result, expected);
    t.end();
});

test('fetchURL returns raw AP data', async t => {
    const response  = await fetchJSON(buildURL(), createLogger());

    const result    = response.electionDate;
    const expected  = '2018-11-06';

    t.equal(result, expected);
    t.end();
});

test('setName should assume a first and last exists and handle middle and suffix too', t => {
    let candidate: any = {
        first: 'Luke',
        last: 'Whyte',
    }
    let result = setName(candidate);
    let expected = 'Luke Whyte';
    t.equal(result, expected);

    candidate.middle = 'Allan';
    result = setName(candidate);
    expected = 'Luke Allan Whyte';
    t.equal(result, expected);

    candidate.suffix = 'Sr.';
    result = setName(candidate);
    expected = 'Luke Allan Whyte Sr.';
    t.equal(result, expected);

    t.end();
});

test('mapParty should map a party name string to a string the client will recognize', t => {
    let result = mapParty('GOP');
    let expected = 'republican';
    t.equal(result, expected);

    result = mapParty('Pickle');
    expected = 'unknown';
    t.equal(result, expected);

    t.end();
});

test('addPropIfExists should search for a property in the inObj and, if it exists, add it to the outObj', t => {
    const inObj = {
        first: 'Luke',
        last: 'Whyte',
        winner: 'X',
    };

    const outObj = {
        name: 'Luke Whyte',
        votes: 10,
        party: 'pickle',
        incumbent: false,
    }

    let result = addPropIfExists(inObj, outObj, 'winner');
    const expected = Object.assign({}, outObj, { winner: 'X' });
    t.deepEqual(result, expected);

    result = addPropIfExists(inObj, expected, 'superhero');
    t.deepEqual(result, expected);

    t.end();
});

test('mapCandidate should map an AP API candidate obj to a Candidate obj', t => {
    const apCandidate = {
        first: 'Luke',
        last: 'Whyte',
        voteCount: 20,
        winner: 'R',
        party: 'pickle',
    };

    let result = mapCandidate(apCandidate);
    let expected = {
        name: 'Luke Whyte',
        votes: 20,
        winner: 'R',
        party: 'unknown',
        incumbent: false,
    };

    t.deepEqual(result, expected);
    t.end();
});

test('mapRace should map an AP API race obj to a Race obj', t => {
    const apRace = {
        raceID: '87687',
        officeID: '234234',
        officeName: 'Dungeon Master',
        candidates: [
            {
                first: 'Luke',
                last: 'Whyte',
                voteCount: 20,
                party: 'pickle',
            },
            {
                first: 'Evil',
                last: 'Twin',
                suffix: 'Sr.',
                voteCount: 1000,
                winner: 'X',
                party: 'doomsday',
                incumbent: true,
            }
        ],
        lastUpdated: '22:00:00',
    }

    let result = mapRace(apRace);
    let expected = {
        id: 87687,
        title: 'Dungeon Master',
        isNational: false,
        candidates: [
            {
                name: 'Luke Whyte',
                votes: 20,
                party: 'unknown',
                incumbent: false,
            },
            {
                name: 'Evil Twin Sr.',
                votes: 1000,
                winner: 'X',
                party: 'unknown',
                incumbent: true,
            },
        ],
    };

    t.deepEqual(result, expected);
    t.end();
});
