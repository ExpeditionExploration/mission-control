import Module from '../Module';
import { Gpio, waveAddGeneric, waveTxBusy, waveClear, waveTxStop, waveCreate, waveTxSend, WAVE_MODE_ONE_SHOT_SYNC } from 'pigpio';

const pins = {
    motorLeftPwm: 21,
    motorLeftDir: 20,
    motorRightPwm: 16,
    motorRightDir: 12,
    turnLeftPin: 1,
    turnLeftDir: 7
}

const stepperDegreesPerStep = 18;
const gearRatio = 21;
const degreesPerStep = stepperDegreesPerStep / gearRatio; // 0.9 is the closest to the origional ratio that doesnt cause rounding errors.

type Move = {
    left: number;
    right: number;
}

type Turn = {
    left: number;
    right: number;
}

export const Control: Module = {
    controller: ({
        send,
        debug,
        events
    }) => {
        function setupTurn() {
            const turnLeftPin = new Gpio(pins.turnLeftPin, { mode: Gpio.OUTPUT });
            const turnLeftDir = new Gpio(pins.turnLeftDir, { mode: Gpio.OUTPUT });

            // turnLeftPin.digitalWrite(0);
            // turnLeftDir.digitalWrite(0);

            const delay = 500;
            const interval = 50;

            let nextTurn: Turn | null = null;
            let findingZero = false;

            let currentTurn: Turn = {
                left: 0,
                right: 0
            }

            // let lastTurn = 0;
            let dir = 1;
            events.on('Module:Control:setTurn', (turn: Turn) => {
                // debug('setTurn', turn);
                /**
                 * Adds the next turn to the variable to be processed next 
                 * time the turn is updated. This is to prevent the turn
                 * from being updated while the turn is being processed.
                 * This will overwrite the previous turn.
                 */

                // if ((turn.left == 90 || turn.left == -90) && !waveTxBusy()) {
                //     dir = dir * -1;
                //     goTo(90);
                // }
            });

            function goDir() {
                waveClear();

                const waveform = [];
                if (dir < 0) waveform.push({ gpioOn: pins.turnLeftDir, gpioOff: 0, usDelay: delay }) //turnLeftDir.digitalWrite(1); // Reverse
                else waveform.push({ gpioOn: 0, gpioOff: pins.turnLeftDir, usDelay: delay }); //turnLeftDir.digitalWrite(0); // Forward


                for (let i = 0; i < 105; i++) { // Go 90;
                    waveform.push({ gpioOn: pins.turnLeftPin, gpioOff: 0, usDelay: delay }, { gpioOn: 0, gpioOff: pins.turnLeftPin, usDelay: delay });
                }

                waveAddGeneric(waveform);

                let waveId = waveCreate();
                waveTxSend(waveId, WAVE_MODE_ONE_SHOT_SYNC);
            }

            setInterval(() => {
                if (!waveTxBusy()) {
                    dir = dir * -1;
                    goDir();
                }
            }, 500);

            // function goTo(degrees = 0) {
            //     waveClear();

            //     // const steps = Math.abs(Math.trunc(degrees / degreesPerStep));
            //     // debug('steps', steps);
            //     // currentTurn.left += steps * degreesPerStep;

            //     const waveform = [];

            //     if (dir < 0) waveform.push({ gpioOn: pins.turnLeftDir, gpioOff: 0, usDelay: delay }) //turnLeftDir.digitalWrite(1); // Reverse
            //     else waveform.push({ gpioOn: 0, gpioOff: pins.turnLeftDir, usDelay: delay }); //turnLeftDir.digitalWrite(0); // Forward


            //     for (let i = 0; i < 105; i++) {
            //         waveform.push({ gpioOn: pins.turnLeftPin, gpioOff: 0, usDelay: delay }, { gpioOn: 0, gpioOff: pins.turnLeftPin, usDelay: delay });
            //     }

            //     waveAddGeneric(waveform);

            //     let waveId = waveCreate();
            //     waveTxSend(waveId, WAVE_MODE_ONE_SHOT_SYNC);
            //     // debug('left', currentTurn.left);
            // }

            // let goToPromise: Promise<void> | null = null;
            // let queuedTurn: Turn | null = null;

            // async function goToP(turn: Turn = { left: 0, right: 0 }): Promise<void> {
            //     if (goToPromise) {
            //         queuedTurn = turn;
            //         return;
            //     } else {
            //         goToPromise = new Promise((resolve, reject) => {
            //             const nextTurn = turn;

            //             // debug('nextLeft', nextTurn.left);
            //             waveClear();
            //             // let turnToProcess = nextTurn;
            //             // nextTurn = null;

            //             let leftDiff = nextTurn.left - currentTurn.left;

            //             const leftSteps = Math.trunc(leftDiff / degreesPerStep);
            //             // debug('leftSteps', leftSteps);

            //             if (leftSteps !== 0) {
            //                 currentTurn.left += leftSteps * degreesPerStep;

            //                 let waveform = [];

            //                 if (leftSteps < 0) waveform.push({ gpioOn: pins.turnLeftDir, gpioOff: 0, usDelay: delay }) //turnLeftDir.digitalWrite(1); // Reverse
            //                 else waveform.push({ gpioOn: 0, gpioOff: pins.turnLeftDir, usDelay: delay }); //turnLeftDir.digitalWrite(0); // Forward


            //                 for (let i = 0; i < Math.abs(leftSteps); i++) {
            //                     waveform.push({ gpioOn: pins.turnLeftPin, gpioOff: 0, usDelay: delay }, { gpioOn: 0, gpioOff: pins.turnLeftPin, usDelay: delay });
            //                 }

            //                 waveAddGeneric(waveform);

            //                 let waveId = waveCreate();
            //                 waveTxSend(waveId, WAVE_MODE_ONE_SHOT_SYNC);
            //                 debug('left', currentTurn.left);
            //             }

            //             let checkBusyInterval = setInterval(() => {
            //                 if (!waveTxBusy()) {
            //                     clearInterval(checkBusyInterval);
            //                     goToPromise = null;
            //                     resolve();

            //                     // Should next queue? Can we dequeue after calling?
            //                     if (queuedTurn) {
            //                         // goTo(queuedTurn);
            //                         queuedTurn = null;
            //                     }
            //                 }
            //             }, 50);
            //         });
            //     }

            //     return goToPromise;
            // }

            // async function findZero() {
            //     await goTo({
            //         left: 90,
            //         right: 90
            //     });
            //     await goTo({
            //         left: -90,
            //         right: -90
            //     });
            //     await goTo({
            //         left: 0,
            //         right: 0
            //     });
            // }

            // findZero();
        }

        function setupMotors() {

            const motorLeftPwm = new Gpio(pins.motorLeftPwm, { mode: Gpio.OUTPUT });
            const motorLeftDir = new Gpio(pins.motorLeftDir, { mode: Gpio.OUTPUT });

            const motorRightPwm = new Gpio(pins.motorRightPwm, { mode: Gpio.OUTPUT });
            const motorRightDir = new Gpio(pins.motorRightDir, { mode: Gpio.OUTPUT });

            const pwmFrequency = 10000;
            const pwmRange = 100;

            motorLeftPwm.pwmFrequency(pwmFrequency);
            motorRightPwm.pwmFrequency(pwmFrequency);

            motorLeftPwm.pwmRange(pwmRange);
            motorRightPwm.pwmRange(pwmRange);

            let targetMove = {
                left: 0,
                right: 0
            }
            let currentMove = {
                left: 0,
                right: 0
            }
            events.on('Module:Control:setMotors', (move: Move) => {
                targetMove = move
            });

            setInterval(() => {
                // Ramp speed
                if (currentMove.left < 0) motorLeftDir.digitalWrite(1); // Reverse
                else motorLeftDir.digitalWrite(0); // Forward

                if (currentMove.right < 0) motorRightDir.digitalWrite(1); // Reverse
                else motorRightDir.digitalWrite(0); // Forward

                motorLeftPwm.pwmWrite(currentMove.left);
                motorRightPwm.pwmWrite(currentMove.right);

                currentMove.left = rampValue(currentMove.left, targetMove.left, 25);
                currentMove.right = rampValue(currentMove.right, targetMove.right, 25);
            }, 100);
        }

        // setupMotors();
        setupTurn();
    }
}

function rampValue(value: number, target: number, ramp: number) {
    if (value < target) {
        value += ramp;
        if (value > target) value = target;
    } else if (value > target) {
        value -= ramp;
        if (value < target) value = target;
    }
    return value;
}