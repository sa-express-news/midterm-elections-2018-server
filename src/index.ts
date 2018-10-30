require("dotenv").config();

// interfaces
import { Logger } from 'winston';

// modules
import createLogger   from './logger';
import DataStore      from './data-store';
import ap             from './associated-press';

/**
 * We'll have two socket events. One named 'Houston' and one named 'SanAntonio'. They'll be organized as followed:
 * Google Sheets: Two different sheets in the same spreadsheet. We'll hinge of the sheet key to send the right ingo
 * AP API: We'll have three env variables for race IDs. One shared, two for papers. All IDs will be pulled together from API
 * and then split into two object properties after response comes through.
 */

const main = async () => {
    const logger: Logger = createLogger();

    const dataStore = new DataStore();

    try {

    } catch (error) {
        logger.error(`The wheels are off. All hands on deck. main() is throwing the following error: ${error.toString()}`);
    }
};

main();