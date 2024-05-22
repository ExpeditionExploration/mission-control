import { Broadcaster } from "src/broadcaster";
import { ModuleDependencies } from "./module-loader";

export type NamespacedEventName = string;

/**
 * The Module injectable class is used to handle auto namespacing of 
 * a module depending on the namespace which the class is injected into.
 */
export abstract class Module {
    private readonly namespace!: string;
    private readonly broadcaster!: Broadcaster;

    constructor(deps: ModuleDependencies) {
        this.namespace = deps.namespace;
        this.broadcaster = deps.broadcaster;
    }

    getEvent(event: string): NamespacedEventName {
        return `${this.namespace}:${event}`;
    }
    on(event: string, listener: (data: any) => void) {
        this.broadcaster?.on(this.getEvent(event), listener);
    }
    off(event: string, listener: (data: any) => void) {
        this.broadcaster?.off(this.getEvent(event), listener);
    }
    emit(event: string, data: any) {
        return this.broadcaster?.emit(this.getEvent(event), data);
    }

    abstract onModuleInit(): void | Promise<void>;
}