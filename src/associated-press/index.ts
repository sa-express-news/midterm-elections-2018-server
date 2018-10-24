require('dotenv').config();

import * as rp from 'request-promise';

// interfaces
import { Logger }       from 'winston';
import { 
    APData,
    APDataRace,
    APDataCandidate,
    Race,
    Candidate
}                       from '../interfaces';

export const fetchJSON = async (url: string, logger: Logger): Promise<any> => {
    try {
        const response = await rp({ url, json: true });
        return response;
    } catch (error) {
        logger.error(error);
        return { errorMsg: error.toString() }
    }
};

export const buildURL = () => {
    const base     = process.env.AP_URL;
    const raceIDs  = process.env.RACE_IDS;
    const apiKey   = process.env.AP_KEY;
    return `${base}&raceID=${raceIDs}&apiKey=${apiKey}`;
};

export const setName = ({ first, middle, last, suffix }: APDataCandidate) => {
    middle = middle ? ` ${middle}` : '';
    suffix = suffix ? ` ${suffix}` : '';
    return `${first}${middle} ${last}${suffix}`;
};

export const mapParty = (party: string) => {
    const map = {
        'Dem': 'democrat',
        'GOP': 'republican',
        'Lib': 'libertarian',
    };
    return map[party] ? map[party] : 'unknown';
};

export const addPropIfExists = (inObj: APDataCandidate, outObj: Candidate, prop: string) => {
    if (inObj[prop]) {
        return Object.assign({}, outObj, { [prop]: inObj[prop] });
    } else {
        return outObj;
    }
};

export const mapCandidate = (candidate: APDataCandidate) => {
    const base = {
        name: setName(candidate),
        votes: candidate.voteCount,
        party: mapParty(candidate.party),
        incumbent: !!candidate.incumbent,
    };
    return addPropIfExists(candidate, base, 'winner');
};

export const mapRace = ({ raceID, officeName, national, candidates }: APDataRace) => ({
    id: parseInt(raceID, 10),
    title: officeName,
    isNational: !!national,
    candidates: candidates.map(mapCandidate),
});

export const formatData = (apData: APData) => {
    const races = apData.races.map(mapRace);
};

export default async logger => {
    const apData: APData = await fetchJSON(buildURL(), logger);

    if (!apData.hasOwnProperty('errorMsg')) {
        return formatData(apData);
    } else {
        return [];
    }
};