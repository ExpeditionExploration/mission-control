import { useContext } from "react";
import { ApplicationContext } from "./ApplicationContext";

export function useEvents() {
    const context = useContext(ApplicationContext);
    return context.contextItems;
}