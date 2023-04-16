// https://systeminformation.io/cpu.html
import si from 'systeminformation';
import { Module } from '../../types';

export const Stats: Module = ({
    emit
}) => {
    setInterval(async () => {
        const [cpu, mem, temp] = await Promise.all([
            si.currentLoad(),
            si.mem(),
            si.cpuTemperature(),
        ]);

        console.log(mem)

        emit({
            cpu: cpu.currentLoad,
            mem: mem.available / mem.total * 100,
            temp: temp.main
        });
    }, 1000)
}