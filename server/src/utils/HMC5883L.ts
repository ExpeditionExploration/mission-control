// Compass
/**
 * This is a raw but working driver written by chat gpt.
 * Calibration turns out to be essential for this sensor to work properly.
 *
 * TODO Compass works really well when sideways but not when level. Perhaps something in the config is wrong?
 * Trying this: https://www.instructables.com/Configure-read-data-calibrate-the-HMC5883L-digital/
 */
import i2c from 'i2c-bus';
import debug from 'debug';

const HMC5883L_ADDR = 0x1e;
const HMC5883L_CONFIG_REG_A = 0x00;
const HMC5883L_CONFIG_REG_B = 0x01;
const HMC5883L_MODE_REG = 0x02;
const HMC5883L_DATA_REG = 0x03;

const log = debug('HMC5883L');

const defaultCalibration = {
    offsetX: 0,
    offsetY: 0,
    offsetZ: 0,
    busy: false,
};
export class HMC5883L {
    declination!: number;
    scale!: number;
    calibration = defaultCalibration;
    i2c!: i2c.PromisifiedBus;

    constructor({ bus = 0, scale = 1, declination = 0 } = {}) {
        this.i2c = i2c.openSync(bus).promisifiedBus(); // Use 1 for Raspberry Pi Model 3 or newer
        this.scale = scale;
        this.declination = declination; // Default declination, set to 0 degrees initially https://www.magnetic-declination.com/ (Convert from degress to radians)
    }

    async init() {
        log('Initializing HMC5883L');

        // Set the configuration for the HMC5883L
        await this.i2c.writeByte(HMC5883L_ADDR, HMC5883L_CONFIG_REG_A, 0x70); // Set to 8 samples @ 15Hz, normal measurement mode
        await this.i2c.writeByte(HMC5883L_ADDR, HMC5883L_CONFIG_REG_B, 0x20); // 1.3 gain LSb / Gauss 1090 (default)
        await this.i2c.writeByte(HMC5883L_ADDR, HMC5883L_MODE_REG, 0x00); // Continuous measurement mode

        // await this.calibrate();
    }

    async calibrate() {
        // Reset calibration so it doesn't affect the readings
        this.calibration = defaultCalibration;
        // Calibration is essential for this sensor to work properly
        this.calibration.busy = true;

        // this.calibration.offsetX = 0;
        // this.calibration.offsetY = 0;
        // this.calibration.offsetZ = 0;

        // let offsetX = 0;
        // let offsetY = 0;
        // let offsetZ = 0;
        let minX!: number;
        let maxX!: number;
        let minY!: number;
        let maxY!: number;
        let minZ!: number;
        let maxZ!: number;

        const calibrationSteps = 10000;
        log(`Calibrating HMC5883L with ${calibrationSteps} steps`);

        for (let i = 0; i < calibrationSteps; i++) {
            const { x, y, z } = await this.readRawData();
            if (minX === undefined || x < minX) minX = x;
            if (maxX === undefined || x > maxX) maxX = x;
            if (minY === undefined || y < minY) minY = y;
            if (maxY === undefined || y > maxY) maxY = y;
            if (minZ === undefined || z < minZ) minZ = z;
            if (maxZ === undefined || z > maxZ) maxZ = z;

            // await new Promise((resolve) => setTimeout(resolve, 50));
            // offsetX += x;
            // offsetY += y;
            // offsetZ += z;
        }

        this.calibration.offsetX = (maxX + minX) / 2;
        this.calibration.offsetY = (maxY + minY) / 2;
        this.calibration.offsetZ = (maxZ + minZ) / 2;

        this.calibration.busy = false;
        log('Calibration complete', this.calibration);
    }

    async readRawData() {
        const rawData = await this.i2c.readI2cBlock(HMC5883L_ADDR, HMC5883L_DATA_REG, 6, Buffer.alloc(6));

        const x = (rawData.buffer.readInt16BE(0) - this.calibration.offsetX) * this.scale;
        const y = (rawData.buffer.readInt16BE(4) - this.calibration.offsetY) * this.scale;
        const z = (rawData.buffer.readInt16BE(2) - this.calibration.offsetZ) * this.scale;

        return { x, y, z };
    }

    async getHeading() {
        const { x, y, z } = await this.readRawData();
        let heading = Math.atan2(y, x);

        if (heading < 0) {
            heading += 2 * Math.PI;
        }
        // const heading = Math.atan2(x, y);
        // const heading = Math.atan2(x, z);
        // const heading = Math.atan2(z, x);
        // const heading = Math.atan2(z, y);
        // const heading = Math.atan2(y, z);

        // Convert the heading to a range of [0, 360)
        let degrees = heading * (180 / Math.PI); // Convert radians to degrees
        degrees += this.declination;
        // if (degrees < 0) {
        //     degrees += 360;
        // }

        return degrees;
    }

    async getCardinalDirection() {
        const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        const heading = await this.getHeading();
        const angle = (heading + 22.5) % 360;
        const index = Math.floor(angle / 45);
        return directions[index];
    }
    // getCardinalDirection() {
    //     const heading = this.getHeading();
    //     if (heading >= 22.5 && heading < 67.5) return 'NE';
    //     if (heading >= 67.5 && heading < 112.5) return 'E';
    //     if (heading >= 112.5 && heading < 157.5) return 'SE';
    //     if (heading >= 157.5 && heading < 202.5) return 'S';
    //     if (heading >= 202.5 && heading < 247.5) return 'SW';
    //     if (heading >= 247.5 && heading < 292.5) return 'W';
    //     if (heading >= 292.5 && heading < 337.5) return 'NW';
    //     else return 'N';
    // }

    async close() {
        await this.i2c.close();
    }
}
