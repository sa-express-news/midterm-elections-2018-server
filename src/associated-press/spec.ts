import * as test from 'tape';

import createLogger from '../logger';
import DataStore from '../data-store';

import {
    fetchJSON,
    setName,
    mapParty,
    mapCandidate,
    mapRace,
    formatData
} from './index';

test('fetchJSON returns raw AP data or errorMsg property', async t => {
    const dataStore = new DataStore();

    const responseOne  = await fetchJSON(dataStore.getAPUrl(), createLogger());
    const resultOne    = responseOne.electionDate;
    const expectedOne  = '2018-11-06';
    t.equal(resultOne, expectedOne);

    const responseTwo = await fetchJSON('https://api.ap.org/v2/elections/2018-11-06?format=json&apiKey=999', createLogger());
    const resultTwo   = responseTwo.hasOwnProperty('errorMsg');
    const expectedTwo = true;
    t.equal(resultTwo, expectedTwo);

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
        party: 'unknown',
        incumbent: false,
        winner: false,
    };
    t.deepEqual(result, expected);

    apCandidate.winner = 'X';
    result = mapCandidate(apCandidate);
    expected = {
        name: 'Luke Whyte',
        votes: 20,
        party: 'unknown',
        incumbent: false,
        winner: true,
    };
    t.deepEqual(result, expected);

    delete apCandidate.winner;
    result = mapCandidate(apCandidate);
    expected = {
        name: 'Luke Whyte',
        votes: 20,
        party: 'unknown',
        incumbent: false,
        winner: false,
    };
    t.deepEqual(result, expected);

    t.end();
});

test('mapRace should map an AP API race obj to a Race obj', t => {
    const apRace = {
        raceID: '87687',
        officeID: '234234',
        officeName: 'Dungeon Master',
        reportingUnits: [
            {
                statePostal: 'TX',
                stateName: 'Texas',
                level: 'state',
                lastUpdated: '2018-11-01T18:10:16.140Z',
                precinctsReporting: 44,
                precinctsTotal: 78,
                precinctsReportingPct: 56.41,
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
                winner: false,
            },
            {
                name: 'Evil Twin Sr.',
                votes: 1000,
                winner: true,
                party: 'unknown',
                incumbent: true,
            },
        ],
    };

    t.deepEqual(result, expected);
    t.end();
});

test('formatData should convert raw races to Race interface and then return object with races and nextUrl prop', t => {
    const apRaceNoID = {
        officeID: '234234',
        officeName: 'Dungeon Master',
        reportingUnits: [
            {
                statePostal: 'TX',
                stateName: 'Texas',
                level: 'state',
                lastUpdated: '2018-11-01T18:10:16.140Z',
                precinctsReporting: 44,
                precinctsTotal: 78,
                precinctsReportingPct: 56.41,
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
            }
        ],
    };

    const apData = {
        electionDate: '11/11/11',
        timestamp: '0098729',
        nextrequest: 'https://www.website.com',
        races: ['45871','45872','46097','45870'].map(id => Object.assign({}, apRaceNoID, { raceID: id })),
    };

    const data = formatData(apData);
    
    const resultOne = data.races[1].id;
    const expectedOne = 45872;
    t.equal(resultOne, expectedOne);

    const resultTwo = data.nextUrl;
    const expectedTwo = 'https://www.website.com';
    t.equal(resultTwo, expectedTwo);

    t.end();
});
