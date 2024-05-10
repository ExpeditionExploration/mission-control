import "reflect-metadata";
import Connection from "src/connection";
import ServerConnection from "./server-connection";
import { container } from "src/container";
import { Application } from "src/application";
import { ServerApplication } from "./server-application";

// Bind environemnt specific injections
// container.bind(Application).to(ServerApplication).inSingletonScope();
// container.bind(Connection).to(ServerConnection).inSingletonScope();

// start the application
const application = container.resolve(Application) as ServerApplication;
application.init();

