import { Controller, Get, Query } from '@nestjs/common';
import { DataDeviceService } from './data-device.service';

@Controller('data-device')
export class DataDeviceController {
    constructor(private readonly dataDeviceService: DataDeviceService) { }

    @Get('history')
    getHistory(@Query() params : any) {
        return this.dataDeviceService.getHistory(params)
    }
}