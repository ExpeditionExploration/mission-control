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
    name?: string;
    setLight: (brightness: number) => Promise<void>;
}> = ({ color = LightColor.Yellow, name = '', setLight }) => {
    const [brightness, setBrightness] = useState<number>(0);
    const modes = 5;

    useEffect(() => {
        setLight(((modes - brightness) % modes) * (1 / (modes - 1)));
    }, [brightness]);

    return (
        <Switch
            checked={brightness > 0}
            onChange={() => {setBrightness((old) => (old + 1) % modes)}}
            className={cn(
                {
                    'data-[checked]:bg-blue-600 !border-blue-300':
                        brightness > 0 && color === LightColor.Blue,
                    'data-[checked]:bg-yellow-600 !border-yellow-300':
                        brightness > 0 && color === LightColor.Yellow,
                    'data-[checked]:bg-red-600 !border-red-300':
                        brightness > 0 && color === LightColor.Red,
                    'bg-gray-200': brightness === 0,
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
                    {((modes - brightness) * (1 / (modes - 1)) * 100).toFixed(0)}%
                </div>
            </span>
        </Switch>
    );
};
