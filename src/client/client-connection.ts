import { IConnection, Payload } from "src/connection";
import { Inject, Injectable } from "@module";
import { Config } from "src/config";
import Broadcaster from "src/broadcaster";

@Injectable()
export class ClientConnection implements IConnection {
    private socket?: WebSocket;
    constructor(@Inject(Config) private readonly config: Config, @Inject(Broadcaster) private readonly broadcaster: Broadcaster) { }
    async init() {
        await this.connect();
    }

    private async connect() {
        if (this.socket) {
            this.socket.onclose = null;
            this.socket.close();
        }

        // TODO reconnect
        await new Promise<void>((resolve) => {
            this.socket = new WebSocket(`ws://${location.hostname}:${this.config.port}`);
            this.socket.onopen = () => {
                console.log('Connected to server');
                resolve();
            }
            this.socket.onclose = () => {
                console.log('Disconnected from server');
            }
            this.socket.onerror = (error) => {
                console.error('Error connecting to server', error);
            }
            this.socket.onmessage = (message) => {
                try {
                    const payload = JSON.parse(message.data) as Payload;
                    this.broadcaster.emit(payload.event, payload.data);
                } catch (e) {
                    console.error('Error parsing message', e);
                }
            }
        });

        this.broadcaster.on('event', (event: Payload) => this.send(event));
    }
    send(payload: Payload): void {
        console.log('Sending payload', payload)
        this.socket?.send(JSON.stringify(payload));
    }

}

export default ClientConnection;