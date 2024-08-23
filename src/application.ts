import { Container } from "./container";

export abstract class Application {
    abstract init(container: Container): Promise<void>;
}