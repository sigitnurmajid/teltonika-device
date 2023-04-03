import { Test, TestingModule } from '@nestjs/testing';
import { DataDeviceService } from './data-device.service';

describe('DataDeviceService', () => {
  let service: DataDeviceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DataDeviceService],
    }).compile();

    service = module.get<DataDeviceService>(DataDeviceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
