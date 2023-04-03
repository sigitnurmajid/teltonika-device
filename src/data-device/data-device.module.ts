import { Module } from '@nestjs/common';
import { DataDeviceService } from './data-device.service';
import { InfluxProvider } from './providers/influx.provider';
import { DataDeviceController } from './data-device.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device } from 'src/devices/entities/device.entity';

@Module({
  providers: [DataDeviceService, InfluxProvider],
  controllers: [DataDeviceController],
  imports: [TypeOrmModule.forFeature([Device])]
})
export class DataDeviceModule { }
