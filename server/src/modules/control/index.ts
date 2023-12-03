import { Module } from '../../types';
import { PCA9685, sleep, mapValue } from 'openi2c';

const rudderChannels = {
    left: 0,
    right: 1,
};

const motorChannels = {
    left: 2,
    right: 3,
};

type Motor = {
    left: number;
    right: number;
};

type Rudder = {
    left: number;
    right: number;
};

const DUTY_MIN = -1;
const DUTY_MAX = 1;
const ESC_MIN = 0.05; // 1ms at 50Hz
const ESC_MAX = 0.1; // 2ms at 50Hz
const ESC_ARM = 0.12; // Any value over 2ms

export const Control: Module = async ({ log, on, emit }) => {
    const pwmDriver = new PCA9685();
    await pwmDriver.setFrequency(50);

    await armAllEsc();

    on('setRudders', (rudder: Rudder) => {
        setEsc(rudderChannels.left, rudder.left);
        setEsc(rudderChannels.right, rudder.right);
    });

    on('setMotors', async (motor: Motor) => {
        setEsc(motorChannels.left, motor.left);
        setEsc(motorChannels.right, motor.right);
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
        await setAllEsc(ESC_ARM);
        await sleep(5000);
        await setAllEsc(0);
        log('ESCs Armed');
    }

    async function setAllEsc(dutyCycle: number) {
        log(`Setting all ESCs to ${dutyCycle}`);
        await Promise.all([
            pwmDriver.setDutyCycle(rudderChannels.left, dutyCycle),
            pwmDriver.setDutyCycle(rudderChannels.right, dutyCycle),
            pwmDriver.setDutyCycle(motorChannels.left, dutyCycle),
            pwmDriver.setDutyCycle(motorChannels.right, dutyCycle),
        ]);
    }
};
