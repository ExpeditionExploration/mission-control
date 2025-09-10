import {
    bindings, SensorEvent, SensorId
} from 'bno08x'

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

type MeasurementCallback = (ev: SensorEvent, cookie: Object) => void

class IMU {
    private bus: number
    private addr: number
    private sensor = bindings

    private measurementCallback?: MeasurementCallback

    constructor(
        bus: number,
        addr: number,
    ) {
        this.bus = bus
        this.addr = addr
        this.sensor.setI2CConfig(bus, addr)
    }

    /**
     * Enable a sensor with SensorId.
     * 
     * @param s SensorId to enable.
     * @param evCb `MeasurementCallback` to be called on receiving a value from
     *              sensor.
     * @param reportInterval_us 
     */
    enableSensor(s: SensorId, reportInterval_ms: number) {
        this.sensor.setSensorConfig(s, {
            alwaysOnEnabled: true,
            reportInterval_us: reportInterval_ms * 1000, // Convert ms to us
        })
    }

    /**
     * All IMU measurements have a common callback
     * 
     * @param cb 
     */
    setMeasurementCallback(cb: MeasurementCallback): void {
        this.sensor.setSensorCallback(cb, {})
    }

    useInterrupts() {
        this.sensor.useInterrupts("gpiochip1", 26)
    }

    /**
     * Open connection to the sensor hub
     * 
     * Optional args:
     * - `drvEvCb` Callback for driver/hub events.
     * - `cookie` This is passed as an argument for `drvEvCb`.
     */
    open(drvEvCb?: (ev: SensorEvent, cookie?: Object) => void, cookie?: Object) {
        // TODO: Make the cookie optional.
        this.sensor.open(drvEvCb ?? ((ev, cookie: Object) => {
        }), cookie ?? { msg: "This cookies has to be an object" })
    }

    /**
     * Turn the sensor hub on
     */
    devOn() {
        this.sensor.devOn()
    }

    devClose() {
        this.sensor.close()
    }

    devReset() {
        this.sensor.devReset()
    }

    service() {
        this.sensor.service()
    }
}

export {
    SensorId, IMU, type MeasurementCallback, type SensorEvent
}
