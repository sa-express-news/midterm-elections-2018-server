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

const shouldMapToSeat = new Set(['U.S. House', 'State House', 'State Senate']);
export const setTitle = (officeName: string, seatName: string) => shouldMapToSeat.has(officeName) && seatName ? seatName : officeName;

// testing API returns different data from main API prior to election
export const findCandidates = (reportingUnits, candidates) => {
    if (reportingUnits) {
        // We only take the first reporting unit for candidates because we only want state level results
        return reportingUnits[0].candidates;
    } else if (candidates) {
        return candidates;
    } else {
        return [];
    }
};

export const mapRace = ({ raceID, officeName, seatName, national, reportingUnits, candidates }: APDataRace) => ({
    id: parseInt(raceID, 10),
    title: setTitle(officeName, seatName),
    isNational: !!national,
    candidates: findCandidates(reportingUnits, candidates).map(mapCandidate),
    percentPrecinctsReporting: reportingUnits && reportingUnits[0].precinctsReportingPct ? reportingUnits[0].precinctsReportingPct : 0,
    source: 'Associated Press',
    source_url: 'https://developer.ap.org/ap-elections-api/',
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