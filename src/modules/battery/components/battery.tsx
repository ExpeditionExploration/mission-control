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
            setBatteryIcon(<BatteryWarning color="red" fontSize={'text-xs'} />);
        } else if (batteryLevel < 50) {
            setBatteryIcon(<BatteryLow color="orange" fontSize={'text-xs'} />);
        } else if (batteryLevel < 75) {
            setBatteryIcon(<BatteryMedium fontSize={'text-xs'} />);
        } else {
            setBatteryIcon(<BatteryFull fontSize={'text-xs'} />);
        }
    }, [batteryLevel]);

    return (
        <div className="flex flex-x-space-2 rounded-full justify-center items-center duration-500 transition-colors">
            {batteryIcon}
            <h3 className="ml-2 text-xs font-bold font-mono">{batteryLevel + '%'}</h3>
        </div>
    );
};