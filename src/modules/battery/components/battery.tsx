import React from "react";
import { ViewProps } from 'src/client/user-interface';
import { BatteryModuleClient } from "../client";


export const Battery: React.FC<ViewProps<BatteryModuleClient>> = ({
    module,
}) => {

    const [batteryLevel, setBatteryLevel] = React.useState<number | null>(null);

    module.on('status', (status) => {
        setBatteryLevel(status.level);
        module.logger.debug('Battery status', status);
    });
    return (
        <div>
            <h3>Battery Level</h3>
            <p>{batteryLevel ?? 100}%</p>
        </div>
    );
};