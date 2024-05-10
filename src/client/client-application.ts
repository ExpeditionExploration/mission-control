import { Inject, Injectable } from "@module";
import { IApplication } from "src/application";
import Connection, { type IConnection } from "src/connection";
import { ModuleLoader } from "src/module-loader";
import * as views from 'src/modules/views';
import UserInterface from "./user-interface";

@Injectable()
export class ClientApplication implements IApplication {
    constructor(@Inject(Connection) private readonly connection: IConnection, @Inject(ModuleLoader) private readonly moduleLoader: ModuleLoader, @Inject(UserInterface) private readonly userInterface: UserInterface) { }
    async init() {
        await Promise.all([
            this.moduleLoader.init(views),
            this.connection.init(),
            this.userInterface.init()
        ]);

        // load modules last
        await this.moduleLoader.loadModules();
    }
}

export default ClientApplication;