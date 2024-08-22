import { Broadcaster } from "./broadcaster";
import { ModuleDependencies, ModuleLoader } from "./module-loader";
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { Config } from "./config";
import { Connection } from "./connection";
import { Application } from "./application";
import { Module } from "./module";

type DeepMockedModuleDependencies<T> = {
    [K in keyof T]: DeepMocked<T[K]>;
};

export type MockedModuleDependencies = DeepMockedModuleDependencies<ModuleDependencies>;

export function mockModuleDependencies(): MockedModuleDependencies {
    return {
        namespace: 'mocked-namespace',
        module: createMock(Module as any),
        config: createMock(Config as any),
        broadcaster: createMock(Broadcaster as any),
        moduleLoader: createMock(ModuleLoader as any),
        connection: createMock(Connection as any),
        application: createMock(Application as any)
    };
}