export type Payload = {
    event: string;
    data: any[];
}

export abstract class Connection {
    abstract init(): Promise<void>;
    abstract send(payload: Payload): void;
    abstract destroy(): void;
}