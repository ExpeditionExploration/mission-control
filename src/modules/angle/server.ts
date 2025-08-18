import { Module } from 'src/module';
import { Angle, AngleStatus, Heading } from './types';
// import { BNO08X, BNO_REPORT_ACCELEROMETER, BNO_REPORT_MAGNETOMETER } from 'openi2c/dist/modules/BNO08X';

export class AngleModuleServer extends Module {
    angle: Angle = [0, 0, 0];
    heading: Heading = 0;
    async onModuleInit() {
        setInterval(async () => {
            // Simulate angle and heading data
            const angle: Angle = [Math.random() * 360, Math.random() * 360, Math.random() * 360];
            const heading: Heading = Math.random() * 360;
            this.angle = angle;
            this.heading = heading;
            this.emit<Angle>('angle', angle);
            this.emit<Heading>('heading', heading);       
        }, 100);
        // const bno = new BNO08X();
        // await bno.init();

        // await bno.enableFeature(BNO_REPORT_ACCELEROMETER);
        // await bno.enableFeature(BNO_REPORT_MAGNETOMETER);

        // setInterval(async () => {
        //     const heading = await bno.heading();
        //     const angle = await bno.euler();

        //     this.emit<Heading>('heading', heading);
        //     this.emit<Angle>('angle', angle);
        // }, 100);
        this.emitStatusContinuously();
    }

     emitStatusContinuously() {
            setInterval(() => {
                this.emit<AngleStatus>('status', {
                    angle: this.angle,
                    heading: this.heading,
                });
            }, 100); // Emit status every 100 milliseconds
        }
}
