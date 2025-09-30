import { Module } from 'src/module';
import si from 'systeminformation';
import checkDiskSpace from 'check-disk-space'
import { Stats } from './types';

export class StatsModuleServer extends Module {
    onModuleInit(): void | Promise<void> {
        setInterval(async () => {
            const [cpu, mem, temp, disk] = await Promise.all([si.currentLoad(), si.mem(), si.cpuTemperature(), checkDiskSpace(process.cwd())]);

            const data: Stats = {
                cpu: cpu.currentLoad,
                memory: (mem.available / mem.total) * 100,
                temperature: temp.main || 0,
                storage: Math.ceil(100 - disk.free / disk.size * 100)
            }

            this.emit<Stats>('stats', data);
        }, 1000);
    }

    processConfig(): void | Promise<void> {
    }
}
