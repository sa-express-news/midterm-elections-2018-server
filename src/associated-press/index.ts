require('dotenv').config();

import * as rp from 'request-promise';

import * as fs from 'fs';
import * as csv from 'csv';

export const fetchJSON = async (url: string): Promise<any> => {
    try {
        const response = await rp({ url, json: true });
        return response;
    } catch (error) {
        throw new Error(error);
    }
};

// const isProp = prop => prop ? prop : 'No data';

// const setStringifyOptions = () => ({
//     header: true,
//     formatters: {
//         'bool': bool => bool ? 'Yep' : 'Nop',
//     }
// });

// const extractCSV = data => new Promise((res, rej) => {
//     const toExport = data.races.map(race => ({
//         raceID: isProp(race.raceID),
//         raceType: isProp(race.raceType),
//         officeName: isProp(race.officeName),
//         seatName: isProp(race.seatName),
//         isUncontested: isProp(race.uncontested),
//         isNational: isProp(race.national),
//     }));
//     console.log(toExport);
//     csv.stringify(toExport, setStringifyOptions(), (err, output) => {
//         if (err) console.error(err);
//         fs.writeFile(`./races.csv`, output, async error => {
//             if (error) console.error(error);
//             else res('booya');
//         });
//     });
// });

export const buildURL = () => {
    const base     = process.env.AP_URL;
    const raceIDs  = process.env.RACE_IDS;
    const apiKey   = process.env.AP_KEY;
    const isTest   = process.env.NODE_ENV !== 'production';
    return `${base}&raceID=${raceIDs}&apiKey=${apiKey}&test=${isTest}`;
};

export const fetchAPData = async () => {
    const apData = await fetchJSON(buildURL());
};

export default fetchAPData;