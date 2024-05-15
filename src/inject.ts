import { delay, inject, injectable, autoInjectable } from 'tsyringe';

export const Injectable = injectable;
export const AutoInjectable = autoInjectable;
export const Inject = inject;
export const DelayInject = (Symbol: any) => inject(delay(() => Symbol));

