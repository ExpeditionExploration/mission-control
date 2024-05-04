import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import WebSocket, { Server } from 'ws';
import cp from 'child_process';
import path from 'path';
import { Module } from '../../types';

const websocketPort = 16502;
export const Media: Module = ({
    events,
    on, 
    emit
}) => {
    const mediaStream = cp.fork(path.join(__dirname, './mediaStream'));
    // events.on('capture', () => {
    //     mediaStream.send('capture');
    // })
    // mediaStream.on('message', (data: Buffer) => {
    //     send('capture', data);
    // });
}