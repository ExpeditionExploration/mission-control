import React, { useEffect, useState } from "react";
import { ViewProps } from 'src/client/user-interface';
import { BatteryWarning, BatteryLow, BatteryMedium,
    BatteryFull, Timer, LucideProps } from "lucide-react";
import { BatteryModuleClient } from "../client";
import { BatteryStatus } from '../types';
import { cn } from 'src/client/utility';

export const BatteryStats: React.FC<ViewProps<BatteryModuleClient>> = ({ module }) => {
    const [batteryLevel, setBatteryLevel] = React.useState<number | null>(null);
    const [minutesRemaining, setMinutesRemaining] = React.useState<number | null>(null);
    // Store the icon as a component type (not an element) to match StatItem expectations
    const [batteryIcon, setBatteryIcon] = React.useState<
        React.ForwardRefExoticComponent<Omit<LucideProps, 'ref'>>>(BatteryFull);

    useEffect(() => {
        // Listen to status updates for immediate values
        module.on('status', (status: BatteryStatus) => {
            setBatteryLevel(status.level);
            setMinutesRemaining(status.minutesRemaining);
            module.logger.debug('Battery status', status);
        });
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
            <div className="grid grid-rows-2 grid-cols-1 gap-1">
                <BatteryPercentage
                    title="Battery left"
                    icon={BatteryFull}
                    warnAt={25}
                    value={batteryLevel}
                    symbol="%"
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
