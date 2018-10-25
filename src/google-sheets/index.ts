// interfaces
import { Logger } from 'winston';
import { GoogleCredentials } from '../interfaces';

// modules
import { loadLocalJson } from './utils';

export const getData = async (logger: Logger) => {
    try {
        const credentials: GoogleCredentials = await loadLocalJson('.google-sheets-credentials.json');
        console.log(credentials);
    } catch (err) {
        logger.error(err);
        return [];
    }
};

export default {
    getData,
}