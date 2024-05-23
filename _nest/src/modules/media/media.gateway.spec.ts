import { Test, TestingModule } from '@nestjs/testing';
import { MediaGateway } from './media.gateway';

describe('MediaGateway', () => {
  let gateway: MediaGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MediaGateway],
    }).compile();

    gateway = module.get<MediaGateway>(MediaGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
