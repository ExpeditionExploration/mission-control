import Module from '../Module';
import { Gpio, waveAddGeneric, waveTxBusy, waveClear, waveTxStop, waveCreate, waveTxSend, WAVE_MODE_ONE_SHOT_SYNC } from 'pigpio';
import Stepper from './Stepper';

const pins = {
    motorLeftPwm: 21,
    motorLeftDir: 20,
    motorRightPwm: 16,
    motorRightDir: 12,
    turnLeftPin: 1,
    turnLeftDir: 7
}

type Motor = {
    left: number;
    right: number;
}

type Rudder = {
    left: number;
    right: number;
}


export const Control: Module = {
    controller: ({
        send,
        debug,
        events
    }) => {
        const a1 = 21;
        const a2 = 20;
        const b1 = 16;
        const b2 = 12;
        const stepper = new Stepper({ a1, a2, b1, b2 });
        // stepper.findZero();

        events.on('Module:Control:setRudders', (rudder: Rudder) => {
            debug('setRudders', rudder);
            /**
             * Adds the next turn to the variable to be processed next 
             * time the turn is updated. This is to prevent the turn
             * from being updated while the turn is being processed.
             * This will overwrite the previous turn.
             */

            // if (Math.abs(rudder.left) == 90) stepper.goTo(rudder.left);

            stepper.goTo(rudder.left);
        });

        // let dir = 1;

        // function step() {
        //     stepper.goTo(90 * dir);
        //     dir = dir * -1;
        //     setTimeout(step, 1500);
        // }

        // step();
    }
}

async function wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
