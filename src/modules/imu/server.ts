import { Module } from 'src/module';
import { IMU, SensorEvent, SensorId } from './class/IMU'; // SensorEvent comes from IMU
import { ServerModuleDependencies } from 'src/server/server';
import { Acceleration, Orientation } from './types';

export class IMUModuleServer extends Module {

    private samplingFrequency = 10

    private imu: IMU
    private previousTime: number

    onModuleInit(): void | Promise<void> {
        this.imu = new IMU(1, 0x4b);
        this.imu.open()
        this.imu.setMeasurementCallback(this.onMeasurement)
        this.imu.enableSensor(SensorId.SH2_ROTATION_VECTOR, this.samplingFrequency)
        this.imu.enableSensor(SensorId.SH2_LINEAR_ACCELERATION, this.samplingFrequency)
        this.imu.devOn()
        this.doServicePeriodically(100)
    }

    private onMeasurement = (ev: SensorEvent, cookie: Object): void => {
        switch (ev.reportId) {
            case SensorId.SH2_LINEAR_ACCELERATION:
                // Don't add delay. Timestamp is sensor's timestamp the sample
                // was taken.
                const timestamp =
                    +this.toMs(ev.timestampMicroseconds)
                this.emit<Acceleration>(
                    'accelerationReceived', {
                    x: +ev.x,
                    y: +ev.y,
                    z: +ev.z,
                    timestamp,
                    timeDelta: timestamp - this.previousTime
                }
                )
                this.previousTime = timestamp
                break;

            case SensorId.SH2_ROTATION_VECTOR:
                this.emit<Orientation>(
                    "orientationReceived",
                    [ev.yaw, ev.pitch, ev.roll]
                )
                break;
        }
    }

    private doServicePeriodically(ms: number): void {
        setInterval(() => {
            this.imu.service()
        }), this.samplingFrequency
    }

    private toMs = (us: bigint): number => {
        return Number(us / 1000n)
    }
}
