require("dotenv").config();

// interfaces
import { Logger } from 'winston';
import { DataStoreInstance } from '../interfaces';

// modules
import ap             from '../associated-press';
import gs             from '../google-sheets';

export const addAPDataToStore = async (dataStore: DataStoreInstance, logger: Logger) => {
    const data = await ap.getData(dataStore.getAPUrl(), logger);
    dataStore.setData(data.races);
    dataStore.setAPUrl(data.nextUrl);
    return dataStore;
};

export const addGoogleSheetsDataToStore = async (dataStore: DataStoreInstance, logger: Logger) => {
    const id    = process.env.SPREADSHEET_ID;
    const range = ['HOUSTON!A2:AB', 'SAN_ANTONIO!A2:AB'];
    const data  = await gs.getData(id, range, logger);

    dataStore.setData(data.houston, 'houston');
    dataStore.setData(data.sa, 'sa');
    return dataStore;
};

export const populateDataStore = (dataStore: DataStoreInstance, logger: Logger) => Promise.all([
    addAPDataToStore(dataStore, logger),
    addGoogleSheetsDataToStore(dataStore, logger),
]);

export default { populateDataStore }