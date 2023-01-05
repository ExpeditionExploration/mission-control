import { useEffect } from "react"
import Module, { ModuleLocation } from "../ClientModule";

export class Angle extends Module {
    static location: ModuleLocation = "left";
    state = {
        cpu: 0,
        ram: 0,
        temp: 0,
    }

    componentDidMount() {
        
    }

    render() {
        return (
            <>
                
            </>
        )
    }
}
