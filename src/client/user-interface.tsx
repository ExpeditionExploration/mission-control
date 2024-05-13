import { Injectable } from '@module';

import { ApplicationContextType } from './root';
import './index.css';

export type SetContextFunction = React.Dispatch<
    React.SetStateAction<ApplicationContextType>
>;

@Injectable()
export class UserInterface {
    private setContext!: SetContextFunction;

    async init(setContext: SetContextFunction) {
        this.setContext = setContext;
    }

    addContextItem(item: JSX.Element) {
        this.setContext((prev) => {
            return {
                contextItems: [...prev.contextItems, item],
            };
        });
    }
}

export default UserInterface;
