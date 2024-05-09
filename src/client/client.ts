import { getApplication, container } from "src/application";
import Connection from "src/connection";
import * as controllers from 'src/modules/controllers';
import ClientConnection from "./client-connection";

// Bind environemnt specific injections
container.bind(Connection).to(ClientConnection).inSingletonScope();

const application = getApplication();
application.init(container, controllers);

