import { createContext } from "react";

export type ApplicationContextType = {
    contextItems: JSX.Element[];
};
export const defaultApplicationContext: ApplicationContextType = {
    contextItems: [],
};
export const ApplicationContext = createContext<ApplicationContextType>(
    defaultApplicationContext,
);
