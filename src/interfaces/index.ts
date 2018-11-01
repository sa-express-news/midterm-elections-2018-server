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

export interface APDataReportingUnits {
    statePostal: string;
    stateName: string;
    level: string;
    lastUpdated: string;
    precinctsReporting: number;
    precinctsTotal: number;
    precinctsReportingPct: number;
    candidates: Array<APDataCandidate>;
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
    reportingUnits: Array<APDataReportingUnits>;
}

export interface APData {
    electionDate: string;
    timestamp: string;
    races: Array<APDataRace>;
    nextrequest: string;
}

// race response interfaces to be sent to client

export interface Candidate {
    name: string;
    votes: number;
    party?: string;
    incumbent: boolean;
    winner: boolean;
}

export interface Race {
    id: number;
    title: string;
    isNational: boolean;
    candidates: Array<Candidate>;
    percentPrecinctsReporting?: number;
    source?: string;
    source_url?: string;
}

// Data store interfaces

export interface DataStoreInstance {
    setAPUrl: Function;
    getAPUrl: Function;
    setData: Function;
    getData: Function;
}

export interface RaceHashes {
    houston: {
        hash: Map<number, Race>;
        ids: Set<number>;
    };
    sa: {
        hash: Map<number, Race>;
        ids: Set<number>;
    };
}

// Google sheets

export interface GoogleCredentials {
    installed: {
        client_id: string;
        project_id: string;
        auth_uri: string;
        token_uri: string;
        auth_provider_x509_cert_url: string;
        client_secret: string;
        redirect_uris: string[];
    };
}

export interface GoogleSheet {
    range: string;
    majorDimension: string;
    values: Array<Array<string>>;
}

export interface GoogleSheetResponse {
    errorMsg?: string;
    data?: Array<GoogleSheet>;
}

export interface GoogleSheetData {
    houston: Array<Race>;
    sa: Array<Race>;
}
