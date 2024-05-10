import { autoInjectable, delay, inject, injectable } from 'tsyringe';

export const Injectable = injectable;
export const Inject = inject;
export const DelayInject = (Symbol: any) => inject(delay(() => Symbol));
export interface Module {
    onModuleInit(): void | Promise<void>;
}


