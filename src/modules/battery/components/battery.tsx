import React, { useEffect, useMemo, useState } from "react";
import { ViewProps } from 'src/client/user-interface';
import { BatteryWarning, BatteryLow, BatteryMedium,
    BatteryFull, Timer, LucideProps } from "lucide-react";
import { BatteryModuleClient } from "../client";
import { BatteryStatus } from '../types';
import { cn } from 'src/client/utility';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export const BatteryStats: React.FC<ViewProps<BatteryModuleClient>> = ({ module }) => {
    const [batteryLevel, setBatteryLevel] = React.useState<number | null>(null);
    const [minutesRemaining, setMinutesRemaining] = React.useState<number | null>(null);
    // Store the icon as a component type (not an element) to match StatItem expectations
    const [batteryIcon, setBatteryIcon] = React.useState<
        React.ForwardRefExoticComponent<Omit<LucideProps, 'ref'>>>(BatteryFull);

    const graphDataMaxLength = 60;
    const [graphDataPoints, setGraphDataPoints] = useState<number[]>(
        new Array(graphDataMaxLength).fill(0)
    );

    // Use functional state update to avoid stale closures
    const addGraphDataPoint = (point: number) => {
        setGraphDataPoints(prev => {
            const next = [...prev, point];
            if (next.length > graphDataMaxLength) next.shift();
            module.logger.debug('Graph data length', next.length);
            return next;
        });
    };

    useEffect(() => {
        const handler = (status: BatteryStatus) => {
            setBatteryLevel(status.level);
            setMinutesRemaining(status.minutesRemaining);
            if (typeof status.currentDraw === 'number') addGraphDataPoint(status.currentDraw);
            module.logger.debug('Battery status', status);
        };
        module.on('status', handler);
        return () => {
            // remove listener on unmount/reconnect
            // @ts-ignore
            module.off?.('status', handler);
        };
    }, [module]);

    useEffect(() => {
        if (batteryLevel !== null) {
            if (batteryLevel < 25) {
                setBatteryIcon(BatteryWarning);
            } else if (batteryLevel < 50) {
                setBatteryIcon(BatteryLow);
            } else if (batteryLevel < 75) {
                setBatteryIcon(BatteryMedium);
            } else {
                setBatteryIcon(BatteryFull);
            }
        }
    }, [batteryLevel]);

    
    return (
        <div>
            <div className="grid grid-rows-2 grid-cols-2 gap-1">
                <BatteryPercentage
                    title="Battery left"
                    icon={batteryIcon}
                    warnAt={25}
                    value={batteryLevel}
                    symbol="%"
                />
                <CurrentUsageGraph
                    dataPointInterval={5}
                    dataPoints={graphDataPoints}
                />
                <BatteryTimeRemaining
                    title="Time left"
                    warnAt={20}
                    value={minutesRemaining}
                />
            </div>
        </div>
    );
};

interface StatValueProps {
    warnAt?: number;
    value: number;
    symbol?: string;
    title?: string;
    icon?: any;
}

const BatteryPercentage: React.FC<StatValueProps> = (props: StatValueProps) => (
    <div
        title={props.title}
        className={cn(
            'flex space-x-2 px-1 w-16 rounded-full justify-center items-center duration-500 transition-colors',
            {
                'bg-red-500': props.value && props.value < props.warnAt,
            },
        )}>
        {props.icon && <props.icon className="w-4" />}
        <div className="text-xs font-bold font-mono">
            <span>{Number.isFinite(props.value) ? props.value.toFixed(0) : '-'}</span>
            <span>{props.symbol}</span>
        </div>
    </div>
);

const BatteryTimeRemaining: React.FC<StatValueProps> = (props: StatValueProps) => {
    const hours = Number.isFinite(props.value) ? (props.value / 60).toFixed(0) : '-';
    const minutes = Number.isFinite(props.value) ? (props.value % 60).toFixed(0) : '-';
    return (
        <div
            title={props.title}
            className={cn(
                'flex space-x-2 px-1 w-16 rounded-full justify-center items-center duration-500 transition-colors',
                {
                    'bg-red-500': props.value && props.value < props.warnAt,
                },
            )}>
            {props.icon && <props.icon className="w-4" />}
            <div className="text-xs font-bold font-mono">
                <span>{`${hours}h ${minutes}m`}</span>
            </div>
        </div>
    )
};

type CurrentUsageProps = {
    dataPointInterval: number; // in seconds
    dataPoints: number[];
};

const CurrentUsageGraph: React.FC<CurrentUsageProps> = (props: CurrentUsageProps) => {
    // Generate simple time labels like "55s", "50s", ...
    const labels = useMemo(
        () => props.dataPoints.map((_, i) => {
            const secondsAgo = (props.dataPoints.length - i) * props.dataPointInterval;
            return `${secondsAgo}s`;
        }),
        [props.dataPoints, props.dataPointInterval]
    );

    const data = useMemo(() => ({
        labels,
        datasets: [
            {
                label: '',
                data: props.dataPoints, // keep numeric data for accuracy and types
                borderColor: '#ffffff',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                fill: true,
                tension: 0.3,
                pointRadius: 0,
                borderWidth: 1,
            },
        ],
    }), [labels, props.dataPoints]);

    // Localized thousands separator for tooltip values
    const numberFormatter = useMemo(() => new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }), []);

    // External HTML tooltip tailored for this graph
    const externalTooltipHandler = React.useCallback((context: any) => {
        const { chart, tooltip } = context;
        const parent = (chart?.canvas?.parentNode as HTMLElement) ?? null;
        if (!parent) return;

        if (getComputedStyle(parent).position === 'static') {
            parent.style.position = 'relative';
        }

        let el = parent.querySelector('.current-usage-tooltip') as HTMLDivElement | null;
        if (!el) {
            el = document.createElement('div');
            el.className = 'current-usage-tooltip';
            // base styles for tooltip
            el.style.position = 'absolute';
            el.style.pointerEvents = 'none';
            el.style.transform = 'translate(-50%, -100%)';
            el.style.zIndex = '20';
            el.style.background = 'rgba(10,14,22,0.92)';
            el.style.color = '#fff';
            el.style.border = '1px solid rgba(255,255,255,0.2)';
            el.style.borderRadius = '6px';
            el.style.padding = '2px 6px';
            el.style.font = '11px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
            el.style.whiteSpace = 'nowrap';
            el.style.textShadow = '0 1px 2px rgba(0,0,0,0.6)';
            el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.35)';
            parent.appendChild(el);
        }

        if (!tooltip || tooltip.opacity === 0) {
            el.style.opacity = '0';
            return;
        }

        const lines: string[] = [];
        const dps = tooltip.dataPoints as any[] | undefined;
        if (Array.isArray(dps)) {
            for (const dp of dps) {
                const yVal = typeof dp.parsed?.y === 'number' ? dp.parsed.y : (typeof dp.raw === 'number' ? dp.raw : parseFloat(String(dp.raw)));
                const valueStr = Number.isFinite(yVal) ? numberFormatter.format(yVal) : '-';
                const label = dp.dataset?.label || '';
                lines.push(label ? `${label}: ${valueStr} mA` : `${valueStr} mA`);
            }
        }
        el.innerHTML = lines.join('<br/>');

        const canvas = chart.canvas as HTMLCanvasElement;
        el.style.left = `${canvas.offsetLeft + tooltip.caretX}px`;
        el.style.top = `${canvas.offsetTop + tooltip.caretY}px`;
        el.style.opacity = '1';
    }, [numberFormatter]);

    const options = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        animation: false as const,
        layout: { padding: 0 },
        plugins: {
            legend: { display: false },
            title: { display: false },
            tooltip: {
                enabled: false,
                external: externalTooltipHandler,
            } as any,
        },
        interaction: { mode: 'index', intersect: false },
        scales: {
            x: {
                // Hide entire x-axis (ticks, labels, grid, border) and free its space
                display: false,
            },
            y: {
                // Hide entire y-axis so no left gutter is reserved
                display: false,
            },
        },
    }), [props.dataPoints.length, props.dataPointInterval, externalTooltipHandler]);

    return (
        <div
            className={`flex align-bottom-0 w-16 shrink-0 row-span-2 p-0 rounded justify-center items-center min-h-full relative`}>
            <Line data={data} options={options} className="w-full" height={52} />
        </div>
    );
};
