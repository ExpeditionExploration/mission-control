import { Module } from 'src/module';
import './index.css';
import { UserInterfaceLoader } from './user-interface-loader';
import { ModuleDependencies } from 'src/module-loader';
import { type ClientModuleDependencies } from './client';
import { JSX } from 'react';

export enum Side {
    Left,
    Right,
}

export class UserInterface {
    private readonly userInterfaceLoader!: UserInterfaceLoader;
    private module!: Module;

    constructor(deps: ClientModuleDependencies) {
        this.userInterfaceLoader = deps.userInterfaceLoader;
        setTimeout(() => {
            // This needs to delay the injection to overcome circular dependency
            this.module = deps.module;
        });
    }

    init() {
        console.log('View init', this.module);
    }

    private getItem(Item: JSX.ElementType) {
        return <Item module={this.module} key={this.generateKey()} />;
    }

    generateKey() {
        return Math.random().toString(36).substring(7);
    }
    addContextItem(
        Item: JSX.ElementType,
        {
            order = 0,
        }: {
            order?: number | null;
        } = {},
    ) {
        this.userInterfaceLoader.contextItems.add({
            element: this.getItem(Item),
            order: order ?? this.userInterfaceLoader.contextItems.size,
        });
    }
    addHeaderItem(
        Item: JSX.ElementType,
        {
            order = 0,
            side = Side.Left,
        }: {
            order?: number | null;
            side?: Side;
        } = {},
    ) {
        if (side === Side.Left) {
            this.userInterfaceLoader.headerLeftItems.add({
                element: this.getItem(Item),
                order: order ?? this.userInterfaceLoader.headerLeftItems.size,
            });
        } else {
            this.userInterfaceLoader.headerRightItems.add({
                element: this.getItem(Item),
                order: order ?? this.userInterfaceLoader.headerRightItems.size,
            });
        }
    }
    addFooterItem(
        Item: JSX.ElementType,
        {
            order = 0,
            side = Side.Left,
        }: {
            order?: number | null;
            side?: Side;
        } = {},
    ) {
        if (side === Side.Left) {
            this.userInterfaceLoader.footerLeftItems.add({
                element: this.getItem(Item),
                order: order ?? this.userInterfaceLoader.footerLeftItems.size,
            });
        } else {
            this.userInterfaceLoader.footerRightItems.add({
                element: this.getItem(Item),
                order: order ?? this.userInterfaceLoader.footerRightItems.size,
            });
        }
    }
}

export interface ViewProps<T extends Module = Module>
    extends React.HTMLProps<HTMLElement> {
    module: T;
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
