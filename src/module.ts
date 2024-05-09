import { Container, injectable } from 'inversify';
import getDecorators from 'inversify-inject-decorators'

export const container = new Container();
const { lazyInject } = getDecorators(container);
export const Injectable = injectable;
export const Inject = lazyInject;

export interface Module {
    onModuleInit(): void | Promise<void>;
}


