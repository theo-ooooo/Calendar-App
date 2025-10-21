import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as helmet from 'helmet';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 보안 설정
  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());

  // CORS 설정
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // 전역 파이프 설정
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('일정공유 서비스 API')
    .setDescription('일정공유 서비스의 API 문서')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 서버가 포트 ${port}에서 실행 중입니다.`);
  console.log(`📚 API 문서: http://localhost:${port}/api/docs`);
}

bootstrap();