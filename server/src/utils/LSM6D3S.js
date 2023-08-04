const i2c = require('i2c-bus');

// LSM6DS3 I2C address
const LSM6DS3_ADDRESS = 0x6B; // Change this to the correct address for your setup

// LSM6DS3 register addresses
const LSM6DS3_CTRL6_C = 0x15;
const LSM6DS3_CTRL1_XL = 0x10;
const LSM6DS3_CTRL2_G = 0x11;
const LSM6DS3_OUTX_L_G = 0x22;
const LSM6DS3_OUTX_L_XL = 0x28;

// Sensitivity values for converting raw data to angles
const GYRO_SENSITIVITY_500DPS = 0.0175; // 500 degrees per second (dps) sensitivity
const ACCEL_SENSITIVITY_2G = 0.061; // 2g sensitivity

class LSM6DS3Driver {
  constructor() {
    this.i2cBus = null;
    this.init();
  }

  async init() {
    try {
      this.i2cBus = await i2c.openPromisified(0); // Use the appropriate I2C bus number

      // Configure the LSM6DS3: Set gyroscope and accelerometer scale
      await this.i2cBus.writeByte(LSM6DS3_ADDRESS, LSM6DS3_CTRL6_C, 0x00); // Low performance mode
    //   await this.i2cBus.writeByte(LSM6DS3_ADDRESS, LSM6DS3_CTRL1_XL, 0x60); // 208 Hz, ±2g, BW=400Hz
    //   await this.i2cBus.writeByte(LSM6DS3_ADDRESS, LSM6DS3_CTRL2_G, 0x60); // 208 Hz, ±500 dps
      await this.i2cBus.writeByte(LSM6DS3_ADDRESS, LSM6DS3_CTRL1_XL, parseInt('00010111',2)); // 12.5 Hz, ±16g, BW=50Hz
      await this.i2cBus.writeByte(LSM6DS3_ADDRESS, LSM6DS3_CTRL2_G, parseInt('00010000',2)); // 12.5 Hz, 250 dps
    } catch (error) {
      console.error('Error initializing LSM6DS3:', error);
    }
  }

  async close() {
    if (this.i2cBus) {
      await this.i2cBus.close();
      this.i2cBus = null;
    }
  }

  async readRawData(registerAddress) {
    try {
      const rawData = await this.i2cBus.readI2cBlock(LSM6DS3_ADDRESS, registerAddress, 6, Buffer.alloc(6));
      return rawData.buffer;
    } catch (error) {
      console.error('Error reading raw data from LSM6DS3:', error);
      return null;
    }
  }

  async getGyroData() {
    const rawData = await this.readRawData(LSM6DS3_OUTX_L_G);
    if (!rawData) return null;

    const gyroX = rawData.readInt16LE(0) * GYRO_SENSITIVITY_500DPS;
    const gyroY = rawData.readInt16LE(2) * GYRO_SENSITIVITY_500DPS;
    const gyroZ = rawData.readInt16LE(4) * GYRO_SENSITIVITY_500DPS;

    return { x: gyroX, y: gyroY, z: gyroZ };
  }

  async getAccelData() {
    const rawData = await this.readRawData(LSM6DS3_OUTX_L_XL);
    if (!rawData) return null;

    const accelX = rawData.readInt16LE(0) * ACCEL_SENSITIVITY_2G;
    const accelY = rawData.readInt16LE(2) * ACCEL_SENSITIVITY_2G;
    const accelZ = rawData.readInt16LE(4) * ACCEL_SENSITIVITY_2G;

    return { x: accelX, y: accelY, z: accelZ };
  }

  async getCurrentAngles() {
    const gyroData = await this.getGyroData();
    const accelData = await this.getAccelData();

    if (!gyroData || !accelData) return null;

    // Calculate the pitch and roll angles using accelerometer data
    const pitch = Math.atan2(accelData.x, Math.sqrt(accelData.y * accelData.y + accelData.z * accelData.z));
    const roll = Math.atan2(-accelData.y, accelData.z);

    // Use the gyroscope data to correct the drift over time
    const dt = 0.00125; // Assuming a 100 Hz data rate, change this if your data rate is different
    const correctedPitch = pitch + gyroData.x * dt;
    const correctedRoll = roll + gyroData.y * dt;

    return { pitch: (correctedPitch * 180) / Math.PI, roll: (correctedRoll * 180) / Math.PI };
  }
}

// Example usage
async function testLSM6DS3() {
  const lsm6ds3 = new LSM6DS3Driver();

  // Wait for LSM6DS3 initialization
  await new Promise((resolve) => setTimeout(resolve, 100));

  setInterval(async ()=>{
        const angles = await lsm6ds3.getCurrentAngles();
        if (angles) {
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            process.stdout.write(`Pitch: ${angles.pitch.toFixed(2)}° | Roll: x:${angles.roll.toFixed(2)}°`);
        }
    },100);
}

// Run the test function
testLSM6DS3();