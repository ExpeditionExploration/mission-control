import { useEffect, useState, FunctionComponent } from "react"
import type Module from "../Module";
import clsx from "clsx";

type Stats = {
    cpu: number;
    mem: number;
    temp: number;
}
const precision = 0;
const baseStyle = 'text-xs w-[50px] p-1 text-center rounded border-2 border-transparent';
const warningStyle = 'bg-red-600 !font-bold shadow-xl animate-pulse !border-white';

export const Stats: Module = {
    header: ({
        events,
        send
    }) => {
        const [state, setState] = useState<Stats>({
            cpu: 0,
            mem: 0,
            temp: 0
        });

        useEffect(() => {
            events.on('module:Stats', (stats: Stats) => setState({
                cpu: stats.cpu || 0,
                mem: stats.mem || 0,
                temp: stats.temp || 0
            }));
        }, []);

        return (
            <>
                <div className='space-x-2 flex font-semibold items-center'>
                    <div className={clsx(baseStyle, state.cpu > 80 && warningStyle)}>CPU<br />{state.cpu.toFixed(precision)}%</div>
                    <div className={clsx(baseStyle, state.mem > 80 && warningStyle)}>MEM<br />{state.mem.toFixed(precision)}%</div>
                    <div className={clsx(baseStyle, state.temp > 80 && warningStyle)}>TEMP<br />{state.temp.toFixed(precision)}°c</div>
                </div>
            </>
        )
    }
}