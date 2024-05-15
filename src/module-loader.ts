import { Injectable } from "@inject";
import { IModule } from "src/m";
import { container } from "src/container";
import { DependencyContainer, Lifecycle } from "tsyringe";
type ModuleNamespace = string;
type ModuleConstructor = new (...args: any[]) => IModule;
export type ModulesImport = Record<ModuleNamespace, ModuleConstructor>;
type ModulesArray = [ModuleConstructor, DependencyContainer][];

@Injectable()
export class ModuleLoader {
    modules: ModulesArray = [];
    async init(modules: ModulesImport) {
        // Create modules containers
        this.modules = this.loadModulesIntoContainer(container, modules);
    }

    private reservedKeys = ['default', 'app', 'root', 'event'];
    private loadModulesIntoContainer(container: DependencyContainer, modules: ModulesImport): ModulesArray {
        const modulesMap: ModulesArray = [];
        for (const [namespace, Module] of Object.entries(modules)) {
            if (namespace in this.reservedKeys) throw new Error(`Module namespace "${namespace}" is reserved`);

            const moduleContainer = container.createChildContainer();
            moduleContainer.register('namespace', {
                useValue: namespace
            })
            moduleContainer.register(Module, {
                useClass: Module
            }, {
                lifecycle: Lifecycle.ContainerScoped
            });
            modulesMap.push([Module, moduleContainer]);
        }

        return modulesMap;
    }

    async loadModules() {
        await Promise.all(this.modules.map(async ([Module, container]) => {
            const instance = container.resolve(Module);
            await instance.onModuleInit();
        }));
    }
}