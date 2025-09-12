import React, { useEffect } from "react";
import { ViewProps } from 'src/client/user-interface';
import { BatteryWarning, BatteryLow, BatteryMedium, BatteryFull } from "lucide-react";
import { BatteryModuleClient } from "../client";


export const Battery: React.FC<ViewProps<BatteryModuleClient>> = ({
    module,
}) => {

    const [batteryLevel, setBatteryLevel] = React.useState<number | null>(null);
    const [batteryIcon, setBatteryIcon] = React.useState<React.ReactNode>(<BatteryFull />);

    module.on('status', (status) => {
        setBatteryLevel(status.level);
        module.logger.debug('Battery status', status);
    });

    useEffect(() => {
        if (batteryLevel < 25) {
            setBatteryIcon(<BatteryWarning color="red" width={'w-4'} />);
        } else if (batteryLevel < 50) {
            setBatteryIcon(<BatteryLow color="orange" width={'w-4'} />);
        } else if (batteryLevel < 75) {
            setBatteryIcon(<BatteryMedium width={'w-4'} />);
        } else {
            setBatteryIcon(<BatteryFull width={'w-4'} />);
        }
    }, [batteryLevel]);

    return (
        <div className="flex space-x-2 px-1 w-16 rounded-full justify-center items-center duration-500 transition-colors">
            {batteryIcon}
            <span className="text-xs font-bold font-mono">{batteryLevel + '%'}</span>
        </div>
    );
};