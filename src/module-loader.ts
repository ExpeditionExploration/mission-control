import { Injectable } from "src/inject";
import { Module, ModuleSymbol } from "src/module";
import { container } from "src/container";
import { Container } from "inversify";
type ModuleNamespace = string;
type ModuleConstructor = new (...args: any[]) => Module;
export type ModulesImport = Record<ModuleNamespace, ModuleConstructor>;
type ModuleContainers = Container[];

@Injectable()
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

            const moduleContainer = container.createChild();
            moduleContainer.bind<string>('namespace').toConstantValue(namespace);
            moduleContainer.bind(ModuleSymbol).to(SubClassedModule).inSingletonScope();
            modulesMap.push(moduleContainer);
        }

        return modulesMap;
    }

    async loadModules() {
        await Promise.all(this.modules.map(async (container) => {
            const instance = container.get<Module>(ModuleSymbol);
            await instance.onModuleInit();
        }));
    }
}