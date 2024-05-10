import "reflect-metadata";
import Connection from "src/connection";
import { container } from "src/container";
import { Application } from "src/application";
import ClientConnection from "./client-connection";
import ClientApplication from "./client-application";
import UserInterface from "./user-interface";

// Bind environemnt specific injections
container.registerSingleton(Application, ClientApplication);
container.registerSingleton(Connection, ClientConnection);
container.registerSingleton(UserInterface, UserInterface);

// container.register(UserInterface, {
//     useToken: delay(() => UserInterface)
// }, {
//     lifecycle: Lifecycle.Singleton
// });

// start the application
const application = container.resolve(Application) as ClientApplication;
application.init();


