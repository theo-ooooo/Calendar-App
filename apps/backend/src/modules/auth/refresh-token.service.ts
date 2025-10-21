import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { JwtService } from '@nestjs/jwt';

import { User } from '../user/entities/user.entity';
import { JwtPayload } from './interfaces/jwt-payload.interface';

interface RefreshTokenData {
  userId: string;
  deviceInfo?: string;
  ipAddress?: string;
  createdAt: Date;
  expiresAt: Date;
}

@Injectable()
export class RefreshTokenService {
  private readonly REFRESH_TOKEN_PREFIX = 'refresh_token:';
  private readonly USER_TOKENS_PREFIX = 'user_tokens:';
  private readonly REFRESH_TOKEN_TTL = 30 * 24 * 60 * 60; // 30일 (초 단위)

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly jwtService: JwtService,
  ) {}

  async generateRefreshToken(
    user: User,
    deviceInfo?: string,
    ipAddress?: string,
  ): Promise<string> {
    // 기존 사용자 토큰들 삭제
    await this.revokeAllUserTokens(user.id);

    // JWT 리프레시 토큰 생성
    const now = new Date();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30일 후 만료

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      type: 'refresh', // 토큰 타입 구분
    };

    const token = this.jwtService.sign(payload, {
      expiresIn: '30d',
      secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    });

    const tokenData: RefreshTokenData = {
      userId: user.id,
      deviceInfo,
      ipAddress,
      createdAt: now,
      expiresAt,
    };

    // Redis에 토큰 데이터 저장 (JWT 자체는 stateless이지만 추가 정보를 위해)
    const tokenKey = `${this.REFRESH_TOKEN_PREFIX}${token}`;
    await this.cacheManager.set(tokenKey, tokenData, this.REFRESH_TOKEN_TTL * 1000);

    // 사용자별 토큰 목록에 추가
    const userTokensKey = `${this.USER_TOKENS_PREFIX}${user.id}`;
    const existingTokens = await this.cacheManager.get<string[]>(userTokensKey) || [];
    existingTokens.push(token);
    await this.cacheManager.set(userTokensKey, existingTokens, this.REFRESH_TOKEN_TTL * 1000);

    return token;
  }

  async validateRefreshToken(token: string): Promise<RefreshTokenData | null> {
    try {
      // JWT 토큰 검증
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      });

      // 토큰 타입 확인
      if (payload.type !== 'refresh') {
        return null;
      }

      // Redis에서 추가 정보 조회
      const tokenKey = `${this.REFRESH_TOKEN_PREFIX}${token}`;
      const tokenData = await this.cacheManager.get<RefreshTokenData>(tokenKey);

      if (!tokenData) {
        return null;
      }

      // 만료 확인 (JWT 자체의 만료시간과 Redis의 만료시간 모두 확인)
      if (tokenData.expiresAt < new Date()) {
        await this.revokeRefreshToken(token);
        return null;
      }

      return tokenData;
    } catch (error) {
      // JWT 검증 실패
      return null;
    }
  }

  async revokeRefreshToken(token: string): Promise<void> {
    const tokenKey = `${this.REFRESH_TOKEN_PREFIX}${token}`;
    const tokenData = await this.cacheManager.get<RefreshTokenData>(tokenKey);

    if (tokenData) {
      // 토큰 삭제
      await this.cacheManager.del(tokenKey);

      // 사용자별 토큰 목록에서 제거
      const userTokensKey = `${this.USER_TOKENS_PREFIX}${tokenData.userId}`;
      const existingTokens = await this.cacheManager.get<string[]>(userTokensKey) || [];
      const updatedTokens = existingTokens.filter(t => t !== token);
      
      if (updatedTokens.length > 0) {
        await this.cacheManager.set(userTokensKey, updatedTokens, this.REFRESH_TOKEN_TTL * 1000);
      } else {
        await this.cacheManager.del(userTokensKey);
      }
    }
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    const userTokensKey = `${this.USER_TOKENS_PREFIX}${userId}`;
    const tokens = await this.cacheManager.get<string[]>(userTokensKey) || [];

    // 모든 토큰 삭제
    for (const token of tokens) {
      const tokenKey = `${this.REFRESH_TOKEN_PREFIX}${token}`;
      await this.cacheManager.del(tokenKey);
    }

    // 사용자별 토큰 목록 삭제
    await this.cacheManager.del(userTokensKey);
  }

  async getUserActiveTokens(userId: string): Promise<RefreshTokenData[]> {
    const userTokensKey = `${this.USER_TOKENS_PREFIX}${userId}`;
    const tokens = await this.cacheManager.get<string[]>(userTokensKey) || [];
    
    const activeTokens: RefreshTokenData[] = [];
    
    for (const token of tokens) {
      const tokenKey = `${this.REFRESH_TOKEN_PREFIX}${token}`;
      const tokenData = await this.cacheManager.get<RefreshTokenData>(tokenKey);
      
      if (tokenData && tokenData.expiresAt > new Date()) {
        // JWT 토큰도 검증
        try {
          this.jwtService.verify(token, {
            secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
          });
          activeTokens.push(tokenData);
        } catch (error) {
          // 만료된 JWT 토큰은 목록에서 제거
          await this.revokeRefreshToken(token);
        }
      }
    }

    return activeTokens;
  }

  async cleanupExpiredTokens(): Promise<void> {
    // Redis의 TTL 기능을 사용하므로 별도의 정리 작업이 필요하지 않음
    // 만료된 키는 자동으로 삭제됨
  }

  async getTokenInfo(token: string): Promise<RefreshTokenData | null> {
    const tokenKey = `${this.REFRESH_TOKEN_PREFIX}${token}`;
    return this.cacheManager.get<RefreshTokenData>(tokenKey);
  }
}