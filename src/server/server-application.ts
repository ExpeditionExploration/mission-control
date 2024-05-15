import { Inject, Injectable } from "src/inject";
import { IApplication } from "src/application";
import { Connection, type IConnection } from "src/connection";
import { ModuleLoader } from "src/module-loader";
import * as controllers from 'src/modules/controllers';

@Injectable()
export class ServerApplication implements IApplication {
    constructor(@Inject(Connection) private readonly connection: IConnection, @Inject(ModuleLoader) private readonly moduleLoader: ModuleLoader) { }
    async init() {
        await Promise.all([
            this.moduleLoader.init(controllers),
            this.connection.init()
        ]);
    }
}

export default ServerApplication;