import { Broadcaster } from "src/broadcaster";
import { ModuleDependencies } from "./module-loader";
import { Payload } from "./connection";
import { Logger } from "./logger";
import { Config } from "./config";

export type NamespacedEventName = string;

/**
 * The Module injectable class is used to handle auto namespacing of 
 * a module depending on the namespace which the class is injected into.
 */
export abstract class Module {
    public readonly namespace!: string;
    public readonly broadcaster!: Broadcaster;
    public readonly logger!: Logger;
    public readonly config!: Config;

    constructor(deps: ModuleDependencies) {
        this.namespace = deps.namespace;
        this.broadcaster = deps.broadcaster;
        this.logger = deps.logger;
        this.config = deps.config;
    }

    getEvent(event: string): NamespacedEventName {
        return `${this.namespace}:${event}`;
    }
    on<T = any>(event: string, listener: (data: T) => void) {
        this.broadcaster?.on(this.getEvent(event), (payload: Payload) => listener(payload.data));
    }
    off(event: string, listener: (data: any) => void) {
        this.broadcaster?.off(this.getEvent(event), listener);
    }
    emit<T = any>(event: string, data: T) {
        return this.broadcaster?.emit(this.getEvent(event), data);
    }

    abstract onModuleInit(): void | Promise<void>;
}