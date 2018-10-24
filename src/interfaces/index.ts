// AP API response interfaces

export interface APDataCandidate {
    candidateID?: string;
    party?: string;
    first?: string;
    middle?: string;
    last?: string;
    abbrv?: string;
    suffix?: string;
    polID?: string;
    polNum?: string;
    winner?: string;
    infoUpdated?: string;
    incumbent?: boolean;
    ballotOrder?: number;
    voteCount?: number;
}

export interface APDataRace {
    raceID: string;
    raceTypeID?: string;
    officeID?: string;
    officeName?: string;
    description?: string;
    seatName?: string;
    seatNum?: string;
    uncontested?: boolean;
    national?: boolean;
    lastUpdated?: string;
    candidates: Array<APDataCandidate>;
}

export interface APData {
    electionDate: string;
    timestamp: string;
    races: Array<APDataRace>;
    nextRequest: string;
}

// race response interfaces to be sent to client

export interface Candidate {
    name: string;
    votes: number;
    party: string;
    incumbent: boolean;
    winner?: boolean;
}

export interface Race {
    id: number;
    title: string;
    isNational: boolean;
    candidates: Array<Candidate>;
}

// Data store interfaces

export interface DataStoreInstance {
    setAPUrl: Function;
    getAPUrl: Function;
    setData: Function;
    getData: Function;
}
