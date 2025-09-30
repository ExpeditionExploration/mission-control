import { Module } from 'src/module';
import { Payload } from 'src/connection';
import fs from 'node:fs/promises';
import path from 'node:path';
import JSON5 from 'json5';

export class ConfigurationModuleServer extends Module {
    private settings: { [key: string]: any };

    async onModuleInit(): Promise<void> {
        const file = path.resolve(process.cwd(), 'moduleConfig.json5');
        try {
            const text = await fs.readFile(file, 'utf8');
            this.settings = JSON5.parse(text);
        } catch (err) {
            this.settings = {};
            this.logger.warn(`[config] Could not read ${file}:`, err);
        }
        this.broadcaster.on('*:configRequest', (configRequest: Payload) => {
            const payload: Payload = {
                event: 'configResponse',
                namespace: configRequest.namespace,
                data: this.settings,
            }
            this.broadcaster.emitLocal(payload);
        });
        this.logger.debug("[config] Configuration module initialized")
    }

    onModuleConfigReceived(): void | Promise<void> {
    }
}
