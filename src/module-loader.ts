import { Module } from "src/module";
import { ApplicationDependencies, container, Container } from "src/container";
import { asClass, asValue, AwilixContainer } from 'awilix';

type ModuleNamespace = string;
type ModuleConstructor = new (...args: any[]) => Module;
export type ModulesImport = Record<ModuleNamespace, ModuleConstructor>;
export type ModuleDependencies = {
    namespace: string;
    module: Module;
} & ApplicationDependencies;
export type ModuleContainers = AwilixContainer<ModuleDependencies>[];

export class ModuleLoader {
    modules: ModuleContainers = [];
    async init(modules: ModulesImport) {
        // Create modules containers
        this.modules = this.loadModulesIntoContainer(container, modules);
    }

    private reservedKeys = ['default', 'app', 'root', 'event'];
    private loadModulesIntoContainer(container: Container, modules: ModulesImport): ModuleContainers {
        const modulesMap: ModuleContainers = [];
        for (const [namespace, SubClassedModule] of Object.entries(modules)) {
            if (namespace in this.reservedKeys) throw new Error(`Module namespace "${namespace}" is reserved`);

            const moduleContainer = container.createScope<ModuleDependencies>();
            moduleContainer.register({
                'namespace': asValue(namespace),
                'module': asClass(SubClassedModule).scoped(),
            })
            modulesMap.push(moduleContainer);
        }

        return modulesMap;
    }

    async loadModules() {
        await Promise.all(this.modules.map(async (container) => {
            const instance = container.resolve('module');
            await instance.onModuleInit();
        }));
    }
}