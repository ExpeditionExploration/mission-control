import Connection from "src/connection";
import * as controllers from 'src/modules/controllers';
import ServerConnection from "./server-connection";
import { container } from "@module";

// Bind environemnt specific injections
container.bind(Connection).to(ServerConnection).inSingletonScope();

// start the application
import { application } from "src/application";
application.init(container, controllers);

