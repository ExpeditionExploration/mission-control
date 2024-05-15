import { Inject, Injectable } from 'src/inject';
import { Module, ModuleSymbol } from 'src/module';
import './index.css';
import { UserInterfaceLoader } from './user-interface-loader';
import { LazyServiceIdentifer } from 'inversify';

export enum Side {
    Left,
    Right,
}

@Injectable()
export class UserInterface {
    @Inject(UserInterfaceLoader)
    private readonly userInterfaceLoader!: UserInterfaceLoader;
    @Inject(new LazyServiceIdentifer(() => ModuleSymbol))
    private readonly module!: Module;

    init() {
        console.log('View init', this.module);
    }

    generateKey() {
        return Math.random().toString(36).substring(7);
    }
    addContextItem(Item: JSX.ElementType) {
        this.userInterfaceLoader.contextItems.add(
            <Item key={this.generateKey()} />,
        );
    }
    addHeaderItem(item: JSX.Element, side: Side) {
        if (side === Side.Left) {
            this.userInterfaceLoader.headerLeftItems.add(item);
        } else {
            this.userInterfaceLoader.headerRightItems.add(item);
        }
    }
    addFooterItem(item: JSX.Element, side: Side) {
        if (side === Side.Left) {
            this.userInterfaceLoader.footerLeftItems.add(item);
        } else {
            this.userInterfaceLoader.footerRightItems.add(item);
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
