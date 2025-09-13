import { Module } from 'src/module';
import { BatteryStatus } from './types';

export class BatteryModuleServer extends Module {
    battery: Battery = new Battery(6500); // 6500 mAh battery
    batteryVoltageSetter = new BatteryLevelSetter(defaultChargeLevelFunction);

    private currentSimulatedVoltage = 8.4; // Start fully charged
    private currentSimulatedDrawmA = 1500; // Start at 1.5A draw

    async onModuleInit() {
        this.simulateBatteryVoltageCheck();
    }

    simulateBatteryVoltageCheck() {
        setInterval(() => {
            // Simulated voltage between 6.4V (empty) and 8.4V (full)
            const avgVoltageDrop = 0.00087963; // Just a linear drop over ~3h
            const voltageDrop = Math.random() * avgVoltageDrop * 2;
            this.currentSimulatedVoltage -= voltageDrop;
            this.batteryVoltageSetter.setBatteryLevel(
                this.currentSimulatedVoltage, this.battery);
            // Simulate current draw in mA (e.g., between 2000 mA and 4000 mA)
            const variability = (Math.random() - 0.5) * 400; // +/- 200 mA
            this.currentSimulatedDrawmA = Math.min(
                4000,
                Math.max(2000, this.currentSimulatedDrawmA + variability),
            );
            this.battery.recordConsumption(this.currentSimulatedDrawmA);
            this.emit<BatteryStatus>('status', {
                level: this.battery.getBatteryLevelPercentage() * 100,
                minutesRemaining: this.battery.getEstimatedTimeRemaining(),
            });
        }, 5000); // Every 5 seconds
    }
}

/**
 * Function type to convert voltage to charge level percentage.
 */
type chargeLevelFunction = (voltage: number) => number;

/**
 * Default function to convert voltage to charge level percentage.
 * 
 * Data is an example from ChatGPT
 * 
 * TODO: The actual battery is a 18650
 *
 * This tries to estimates NMC (Lithium Nickel Manganese Cobalt) 2S battery.
 * @param voltage - Voltage of the battery
 * @returns Charge level percentage (0.0 to 1.0)
 */
const defaultChargeLevelFunction: chargeLevelFunction = (voltage: number) => {
    if (voltage >= 8.3) return 1.0;
    if (voltage >= 8.2) return 0.9;
    if (voltage >= 8.0) return 0.8;
    if (voltage >= 7.85) return 0.7;
    if (voltage >= 7.7) return 0.6;
    if (voltage >= 7.6) return 0.5;
    if (voltage >= 7.5) return 0.4;
    if (voltage >= 7.35) return 0.3;
    if (voltage >= 7.2) return 0.2;
    if (voltage >= 6.9) return 0.1;
    if (voltage >= 6.4) return 0.05;
    return 0.01;
}

/**
 * Class to set battery level based on voltage using a provided function.
 */
class BatteryLevelSetter {
    private chargeLevelFunction: chargeLevelFunction;

    constructor(chargeLevelFunction: chargeLevelFunction) {
        this.chargeLevelFunction = chargeLevelFunction;
    }

    setBatteryLevel(voltage: number, battery: Battery) {
        const chargeLevel = this.chargeLevelFunction(voltage);
        battery.setCurrentCapacityPercentage(chargeLevel);
    }
}

type ConsumptionRecord = {
    timestamp: number;
    // current draw in Amperes (A)
    currentA: number;
};

/**
 * Battery class to track capacity, consumption history, and estimate remaining time.
 */
class Battery {
    private totalCapacity: number; // in Ah
    private remainingCapacity: number; // in Ah
    private history: ConsumptionRecord[] = [];
    private maxHistoryLength: number;

    /**
     * @param capacity - Capacity of the battery in mAh
     * @param maxHistoryLength - Maximum length of the consumption history
     */
    constructor(capacity: number, maxHistoryLength: number = 60) {
        this.totalCapacity = capacity * 0.001; // Convert mAh to Ah
        this.remainingCapacity = capacity * 0.001; // Convert mAh to Ah
        this.maxHistoryLength = maxHistoryLength;
    }

    /**
     * @returns Current battery level in Ah
     */
    getBatteryLevel(): number {
        return this.remainingCapacity;
    }

    /**
     * @returns Current battery level as a percentage (0.0 to 1.0)
     */
    getBatteryLevelPercentage(): number {
        return this.remainingCapacity / this.totalCapacity;
    }

    /**
     * Sets the current battery capacity.
     * @param chargeLevel - Percentage of the maximum capacity (0.0 to 1.0)
     */
    setCurrentCapacityPercentage(chargeLevel: number) {
        this.remainingCapacity = chargeLevel * this.totalCapacity;
    }

    /**
     * Records the battery consumption as current measurement.
     * @param consumption - Consumption in mA
     */
    recordConsumption(consumptionMilliAmps: number) {
        const now = Date.now();
        // store current in Amperes
        const currentA = consumptionMilliAmps / 1000;
        this.history.push({ timestamp: now, currentA });
        if (this.history.length > this.maxHistoryLength) {
            this.history.shift();
        }
    }

    /**
     * @returns Average consumption in Ah
     */
    /**
     * @returns Time-weighted average current draw in Amperes (A)
     */
    getAverageConsumption(): number {
        if (this.history.length < 2) {
            return 0;
        }

        // Compute time-weighted average: avgA = sum(I_i * dt_i) / sum(dt_i)
        let weightedSum = 0; // A * s
        let totalTime = 0; // s
        for (let i = 1; i < this.history.length; i++) {
            const prev = this.history[i - 1];
            const curr = this.history[i];
            const dt = (curr.timestamp - prev.timestamp) / 1000; // seconds
            if (dt <= 0) continue;
            // assume draw during interval equals previous sample current
            weightedSum += prev.currentA * dt; // A*s
            totalTime += dt;
        }
        if (totalTime === 0) return 0;
        return weightedSum / totalTime; // A
    }

    /**
     * @returns Estimated time remaining in minutes
     */
    getEstimatedTimeRemaining(): number {
        const avgConsumptionA = this.getAverageConsumption();
        if (avgConsumptionA === 0) return Infinity;
        const minutes = (this.remainingCapacity / avgConsumptionA) * 60;
        return minutes; // in minutes
    }
}
