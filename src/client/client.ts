import "reflect-metadata";
import Connection from "src/connection";
import * as views from 'src/modules/views';
import { container } from "src/container";
import { Application } from "src/application";
import ClientConnection from "./client-connection";

// Bind environemnt specific injections
container.bind(Connection).to(ClientConnection).inSingletonScope();


// start the application
const application = container.get<Application>(Application);
application.init(container, views);


