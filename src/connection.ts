export type Payload = {
    event: string;
    data: any[];
}

export interface IConnection {
    init(): Promise<void>;
    send(payload: Payload): void;
    destroy(): void;
}

export const Connection = Symbol("Connection");