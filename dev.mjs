import { EventEmitter } from 'node:events';
import concurrently from 'concurrently';

EventEmitter.defaultMaxListeners = 100;
process.setMaxListeners(100);
const { result } = concurrently(
    [
        { command: 'npm run dev:client', name: 'Client' },
        {
            command: 'npm run dev:server',
            name: 'Server',
            env: { OPENGPIO_MOCKED: false },
        },
    ],
    {
        prefixColors: ['bgGreen.bold', 'bgBlue.bold'],
        prefix: 'name',
        killOthers: ['failure', 'success'],
        restartTries: 3,
    },
);
result.catch((err) => {
    console.error(err);
    process.exit(1);
});
