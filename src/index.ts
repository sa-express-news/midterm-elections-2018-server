require("dotenv").config();

// interfaces
import { Logger } from 'winston';
import { DataStoreInstance } from './interfaces';

// modules
import createLogger      from './logger';
import DataStore         from './data-store';
import socket            from './socket';
import requestController from './requestController';

const main = async () => {
    const logger: Logger               = createLogger();
    const dataStore: DataStoreInstance = new DataStore();

    try {
        const port = parseInt(process.env.SOCKET_PORT, 10);

        socket.listen(port);

        logger.info(`Listening on port: ${port}`);

        await requestController.populateDataStore(dataStore, logger);

        socket.on('connection', (clientSocket) => {
            clientSocket.emit('houston', JSON.stringify(dataStore.getData('houston')));
            clientSocket.emit('sa', JSON.stringify(dataStore.getData('sa')));
        });

        const updateDataStore = async () => {
            await requestController.populateDataStore(dataStore, logger);
            socket.sockets.emit('houston', JSON.stringify(dataStore.getData('houston')));
            socket.sockets.emit('sa', JSON.stringify(dataStore.getData('sa')));
        };

        setInterval(updateDataStore, 90000);
    } catch (error) {
        logger.error(`The wheels are off. All hands on deck. main() is throwing the following error: ${error.toString()}`);
    }
};

main();