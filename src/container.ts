import 'reflect-metadata';
import { Container } from 'inversify';
import { ModuleLoader } from 'src/module-loader';
import Events from '@events';
import Broadcaster from 'src/broadcaster';
import { Config } from './config';
import { Application } from 'src/application';

export const container = new Container();
container.bind<string>('namespace').toConstantValue('app');
container.bind<Application>(Application).to(Application).inSingletonScope();
container.bind<Config>(Config).to(Config).inSingletonScope();
container.bind<Broadcaster>(Broadcaster).to(Broadcaster).inSingletonScope();
container.bind<Events>(Events).to(Events).inRequestScope();
container.bind<ModuleLoader>(ModuleLoader).to(ModuleLoader).inSingletonScope();
