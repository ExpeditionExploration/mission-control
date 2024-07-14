import { Application } from "src/application";
import { Connection } from "src/connection";
import { ModuleLoader } from "src/module-loader";
import { views } from 'src/modules/views';
import { UserInterfaceLoader } from "./user-interface-loader";
import { ClientApplicationDependencies } from "./client";

export class ClientApplication extends Application {
    private readonly connection!: Connection;
    private readonly moduleLoader!: ModuleLoader;
    private readonly userInterfaceLoader!: UserInterfaceLoader;

    constructor(deps: ClientApplicationDependencies) {
        super();
        this.connection = deps.connection;
        this.moduleLoader = deps.moduleLoader;
        this.userInterfaceLoader = deps.userInterfaceLoader;
    }

    async init() {
        await Promise.all([
            this.moduleLoader.init(views),
        ]);

        await this.moduleLoader.loadModules();
        await this.userInterfaceLoader.init();

        this.connection.init();
    }

    destroy() {
        console.log('Destroying client application');
        this.connection.destroy();
    }
}

export default ClientApplication;