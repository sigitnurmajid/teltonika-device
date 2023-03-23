import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { Device } from './entities/device.entity';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(Device)
    private devicesRepository: Repository<Device>
  ) { }

  create(createDeviceDto: CreateDeviceDto) {
    const device = this.devicesRepository.create(createDeviceDto);
    return this.devicesRepository.save(device)
  }

  findAll() {
    return this.devicesRepository.find();
  }

  async findOne(IMEINumber: string) {
    const device = await this.devicesRepository.findOneBy({ IMEINumber });
    if (!device) throw new NotFoundException();
    return device;
  }

  async update(id: number, updateDeviceDto: UpdateDeviceDto) {
    const device = await this.devicesRepository.update(id, updateDeviceDto)
    if (device.affected === 0) throw new NotFoundException();
    return { message: 'Device updated' };
  }

  async remove(id: number) {
    const device = await this.devicesRepository.delete(id);
    if (device.affected === 0) throw new NotFoundException();
    return { message: 'Device deleted' };
  }
}
