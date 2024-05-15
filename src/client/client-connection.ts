import { IConnection, Payload } from "src/connection";
import { Inject, Injectable } from "src/inject";
import { Config } from "src/config";
import { Broadcaster } from "src/broadcaster";

@Injectable()
export class ClientConnection implements IConnection {
    private socket?: WebSocket;
    constructor(@Inject(Config) private readonly config: Config, @Inject(Broadcaster) private readonly broadcaster: Broadcaster) { }
    async init() {
        await this.connect();
    }

    private async connect() {
        this.destroy();

        await new Promise<void>((resolve) => {
            this.socket = new WebSocket(`ws://${location.hostname}:${this.config.port}`);
            this.socket.onopen = () => {
                console.log('Connected to server');
                resolve()
            }
            this.socket.onclose = () => {
                console.log('Disconnected from server');
                this.reconnect();
            }
            this.socket.onerror = (error) => {
                console.error('Error connecting to server', error);
                resolve()
                this.reconnect();
            }
            this.socket.onmessage = (message) => {
                try {
                    const payload = JSON.parse(message.data) as Payload;
                    this.broadcaster.emit(payload.event, payload.data, false);
                } catch (e) {
                    console.error('Error parsing message', e);
                }
            }
        });

        this.broadcaster.on('event', (event: Payload) => this.send(event));
    }

    destroy() {
        if (this.socket) {
            this.socket.onclose = null;
            this.socket.close();
        }
    }

    reconnect() {
        if (this.config.reconnectTimeout > 0) {
            console.log(`Reconnecting in ${this.config.reconnectTimeout / 1000}s`);
            setTimeout(() => this.connect(), this.config.reconnectTimeout);
        }
    }

    send(payload: Payload): void {
        console.log('Sending payload', payload)
        this.socket?.send(JSON.stringify(payload));
    }

}

export default ClientConnection;