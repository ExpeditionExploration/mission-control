/**
 * This is a raw but working driver written by chat gpt. 
 * Calibration turns out to be essential for this sensor to work properly.
 */

const i2c = require('i2c-bus');

const HMC5883L_ADDR = 0x1E;
const HMC5883L_CONFIG_REG_A = 0x00;
const HMC5883L_CONFIG_REG_B = 0x01;
const HMC5883L_MODE_REG = 0x02;
const HMC5883L_DATA_REG = 0x03;
const HMC5883L_CALIBRATION_STEPS = 10000;

class HMC5883L {
  constructor() {
    this.i2c = i2c.openSync(0); // Use 1 for Raspberry Pi Model 3 or newer
    this.calibration = { offsetX: 0, offsetY: 0, offsetZ: 0 };
    this.scale = 1.0;
    this.declination = -0.1884956; // Default declination, set to 0 degrees initially https://www.magnetic-declination.com/ (Convert from degress to radians)
  }

  initialize() {
    // Set the configuration for the HMC5883L
    this.i2c.writeByteSync(HMC5883L_ADDR, HMC5883L_CONFIG_REG_A, 0x70); // 8-sample average, 15 Hz update rate, normal measurement mode
    this.i2c.writeByteSync(HMC5883L_ADDR, HMC5883L_CONFIG_REG_B, 0xA0); // +/- 5.6 gauss
    this.i2c.writeByteSync(HMC5883L_ADDR, HMC5883L_MODE_REG, 0x00); // Continuous measurement mode

    // Perform calibration
    this.calibrate();
  }

  calibrate() {
    console.log('Calibrating HMC5883L...')
    console.log('Move the sensor around in a figure 8 until the calibration is complete.')
    let offsetX = 0;
    let offsetY = 0;
    let offsetZ = 0;

    for (let i = 0; i < HMC5883L_CALIBRATION_STEPS; i++) {
      const { x, y, z } = this.readRawData();
      offsetX += x;
      offsetY += y;
      offsetZ += z;
    }

    this.calibration.offsetX = offsetX / HMC5883L_CALIBRATION_STEPS;
    this.calibration.offsetY = offsetY / HMC5883L_CALIBRATION_STEPS;
    this.calibration.offsetZ = offsetZ / HMC5883L_CALIBRATION_STEPS;
  }

  readRawData() {
    const rawData = Buffer.alloc(6);
    this.i2c.readI2cBlockSync(HMC5883L_ADDR, HMC5883L_DATA_REG, 6, rawData);
    // const rawData = this.i2c.readBytesSync(HMC5883L_ADDR, HMC5883L_DATA_REG, 6);

    const x = (rawData.readInt16BE(0) - this.calibration.offsetX) * this.scale;
    const y = (rawData.readInt16BE(4) - this.calibration.offsetY) * this.scale;
    const z = (rawData.readInt16BE(2) - this.calibration.offsetZ) * this.scale;

    return { x, y, z };
  }

  getHeading() {
    const { x, y, z } = this.readRawData();
    const heading = Math.atan2(y, x);

    // Convert the heading to a range of [0, 360)
    let degrees = heading * (180 / Math.PI);
    degrees += this.declination;
    if (degrees < 0) {
      degrees += 360;
    }

    return degrees;
  }

//   getCardinalDirection() {
//     const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
//     const angle = (this.getHeading() + 22.5) % 360;
//     const index = Math.floor(angle / 45);
//     return directions[index];
//   }
  getCardinalDirection() {
    const heading = this.getHeading();
    if(heading >= 22.5 && heading < 67.5) return 'NE';
    if(heading >= 67.5 && heading < 112.5) return 'E';
    if(heading >= 112.5 && heading < 157.5) return 'SE';
    if(heading >= 157.5 && heading < 202.5) return 'S';
    if(heading >= 202.5 && heading < 247.5) return 'SW';
    if(heading >= 247.5 && heading < 292.5) return 'W';
    if(heading >= 292.5 && heading < 337.5) return 'NW';
    else return 'N';

  }

  close() {
    this.i2c.closeSync();
  }
}


// Example usage:
const hmc5883l = new HMC5883L();
hmc5883l.initialize();

setInterval(() => { 
    // print on the same line
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(`Heading: ${hmc5883l.getHeading().toFixed(2)}° | Direction: ${hmc5883l.getCardinalDirection()}`);
},100)