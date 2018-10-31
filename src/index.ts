require("dotenv").config();

// interfaces
import { Logger } from 'winston';

// modules
import createLogger   from './logger';
import DataStore      from './data-store';
import socket         from './socket';
import ap             from './associated-press';

/**
 * We'll have two socket events. One named 'Houston' and one named 'SanAntonio'. They'll be organized as followed:
 * Google Sheets: Two different sheets in the same spreadsheet. We'll hinge of the sheet key to send the right ingo
 * AP API: We'll have three env variables for race IDs. One shared, two for papers. All IDs will be pulled together from API
 * and then split into two object properties after response comes through.
 * NEED TO CHANGE HOW WINNERS ARE HANDLED IN AP DATA
 */

const main = async () => {
    const logger: Logger = createLogger();

    const dataStore = new DataStore();

    try {
        const port = parseInt(process.env.SOCKET_PORT as string, 10);
        socket.listen(port);

        // socket.on('connection', (clientSocket) => {
        //     clientSocket.emit('houston', JSON.stringify({ primaries: data.primaries }));
        // });

    } catch (error) {
        logger.error(`The wheels are off. All hands on deck. main() is throwing the following error: ${error.toString()}`);
    }
};

main();