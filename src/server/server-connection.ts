import { Inject, Injectable } from "@module";
import Broadcaster from "src/broadcaster";
import { Config } from "src/config";
import { IConnection, Payload } from "src/connection";
import { WebSocketServer } from 'ws';
import handler from 'serve-handler';
import http, { Server } from 'http';

@Injectable()
export class ServerConnection implements IConnection {
    private webSocketServer?: WebSocketServer;
    private server?: Server;
    constructor(@Inject(Config) private readonly config: Config, @Inject(Broadcaster) private readonly broadcaster: Broadcaster) { }

    async init() {
        this.webSocketServer = new WebSocketServer({
            port: this.config.port,
        });
        this.server = http.createServer(handler);
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

export default ServerConnection;