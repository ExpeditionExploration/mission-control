
import { Application } from "src/application";
import { Connection } from "src/connection";
import { ModuleLoader } from "src/module-loader";
import { ServerApplicationDependencies } from "./server";
import { modules } from 'src/modules/server';
import { Container } from "src/container";

export class ServerApplication extends Application {
    private readonly connection!: Connection;
    private readonly moduleLoader!: ModuleLoader;
    constructor(deps: ServerApplicationDependencies) {
        super();
        this.connection = deps.connection;
        this.moduleLoader = deps.moduleLoader;
    }

    async init(container: Container) {
        await Promise.all([
            this.moduleLoader.init(modules, container),
            this.connection.init(),
        ]);

        await this.moduleLoader.loadModules();
    }
}

export default ServerApplication;