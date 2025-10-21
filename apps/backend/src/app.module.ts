import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CacheModule } from "@nestjs/cache-manager";
import { ThrottlerModule } from "@nestjs/throttler";
import { redisStore } from "cache-manager-redis-store";

import { DatabaseModule } from "./database/database.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UserModule } from "./modules/user/user.module";
import { TeamModule } from "./modules/team/team.module";
import { CalendarModule } from "./modules/calendar/calendar.module";
import { EventModule } from "./modules/event/event.module";

@Module({
  imports: [
    // 환경변수 설정
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),

    // 데이터베이스 설정
    DatabaseModule,

    // 캐시 설정 (Redis)
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: redisStore as any,
        host: process.env.REDIS_HOST || "localhost",
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD,
        ttl: 300, // 5분
      }),
    }),

    // Rate Limiting 설정
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1분
        limit: 100, // 100회 요청 제한
      },
    ]),

    // 모듈들
    AuthModule,
    UserModule,
    TeamModule,
    CalendarModule,
    EventModule,
  ],
})
export class AppModule {}
