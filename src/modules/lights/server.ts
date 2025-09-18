import { Module } from 'src/module';
import { PCA9685 } from 'openi2c';
import { ServerModuleDependencies } from 'src/server/server';

export class LightsModuleServer extends Module {
    private pca9685: PCA9685;
    private frequency = 200;
    private bus = 1;
    private pcaRanInit = false;

    constructor(deps: ServerModuleDependencies) {
        super(deps);
        this.pca9685 = new PCA9685(this.bus);
    }

    onModuleInit(): void | Promise<void> {
        this.pca9685.init().then(() => {
            this.pcaRanInit = true;
            this.pca9685.setFrequency(this.frequency)
                .then(() => {
                    this.logger.info(`PCA9685 initialized at ${this.frequency}Hz on bus ${this.bus}`);
                })
                .catch((err) => {
                    this.logger.error('Failed to set PCA9685 frequency', err);
                });
        });

        this.on('setLight', async (data: { type: 'vis' | 'ir' | 'uv'; brightness: number }) => {
            if (!this.pcaRanInit) {
                console.warn('PCA9685 not initialized yet');
                return;
            }
            let channel: number;
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
            await this.pca9685.setDutyCycle(channel, brightness);
        });
    }
}
