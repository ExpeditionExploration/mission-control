export { container } from 'tsyringe';
import { inject, injectable } from 'tsyringe';

export const Injectable = injectable;
export const Inject = inject;
export interface Module {
    onModuleInit(): void | Promise<void>;
}


