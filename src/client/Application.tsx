import { useEffect, useState } from 'react';
import './App.css';
import {
    ApplicationContext,
    ApplicationContextType,
    defaultApplicationContext,
} from './ApplicationContext';

export function Application({
    contextReady,
}: {
    contextReady: (
        setContext: React.Dispatch<
            React.SetStateAction<ApplicationContextType>
        >,
    ) => void;
}) {
    const [context, setContext] = useState<ApplicationContextType>(
        defaultApplicationContext,
    );

    useEffect(() => {
        contextReady(setContext);
    }, [setContext]);

    return (
        <ApplicationContext.Provider value={context}>
            <div>{...context.contextItems}</div>
        </ApplicationContext.Provider>
    );
}
