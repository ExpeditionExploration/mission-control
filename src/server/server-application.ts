import Events from "@events";
import { Inject, Injectable } from "@module";
import { IApplication } from "src/application";
import Connection, { type IConnection } from "src/connection";
import { ModuleLoader } from "src/module-loader";
import * as controllers from 'src/modules/controllers';

@Injectable()
export class ServerApplication implements IApplication {
    constructor(@Inject(Connection) private readonly connection: IConnection, @Inject(ModuleLoader) private readonly moduleLoader: ModuleLoader, @Inject(Events) private readonly events: Events) { }
    async init() {
        this.events.on('controller', (data) => { });
        console.log('ServerApplication', this.events);

        await Promise.all([
            this.moduleLoader.init(controllers),
            this.connection.init()
        ]);
    }
}

export default ServerApplication;