import { Injectable } from "@";
import { Container } from 'inversify';
import path from 'path';

export enum ModuleType {
    Controller,
    View
}

type ModuleKey = string;
type ModulePaths = Map<ModuleKey, string>;
type ModulesIndex = Record<ModuleKey, string>;

@Injectable()
export class ModuleLoader {
    async initModules(container: Container, moduleType: ModuleType) {
        const modulePaths = await this.getModulePaths(moduleType);
        console.log(modulePaths, container)
    }

    // async loadModules(moduleType: ModuleType) {

    // }

    // async tryLoadModule(modulePath: string) {

    // }

    async getModulePaths(type: ModuleType): Promise<ModulePaths> {
        const modulePaths = new Map();
        await import('src/modules/index.json').then((modules: any) => {
            for (const [key, modulePath] of Object.entries(modules as ModulesIndex)) {
                modulePaths.set(key, path.join(__dirname, 'modules', modulePath, type === ModuleType.Controller ? 'controller.ts' : 'view.ts'));
            }
        });

        return modulePaths;
    }
}