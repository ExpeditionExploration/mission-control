import { useEffect } from "react"
import Module, { ModuleLocation } from "../ClientModule";

export class Angle extends Module {
    static location: ModuleLocation = "left";

    componentDidMount() {
        
    }

    render() {
        return (
            <>
                <div className='space-y-2'>
                    <div className='h-16 flex justify-center items-center'>
                        <div className='h-8 w-16 relative border-2 border-white rounded-lg'>
                            <div className='absolute left-8 right-0 top-1/2 mt-[-1px] border-t-[2px] border-white'></div>
                        </div>
                    </div>
                    <div className='text-xs'>Pitch</div>
                </div>
                <div className='space-y-2'>
                    <div className='h-16 flex justify-center items-center'>
                        <div className='h-8 w-8 relative border-2 border-white rounded-full'>
                            <div className='absolute bottom-4 top-0 left-1/2 ml-[-1px] border-r-[2px] border-white'></div>
                        </div>
                    </div>
                    <div className='text-xs'>Roll</div>
                </div>
            </>
        )
    }
}
