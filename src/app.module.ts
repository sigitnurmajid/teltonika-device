import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DevicesModule } from './devices/devices.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device } from './devices/entities/device.entity';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/users.entitiy';
import { DataDeviceModule } from './data-device/data-device.module';

@Module({
  imports: [DevicesModule,
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DATABASE,
      entities: [Device, User],
      synchronize: true
    }),
    AuthModule,
    UsersModule,
    DataDeviceModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
