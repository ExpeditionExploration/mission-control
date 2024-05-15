import { Injectable } from "src/inject";

@Injectable()
export class Config {
    port = 16500;
    reconnectTimeout = 5000;
}