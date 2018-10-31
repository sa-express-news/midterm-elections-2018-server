// interfaces
import { Logger } from 'winston';
import { GoogleCredentials, GoogleSheetResponse, GoogleSheet, GoogleSheetData } from '../interfaces';

// modules
import { loadLocalJson, authorize, fetchData } from './utils';

export const isHouston = (range: string) => range.indexOf('HOUSTON') !== -1;

export const mapCandidates = (candidateArr: Array<string>) => {
    const incumbent = candidateArr[0];
    const winner    = candidateArr[1];

    let input  = candidateArr.slice(2);
    let output = [];
    let curr   = []

    while(input.length) {
        curr = input.splice(0, 3);
        output.push({
            name: curr[0],
            votes: curr[1],
            party: curr[2],
            incumbent: curr[0] === incumbent,
            winner: curr[0] === winner,
        });
    }

    return output;
};

export const mapRace = (raceArr: Array<string>, idx: number) => ({
    id: parseInt(raceArr[0], 10),
    title: raceArr[1],
    isNational: false,
    candidates: mapCandidates(raceArr.slice(2)),
});

export const parseData = (data: Array<GoogleSheet>) => data.reduce((res: GoogleSheetData, hash: GoogleSheet) => {
    const market = isHouston(hash.range) ? 'houston' : 'sa';
    res[market] = hash.values.map(mapRace);
    return res;
}, { houston: [], sa: [] });

export const getData = async (spreadsheetID: string, ranges: Array<string>, logger: Logger) => {
    try {
        const credentials: GoogleCredentials = await loadLocalJson('.google-sheets-credentials.json');
        const oAuthClient: any               = await authorize(credentials);
        const response: GoogleSheetResponse  = await fetchData(oAuthClient, spreadsheetID, ranges);

        if (response.errorMsg) {
            logger.error(response.errorMsg);
            return { houston: [], sa: [] };
        }

        return parseData(response.data);
    } catch (err) {
        logger.error(err);
        return { houston: [], sa: [] };;
    }
};

export default {
    getData,
}