import { Injectable } from "@module";

@Injectable()
export class Config {
    port = 16500;
    reconnectTimeout = 5000;
}