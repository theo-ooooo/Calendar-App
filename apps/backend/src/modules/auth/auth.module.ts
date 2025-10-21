import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { RefreshTokenService } from './refresh-token.service';
import { UserModule } from '../user/user.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { KakaoStrategy } from './strategies/kakao.strategy';
import { NaverStrategy } from './strategies/naver.strategy';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '7d'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    RefreshTokenService,
    JwtStrategy,
    LocalStrategy,
    GoogleStrategy,
    KakaoStrategy,
    NaverStrategy,
  ],
  controllers: [AuthController],
  exports: [AuthService, RefreshTokenService],
})
export class AuthModule {}