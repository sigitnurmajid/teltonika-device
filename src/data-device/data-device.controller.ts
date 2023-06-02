import { Controller, Get, NotFoundException, Param, Query, UseGuards } from '@nestjs/common';
import { DataDeviceService } from './data-device.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Device } from 'src/devices/entities/device.entity';
import { BasicAuthGuard } from '../auth/guards/basicAuth.guard';

@Controller('data-device')
export class DataDeviceController {
  constructor(private readonly dataDeviceService: DataDeviceService,
    @InjectRepository(Device)
    private devicesRepository: Repository<Device>
  ) { }

  @Get('history')
  @UseGuards(BasicAuthGuard)
  getHistory(@Query() params: any) {
    return this.dataDeviceService.getHistory(params)
  }

  @Get('last')
  @UseGuards(BasicAuthGuard)
  getLast(@Query() params: any) {
    return this.dataDeviceService.getLast(params)
  }

  @Get('tcp')
  @UseGuards(BasicAuthGuard)
  getTcpStatus() {
    return this.dataDeviceService.getTcpStatus()
  }

  @Get('tcp/:IMEINumber')
  @UseGuards(BasicAuthGuard)
  async findOneTcpStatus(@Param('IMEINumber') IMEINumber: string) {
    const device = await this.devicesRepository.findOneBy({ IMEINumber });
    if (!device) throw new NotFoundException('Device not found');
    return this.dataDeviceService.findOneTcpStatus(IMEINumber);
  }

  @Get('geolocation/last')
  @UseGuards(BasicAuthGuard)
  async getLocationDataLast(@Query() params: any) {
    return this.dataDeviceService.getLocationDataLast(params);
  }

  @Get('geolocation/history')
  @UseGuards(BasicAuthGuard)
  async getLocationDataHistory(@Query() params: any) {
    return this.dataDeviceService.getLocationDataHistory(params);
  }
}