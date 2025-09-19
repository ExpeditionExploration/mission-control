import { Module } from 'src/module';
import { PCA9685 } from 'openi2c';
import { ServerModuleDependencies } from 'src/server/server';

export class LightsModuleServer extends Module {
    private pwmModule?: PCA9685;
    private frequency = 200;
    private bus = 1;
    private pwmModuleRanInit = false;

    constructor(deps: ServerModuleDependencies) {
        super(deps);
        // Uncomment the following line to enable PCA9685 control.
        // this.pwmModule = new PCA9685(this.bus);
    }

    onModuleInit(): void | Promise<void> {
        if (!this.pwmModule) {
            return;
        }

        this.pwmModule.init().then(() => {
            this.pwmModuleRanInit = true;
            this.pwmModule.setFrequency(this.frequency)
                .then(() => {
                    this.logger.info(`PCA9685 initialized at ${this.frequency}Hz on bus ${this.bus}`);
                })
                .catch((err) => {
                    this.logger.error('Failed to set PCA9685 frequency', err);
                });
        });

        this.on('setLight', async (data: { type: 'vis' | 'ir' | 'uv'; brightness: number }) => {
            if (!this.pwmModuleRanInit) {
                console.warn('PCA9685 not initialized yet');
                return;
            }
            let channel: number; // Channel is PWM module output channel.
            switch (data.type) {
                case 'vis':
                    channel = 0;
                    break;
                case 'ir':
                    channel = 1;
                    break;
                case 'uv':
                    channel = 2;
                    break;
                default:
                    console.warn(`Unknown light type: ${data.type}`);
                    return;
            }
            const brightness = Math.min(1, Math.max(0, data.brightness));
            await this.pwmModule.setDutyCycle(channel, brightness);
        });
    }
}
