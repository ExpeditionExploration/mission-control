import { useEffect } from "react"
import Module from "../Module";
import clsx from "clsx";
import FooterController from "../../components/FooterController";


export const Angle: Module = {
    left: () => {
        return (
            <>
                <FooterController
                    icon={
                        <div className='h-8 w-16 relative border-2 border-white rounded-lg'>
                            <div className='absolute left-8 right-0 top-1/2 mt-[-1px] border-t-[2px] border-white'></div>
                        </div>
                    }
                    name='Pitch' />

                <FooterController
                    icon={
                        <div className='h-8 w-8 relative border-2 border-white rounded-full'>
                            <div className='absolute bottom-4 top-0 left-1/2 ml-[-1px] border-r-[2px] border-white'></div>
                        </div>
                    }
                    name='Roll' />
            </>
        )
    }
}