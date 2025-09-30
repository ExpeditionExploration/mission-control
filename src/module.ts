import { Broadcaster } from "src/broadcaster";
import { ModuleDependencies } from "./module-loader";
import { Payload } from "./connection";
import { Logger } from "./logger";

export type NamespacedEventName = string;

/**
 * The Module injectable class is used to handle auto namespacing of 
 * a module depending on the namespace which the class is injected into.
 */
export abstract class Module {
    public readonly namespace!: string;
    public readonly broadcaster!: Broadcaster;
    public readonly logger!: Logger;
    protected config?: { [key: string]: any };
    private configIntervalHandle?: NodeJS.Timeout;

    constructor(deps: ModuleDependencies) {
        this.namespace = deps.namespace;
        this.broadcaster = deps.broadcaster;
        this.logger = deps.logger;
        if (this.namespace !== 'configuration') {
            this.requestConfig();
        }
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

    requestConfig(): void {
        this.logger.info(`[${this.namespace}] Requesting configuration`);
        this.on('configResponse', (data) => {
            if (this.config) {
                return; // Already have config, ignore further responses
            }
            this.config = data;
            try {
                const fn = (this as any).processConfig;
                if (typeof fn === 'function') {
                    this.logger.info(`[${this.namespace}] Received and processing configuration`);
                    fn.call(this);
                } else {
                    this.logger.warn(`[${this.namespace}] onModuleConfigReceived() not implemented; ignoring configResponse`);
                }
            } finally {
                if (this.configIntervalHandle) {
                    clearInterval(this.configIntervalHandle);
                    this.configIntervalHandle = undefined;
                }
            }
        });
        this.configIntervalHandle = setInterval(() => {   
            if (this.config) {
                return; // Already have config, ignore further requests
            }
            this.emit('configRequest', {
                event: 'configRequest',
                namespace: this.namespace,
                data: null,
            } as Payload);
        }, 1000);
    }

    /**
     * Process the configuration data once received.
     * 
     * Config is stored in `this.config`.
     */
    abstract onModuleConfigReceived(): void | Promise<void>;
}