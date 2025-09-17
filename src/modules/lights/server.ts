import { Module } from 'src/module';
import { PCA9685, Config as PCA9685Config } from 'openi2c';
import { ServerModuleDependencies } from 'src/server/server';

export class LightsModuleServer extends Module {
    private pca9685: PCA9685;
    private pcaRanInit = false;

    constructor(deps: ServerModuleDependencies) {
        super(deps);
        const config: PCA9685Config = {
            frequency: 200,
        };
        this.pca9685 = new PCA9685(1, {frequency: 200});
        this.pca9685.init().then(() => {
            this.pcaRanInit = true;
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

    onModuleInit(): void | Promise<void> {
    }
}
