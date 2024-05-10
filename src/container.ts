import 'reflect-metadata';
export { container } from 'tsyringe';
import { ModuleLoader } from 'src/module-loader';
import Events from '@events';
import Broadcaster from 'src/broadcaster';
import { Config } from './config';

// container.bind<string>('namespace').toConstantValue('application');
// container.bind<Config>(Config).to(Config).inSingletonScope();
// container.bind<Broadcaster>(Broadcaster).to(Broadcaster).inSingletonScope();
// container.bind<Events>(Events).to(Events).inRequestScope();
// container.bind<ModuleLoader>(ModuleLoader).to(ModuleLoader).inSingletonScope();
