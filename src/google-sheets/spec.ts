import * as test from 'tape';

import { loadLocalJson } from './utils';

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
