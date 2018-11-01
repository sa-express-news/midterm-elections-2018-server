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

export const mapCandidate = (candidate: APDataCandidate) => ({
    name: setName(candidate),
    votes: candidate.voteCount ? candidate.voteCount : 0,
    party: mapParty(candidate.party),
    incumbent: !!candidate.incumbent,
    winner: !!candidate.winner && candidate.winner === 'X'
});

export const mapRace = ({ raceID, officeName, national, reportingUnits }: APDataRace) => ({
    id: parseInt(raceID, 10),
    title: officeName,
    isNational: !!national,
    // We only take the first reporting unit for candidates because we only want state level results
    candidates: reportingUnits[0].candidates.map(mapCandidate), 
});

export const formatData = (apData: APData) => ({
    races: apData.races.map(mapRace),
    nextUrl: apData.nextrequest,
});

export const getData = async (url: string, logger: Logger) => {
    const apData: APData = await fetchJSON(url, logger);

    if (!apData.hasOwnProperty('errorMsg')) {
        return formatData(apData);
    } else {
        return {
            races: [],
            nextUrl: null,
        };
    }
};

export default {
    getData,
}