require('dotenv').config();

// interfaces
import { Race, DataStoreInstance } from '../interfaces';

class DataStore implements DataStoreInstance {
    private nextAPUrl: string;
    private raceHash: Map<number, Race>;

    constructor() {
        this.raceHash = new Map();
        this.nextAPUrl = null;
    }

    private getBaseAPUrl () {
        const base     = process.env.AP_URL;
        const raceIDs  = process.env.RACE_IDS;
        const apiKey   = process.env.AP_KEY;
        return `${base}&raceID=${raceIDs}&apiKey=${apiKey}`;
    }

    public setAPUrl (url: string) {
        return this.nextAPUrl = url;
    }

    public getAPUrl () {
        return this.nextAPUrl ? this.nextAPUrl : this.getBaseAPUrl();
    }

    public setData (races: Array<Race>) {
        races.forEach((race: Race) => this.raceHash.set(race.id, race))
    }

    public getData () {
        return {
            races: Array.from(this.raceHash.values()),
        };
    }
}

export default DataStore;