import Connection, { Payload, type IConnection } from "src/connection";
import { Inject, Injectable } from "@module";
import EventEmitter from "events";

@Injectable()
/**
 * The EventBroadcaster injectable class is used to handle broadcasting of events
 * on the event emitter and on the connection
 */
export class Broadcaster {
    private readonly emitter = new EventEmitter();

    on(event: string, listener: (...args: any[]) => void) {
        this.emitter.on(event, listener);
    }
    off(event: string, listener: (...args: any[]) => void) {
        this.emitter.off(event, listener);
    }
    emit(event: string, data: any, global = true) {
        const payload: Payload = {
            event,
            data
        };
        // If the event is global, broadcast it on the emitter
        if (global) this.emitter.emit('event', payload); // Broadcast the event on the emitter for catching all events
        return this.emitter.emit(payload.event, payload);
    }
}

export default Broadcaster;