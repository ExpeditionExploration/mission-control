// // Jest test file

// import { MockedModuleDependencies, mockModuleDependencies } from 'src/test/mocks';
// import { ControlModuleServer } from './server';

// describe('ControlModuleController', () => {
//     let controller!: ControlModuleServer;
//     let deps!: MockedModuleDependencies;

//     beforeEach(() => {
//         deps = mockModuleDependencies();
//         controller = new ControlModuleServer(deps);
//     });

//     it('should be defined', () => {
//         expect(controller).toBeDefined();
//     });

//     it('should map axis values to aileron rotation targets', () => {
//         expect(controller.mapAxisToAileron({ x: 0, y: 0 })).toEqual({ left: 0, right: 0 });
//         expect(controller.mapAxisToAileron({ x: 0, y: 1 })).toEqual({ left: -90, right: -90 });
//         expect(controller.mapAxisToAileron({ x: 1, y: 1 })).toEqual({ left: -90, right: 0 });
//         expect(controller.mapAxisToAileron({ x: 1, y: 0 })).toEqual({ left: -90, right: 90 });
//         expect(controller.mapAxisToAileron({ x: 1, y: -1 })).toEqual({ left: 0, right: 90 });
//         expect(controller.mapAxisToAileron({ x: 0, y: -1 })).toEqual({ left: 90, right: 90 });
//         expect(controller.mapAxisToAileron({ x: -1, y: -1 })).toEqual({ left: 90, right: 0 });
//         expect(controller.mapAxisToAileron({ x: -1, y: 0 })).toEqual({ left: 90, right: -90 });
//         expect(controller.mapAxisToAileron({ x: -1, y: 1 })).toEqual({ left: 0, right: -90 });
//     });

//     it('should map axis values to aileron rotation targets with invert y off', () => {
//         expect(controller.mapAxisToAileron({ x: 0, y: 0 }, false)).toEqual({ left: 0, right: 0 });
//         expect(controller.mapAxisToAileron({ x: 0, y: 1 }, false)).toEqual({ left: 90, right: 90 });
//         expect(controller.mapAxisToAileron({ x: 1, y: 1 }, false)).toEqual({ left: 0, right: 90 });
//         expect(controller.mapAxisToAileron({ x: 1, y: 0 }, false)).toEqual({ left: -90, right: 90 });
//         expect(controller.mapAxisToAileron({ x: 1, y: -1 }, false)).toEqual({ left: -90, right: 0 });
//         expect(controller.mapAxisToAileron({ x: 0, y: -1 }, false)).toEqual({ left: -90, right: -90 });
//         expect(controller.mapAxisToAileron({ x: -1, y: -1 }, false)).toEqual({ left: 0, right: -90 });
//         expect(controller.mapAxisToAileron({ x: -1, y: 0 }, false)).toEqual({ left: 90, right: -90 });
//         expect(controller.mapAxisToAileron({ x: -1, y: 1 }, false)).toEqual({ left: 90, right: 0 });
//     });
// });