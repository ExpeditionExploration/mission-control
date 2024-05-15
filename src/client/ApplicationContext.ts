import { createContext } from "react";
// import Broadcaster from "src/broadcaster";

export type ApplicationContextType = {
    // broadcaster: Broadcaster | null;
    contextItems: JSX.Element[];
};
export const defaultApplicationContext: ApplicationContextType = {
    contextItems: [],
    // broadcaster: null,
};
export const ApplicationContext = createContext<ApplicationContextType>(
    defaultApplicationContext,
);
