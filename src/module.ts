import { AutoInjectable, Inject, Injectable } from "src/inject";
import { Broadcaster } from "src/broadcaster";

export type NamespacedEventName = string;

@AutoInjectable()
/**
 * The Module injectable class is used to handle auto namespacing of 
 * a module depending on the namespace which the class is injected into.
 */
export class Module {
    constructor(private readonly namespace?: string, private readonly broadcaster?: Broadcaster) { }

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
}

export interface IModule {
    onModuleInit(): void | Promise<void>;
}