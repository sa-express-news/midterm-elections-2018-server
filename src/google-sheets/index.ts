// interfaces
import { Logger }        from 'winston';
import { 
    GoogleCredentials,
    GoogleSheetResponse,
    GoogleSheet,
    GoogleSheetData,
    Candidate
}                        from '../interfaces';

// modules
import { loadLocalJson, authorize, fetchData } from './utils';

export const getEmptyData = (): GoogleSheetData => ({ houston: [], sa: [] });

export const isHouston = (range: string) => range.indexOf('HOUSTON') !== -1;

export const mapParty = (party: string) => {
    const map = {
        'Democrat': 'democrat',
        'Republican': 'republican',
        'Libertarian': 'libertarian',
    };
    return map[party] ? map[party] : 'unknown';
};

export const mapCandidate = (candidate: Array<string>, incumbent: string, winner: string) => ({
    name: candidate[0],
    votes: parseInt(candidate[1], 10),
    party: mapParty(candidate[2]),
    incumbent: candidate[0] === incumbent,
    winner: candidate[0] === winner,
});

export const getCandidates = (candidateArr: Array<string>, output: Array<Candidate>) => {
    const incumbent = candidateArr[0];
    const winner    = candidateArr[1];

    let input  = candidateArr.slice(2);
    while(input.length) {
        output.push(mapCandidate(input.splice(0, 3), incumbent, winner));
    }

    return output;
};

export const setIDBaseNumber = (market: string) => market === 'houston' ? 100000 : 200000;

export const mapRace = (raceArr: Array<string>, IDBaseNumber: number) => ({
    id: parseInt(raceArr[0], 10) + IDBaseNumber,
    title: raceArr[1],
    isNational: false,
    candidates: getCandidates(raceArr.slice(2), []),
});

export const parseData = (data: Array<GoogleSheet>) => data.reduce((res: GoogleSheetData, hash: GoogleSheet) => {
    const market = isHouston(hash.range) ? 'houston' : 'sa';
    res[market] = hash.values.map((raceArr: Array<string>) => mapRace(raceArr, setIDBaseNumber(market)));
    return res;
}, getEmptyData());

export const getOAuth = async (logger: Logger) => {
    try {
        const credentials: GoogleCredentials = await loadLocalJson('.google-sheets-credentials.json');
        return await authorize(credentials);
    } catch (err) {
        logger.error(err);
        return null;
    }
};

export const getData = async (spreadsheetID: string, ranges: Array<string>, logger: Logger) => {
    const oAuthClient = await getOAuth(logger);

    if (!oAuthClient) return getEmptyData();

    const response: GoogleSheetResponse  = await fetchData(oAuthClient, spreadsheetID, ranges);

    if (response.errorMsg) {
        logger.error(response.errorMsg);
        return getEmptyData();
    } else {
        return parseData(response.data);
    }
};

export default {
    getData,
}