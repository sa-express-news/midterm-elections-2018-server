/**
 * All credit goes to Kia Farhang for this Sheets API authorization code
 **/

import * as fs from 'fs';
import * as readlineSync from 'readline-sync';
import { promisify } from "util";

const google     = require('googleapis');
const googleAuth = require('google-auth-library');

// interfaces
import { GoogleCredentials } from '../interfaces';

const writeLocalJson = (path: string, data: any): Promise<GoogleCredentials> => new Promise((resolve, reject) => {
    fs.writeFile(path, data, (err) => {
        if (err) return reject(err);
        return resolve();
    });
});

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */

const storeToken = async (token: object): Promise<void> => {
    try {
        fs.mkdirSync(getTokenDir());
    } catch (err) {
        if (err.code !== "EEXIST") {
            throw err;
        }
    }

    try {
        await writeLocalJson(getTokenPath(), JSON.stringify(token));
        console.log(`Token stored to ${getTokenPath()}`);
    } catch (error) {
        console.log(`Error storing token: ${error}`);
    }
};

const getTokenPromise = (oauth2Client, code) => new Promise((resolve, reject) => {
    oauth2Client.getToken(code, (error: any, tokens: any, response: any) => {
        if (error) {
            reject(error);
        } else {
            resolve(tokens);
        }
    });
});

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 */

const getNewToken = async (oauth2Client: any): Promise<any> => {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    console.log(`Authorize this app by visiting this url: ${authUrl}`);
    const code = readlineSync.question("Enter the code from that page here: ");

    try {
        const token = await getTokenPromise(oauth2Client, code);
        oauth2Client.credentials = token;
        await storeToken(token);
        return oauth2Client;

    } catch (error) {
        console.log(`Error while trying to receive access token: ${error}`);
    }
};

export const getTokenDir = () => {
    const base = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
    return `${base}/.credentials/`;
};

export const getTokenPath = () => `${getTokenDir()}2018-midterm-elections.json`;

export const loadLocalJson = (path: string): Promise<GoogleCredentials> => new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
        if (err) return reject(err);
        return resolve(JSON.parse(data.toString()));
    });
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */

export const authorize = async (credentials: GoogleCredentials): Promise<any> => {
    const clientSecret = credentials.installed.client_secret;
    const clientId     = credentials.installed.client_id;
    const redirectUrl  = credentials.installed.redirect_uris[0];
    const auth         = new googleAuth();
    const oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    try {
        oauth2Client.credentials = await loadLocalJson(getTokenPath());
        return oauth2Client;
    } catch (e) {
        return getNewToken(oauth2Client);
    }
};

/**
 * Fetches all rows in a provided range for a given spreadsheet.
 */

export const fetchData = async (auth: any, spreadsheetId: string, range: string): Promise<string[][]> => {
    const sheets = google.sheets("v4");

    const get = promisify(sheets.spreadsheets.values.get);
    try {
        const data: { values: string[][] } = await get({
            auth,
            range,
            spreadsheetId,
        });

        return data.values;
    } catch (error) {
        throw error;
    }
};
