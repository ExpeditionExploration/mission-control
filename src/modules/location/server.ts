import { Module } from "src/module";
import { Acceleration, Speed, Location } from "./types";
import { Payload } from "src/connection";

export class LocationModuleServer extends Module {

    private averageQueue: Acceleration[] = [];
    private acceleration: Acceleration = {
        x: 0,
        y: 0,
        z: 0,
        timestamp: 0,
        timeDelta: 0,
    };
    private speed: Speed = {
        x: 0,
        y: 0,
        z: 0,
        timestamp: 0,
        timeDelta: 0,
    };
    private location: Location = {
        x: 0,
        y: 0,
        z: 0,
        timestamp: 0,
        timeDelta: 0,
    };

    onModuleInit(): void | Promise<void> {
        this.broadcaster.on('imu:accelerationReceived', this.onAcceleration);
    }

    onAcceleration = (payload: Payload): void => {
        const accel: Acceleration = payload.data;
        this.averageQueue.push(accel);
        const averageOver = 10
        if (this.averageQueue.length >= averageOver) {
            const x = this.averageQueue.reduce((sum, a) => sum + a.x, 0) / averageOver;
            const y = this.averageQueue.reduce((sum, a) => sum + a.y, 0) / averageOver;
            const z = this.averageQueue.reduce((sum, a) => sum + a.z, 0) / averageOver;

            const timestamp = this.averageQueue[averageOver - 1].timestamp;
            const prevTimestamp = this.averageQueue[averageOver - 2].timestamp;
            const timeDelta = timestamp - prevTimestamp;


            this.acceleration.x = x;
            this.acceleration.y = y;
            this.acceleration.z = z;
            this.acceleration.timestamp = timestamp;
            this.acceleration.timeDelta = timeDelta;

            this.speed.x += this.acceleration.x * (timeDelta / 1000);
            this.speed.y += this.acceleration.y * (timeDelta / 1000);
            this.speed.z += this.acceleration.z * (timeDelta / 1000);
            this.speed.timestamp = timestamp;
            this.speed.timeDelta = timeDelta;

            console.log("Speed:", this.speed);
            console.log("Location:", this.location);

            this.location.x += this.speed.x * (timeDelta / 1000);
            this.location.y += this.speed.y * (timeDelta / 1000);
            this.location.z += this.speed.z * (timeDelta / 1000);
            this.location.timestamp = timestamp;
            this.location.timeDelta = timeDelta;

            this.emit<Acceleration>('acceleration', this.acceleration);
            this.emit<Speed>('speed', this.speed);
            this.emit<Location>('location', this.location);
        }
        if (this.averageQueue.length >= averageOver) {
            this.averageQueue.shift();
        }
    }
}