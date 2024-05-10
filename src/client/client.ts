import "reflect-metadata";
import Connection from "src/connection";
import { container } from "src/container";
import { Application } from "src/application";
import ClientConnection from "./client-connection";
import ClientApplication from "./client-application";
import UserInterface from "./user-interface";

// Bind environemnt specific injections
container.bind(Application).to(ClientApplication).inSingletonScope();
container.bind(Connection).to(ClientConnection).inSingletonScope();
container.bind(UserInterface).to(UserInterface).inSingletonScope();

// start the application
const application = container.get(Application) as ClientApplication;
application.init(container);


