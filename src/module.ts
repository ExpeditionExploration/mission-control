import { inject, injectable } from 'inversify';

export const Injectable = injectable;
export const Inject = inject;

export interface Module {
    onModuleInit(): void | Promise<void>;
}


