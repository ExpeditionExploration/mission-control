import { Module } from '../../types';
import { PCA9685, sleep, mapValue } from 'openi2c';
import { SmoothValue } from '../../utils/SmoothValue';

const aileronChannels = {
    left: 0,
    right: 1,
};

const thrusterChannels = {
    left: 2,
    right: 3,
};

type ThrusterUpdate = {
    left: number;
    right: number;
};

type AileronUpdate = {
    left: number;
    right: number;
};

const DUTY_MIN = -1;
const DUTY_MAX = 1;
const ESC_DRIVER_FREQUENCY = 50;
const ESC_MIN = 0.05; // 1ms at 50Hz
const ESC_MAX = 0.1; // 2ms at 50Hz
const ESC_ARM = 0.12; // Any value over 2ms
const SPEED_SMOOTHING = 1;

export const Control: Module = async ({ log, on, emit }) => {
    const pwmDriver = new PCA9685(0, {
        frequency: ESC_DRIVER_FREQUENCY,
    });
    await pwmDriver.init()
    await armAllEsc();

    // const aileronValues = {
    //     left: new SmoothValue({ speed: SPEED_SMOOTHING }).on('update', (value) => setEsc(aileronChannels.left, value)),
    //     right: new SmoothValue({ speed: SPEED_SMOOTHING }).on('update', (value) => setEsc(aileronChannels.right, value))
    // };

    // const thrusterValues = {
    //     left: new SmoothValue({ speed: SPEED_SMOOTHING }).on('update', (value) => setEsc(thrusterChannels.left, value)),
    //     right: new SmoothValue({ speed: SPEED_SMOOTHING }).on('update', (value) => setEsc(thrusterChannels.right, value))
    // };

    on('setAilerons', (update: AileronUpdate) => {
        // aileronValues.left.value = update.left;
        // aileronValues.right.value = update.right;
    });

    on('setThrusters', async (update: ThrusterUpdate) => {
        // thrusterValues.left.value = update.left;
        // thrusterValues.right.value = update.right;
    });

    async function setEsc(channel: number, value: number) {
        log(`Setting ESC ${channel} to ${value}`);
        // value is between -1 and 1
        await pwmDriver.setDutyCycle(
            channel,
            mapValue(value, DUTY_MIN, DUTY_MAX, ESC_MIN, ESC_MAX) // Not sure if setting to 0 is nessesary.
        );
    }

    async function armAllEsc() {
        log('Arming ESCs');
        await setAllEsc(0);
        await sleep(1000);
        await setAllEsc(ESC_ARM);
        await sleep(5000);
        await setAllEsc(0);
        log('ESCs Armed');
    }

    async function setAllEsc(dutyCycle: number) {
        log(`Setting all ESCs to ${dutyCycle}`);
        await Promise.all([
            pwmDriver.setDutyCycle(aileronChannels.left, dutyCycle),
            pwmDriver.setDutyCycle(aileronChannels.right, dutyCycle),
            pwmDriver.setDutyCycle(thrusterChannels.left, dutyCycle),
            pwmDriver.setDutyCycle(thrusterChannels.right, dutyCycle),
        ]);
    }
};
