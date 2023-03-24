import {  IsNotEmpty, IsString } from 'class-validator';

export class CreateDeviceDto {
    @IsString()
    @IsNotEmpty()
    IMEINumber: string;

    @IsString()
    @IsNotEmpty()
    deviceName: string;

    @IsString()
    @IsNotEmpty()
    deviceType: string;

    @IsString()
    @IsNotEmpty()
    SIMNumber: string;

    @IsString()
    @IsNotEmpty()
    SIMInfo: string;

    notes: string;
}
