// import { useEvents } from 'src/client/hooks';
import { ViewProps } from 'src/client/user-interface';
import { type AngleModuleClient } from '../client';
import { useEffect, useState } from 'react';
import { Roll } from './types';

export const RollFooterItem: React.FC<ViewProps<AngleModuleClient>> = ({
    module,
}) => {
    const [roll, setRoll] = useState<Roll>(0);
    useEffect(() => {
        module.on<Roll>('roll', (roll) => {
            setRoll(roll);
        });
    }, []);

    return (
        <div className="relative flex w-14 h-14 justify-center items-end" title='Roll'>
            <div className="text-xs font-bold text-center relative z-10 bg-black/80 px-2 py-1 rounded-full w-12 -mb-4">
                {roll.toFixed(0)}°
            </div>
            <div
                style={{
                    transform: `rotateX(0deg) rotateY(0deg) rotateZ(${roll}deg)`,
                }}
                className="w-full aspect-square absolute bottom-0 transition-transform  border-2 border-white rounded-full"
            >
                <div className="absolute bottom-1/2 top-0 left-1/2 ml-[-1px] border-r-[2px] border-white"></div>
            </div>
        </div>
    );
};
