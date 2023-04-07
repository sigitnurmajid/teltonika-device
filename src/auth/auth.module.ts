import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { RefreshTokenStrategy } from './strategies/refreshToken.strategy';
import { AuthController } from './auth.controller';
import { BasicStrategy } from './strategies/basicAuth.strategy';

@Module({
  imports: [
    ConfigModule.forRoot(),
    UsersModule,
    JwtModule.register({}),
  ],
  providers: [AuthService, JwtStrategy, RefreshTokenStrategy, BasicStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}