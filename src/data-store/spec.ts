require('dotenv').config();

import * as test from 'tape';

import DataStore from './index';

test('getAPUrl constructs query URL', t => {
    const dataStore = new DataStore();

    const apiKey   = process.env.AP_KEY;
    const raceIDs  = process.env.RACE_IDS;

    const result = dataStore.getAPUrl();
    const expected = `https://api.ap.org/v2/elections/2018-11-06?format=json&raceID=${raceIDs}&apiKey=${apiKey}`;
    
    t.equal(result, expected);
    t.end();
});