import { Injectable, Module } from "@module";
import { Container } from 'inversify';
type ModuleNamespace = string;
type ModuleConstructor = new (...args: any[]) => Module;
export type ModulesImport = Record<ModuleNamespace, ModuleConstructor>;
type ModulesArray = [ModuleConstructor, Container][];

@Injectable()
export class ModuleLoader {
    async init(container: Container, modules: ModulesImport) {
        // Create modules containers
        const modulesArray = this.loadModulesIntoContainer(container, modules);
        // Load modules
        await this.loadModules(modulesArray);
    }

    private reservedKeys = ['default', 'app', 'root', 'event'];
    private loadModulesIntoContainer(container: Container, modules: ModulesImport): ModulesArray {
        const modulesMap: ModulesArray = [];
        for (const [namespace, Module] of Object.entries(modules)) {
            if (namespace in this.reservedKeys) throw new Error(`Module namespace "${namespace}" is reserved`);

            const moduleContainer = container.createChild();
            moduleContainer.bind<string>('namespace').toConstantValue(namespace);
            moduleContainer.bind<Module>(Module).to(Module).inSingletonScope();
            modulesMap.push([Module, moduleContainer]);
        }

        return modulesMap;
    }

    async loadModules(modules: ModulesArray) {
        await Promise.all(modules.map(async ([Module, container]) => {
            const instance = container.get(Module);
            await instance.onModuleInit();
        }));
    }
}