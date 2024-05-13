import 'reflect-metadata';
import Connection from 'src/connection';
import { container } from 'src/container';
import { Application } from 'src/application';
import ClientConnection from './client-connection';
import ClientApplication from './client-application';
import UserInterface from './user-interface';

import './App.css';
import {
    Fragment,
    StrictMode,
    createContext,
    useEffect,
    useState,
} from 'react';

export type ApplicationContextType = {
    setContext?: React.Dispatch<React.SetStateAction<ApplicationContextType>>;
    contextItems: JSX.Element[];
};
const defaultApplicationContext: ApplicationContextType = {
    setContext: () => {},
    contextItems: [],
};
const ApplicationContext = createContext<ApplicationContextType>(
    defaultApplicationContext,
);

export function Root() {
    const [context, setContext] = useState<ApplicationContextType>(
        defaultApplicationContext,
    );

    useEffect(() => {
        // Start the application
        container.registerSingleton(Application, ClientApplication);
        container.registerSingleton(Connection, ClientConnection);
        container.registerSingleton(UserInterface, UserInterface);

        const application = container.resolve(Application) as ClientApplication;
        application.init(setContext);

        return () => {
            container.clearInstances();
            container.reset();
            application.destroy();
            setContext(defaultApplicationContext);
        };
    }, []);

    return (
        <ApplicationContext.Provider
            value={{
                ...context,
                setContext,
            }}
        >
            <div>{...context.contextItems}</div>
        </ApplicationContext.Provider>
    );
}
