import pigpio from 'pigpio';
// pigpio.configureClock(1, pigpio.CLOCK_PCM);

import App from './App';
App();
const { Gpio, waveClear, waveTxSend, waveTxBusy, waveCreate, waveAddGeneric, waveChain, WAVE_MODE_ONE_SHOT_SYNC } = pigpio;

async function main() {
    const stepPin = 1;
    const dirPin = 7;
    const delay = 500;
    let dir = 1;

    new Gpio(stepPin, { mode: Gpio.OUTPUT });
    new Gpio(dirPin, { mode: Gpio.OUTPUT });

    function goDir() {
        waveClear();

        const waveform = [];
        if (dir < 0) waveform.push({ gpioOn: dirPin, gpioOff: 0, usDelay: delay }) //turnLeftDir.digitalWrite(1); // Reverse
        else waveform.push({ gpioOn: 0, gpioOff: dirPin, usDelay: delay }); //turnLeftDir.digitalWrite(0); // Forward


        for (let i = 0; i < 105; i++) { // Go 90;
            waveform.push({ gpioOn: stepPin, gpioOff: 0, usDelay: delay }, { gpioOn: 0, gpioOff: stepPin, usDelay: delay });
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
}

// main();