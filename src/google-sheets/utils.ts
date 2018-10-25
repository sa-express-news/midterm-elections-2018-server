import * as fs from 'fs';
import * as readlineSync from 'readline-sync';

const google     = require('googleapis');
const googleAuth = require('google-auth-library');

// interfaces
import { GoogleCredentials } from '../interfaces';

export const loadLocalJson = (path: string): Promise<GoogleCredentials> => new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
        if (err) return reject(err);
        return resolve(JSON.parse(data.toString()));
    });
});

export const getTokenDir = () => {
    const base = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
    return `${base}/.credentials/`;
};

export const getTokenPath = () => `${getTokenDir()}2018-midterm-elections.json`;

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 */

export const getNewToken = async (oauth2Client: any): Promise<any> => {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    console.log(`Authorize this app by visiting this url: ${authUrl}`);
    const code = readlineSync.question("Enter the code from that page here: ");

    try {
        // Google's API for fetching a token requires a promise wrap
        const getTokenPromise = () => {
            return new Promise((resolve, reject) => {
                oauth2Client.getToken(code, (error: any, tokens: any, response: any) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(tokens);
                    }
                });
            });
        };

        const token = await getTokenPromise();
        oauth2Client.credentials = token;
        await storeToken(token);
        return oauth2Client;

    } catch (error) {
        console.log(`Error while trying to receive access token: ${error}`);
    }
};

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