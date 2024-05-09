import { injectable, inject } from 'inversify';

export const Module = injectable; // In future this might be a decorator that takes options
export const Injectable = injectable;
export const Inject = inject;

