import "reflect-metadata";
import Connection from "src/connection";
import * as controllers from 'src/modules/controllers';
import ServerConnection from "./server-connection";
import { container } from "src/container";
import { Application } from "src/application";

// Bind environemnt specific injections
container.bind(Connection).to(ServerConnection).inSingletonScope();


// start the application
const application = container.get<Application>(Application);
application.init(container, controllers);


