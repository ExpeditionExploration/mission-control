
import { Orientation } from '../../imu/types';
import { ScanData } from '../types';
import { TOFModuleClient } from '../client';
import React from 'react';
import { useEffect, useState } from 'react';
import { ViewProps } from 'src/client/user-interface';
import { Payload } from 'src/connection';

export const TOFArray: React.FC<ViewProps<TOFModuleClient>> = ({
    module,
}) => {
    const [zones, setZones] = useState<ScanData | undefined>();

    useEffect(() => {
        const spatialChannel = new BroadcastChannel('tof-data');

        const handleMessage = (event: MessageEvent<Payload>) => {
            const payload = event.data;
            console.log('Received TOF data', payload);
            if (payload.namespace === 'tof') setZones(payload.data as ScanData);
        };

        spatialChannel.addEventListener('message', handleMessage);

        return () => {
            spatialChannel.removeEventListener('message', handleMessage);
            spatialChannel.close();
        };
    }, []);

    return (
        <div>
            <h3>TOF Sensor Data</h3>
        </div>
    );
}