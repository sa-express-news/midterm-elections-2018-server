require('dotenv').config();

import * as test from 'tape';

import DataStore from './index';

test('getAPUrl constructs query URL', t => {
    const dataStore = new DataStore();

    const apiKey   = process.env.AP_KEY;
    const raceIDs  = `${process.env.SHARED_RACE_IDS},${process.env.HOUSTON_RACE_IDS},${process.env.SA_RACE_IDS}`;

    const result = dataStore.getAPUrl();
    const expected = `https://api.ap.org/v2/elections/2018-11-06?format=json&raceID=${raceIDs}&apiKey=${apiKey}`;
    
    t.equal(result, expected);
    t.end();
});

test('setData should take an array of races and add them to their respective hashes, getData should return one of those hashes' , t => {
    const dataStore = new DataStore();
    const races = [
        {
            id: 45871,
            title: 'Lead Rhetoric Generator',
            isNational: false,
            candidates: [
                {
                    name: 'The Backbone of This Country',
                    votes: 20,
                    party: 'unknown',
                    incumbent: false,
                },
                {
                    name: 'Jobs McJobby',
                    votes: 1000,
                    winner: true,
                    party: 'unknown',
                    incumbent: true,
                },
            ],
        },
        {
            id: 45870,
            title: 'Capitol Bouncer',
            isNational: false,
            candidates: [
                {
                    name: 'Marlyn Munbro',
                    votes: 20,
                    party: 'unknown',
                    incumbent: false,
                },
                {
                    name: 'Patrick Swazey in Roadhouse',
                    votes: 1000,
                    winner: true,
                    party: 'unknown',
                    incumbent: true,
                },
            ],
        },
        {
            id: 49055,
            title: 'Casual Friday\'s Coordinator',
            isNational: false,
            candidates: [
                {
                    name: 'LMFAO',
                    votes: 20,
                    party: 'unknown',
                    incumbent: false,
                },
                {
                    name: 'Janet Reno',
                    votes: 1000,
                    winner: true,
                    party: 'unknown',
                    incumbent: true,
                },
            ],
        },
        {
            id: 44720,
            title: 'Lead DogeCoin Investor',
            isNational: false,
            candidates: [
                {
                    name: 'That Hacker From That 80s Movie',
                    votes: 20,
                    party: 'unknown',
                    incumbent: false,
                },
                {
                    name: 'Niece That Works In Computers',
                    votes: 1000,
                    winner: true,
                    party: 'unknown',
                    incumbent: true,
                },
            ],
        },
        {
            id: 999999,
            title: 'Governor Of Michigan',
            isNational: false,
            candidates: [
                {
                    name: 'Guy From Michigan',
                    votes: 20,
                    party: 'unknown',
                    incumbent: false,
                },
                {
                    name: 'Gal From Michigan',
                    votes: 1000,
                    winner: true,
                    party: 'unknown',
                    incumbent: true,
                },
            ],
        },
    ];

    dataStore.setData(races);

    const houston = dataStore.getData('houston');
    const sa = dataStore.getData('sa');

    let result = houston.races.map(race => race.title);
    let expected = ['Lead Rhetoric Generator', 'Lead DogeCoin Investor'];
    t.deepEqual(result, expected);

    result = sa.races.map(race => race.title);
    expected = ['Capitol Bouncer', 'Casual Friday\'s Coordinator', 'Lead DogeCoin Investor'];
    t.deepEqual(result, expected);

    t.end();
});
