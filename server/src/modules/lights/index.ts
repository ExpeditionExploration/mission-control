import Module from '../Module';
import { Gpio } from 'pigpio';

const pins = {
    lights: 24,
}

export const Lights: Module = {
    controller: ({
        send,
        events,
        debug
    }) => {
        const lightsPwm = new Gpio(pins.lights, { mode: Gpio.OUTPUT });
        const pwmFrequency = 10000;
        const pwmRange = 100;

        lightsPwm.pwmFrequency(pwmFrequency);
        lightsPwm.pwmRange(pwmRange);

        events.on('Module:Lights:setBrightness', (brightness: number) => {
            debug('Set brightness', brightness);
            lightsPwm.pwmWrite(brightness);
        });
    }
}
