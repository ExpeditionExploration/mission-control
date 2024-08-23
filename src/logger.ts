import { ApplicationDependencies } from "./container";
import { ModuleDependencies } from "./module-loader";
export enum LogLevel {
    Info = 'info',
    Warn = 'warn',
    Error = 'error',
    Debug = 'debug',
}

export class Logger {
    private logLevels: LogLevel[];
    private namespace: string;

    constructor(deps: ModuleDependencies) {
        this.namespace = deps.namespace;
        this.logLevels = typeof deps.config.logger === 'boolean' ? [LogLevel.Info, LogLevel.Warn, LogLevel.Error, LogLevel.Debug] : deps.config.logger;
    }

    private getLogPrefix(logLevel: LogLevel) {
        return `[${this.namespace}] (${logLevel}) ${new Date().toJSON()} -`;
    }
    info(...args: any) {
        if (this.logLevels.includes(LogLevel.Info)) console.info(this.getLogPrefix(LogLevel.Info), ...args);
    }
    warn(...args: any) {
        if (this.logLevels.includes(LogLevel.Warn)) console.warn(this.getLogPrefix(LogLevel.Warn), this.namespace, ...args);
    }
    error(...args: any) {
        if (this.logLevels.includes(LogLevel.Error)) console.error(this.getLogPrefix(LogLevel.Error), ...args);
    }
    debug(...args: any) {
        if (this.logLevels.includes(LogLevel.Debug)) console.debug(this.getLogPrefix(LogLevel.Debug), ...args);
    }
}