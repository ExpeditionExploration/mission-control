import "reflect-metadata";
import { Connection } from "src/connection";
import { ServerConnection } from "./server-connection";
import { container } from "src/container";
import { ServerApplication } from "./server-application";
import { Application } from "src/application";

// Bind environemnt specific injections
container.registerSingleton(Application, ServerApplication);
container.registerSingleton(Connection, ServerConnection);

// start the application
const application = container.resolve(Application) as ServerApplication;
application.init();

