import { Config } from "src/config";
import { Connection, Payload } from "src/connection";
import { WebSocketServer } from 'ws';
import handler from 'serve-handler';
import http, { Server } from 'http';
import path from "path";
import { Broadcaster } from "src/broadcaster";
import { ServerApplicationDependencies } from "./server";

export class ServerConnection extends Connection {
    private readonly config!: Config;
    private readonly broadcaster!: Broadcaster;
    private webSocketServer?: WebSocketServer;
    private server?: Server;

    constructor(deps: ServerApplicationDependencies) {
        super();
        this.config = deps.config;
        this.broadcaster = deps.broadcaster;
    }

    async init() {
        this.server = http.createServer((request, response) => {
            return handler(request, response, {
                public: process.cwd() // In final deployment, this should be the path to the build directory
            });
        });

        const ws = new WebSocketServer({
            server: this.server,
        });
        ws.on('connection', (socket) => {
            socket.on('message', (message) => {
                console.log('Received message', message.toString());
                try {
                    const payload = JSON.parse(message.toString()) as Payload;
                    this.broadcaster.emit(payload.event, payload.data, false);
                } catch (e) {
                    console.error('Error parsing message', e);
                }
            })
        })

        this.webSocketServer = ws;

        await new Promise<void>((resolve) => this.server?.listen(this.config.port, () => {
            console.log(`Server started on port ${this.config.port}`);
            resolve();
        }));

        this.broadcaster.on('event', (event: Payload) => this.send(event));
    }

    destroy() {
        this.webSocketServer?.close();
        this.server?.close();
    }

    send(payload: Payload) {
        this.webSocketServer?.clients.forEach(client => {
            client.send(JSON.stringify(payload));
        });
    }
}