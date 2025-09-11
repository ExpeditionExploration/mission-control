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
        if (batteryLevel < 12) {
            setBatteryIcon(<BatteryWarning color="red" />);
        } else if (batteryLevel < 30) {
            setBatteryIcon(<BatteryLow color="orange" />);
        } else if (batteryLevel < 70) {
            setBatteryIcon(<BatteryMedium />);
        } else {
            setBatteryIcon(<BatteryFull />);
        }
    }, [batteryLevel]);

    return (
        <div className="flex flex-x-space-2 rounded-full justify-center items-center duration-500 transition-colors">
            {batteryIcon}
            <h3 className="ml-2">{batteryLevel ?? '?'}</h3>
        </div>
    );
};