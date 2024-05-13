import 'reflect-metadata';
import { Inject, Injectable } from '@module';
import { ModuleLoader, ModulesImport } from 'src/module-loader';
import Events from '@events';
import Connection, { type IConnection } from './connection';

export interface IApplication {

}
export const Application = Symbol('Application');