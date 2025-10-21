import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { User, AuthProvider } from '../user/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { RefreshTokenService } from './refresh-token.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const { email, password, name } = registerDto;

    // 이메일 중복 확인
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('이미 사용 중인 이메일입니다.');
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 12);

    // 사용자 생성
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      name,
      provider: AuthProvider.LOCAL,
    });

    const savedUser = await this.userRepository.save(user);

    // JWT 토큰 생성
    const payload: JwtPayload = {
      sub: savedUser.id,
      email: savedUser.email,
      name: savedUser.name,
      type: 'access',
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.refreshTokenService.generateRefreshToken(savedUser);

    return {
      user: savedUser,
      accessToken,
      refreshToken: refreshToken.token,
    };
  }

  async login(loginDto: LoginDto, deviceInfo?: string, ipAddress?: string): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const { email, password } = loginDto;

    // 사용자 찾기
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    // 활성 상태 확인
    if (!user.isActive) {
      throw new UnauthorizedException('비활성화된 계정입니다.');
    }

    // 마지막 로그인 시간 업데이트
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    // JWT 토큰 생성
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      type: 'access',
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.refreshTokenService.generateRefreshToken(user, deviceInfo, ipAddress);

    return {
      user,
      accessToken,
      refreshToken: refreshToken.token,
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const tokenData = await this.refreshTokenService.validateRefreshToken(refreshToken);
    
    if (!tokenData) {
      throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
    }

    const user = tokenData.user;

    // 새 액세스 토큰 생성
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      type: 'access',
    };

    const newAccessToken = this.jwtService.sign(payload);

    // 새 리프레시 토큰 생성 (기존 토큰은 비활성화됨)
    const newRefreshToken = await this.refreshTokenService.generateRefreshToken(
      user,
      tokenData.deviceInfo,
      tokenData.ipAddress,
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken.token,
    };
  }

  async logout(refreshToken: string): Promise<void> {
    await this.refreshTokenService.revokeRefreshToken(refreshToken);
  }

  async logoutAll(userId: string): Promise<void> {
    await this.refreshTokenService.revokeAllUserTokens(userId);
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }
    return null;
  }

  async findOrCreateSocialUser(
    provider: AuthProvider,
    providerId: string,
    email: string,
    name: string,
    profileImage?: string,
    deviceInfo?: string,
    ipAddress?: string,
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    let user = await this.userRepository.findOne({
      where: { provider, providerId },
    });

    if (!user) {
      // 소셜 로그인으로 새 사용자 생성
      user = this.userRepository.create({
        provider,
        providerId,
        email,
        name,
        profileImage,
        isActive: true,
      });

      user = await this.userRepository.save(user);
    } else {
      // 기존 사용자 정보 업데이트
      user.name = name;
      user.profileImage = profileImage;
      user.lastLoginAt = new Date();
      user = await this.userRepository.save(user);
    }

    // JWT 토큰 생성
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      type: 'access',
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.refreshTokenService.generateRefreshToken(user, deviceInfo, ipAddress);

    return {
      user,
      accessToken,
      refreshToken: refreshToken.token,
    };
  }

  async validateJwtPayload(payload: JwtPayload): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }

    return user;
  }

  async getUserActiveTokens(userId: string): Promise<RefreshToken[]> {
    return this.refreshTokenService.getUserActiveTokens(userId);
  }
}