export type Payload = {
    event: string;
    data: any[];
}

export interface IConnection {
    init(): Promise<void>;
    send(payload: Payload): void;
}

export const Connection = Symbol("Connection");
export default Connection;