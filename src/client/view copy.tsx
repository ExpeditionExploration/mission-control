import { Inject, Injectable } from 'src/inject';
import { Module, IModule } from 'src/module';
import './index.css';
import { ViewLoader } from './view-loader';
import React from 'react';

@Injectable()
export class View {
    context: React.Context<Module>;
    constructor(
        @Inject(ViewLoader) private readonly viewLoader: ViewLoader,
        @Inject(Module) private readonly module: Module,
    ) {
        this.context = React.createContext<Module>(this.module);
    }

    init() {
        console.log('View init', this.module);
    }

    addContextItem(item: JSX.Element) {
        this.viewLoader.setContext((prev) => {
            return {
                ...prev,
                contextItems: [...prev.contextItems, item],
            };
        });
    }
}

// export const ViewContext = React.createContext<Module | null>(null);

// export function ViewFragment({
//     module,
//     children,
// }: {
//     module: Module;
//     children?: React.ReactNode;
// }) {
//     const context = React.useContext(ViewContext);
//     return <>{children}</>;
// }
