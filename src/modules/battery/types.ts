type BatteryStatus = {
    level: number;
    minutesRemaining: number;
    /**
     * Current draw in mA
     */
    currentDraw: number;
};

export { type BatteryStatus };