export type Payload<T = any> = {
    event: string;
    namespace: string;
    data: T;
};

export abstract class Connection {
    abstract init(): Promise<void>;
    abstract send(payload: Payload): void;
    abstract destroy(): void;
}
