import { Injectable, OnModuleInit, Type } from '@nestjs/common';
import { ModulesContainer } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { MessageMappingProperties } from '@nestjs/websockets';
import { Observable } from 'rxjs';

@Injectable()
export class DiscoveryService implements OnModuleInit {
    constructor(private readonly modulesContainer: ModulesContainer) { }

    onModuleInit() {
        const messageMappings = this.findAllMessageMappings();
        console.log(messageMappings);
    }

    private findAllMessageMappings(): MessageMappingProperties[] {
        const modules = [...this.modulesContainer.values()];
        const mappings: MessageMappingProperties[] = [];

        modules.forEach((module) => {
            const providers = [...module.providers.values()];
            providers
                .filter((wrapper: InstanceWrapper) => wrapper.instance && wrapper.metatype)
                .forEach((wrapper: InstanceWrapper) => {
                    const { instance } = wrapper;
                    const prototype = Object.getPrototypeOf(instance);
                    if (!prototype) return;

                    const handlers = this.extractMessageHandlers(prototype);
                    mappings.push(...handlers);
                });
        });

        return mappings;
    }

    private extractMessageHandlers(prototype: any): MessageMappingProperties[] {
        const handlers: MessageMappingProperties[] = [];
        const keys = Reflect.ownKeys(prototype);
        keys.forEach((key) => {
            const method = prototype[key];
            const isMessageHandler = Reflect.getMetadata('isMessageHandler', method);
            if (isMessageHandler) {
                const message = Reflect.getMetadata('message', method);
                handlers.push({
                    message,
                    callback: method,
                    methodName: key as string,
                });
            }
        });
        return handlers;
    }
}