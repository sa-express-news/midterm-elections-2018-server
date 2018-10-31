require('dotenv').config();

// interfaces
import { Race, DataStoreInstance, RaceHashes } from '../interfaces';

class DataStore implements DataStoreInstance {
    private nextAPUrl: string;
    private races: RaceHashes;

    constructor() {
        this.nextAPUrl = null;
        this.races     = this.initalizeRaceHash();        
    }

    private setRaceIDSet (local: string) {
        const localIDs  = local.split(',').map(str => parseInt(str, 10));
        const sharedIDs = process.env.SHARED_RACE_IDS.split(',').map(str => parseInt(str, 10));
        return new Set(sharedIDs.concat(localIDs));
    }

    private initalizeRaceHash () {
        return {
            houston: {
                ids: this.setRaceIDSet(process.env.HOUSTON_RACE_IDS),
                hash: new Map(),
            },
            sa: {
                ids: this.setRaceIDSet(process.env.SA_RACE_IDS),
                hash: new Map(),
            },
        };
    }

    private getBaseAPUrl () {
        const base     = process.env.AP_URL;
        const raceIDs  = `${process.env.SHARED_RACE_IDS},${process.env.HOUSTON_RACE_IDS},${process.env.SA_RACE_IDS}`;
        const apiKey   = process.env.AP_KEY;
        return `${base}&raceID=${raceIDs}&apiKey=${apiKey}`;
    }

    private addToHash (race: Race, market: 'houston' | 'sa') {
        this.races[market].hash.set(race.id, race);
    }

    private conditionallyAddToHash (race: Race, market: 'houston' | 'sa') {
        if (this.races[market].ids.has(race.id)) {
            this.addToHash(race, market);
        }
    }

    public setAPUrl (url: string) {
        return this.nextAPUrl = url;
    }

    public getAPUrl () {
        return this.nextAPUrl ? this.nextAPUrl : this.getBaseAPUrl();
    }

    public setData (races: Array<Race>, market?: 'houston' | 'sa') {
        races.forEach((race: Race) => {
            if (market) {
                this.addToHash(race, market);
            } else {
                this.conditionallyAddToHash(race, 'houston');
                this.conditionallyAddToHash(race, 'sa');
            }
        })
    }

    public getData (market: 'houston' | 'sa') {
        return {
            races: Array.from(this.races[market].hash.values()),
        };
    }
}

export default DataStore;