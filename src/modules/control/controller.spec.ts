// Jest test file

import { MockedModuleDependencies, mockModuleDependencies } from 'src/mocks';
import { ControlModuleController } from './controller';

describe('ControlModuleController', () => {
    let controller!: ControlModuleController;
    let deps!: MockedModuleDependencies;

    beforeEach(() => {
        deps = mockModuleDependencies();
        controller = new ControlModuleController(deps);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should map axis values to aileron rotation targets', () => {
        // Test case 1
        const input1 = { x: 0, y: 1 };
        const expected1 = { left: -90, right: -90 };
        expect(controller.mapAxisToAileron(input1)).toEqual(expected1);

        // Test case 2
        const input2 = { x: 1, y: 1 };
        const expected2 = { left: -90, right: 0 };
        expect(controller.mapAxisToAileron(input2)).toEqual(expected2);

        // Test case 3
        const input3 = { x: 1, y: 0 };
        const expected3 = { left: -90, right: 90 };
        expect(controller.mapAxisToAileron(input3)).toEqual(expected3);

        // Test case 4
        const input4 = { x: 1, y: -1 };
        const expected4 = { left: 0, right: 90 };
        expect(controller.mapAxisToAileron(input4)).toEqual(expected4);

        // Test case 5
        const input5 = { x: 0, y: -1 };
        const expected5 = { left: 90, right: 90 };
        expect(controller.mapAxisToAileron(input5)).toEqual(expected5);

        // Test case 6
        const input6 = { x: -1, y: -1 };
        const expected6 = { left: 90, right: 0 };
        expect(controller.mapAxisToAileron(input6)).toEqual(expected6);

        // Test case 7
        const input7 = { x: -1, y: 0 };
        const expected7 = { left: 90, right: -90 };
        expect(controller.mapAxisToAileron(input7)).toEqual(expected7);

        // Test case 8
        const input8 = { x: -1, y: 1 };
        const expected8 = { left: 0, right: -90 };
        expect(controller.mapAxisToAileron(input8)).toEqual(expected8);
    });
});