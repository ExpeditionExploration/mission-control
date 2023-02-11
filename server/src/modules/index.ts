import type { Module, Controller } from './Module';
import * as modules from './loader';
import logger from 'debug';
import { SocketPayload } from '../types';
import { EventEmitter } from 'events';

const debug = logger('MissionControl:Modules');
debug('Loading modules:', Object.keys(modules));

const events = new EventEmitter();

process.on('message', (payload: SocketPayload) => {
    events.emit(`Module:${payload.module}${payload.event ? `:${payload.event}` : ''}`, payload.data);
});

function send(module: string, event: string = '', data: any) {
    const payload: SocketPayload = { module, event, data };
    if (process.send) process.send(payload);
    // sockets.clients.forEach(client => client.send(JSON.stringify(payload)));
}

Object.entries(modules).forEach(([name, module]) => {
    const Controller = module.controller as Controller;
    Controller({
        events,
        debug: logger(`MissionControl:Module:${name}`),
        send: (data: any, event?: string) => send(name, event, data)
    });
})