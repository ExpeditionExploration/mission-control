import Module from '../Module';
import { Gpio } from 'pigpio';

const pins = {
    motorLeftPwm: 21,
    motorLeftDir: 20,
    motorRightPwm: 16,
    motorRightDir: 12,
}

type Move = {
    left: number;
    right: number;
}

export const Control: Module = {
    controller: ({
        send,
        events
    }) => {
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

            currentMove.left = rampValue(currentMove.left, targetMove.left, 10);
            currentMove.right = rampValue(currentMove.right, targetMove.right, 10);
        }, 50);
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