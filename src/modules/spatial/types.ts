import { Orientation } from '../imu/types';

export type Stats = {
    temperature: number;
    cpu: number;
    memory: number;
    storage: number;
}

type Heading = number;
export type AngleStatus = {
    angle: Orientation,
    heading: Heading
}