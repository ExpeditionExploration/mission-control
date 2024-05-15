import 'reflect-metadata';
import { Connection } from 'src/connection';
import { container } from 'src/container';
import { Application } from 'src/application';
import ClientConnection from './client-connection';
import ClientApplication from './client-application';
import { UserInterfaceLoader } from './user-interface-loader';
import { UserInterface } from './user-interface';
import { Lifecycle } from 'tsyringe';

// Bind environemnt specific injections
container.registerSingleton(Application, ClientApplication);
container.registerSingleton(Connection, ClientConnection);
container.registerSingleton(UserInterfaceLoader, UserInterfaceLoader);
container.register(
    UserInterface,
    {
        useClass: UserInterface,
    },
    {
        lifecycle: Lifecycle.ContainerScoped,
    },
);

// Start the application
const application = container.resolve(Application) as ClientApplication;
application.init();
