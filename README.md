# 2018 Midterm election results server

This Node.js app served results of the Texas 2018 midterm elections for Houston Chornicle and San Antonio Express-News. This app centralized data from Google Sheets and the Associated Press elections API to fetch results for the elections we wanted to watch.

## Overview ##

The server kept an array of primaries in memory and broadcasts it to users using [the Socket.IO web socket library](https://github.com/socketio/socket.io).

At a regular interval (90 seconds in production), the server fetched updated information from both Google Sheets and the Associated Press API, merged them into the data in memory and rebroadcasted that primary data.

## JSON response structure

```JavaScript
{
    "races": [
        {
            "id": Number,
            "title": String,
            "isNational": Boolean,
            "candidates": [
                {
                    "name": String,
                    "votes": Number,
                    "party": String,
                    "incumbent": Boolean,
                    "winner": Boolean,
                }
                ...
            ]
        }
        ...
    ]
}
```

The `party` candidate property can only have one four values. Those are defined here:

 - `republican`, `democrat`, `libertarian` or `unknown`

Also note the following:
 - A value of `false` for the `incumbent` property doesn't necessarily mean they weren't the incumbent, only that the API didn't specify. On the other hand, it will only be `true` if the API specifically declared it so.
 - The `winner` property will be `false` for all candidates until a winner is declared.

## Development / Getting Started ##

Clone the repository and install dependencies using Yarn or NPM.

You'll need the following environment variables in a `.env` file at the root project directory:

`AP_URL` - The AP Elections API URL we used to access results for the exact races we wanted, including our API key.
`AP_KEY` - AP Elections API key broken out into a separate variable (used when running tests).
`AP_URL_BASE` - Base URL for the API Elections API, also used for testing.
`AP_URL_PARAMS` - URL parameters for our API Elections API request, used for testing.
`SPREADSHEET_ID` - The ID of the Google Spreadsheet holding election results. If you're looking at the URL of a spreadsheet, the ID is everything after the `/d/`. Note that the spreadsheet must be available for viewing by anyone with the link.
`SOCKET_PORT` - Port to run the web socket server on.
`HOUSTON_RACE_IDS` - AP races being watched by Houston Chronicle
`SA_RACE_IDS` - AP races being watched by the Express-News
`GS_HOUSTON_IDS` – Google Sheet race IDs for Houston Chronicle
`GS_SA_IDS` - Google Sheet race IDs for Express-News

You'll also need to authenticate your machine with Google before running any tests/code.

#### Authenticating for Google Sheets Access ####

This project includes code to help you authenticate with Google via the command line, but you must first [use the Google Developers Console](https://console.developers.google.com) to generate a secret key JSON file for your machine.

Follow the instructions [in step 1 of this guide](https://developers.google.com/sheets/api/quickstart/nodejs) to do so, saving the file that results as `.google-sheets-credentials.json` in the root directory of this project.

After that, the first time you run the project your terminal should walk you through getting access to the Google Sheets data. The whole process should take no more than a few minutes. Future runs of the program on the same machine will use stored credentials and not require these steps.

## Deployment ##

We ran this application on an Amazon Lightsail instance using [the PM2 process manager.](http://pm2.keymetrics.io/). PM2 was an excellent choice. Lightsail was not. I strongly recommend a more robust system and stress testing with something like [artillery.io](https://artillery.io/).