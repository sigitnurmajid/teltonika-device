import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { DataDeviceService } from './data-device.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Device } from 'src/devices/entities/device.entity';

@Controller('data-device')
export class DataDeviceController {
  constructor(private readonly dataDeviceService: DataDeviceService,
    @InjectRepository(Device)
    private devicesRepository: Repository<Device>
  ) { }

  @Get('history')
  getHistory(@Query() params: any) {
    return this.dataDeviceService.getHistory(params)
  }

  @Get('last')
  getLast(@Query() params: any) {
    return this.dataDeviceService.getLast(params)
  }

  @Get('tcp')
  getTcpStatus() {
    return this.dataDeviceService.getTcpStatus()
  }

  @Get('tcp/:IMEINumber')
  async findOneTcpStatus(@Param('IMEINumber') IMEINumber: string) {
    const device = await this.devicesRepository.findOneBy({ IMEINumber });
    if (!device) throw new NotFoundException('Device not found');
    return this.dataDeviceService.findOneTcpStatus(IMEINumber);
  }
}