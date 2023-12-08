// import { Module } from '../../types';
// import { HMC5883L } from '../../utils/HMC5883L';
// // import { Gpio } from 'pigpio';

// export const Angle: Module = ({ on, log, emit }) => {
//     const compass = new HMC5883L();
//     compass.init().then(getHeading);

//     on('recalibrateCompass', async () => {
//         log('Recalibrating compass');
//         await compass.calibrate();
//         emit('compassCalibrated');
//         log('Recalibrated compass');
//     });

//     async function getHeading() {
//         if (!compass.calibration.busy) {
//             const heading = await compass.getHeading();
//             emit('compass', heading);
//         }
//         setTimeout(getHeading, 100);
//     }

//     // on('setBrightness', (brightness: number) => {
//     //     log('Set brightness', brightness);
//     //     // lightsPwm.pwmWrite(brightness);
//     // });
// };
