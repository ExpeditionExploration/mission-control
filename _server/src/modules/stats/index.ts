// https://systeminformation.io/cpu.html
import si from 'systeminformation';
import { Module } from '../../types';

export const Stats: Module = ({ emit, log }) => {
    setInterval(async () => {
        const [cpu, mem, temp] = await Promise.all([si.currentLoad(), si.mem(), si.cpuTemperature()]);

        const data = {
            cpu: cpu.currentLoad,
            mem: (mem.available / mem.total) * 100,
            temp: temp.main,
        };

        log('Stats', data);

        emit('stats', data);
    }, 1000);
};
