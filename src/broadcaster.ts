import Connection, { type IConnection } from "src/connection";
import { Inject, Injectable } from "@module";
import EventEmitter from "events";

@Injectable()
/**
 * The EventBroadcaster injectable class is used to handle broadcasting of events
 * on the event emitter and on the connection
 */
export class Broadcaster {
    private readonly emitter = new EventEmitter();

    constructor(@Inject(Connection) private readonly connection: IConnection) { }

    on(event: string, listener: (...args: any[]) => void) {
        this.emitter.on(event, listener);
    }
    off(event: string, listener: (...args: any[]) => void) {
        this.emitter.off(event, listener);
    }
    emit(event: string, ...args: any[]) {
        this.connection.send({
            event,
            data: args
        });
        return this.emitter.emit(event, ...args);
    }
}

export default Broadcaster;