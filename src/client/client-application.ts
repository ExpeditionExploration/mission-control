import { Injectable } from "@module";
import { Container } from "inversify";
import { Application } from "src/application";
import * as views from 'src/modules/views';
import UserInterface from "./user-interface";

@Injectable()
export class ClientApplication extends Application {
    constructor(@Inject(UserInterface) userInterface: UserInterface) { }
    async init(container: Container) {
        await super.init(container, views);

        await Promise.all([
            await this.userInterface.init()
        ]);
    }
}

export default ClientApplication;