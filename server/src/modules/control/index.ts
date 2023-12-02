import { Module } from '../../types';
import { setDutyCycle, mapValue, sleep, wait } from '../../utils/PCA9685';
// import { Gpio, waveAddGeneric, waveTxBusy, waveClear, waveTxStop, waveCreate, waveTxSend, WAVE_MODE_ONE_SHOT_SYNC } from 'pigpio';
// import Stepper from './StepperWithWaves';
import { PCA9685 } from 'openi2c/dist/PCA9685';

// const pins = {
//     motorLeftPwm: 21,
//     motorLeftDir: 20,
//     motorRightPwm: 16,
//     motorRightDir: 12,
//     turnLeftPin: 1,
//     turnLeftDir: 7
// }

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

const DUTY_MIN = 0.05;
const DUTY_MAX = 0.1;
const MOTOR_MIN = -130;
const MOTOR_MAX = 130;

export const Control: Module = async ({ log, on, emit }) => {
    const pwmDriver = new PCA9685();
    await pwmDriver.setFrequency(50);

    on('setRudders', (rudder: Rudder) => {
        pwmDriver.setDutyCycle(rudderChannels.left, mapValue(rudder.left, -1, 1, 0, 1));
        pwmDriver.setDutyCycle(rudderChannels.right, mapValue(rudder.right, -1, 1, 0, 1));
    });

    on('setMotors', async (motor: Motor) => {
        pwmDriver.setDutyCycle(motorChannels.left, mapValue(motor.left, -1, 1, 0, 1));
        pwmDriver.setDutyCycle(motorChannels.right, mapValue(motor.right, -1, 1, 0, 1));
    });
};
