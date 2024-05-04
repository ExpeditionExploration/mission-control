const {PCA9685, sleep} = require('openi2c');

const a = new PCA9685(0)

async function main(){
    await a.init();
    await a.setFrequency(50);
    await Promise.all([
        a.setDutyCycle(0, 0.12),
        a.setDutyCycle(1, 0.12)
    ])
    await sleep(5000);
    await Promise.all([
        a.setDutyCycle(0, 0.075),
        a.setDutyCycle(1, 0.075)
    ])
    await Promise.all([
        a.setDutyCycle(0, 0.08),
        a.setDutyCycle(1, 0.08)
    ])
}

main();