import { IConnection, Payload } from "src/connection";
import { Injectable } from "@module";

@Injectable()
export class ClientConnection implements IConnection {
    init(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    send(payload: Payload): void {
        throw new Error("Method not implemented.");
    }

}

export default ClientConnection;