import * as i2c from 'i2c-bus';
export const ADDRESS = 0x40;
export const FREQUENCY = 50;
export const MODE1 = 0x00;
export const PRESCALE = 0xfe;

export const channels: Record<
    number,
    {
        on: [number, number];
        off: [number, number];
    }
> = {
    0: { on: [0x06, 0x07], off: [0x08, 0x09] },
    1: { on: [0x0a, 0x0b], off: [0x0c, 0x0d] },
    2: { on: [0x0e, 0x0f], off: [0x10, 0x11] },
    3: { on: [0x12, 0x13], off: [0x14, 0x15] },
    4: { on: [0x16, 0x17], off: [0x18, 0x19] },
    5: { on: [0x1a, 0x1b], off: [0x1c, 0x1d] },
    6: { on: [0x1e, 0x1f], off: [0x20, 0x21] },
    7: { on: [0x22, 0x23], off: [0x24, 0x25] },
    8: { on: [0x26, 0x27], off: [0x28, 0x29] },
    9: { on: [0x2a, 0x2b], off: [0x2c, 0x2d] },
    10: { on: [0x2e, 0x2f], off: [0x30, 0x31] },
    11: { on: [0x32, 0x33], off: [0x34, 0x35] },
    12: { on: [0x36, 0x37], off: [0x38, 0x39] },
    13: { on: [0x3a, 0x3b], off: [0x3c, 0x3d] },
    14: { on: [0x3e, 0x3f], off: [0x40, 0x41] },
    15: { on: [0x42, 0x43], off: [0x44, 0x45] },
};

const ic2Bus = i2c.openSync(0);
const ic2BusPromisified = ic2Bus.promisifiedBus();

// Go to sleep
ic2Bus.writeByteSync(ADDRESS, MODE1, 0x11);

// Set the prescaler
const prescale = Math.round(25000000 / (4096 * FREQUENCY)) - 1;
ic2Bus.writeByteSync(ADDRESS, PRESCALE, prescale);

// Leave sleep mode
ic2Bus.writeByteSync(ADDRESS, MODE1, 0x1);

export function mapValue(current: number, out_min = 0, out_max = 1, in_min = 0, in_max = 1) {
    const mapped = ((current - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
    return mapped;
}

export async function wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function setDutyCycle(channel: number, dutyCycle: number) {
    const {
        on: [ON_L, ON_H],
        off: [OFF_L, OFF_H],
    } = channels[channel];

    // Set the on time
    const hex = Math.floor(dutyCycle * 4095).toString(16);
    const hexArray = hex.split('');
    const stopL = hexArray.splice(-2).join(''); // Last 2 elements
    const stopH = hexArray.join(''); // First elements

    // Start on from 0 no delay
    await ic2BusPromisified.writeByte(ADDRESS, ON_H, 0);
    await ic2BusPromisified.writeByte(ADDRESS, ON_L, 0);

    // Set the off time
    await ic2BusPromisified.writeByte(ADDRESS, OFF_H, parseInt(stopH || '0', 16));
    await ic2BusPromisified.writeByte(ADDRESS, OFF_L, parseInt(stopL, 16));
}
