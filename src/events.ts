import { Inject, Injectable } from "@module";
import Broadcaster from "src/broadcaster";

export type NamespacedEventName = string;

@Injectable()
/**
 * The Events injectable class is used to handle auto namespacing of 
 * events depending on the namespace which the class is injected into.
 */
export class Events {
    constructor(@Inject('namespace') private readonly namespace: string, @Inject(Broadcaster) private readonly broadcaster: Broadcaster) { }

    getEvent(event: string): NamespacedEventName {
        return `${this.namespace}:${event}`;
    }
    on(event: string, listener: (data: any) => void) {
        this.broadcaster.on(this.getEvent(event), listener);
    }
    off(event: string, listener: (data: any) => void) {
        this.broadcaster.off(this.getEvent(event), listener);
    }
    emit(event: string, data: any) {
        return this.broadcaster.emit(this.getEvent(event), data);
    }
}

export default Events;