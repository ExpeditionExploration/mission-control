import 'reflect-metadata';
import { Container } from 'inversify';
import { ModuleLoader } from 'src/module-loader';
import { Module } from 'src/module';
import { Broadcaster } from 'src/broadcaster';
import { Config } from './config';
import * as awilix from 'awilix';

const container = awilix.createContainer({
    injectionMode: awilix.InjectionMode.PROXY,
    strict: true,
});
// container.bind<string>('namspace').toConstantValue('application');
// container.bind<Config>(Config).to(Config).inSingletonScope();
// container.bind<Broadcaster>(Broadcaster).to(Broadcaster).inSingletonScope();
// container.bind<ModuleLoader>(ModuleLoader).to(ModuleLoader).inSingletonScope();

export { container };