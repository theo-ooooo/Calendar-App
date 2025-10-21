import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        // 데이터베이스 연결 정보가 없으면 기본값으로 설정
        const dbHost = configService.get("DB_HOST", "localhost");
        const dbPort = configService.get("DB_PORT", 3306);
        const dbUsername = configService.get("DB_USERNAME", "root");
        const dbPassword = configService.get("DB_PASSWORD", "");
        const dbDatabase = configService.get("DB_DATABASE", "calendar_sharing");

        return {
          type: "mysql",
          host: dbHost,
          port: dbPort,
          username: dbUsername,
          password: dbPassword,
          database: dbDatabase,
          // entities: [__dirname + "/../**/*.entity{.ts,.js}"],
          synchronize: configService.get("NODE_ENV") !== "production",
          logging: configService.get("NODE_ENV") === "development",
          timezone: "+09:00",
          charset: "utf8mb4",
          retryAttempts: 1,
          retryDelay: 1000,
          // 연결 실패 시 서버 시작을 중단하지 않도록 설정
          autoLoadEntities: true,
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
