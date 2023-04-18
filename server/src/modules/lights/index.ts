import { Module } from '../../types';
// import { Gpio } from 'pigpio';

const pins = {
    lights: 24,
}

export const Lights: Module = ({
    on,
    log
}) => {
    // const lightsPwm = new Gpio(pins.lights, { mode: Gpio.OUTPUT });
    // const pwmFrequency = 10000;
    // const pwmRange = 100;

    // lightsPwm.pwmFrequency(pwmFrequency);
    // lightsPwm.pwmRange(pwmRange);

    on('setBrightness', (brightness: number) => {
        log('Set brightness', brightness);
        // lightsPwm.pwmWrite(brightness);
    });
}
