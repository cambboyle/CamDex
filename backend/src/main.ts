import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { HttpLoggerInterceptor } from './common/interceptors/http-logger.interceptor';
import { JsonLoggerService } from './common/logger/json-logger.service';

async function bootstrap() {
  const logger = new JsonLoggerService();

  const app = await NestFactory.create(AppModule, { logger });

  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new HttpLoggerInterceptor(logger));
  app.useGlobalFilters(new AllExceptionsFilter(logger));

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  logger.log(`Backend running on http://0.0.0.0:${port}`, 'Bootstrap');
}

void bootstrap();
