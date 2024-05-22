import { Payload } from "src/connection";
import EventEmitter from "events";

/**
 * The EventBroadcaster injectable class is used to handle broadcasting of events
 * on the event emitter and on the connection
 */
export class Broadcaster {
    private readonly emitter = new EventEmitter();

    on(event: string, listener: (data: any) => void) {
        this.emitter.on(event, listener);
    }
    off(event: string, listener: (data: any) => void) {
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