import { Test, TestingModule } from '@nestjs/testing';
import { ControlGateway } from './control.gateway';

describe('ControlGateway', () => {
  let gateway: ControlGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ControlGateway],
    }).compile();

    gateway = module.get<ControlGateway>(ControlGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
