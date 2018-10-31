import * as test from 'tape';

import createLogger  from '../logger';
import DataStore     from '../data-store';

import { addAPDataToStore, addGoogleSheetsDataToStore, populateDataStore } from './index';

test('addAPDataToStore should pull fresh data from the AP API, put it in store and update nextURL', async t => {
    let dataStore = new DataStore();
    await addAPDataToStore(dataStore, createLogger());
    
    const senateRace = dataStore.getData('sa').races.find(race => race.title === 'U.S. Senate');
    const dataResult = senateRace && senateRace.candidates && !!senateRace.candidates.find(candidate => candidate.name === 'Beto O\'Rourke');
    const dataExpected = true;
    t.equal(dataResult, dataExpected);

    const nextURL = dataStore.getAPUrl().slice(0, dataStore.getAPUrl().indexOf('&apiKey'));
    dataStore = new DataStore();
    dataStore.setAPUrl(nextURL); // here we're adding an old 'nextURL' to an empty store with the intent of the next request returning no races (assuming changes aren't underway)
    await addAPDataToStore(dataStore, createLogger());

    const lenResult = dataStore.getData('sa').races.length;
    const lenExpected = 0;
    t.equal(lenResult, lenExpected);

    t.end();
});

test('addGoogleSheetsDataToStore should pull Sheets data and add races to store', async t => {
    const dataStore = new DataStore();
    await addGoogleSheetsDataToStore(dataStore, createLogger());

    const result = dataStore.getData('sa').races[0].title;
    const expected = 'Bexar County District Attorney';
    t.equal(result, expected);

    t.end();
});

test('populateDataStore should perform Sheets and AP retrieval and concat races in store', async t => {
    const logger = createLogger();

    let dataStore = new DataStore();
    let seperateRequestsLength = 0;

    await addAPDataToStore(dataStore, logger);

    seperateRequestsLength += dataStore.getData('houston').races.length;
    dataStore = new DataStore();

    await addGoogleSheetsDataToStore(dataStore, logger);

    seperateRequestsLength += dataStore.getData('houston').races.length;
    dataStore = new DataStore();

    await populateDataStore(dataStore, createLogger());

    const result = dataStore.getData('houston').races.length === seperateRequestsLength;
    const expected = true;
    t.equal(result, expected);

    t.end();
});
