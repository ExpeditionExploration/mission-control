import { ConsoleLogger, LogLevel } from '@nestjs/common';
import { inspect } from 'util';

export class Logger extends ConsoleLogger {
    logLevels: Record<LogLevel, boolean> = {
        log: false,
        error: false,
        warn: false,
        debug: false,
        verbose: false,
        fatal: false,
    };

    constructor() {
        super();

        const logging =
            process.env.NESTJS_LOGGING === 'true'
                ? ['verbose']
                : process.env.NESTJS_LOGGING?.split(',').map((e) => e.trim()) ?? [];

        const verbose = logging.includes('verbose');
        this.logLevels.log = verbose || logging.includes('log');
        this.logLevels.error = verbose || logging.includes('error');
        this.logLevels.warn = verbose || logging.includes('warn');
        this.logLevels.debug = verbose || logging.includes('debug');
        this.logLevels.fatal = true; // Always log fatal errors
        this.logLevels.verbose = verbose;
    }

    /**
     * Overrides the default print messages so it uses a cleaner output and logs using console instead of process.write.
     * This ensures that javascript objects will log correctly.
     */
    protected printMessages(
        messages: unknown[],
        context?: string,
        logLevel?: LogLevel,
        writeStreamType?: 'stdout' | 'stderr',
    ): void {
        if (this.logLevels.verbose || this.logLevels[logLevel]) {
            const useColor = !process.env.NO_COLOR;
            const output = [
                this.colorize(logLevel.toUpperCase(), logLevel),
                this.formatContext(context),
                ...messages.map((message) => {
                    if (process.env.NODE_ENV !== 'production') {
                        return inspect(message, { colors: useColor, depth: 10, compact: false });
                    } else {
                        let out = message;
                        if (message instanceof Error) {
                            // Errors don't log correctly, so we need to extract the message and stack
                            out = {
                                message: message.message,
                                stack: message.stack.split('\n').map((e) => e.trim()),
                            };
                        }
                        return JSON.stringify(out);
                    }
                }),
            ].join(' ');

            if (writeStreamType === 'stderr') {
                console.error(output);
            } else {
                console.log(output);
            }
        }
    }
}