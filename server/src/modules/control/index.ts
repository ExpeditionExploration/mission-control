import { Module } from '../../types';
import { setDutyCycle, mapValue } from '../../utils/PCA9685';
// import { Gpio, waveAddGeneric, waveTxBusy, waveClear, waveTxStop, waveCreate, waveTxSend, WAVE_MODE_ONE_SHOT_SYNC } from 'pigpio';
// import Stepper from './StepperWithWaves';

// const pins = {
//     motorLeftPwm: 21,
//     motorLeftDir: 20,
//     motorRightPwm: 16,
//     motorRightDir: 12,
//     turnLeftPin: 1,
//     turnLeftDir: 7
// }

type Motor = {
    left: number;
    right: number;
};

type Rudder = {
    left: number;
    right: number;
};

export const Control: Module = async ({ log, on, emit }) => {
    
    // const a1 = 21;
    // const a2 = 20;
    // const b1 = 16;
    // const b2 = 12;
    // const stepper = new Stepper({ a1, a2, b1, b2 });

    // const stepper = new Stepper({ step: 21, dir: 20 });
    // stepper.findZero();

    on('setRudders', (rudder: Rudder) => {
        log('setRudders', rudder);
    });

    on('setMotors', (motor: Motor) => {
        log('setMotors', motor);
    });
};
