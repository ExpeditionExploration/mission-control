
import { ScanData } from '../../../tof/types';
import { TOFKeeper } from '../class/TOFKeeper';
import React, { useRef, useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { Payload } from 'src/connection';
import * as THREE from 'three';

export interface TOFProps {
    dronePosition: [number, number, number];
    droneOrientation: { yaw: number; pitch: number; roll: number };
    /** Multiplier applied to distance (and thus sphere placement & size). Default 1.0 */
    scale?: number;
}


export const TOFArray = (props: TOFProps) => {
    const [zones, setZones] = useState<ScanData | undefined>();
    const droneGroupRef = useRef<THREE.Group>(new THREE.Group());
    const keeperRef = useRef<TOFKeeper | null>(null);
    const { scene } = useThree();

    // Initialise keeper once
    if (!keeperRef.current) {
        keeperRef.current = new TOFKeeper(droneGroupRef.current, scene);
    }

    useEffect(() => {
        const tofChannel = new BroadcastChannel('tof-data');
        const handleMessage = (event: MessageEvent<Payload>) => {
            const payload = event.data;
            if (payload.namespace === 'tof') setZones(payload.data as ScanData);
        };
        tofChannel.addEventListener('message', handleMessage);
        return () => {
            tofChannel.removeEventListener('message', handleMessage);
            tofChannel.close();
        };
    }, []);

    // Sync proxy drone group transform with props
    useEffect(() => {
        const g = droneGroupRef.current;
        g.position.set(...props.dronePosition);
        // Convert yaw/pitch/roll (deg) into quaternion (assuming order Y (yaw), X (pitch), Z (roll) maybe) – minimally keep mapping
        const yaw = THREE.MathUtils.degToRad(props.droneOrientation.yaw || 0);
        const pitch = THREE.MathUtils.degToRad(props.droneOrientation.pitch || 0);
        const roll = THREE.MathUtils.degToRad(props.droneOrientation.roll || 0);
    g.setRotationFromEuler(new THREE.Euler(pitch, yaw, roll, 'YXZ'));
    }, [props.dronePosition, props.droneOrientation]);

    useEffect(() => {
        if (zones && keeperRef.current) {
            const scale = props.scale ?? 1.0;
            if (scale === 1.0) {
                keeperRef.current.update(zones);
            } else {
                // Create a scaled copy of scan data distances
                const scaled = { ...zones, scanZones: zones.scanZones.map(z => z ? { ...z, distanceMillimeters: z.distanceMillimeters * scale } : z) } as ScanData;
                keeperRef.current.update(scaled);
            }
        }
    }, [zones, props.scale]);

    return (<></>);
};
