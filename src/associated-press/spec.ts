require('dotenv').config();

import * as test from 'tape';

import { buildURL, fetchJSON } from './index';

test('buildURL constructs query URL', t => {
    const apiKey   = process.env.AP_KEY;
    const raceIDs  = process.env.RACE_IDS;
    const isTest   = process.env.NODE_ENV !== 'production';

    const result = buildURL();
    const expected = `https://api.ap.org/v2/elections/2018-11-06?format=json&raceID=${raceIDs}&apiKey=${apiKey}&test=${isTest}`;
    
    t.equal(result, expected);
    t.end();
});

test('fetchURL returns raw AP data', async t => {
    const result = await fetchJSON(buildURL());
    result.races.forEach(race => {
        console.log(race.reportingUnits);
    })
    t.end();
});
