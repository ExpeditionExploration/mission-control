import { useEffect, useState } from 'react';
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
    name?: string;
    setLight: (brightness: number) => Promise<void>;
}> = ({ color = LightColor.Yellow, brightness = 1, name = '', setLight }) => {
    const [lightIsOn, setLightIsOn] = useState<boolean>(false);

    useEffect(() => {
        if (lightIsOn) {
            setLight(100);
        } else {
            setLight(0);
        }
    }, [lightIsOn]);

    return (
        <Switch
            checked={lightIsOn}
            onChange={setLightIsOn}
            className={cn(
                {
                    'data-[checked]:bg-blue-600 !border-blue-300':
                        brightness && color === LightColor.Blue,
                    'data-[checked]:bg-yellow-600 !border-yellow-300':
                        brightness && color === LightColor.Yellow,
                    'data-[checked]:bg-red-600 !border-red-300':
                        brightness && color === LightColor.Red,
                    'bg-gray-200': !brightness,
                },
                'group flex h-6 relative border-2 border-white w-14 bg-transparent items-center rounded-full transition',
            )}
            title={`Toggle ${name}`}
        >
            <span className="w-full relative flex items-center px-0 text-[0.6rem]">
                <div className="absolute flex items-center space-x-1 left-1 opacity-100">
                    <SunIcon
                        size={10}
                        className="shrink-0 transition group-data-[checked]:translate-x-8"
                    />{' '}
                    <span className="group-data-[checked]:opacity-0">
                        {name}
                    </span>
                </div>
                <div className="absolute left-1 opacity-0 font-bold transition group-data-[checked]:opacity-100">
                    {(brightness * 100).toFixed(0)}%
                </div>
            </span>
        </Switch>
    );
};
