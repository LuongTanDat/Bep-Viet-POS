import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/** Khởi động API, cấu hình prefix, CORS và validation chung. */
async function khoiDong() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const webOrigin = config.get<string>('WEB_ORIGIN') ?? 'http://localhost:3000';

  app.setGlobalPrefix('api/v1');
  app.enableCors({ origin: webOrigin, credentials: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const port = Number(config.get<string>('PORT') ?? 4000);
  await app.listen(port);
  console.log(`✅ Bếp Việt POS API chạy tại http://localhost:${port}/api/v1`);
}

void khoiDong();
