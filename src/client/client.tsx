import { ApplicationDependencies, createContainer } from 'src/container';
import ClientApplication from './client-application';
import { UserInterfaceLoader } from './user-interface-loader';
import { UserInterface } from './user-interface';
import ClientConnection from './client-connection';
import { asClass, AwilixContainer } from 'awilix';
import { ModuleDependencies } from 'src/module-loader';

export type ClientApplicationDependencies = {
    userInterface: UserInterface;
    userInterfaceLoader: UserInterfaceLoader;
} & ApplicationDependencies;

export type ClientModuleDependencies = ModuleDependencies &
    ClientApplicationDependencies;

const container = createContainer();
(container as AwilixContainer<ClientApplicationDependencies>).register({
    application: asClass(ClientApplication).singleton(),
    connection: asClass(ClientConnection).singleton(),
    userInterface: asClass(UserInterface).scoped(),
    userInterfaceLoader: asClass(UserInterfaceLoader).singleton(),
});

const application = container.resolve('application');
application.init(container);
