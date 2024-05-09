import { Inject, Injectable } from "@module";
import Broadcaster from "src/broadcaster";

@Injectable()
/**
 * The Events injectable class is used to handle auto namespacing of 
 * events depending on the namespace which the class is injected into.
 */
export class Events {
    constructor(@Inject('namespace') private readonly namespace: string, @Inject(Broadcaster) private readonly broadcaster: Broadcaster) { }

    private getNamespacedEvent(event: string) {
        return `${this.namespace}:${event}`;
    }
    on(event: string, listener: (...args: any[]) => void) {
        this.broadcaster.on(this.getNamespacedEvent(event), listener);
    }
    off(event: string, listener: (...args: any[]) => void) {
        this.broadcaster.off(this.getNamespacedEvent(event), listener);
    }
    emit(event: string, ...args: any[]) {
        return this.broadcaster.emit(this.getNamespacedEvent(event), ...args);
    }
}

export default Events;