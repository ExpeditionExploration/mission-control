
import { Application } from "src/application";
import { Config } from "src/config";
import { Connection } from "src/connection";
import { ModuleLoader } from "src/module-loader";
import { ServerApplicationDependencies } from "./server";
import { modules } from 'src/modules/server';
import { Container } from "src/container";

export class ServerApplication extends Application {
    private readonly config!: Config;
    private readonly connection!: Connection;
    private readonly moduleLoader!: ModuleLoader;
    constructor(deps: ServerApplicationDependencies) {
        super();
        this.config = deps.config;
        this.connection = deps.connection;
        this.moduleLoader = deps.moduleLoader;
    }

    async init(container: Container) {
        await Promise.all([
            this.config.init(),
            this.moduleLoader.init(modules, container),
            this.connection.init(),
        ]);

        await this.moduleLoader.loadModules();
    }
}

export default ServerApplication;