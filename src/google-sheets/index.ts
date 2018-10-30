// interfaces
import { Logger } from 'winston';
import { GoogleCredentials } from '../interfaces';

// modules
import { loadLocalJson, authorize, fetchData } from './utils';

export const getData = async (spreadsheetID: string, range: string, logger: Logger) => {
    try {
        const credentials: GoogleCredentials = await loadLocalJson('.google-sheets-credentials.json');
        const oAuthClient: any               = await authorize(credentials);
        const data                           = await fetchData(oAuthClient, spreadsheetID, range);
    } catch (err) {
        logger.error(err);
        return [];
    }
};

export default {
    getData,
}