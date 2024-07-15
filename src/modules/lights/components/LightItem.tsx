import { useState } from 'react';
import { SunIcon } from 'lucide-react';
import { cn } from 'src/client/utility';
import { Switch } from '@headlessui/react';

export enum LightColor {
    Yellow,
    Violet,
    Red,
    Blue,
}

export const LightItem: React.FC<{
    color?: LightColor;
    brightness?: number;
}> = ({ color = LightColor.Yellow, brightness = 1 }) => {
    const [enabled, setEnabled] = useState(false);
    return (
        // <LightbulbIcon
        //     size={20}
        //     onClick={() => setOn(!on)}
        //     className={cn({
        //         'text-yellow-400 ': color === LightColor.Yellow,
        //         'text-blue-500 shadow-blue-500': color === LightColor.Blue,
        //         'text-red-500 shadow-red-500': color === LightColor.Red,
        //         'text-violet-500 shadow-violet-500':
        //             color === LightColor.Violet,
        //         '!text-gray-600': !on,
        //         'drop-shadow-xl stroke-white': on,
        //     })}
        // />

        <Switch
            checked={enabled}
            onChange={setEnabled}
            style={
                {
                    // boxShadow: `0 0 ${enabled ? brightness * 10 : 0}px`,
                }
            }
            className={cn(
                {
                    'data-[checked]:bg-blue-600 !border-blue-300':
                        enabled && color === LightColor.Blue,
                    'data-[checked]:bg-yellow-400 !border-yellow-100':
                        enabled && color === LightColor.Yellow,
                    'data-[checked]:bg-red-600 !border-red-300':
                        enabled && color === LightColor.Red,
                    'bg-gray-200': !enabled,
                },
                'group flex h-6 relative border-2 border-white w-11 bg-transparent items-center rounded-full transition',
            )}
        >
            <span className="size-4 relative space-x-1 flex items-center translate-x-1 text-xs transition group-data-[checked]:translate-x-6">
                <SunIcon size={14} className="shrink-0" />
                <span className="">IR</span>
            </span>

            {/* <span className="absolute right-1 text-xs">IR</span> */}
        </Switch>

        // <div
        //     onClick={() => setOn(!on)}
        //     style={{
        //         boxShadow: `0 0 ${on ? 10 * brightness : 0}px`,
        //     }}
        //     className={cn(
        //         {
        //             'bg-yellow-400 shadow-yellow-400':
        //                 color === LightColor.Yellow,
        //             'bg-blue-500': color === LightColor.Blue,
        //             'bg-red-500': color === LightColor.Red,
        //             'bg-violet-500': color === LightColor.Violet,
        //             'bg-transparent': !on,
        //             'opacity-10': brightness > 0,
        //             'opacity-20': brightness > 0.1,
        //             'opacity-30': brightness > 0.2,
        //             'opacity-40': brightness > 0.3,
        //             'opacity-50': brightness > 0.4,
        //             'opacity-60': brightness > 0.5,
        //             'opacity-70': brightness > 0.6,
        //             'opacity-80': brightness > 0.7,
        //             'opacity-90': brightness > 0.8,
        //             'opacity-100': brightness > 0.9,
        //         },
        //         'border-2 rounded-md w-6 h-6 flex justify-center items-center transition-shadow',
        //     )}
        // >
        //     IR
        // </div>
    );
};
