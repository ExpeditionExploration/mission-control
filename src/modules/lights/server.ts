import { Module } from 'src/module';
import { PCA9685 } from 'openi2c';
import { ServerModuleDependencies } from 'src/server/server';

export class LightsModuleServer extends Module {
    private pwmModule: PCA9685;

    constructor(deps: ServerModuleDependencies) {
        super(deps);
        let bus = 4;
        let frequency = 4096;
        if (!this.pwmModule) {
            // Uncomment the following line to enable PCA9685 control.
            // this.pwmModule = new PCA9685(bus);
            this.pwmModule?.init().then(() => {
                this.pwmModule?.setFrequency(frequency)
                    .then(() => {
                        this.logger.info(`PCA9685 initialized at ${frequency}Hz on bus ${bus}`);
                    })
                    .catch((err) => {
                        this.logger.error('Failed to set PCA9685 frequency', err);
                    });
            });
        }
    }

    onModuleInit(): void | Promise<void> {
        this.on('setLight', async (data: { type: 'vis' | 'ir' | 'uv'; brightness: number }) => {
            let channel: number; // Channel is PWM module output channel.
            switch (data.type) {
                case 'vis':
                    channel = 12;
                    break;
                case 'ir':
                    channel = 13;
                    break;
                case 'uv':
                    channel = 14;
                    break;
                default:
                    console.warn(`Unknown light type: ${data.type}`);
                    return;
            }
            const brightness = Math.min(1, Math.max(0, data.brightness));
            if (this.pwmModule) {
                await this.pwmModule.setDutyCycle(channel, brightness);
            }
        });
    }
}
