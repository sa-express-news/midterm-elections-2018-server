require("dotenv").config();

// interfaces
import { Logger } from 'winston';

// modules
import createLogger   from './logger';
import ap             from './associated-press';

const main = async () => {
    const logger: Logger = createLogger();
    
    try {
        
    } catch (error) {
        logger.error(`The wheels are off. All hands on deck. main() is throwing the following error: ${error.toString()}`);
    }
};

main();