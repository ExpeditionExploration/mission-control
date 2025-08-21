// This module depends on the imu
import { Acceleration } from "../imu/types";

export { type Acceleration }
export type Speed = {
    x: number;
    y: number;
    z: number;
    timestamp: number;
    timeDelta: number;
}
export type Location = {
    x: number;
    y: number;
    z: number;
    timestamp: number;
    timeDelta: number;
}