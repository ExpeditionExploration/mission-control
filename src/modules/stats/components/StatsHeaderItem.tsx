// import { useEvents } from 'src/client/hooks';
import { ViewProps } from 'src/client/user-interface';
import { type StatsModule } from '../view';
import { useEffect, useState } from 'react';
import { Stats } from '../types';
import { Cpu, HardDrive, MemoryStick, Thermometer } from 'lucide-react';
import { cn } from 'src/client/utility';

export const StatsHeaderItem: React.FC<ViewProps<StatsModule>> = ({
    module,
}) => {
    const [stats, setStats] = useState<Stats>({
        temperature: 0,
        cpu: 0,
        memory: 0,
        storage: 0,
    });
    useEffect(() => {
        module.on<Stats>('stats', (data) => {
            console.log('Stats', data);
            setStats(data);
        });
    }, []);
    return (
        <div>
            <div className="grid grid-rows-2 grid-cols-2 gap-2">
                <StatItem
                    title="Temperature"
                    icon={<Thermometer />}
                    warnAt={10}
                    value={stats.temperature * 100}
                    symbol="°"
                ></StatItem>
                <StatItem
                    title="CPU"
                    icon={<Cpu />}
                    warnAt={10}
                    value={stats.cpu * 100}
                    symbol="%"
                ></StatItem>
                <StatItem
                    title="Memory"
                    icon={<MemoryStick />}
                    warnAt={10}
                    value={stats.memory * 100}
                    symbol="%"
                ></StatItem>
                <StatItem
                    title="Storage"
                    icon={<HardDrive />}
                    warnAt={10}
                    value={stats.storage * 100}
                    symbol="%"
                ></StatItem>
            </div>
        </div>
    );
};

interface StatValueProps {
    warnAt?: number;
    value: number;
    symbol?: string;
    title?: string;
    icon?: JSX.Element;
}
const StatItem: React.FC<StatValueProps> = ({
    icon,
    symbol,
    value,
    warnAt = 0,
    title,
}) => (
    <div
        title={title}
        className={cn(
            'flex space-x-2 items-center duration-500 transition-colors',
            {
                'text-red-500': value && value > warnAt,
            },
        )}
    >
        {icon}
        <div className="w-10">
            <span className="font-bold">{value.toFixed(0)}</span>
            {symbol}
        </div>
    </div>
);
