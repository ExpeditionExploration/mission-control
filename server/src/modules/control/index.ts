import { Module } from '../../types';
import { setDutyCycle, mapValue, sleep, wait } from '../../utils/PCA9685';
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

const DUTY_MIN = 0.05;
const DUTY_MAX = 0.1;
const MOTOR_MIN = -130;
const MOTOR_MAX = 130;

export const Control: Module = async ({ log, on, emit }) => {
    let leftTarget = 0;
    let rightTarget = 0;
    let leftCurrent = 0;
    let rightCurrent = 0;
    let targetTimer: NodeJS.Timeout | null = null;

    await setDutyCycle(leftCurrent, mapValue(0, MOTOR_MIN, MOTOR_MAX, DUTY_MIN, DUTY_MAX)); // Map between 1ms and 2ms pulse

    // setInterval(async () => {
    //     const leftDiff = leftCurrent - leftTarget;
    //     // const rightDiff = motor.right - rightTarget;

    //     if (leftDiff > 0) {
    //         leftCurrent -= 10;
    //     } else if (leftDiff < 0) {
    //         leftCurrent += 10;
    //     }

    //     // if (rightDiff > 0) {
    //     //     rightTarget += 1;
    //     // } else if (rightDiff < 0) {
    //     //     rightTarget -= 1;
    //     // }

    //     if (Math.abs(leftDiff) > 0.1) setDutyCycle(0, mapValue(leftCurrent, MOTOR_MIN, MOTOR_MAX, DUTY_MIN, DUTY_MAX)); // Map between 1ms and 2ms pulse
    //     // setDutyCycle(1, mapValue(rightTarget, MOTOR_MIN, MOTOR_MAX, DUTY_MIN, DUTY_MAX)); // Map between 1ms and 2ms pulse
    // }, 100);

    // async function goToTarget(motor: Motor) {
    //     if (targetTimer) clearInterval(targetTimer);

    //     // Start each new target off with a boost to get it moving
    //     if (motor.left < 0) {
    //         await setDutyCycle(0, mapValue(-50, MOTOR_MIN, MOTOR_MAX, DUTY_MIN, DUTY_MAX)); // Map between 1ms and 2ms pulse
    //         await wait(100);
    //     } else if (motor.left > 0) {
    //         setDutyCycle(0, mapValue(50, MOTOR_MIN, MOTOR_MAX, DUTY_MIN, DUTY_MAX)); // Map between 1ms and 2ms pulse
    //         await wait(100);
    //     }

    //     await setDutyCycle(0, mapValue(motor.left, MOTOR_MIN, MOTOR_MAX, DUTY_MIN, DUTY_MAX)); // Map between 1ms and 2ms pulse
    // }
    // const a1 = 21;
    // const a2 = 20;
    // const b1 = 16;
    // const b2 = 12;
    // const stepper = new Stepper({ a1, a2, b1, b2 });

    // const stepper = new Stepper({ step: 21, dir: 20 });
    // stepper.findZero();
    // setDutyCycle(0, mapValue(0, MOTOR_MIN, MOTOR_MAX, DUTY_MIN, DUTY_MAX)); // Map between 1ms and 2ms pulse

    on('setRudders', (rudder: Rudder) => {
        log('setRudders', rudder);
    });

    on('setMotors', async (motor: Motor) => {
        log('setMotors', motor);
        if(motor.left !== leftCurrent) {
            await setDutyCycle(0, mapValue(motor.left, MOTOR_MIN, MOTOR_MAX, DUTY_MIN, DUTY_MAX)); // Map between 1ms and 2ms pulse
        }
        leftCurrent = motor.left;

        // if(motor.left > -20 && motor.left < 20 &&  leftCurrent > -20 && leftCurrent < 20) {
        //     leftTarget = 20;
        //     setTimeout(() => {
        //         leftTarget = motor.left;
        //     }, 500)
        // }else{
        //     leftTarget = motor.left;
        // }
        // leftTarget = motor.left;
        // goToTarget(motor);
    });
};
