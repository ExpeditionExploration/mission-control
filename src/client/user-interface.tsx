import { Module } from 'src/module';
import './index.css';
import { UserInterfaceLoader } from './user-interface-loader';
import { ModuleDependencies } from 'src/module-loader';

export enum Side {
    Left,
    Right,
}

export class UserInterface {
    private readonly userInterfaceLoader!: UserInterfaceLoader;
    private module!: Module;

    constructor(deps: ModuleDependencies) {
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
    addContextItem(Item: JSX.ElementType) {
        this.userInterfaceLoader.contextItems.add(this.getItem(Item));
    }
    addHeaderItem(Item: JSX.ElementType, side: Side = Side.Left) {
        if (side === Side.Left) {
            this.userInterfaceLoader.headerLeftItems.add(this.getItem(Item));
        } else {
            this.userInterfaceLoader.headerRightItems.add(this.getItem(Item));
        }
    }
    addFooterItem(Item: JSX.ElementType, side: Side = Side.Left) {
        if (side === Side.Left) {
            this.userInterfaceLoader.footerLeftItems.add(this.getItem(Item));
        } else {
            this.userInterfaceLoader.footerRightItems.add(this.getItem(Item));
        }
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
