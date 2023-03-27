import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createDeviceDto: CreateDeviceDto) {
    return this.devicesService.create(createDeviceDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.devicesService.findAll();
  }

  @Get(':IMEINumber')
  findOne(@Param('IMEINumber') IMEINumber: string) {
    return this.devicesService.findOne(IMEINumber);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDeviceDto: UpdateDeviceDto) {
    return this.devicesService.update(+id, updateDeviceDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.devicesService.remove(+id);
  }
}
