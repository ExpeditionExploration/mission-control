import { Inject, Injectable } from "src/inject";
import { IApplication } from "src/application";
import { Connection, type IConnection } from "src/connection";
import { ModuleLoader } from "src/module-loader";
import * as views from 'src/modules/views';
import { UserInterfaceLoader } from "./user-interface-loader";

@Injectable()
export class ClientApplication implements IApplication {
    constructor(@Inject(Connection) private readonly connection: IConnection, @Inject(ModuleLoader) private readonly moduleLoader: ModuleLoader, @Inject(UserInterfaceLoader) private readonly userInterfaceLoader: UserInterfaceLoader) { }
    async init() {
        await Promise.all([
            this.moduleLoader.init(views),
            this.connection.init(),
        ]);

        await this.moduleLoader.loadModules();
        this.userInterfaceLoader.init()
    }

    destroy() {
        console.log('Destroying client application');
        this.connection.destroy();
    }
}

export default ClientApplication;