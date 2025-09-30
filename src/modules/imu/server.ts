import { Module } from 'src/module';
import { IMU, SensorEvent, SensorId } from './class/IMU'; // SensorEvent comes from IMU
import { Acceleration, Orientation, Speed } from './types';

export class IMUModuleServer extends Module {

    private samplingInterval = 20

    private accelerationIntegrator = new TriAxisIntegrator()
    private currentYpr: [number, number, number] = [0, 0, 0]
    private imu: IMU
    private previousTime: number
    private speed: [number, number, number] = [0, 0, 0]

    onModuleInit(): void | Promise<void> {
        this.imu = new IMU(5, 0x4b);
        this.imu.open()
        this.imu.setMeasurementCallback(this.onMeasurement)
        this.imu.enableSensor(SensorId.SH2_ROTATION_VECTOR, this.samplingInterval)
        this.imu.enableSensor(SensorId.SH2_LINEAR_ACCELERATION, this.samplingInterval)
        this.imu.useInterrupts()
        this.imu.devOn()
    }

    onModuleConfigReceived(): void | Promise<void> {
    }

    private onMeasurement = (ev: SensorEvent, cookie: Object): void => {
        switch (ev.reportId) {
            case SensorId.SH2_LINEAR_ACCELERATION:
                // Don't add delay. Timestamp is sensor's timestamp the sample
                // was taken.
                const timestamp =
                    +this.toMs(ev.timestampMicroseconds)

                // Compute acceleration in world coordinates (Y=up, -Z=forward, X=right)
                const ax = +ev.x, ay = +ev.y, az = +ev.z;
                const [yaw, pitch, roll] = this.currentYpr;
                const cy = Math.cos(yaw), sy = Math.sin(yaw);
                const cp = Math.cos(pitch), sp = Math.sin(pitch);
                const cr = Math.cos(roll), sr = Math.sin(roll);

                // Drone local to world
                const ax_w = ax * (cy * cp) + ay * (cy * sp * sr - sy * cr) + az * (cy * sp * cr + sy * sr)
                const ay_w = ax * (sy * cp) + ay * (sy * sp * sr + cy * cr) + az * (sy * sp * cr - cy * sr)
                const az_w = ax * (-sp) + ay * (cp * sr) + az * (cp * cr)

                // remap sensor axes to align with world axes
                const world: [number, number, number] = [ax_w, az_w, -ay_w]
                // this.logger.debug('Linear acceleration', ev)
                this.emit<Acceleration>('acceleration', world as Acceleration)

                const dv = this.accelerationIntegrator.integrate(world, timestamp)
                // Accumulate delta-v into current speed
                this.speed = [
                    this.speed[0] + dv[0],
                    this.speed[1] + dv[1],
                    this.speed[2] + dv[2],
                ]
                this.emit<Speed>("speed", {
                    x: this.speed[0],
                    y: this.speed[1],
                    z: this.speed[2],
                    timestamp,
                })

                this.previousTime = timestamp
                break;

            case SensorId.SH2_ROTATION_VECTOR:
                this.emit<Orientation>(
                    "orientation",
                    [ev.yaw, ev.pitch, ev.roll]
                )
                this.currentYpr = [ev.yaw, ev.pitch, ev.roll]
                break;
        }
    }

    private toMs = (us: bigint): number => {
        return Number(us / 1000n)
    }
}

class TrapezoidalIntegrator {
    private lastValue?: number
    private previousTimestamp?: number

    integrate(value: number, timestamp: number): number {
        let result = 0
        if (this.lastValue !== undefined) {
            const min = Math.min(this.lastValue, value)
            const max = Math.max(this.lastValue, value)
            result = ((min) + ((max - min) * 0.5)) * (timestamp - this.previousTimestamp) / 1000
        }
        this.lastValue = value
        this.previousTimestamp = timestamp
        return result
    }
}

class TriAxisIntegrator {
    private x = new TrapezoidalIntegrator()
    private y = new TrapezoidalIntegrator()
    private z = new TrapezoidalIntegrator()

    integrate(value: [number, number, number], timestamp: number): [number, number, number] {
        return [
            this.x.integrate(value[0], timestamp),
            this.y.integrate(value[1], timestamp),
            this.z.integrate(value[2], timestamp),
        ]
    }
}
