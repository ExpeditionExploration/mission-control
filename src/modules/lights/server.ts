import { Module } from 'src/module';
import { PCA9685 } from 'openi2c';
import { ServerModuleDependencies } from 'src/server/server';

export class LightsModuleServer extends Module {
    private pwmModule: PCA9685;

    constructor(deps: ServerModuleDependencies) {
        super(deps);
    }

    onModuleInit(): void | Promise<void> {
        if (!this.pwmModule) {
            // Uncomment the following line to enable PCA9685 control.
            if (this.config.modules.lights.server.enabled) {
                this.pwmModule = new PCA9685(this.config.modules.lights.server.pca9685.i2cBus, parseInt(this.config.modules.lights.server.pca9685.i2cAddr, 16));
            }
            this.pwmModule?.init();
            this.pwmModule?.setFrequency(this.config.modules.lights.server.pca9685.frequency);
            this.logger.info(`PCA9685 enabled: ${this.config.modules.lights.server.enabled}`);
        }
        this.on('setLight', async (data: { type: 'vis' | 'ir' | 'uv'; brightness: number }) => {
            let channel: number; // Channel is PWM module output channel.
            switch (data.type) {
                case 'vis':
                    channel = this.config.modules.lights.server.pca9685.leds.vis;
                    break;
                case 'ir':
                    channel = this.config.modules.lights.server.pca9685.leds.ir;
                    break;
                case 'uv':
                    channel = this.config.modules.lights.server.pca9685.leds.uv;
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
