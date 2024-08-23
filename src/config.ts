import { LogLevel } from "./logger";

export class Config {
    port = 16500;
    reconnectTimeout = 5000;
    logger: LogLevel[] | boolean = true; // Set to false to disable logging
}