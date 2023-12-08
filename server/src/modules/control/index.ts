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
const ESC_MID = (ESC_MIN+ESC_MAX)/2;
const ESC_STOP_RANGE = 0.001; // 0.2ms at 50Hz
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

    const thrusterValues = {
        left: new SmoothValue({ speed: SPEED_SMOOTHING }).on('update', (value) => setEsc(thrusterChannels.left, value)),
        right: new SmoothValue({ speed: SPEED_SMOOTHING }).on('update', (value) => setEsc(thrusterChannels.right, value))
    };

    on('setAilerons', (update: AileronUpdate) => {
        // aileronValues.left.value = update.left;
        // aileronValues.right.value = update.right;
        setEsc(aileronChannels.left, update.left);
        setEsc(aileronChannels.right, update.right);
    });

    on('setThrusters', async (update: ThrusterUpdate) => {
        thrusterValues.left.value = update.left;
        thrusterValues.right.value = update.right;
        // setEsc(thrusterChannels.left, update.left);
        // setEsc(thrusterChannels.right, update.right);
    });

    async function setEsc(channel: number, value: number) {
        /**
         * TODO!
         * In one direction to zero, eg going from -1 to 0 duty cycle, 
         * the ESC will stop immediately vs the other direction where 
         * it will slowly decrease. I think because in one case the
         * ESC is receiving a signal that thinks it's changing direction
         * and in the other it on the same direction going to zero.
         * 
         * To address this I need to set find a range in which I classify 
         * the ESC as stopped and set the duty cycle to a stop number that 
         * the ESC will recognize as stopped, perhaps 0.
         */
        // value is between -1 and 1
        let mappedValue = mapValue(value, DUTY_MIN, DUTY_MAX, ESC_MIN, ESC_MAX);
        log(`Mapped value ${mappedValue}`, value, DUTY_MIN, DUTY_MAX, ESC_MIN, ESC_MAX);
        if((mappedValue > (ESC_MID - ESC_STOP_RANGE)) && (mappedValue < (ESC_MID + ESC_STOP_RANGE))) {
            mappedValue = 1;
            // Setting this to 0 causes the ESC to rearm constantly.
            // Setting to 1 seemed to work as a stop value.
        }

        log(`Setting ESC ${channel} to ${mappedValue}`, ESC_MID, ESC_MID - ESC_STOP_RANGE, ESC_MID + ESC_STOP_RANGE);
        await pwmDriver.setDutyCycle(
            channel,
            mappedValue,
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
