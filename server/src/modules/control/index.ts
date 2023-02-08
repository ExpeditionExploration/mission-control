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
type Step = {
    gpioOn: number;
    gpioOff: number;
    usDelay: number;
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

        const delay = 500;

        new Gpio(a1, { mode: Gpio.OUTPUT });
        new Gpio(a2, { mode: Gpio.OUTPUT });
        new Gpio(b1, { mode: Gpio.OUTPUT });
        new Gpio(b2, { mode: Gpio.OUTPUT });

        const steps: {
            [key: number]: Step[]
        } = {
            0: [{ gpioOn: a1, gpioOff: a2, usDelay: delay }, { gpioOn: b2, gpioOff: b1, usDelay: delay }],
            1: [{ gpioOn: a1, gpioOff: a2, usDelay: delay }, { gpioOn: b1, gpioOff: b2, usDelay: delay }],
            2: [{ gpioOn: a2, gpioOff: a1, usDelay: delay }, { gpioOn: b1, gpioOff: b2, usDelay: delay }],
            3: [{ gpioOn: a2, gpioOff: a1, usDelay: delay }, { gpioOn: b2, gpioOff: b1, usDelay: delay }],
        }
        let lastStep = 0;
        function doWave() {
            let waveform: Step[] = [];
            for (let i = 0; i < 210; i++) {
                lastStep = (lastStep + 1) % 4;
                waveform.push(...steps[lastStep]);
            }

            waveClear();
            waveAddGeneric(waveform);
            let waveId = waveCreate();
            waveTxSend(waveId, WAVE_MODE_ONE_SHOT_SYNC);
        }

        setInterval(() => {
            if (!waveTxBusy()) {
                doWave();
            }
        }, 500);
    }
}
