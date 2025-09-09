import { Module } from 'src/module';

export class BatteryModuleServer extends Module {
    batteryLevel: number = 100; // Initial battery level

    async onModuleInit() {
        this.simulateBatteryDrain();
    }

    simulateBatteryDrain() {
        setInterval(() => {
            this.batteryLevel = Math.max(0, this.batteryLevel - 1);
            //this.emit<BatteryStatus>('battery-status', { level: this.batteryLevel });
        }, 60000); // Decrease every minute
    }
}