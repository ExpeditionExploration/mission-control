
import { Application } from "src/application";
import { Connection } from "src/connection";
import { ModuleLoader } from "src/module-loader";
import { ServerApplicationDependencies } from "./server";
import * as controllers from 'src/modules/controllers';

export class ServerApplication extends Application {
    private readonly connection!: Connection;
    private readonly moduleLoader!: ModuleLoader;
    constructor(deps: ServerApplicationDependencies) {
        super();
        this.connection = deps.connection;
        this.moduleLoader = deps.moduleLoader;
    }

    async init() {
        await Promise.all([
            this.moduleLoader.init(controllers),
            this.connection.init()
        ]);
    }
}

export default ServerApplication;