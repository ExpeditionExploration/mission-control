import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import type Module from '../Module';
import WebSocket, { Server } from 'ws';
import cp from 'child_process';
import path from 'path';

const websocketPort = 16502;
export const Media: Module = {
    controller: ({
        events,
        send,
        debug
    }) => {
        const mediaStream = cp.fork(path.join(__dirname, './mediaStream'));
    }
}