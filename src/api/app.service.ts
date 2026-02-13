import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { HttpException, HttpStatus, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as fs from 'fs';
import cors from 'cors';
import { AllExceptionsFilter } from '../infrastructure/lib';
import { config } from '../config';

export default class Application {
  public static async main(): Promise<void> {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    // ================= GLOBAL SETTINGS =================
    app.useGlobalFilters(new AllExceptionsFilter());
    app.use(cookieParser());
    app.enableCors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });
    // ✅ ValidationPipe with exceptionFactory
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        exceptionFactory: (errors) => {
          const fields = errors.reduce(
            (acc, err) => {
              if (err.constraints) {
                acc[err.property] = Object.values(err.constraints);
              }
              return acc;
            },
            {} as Record<string, string[]>,
          );

          return new HttpException(
            {
              success: false,
              statusCode: 422,
              error: {
                code: 'VALIDATION_ERROR',
                fields,
              },
            },
            422,
          );
        },
      }),
    );

    // ================= STATIC FILES =================
    const uploadsPath = join(process.cwd(), 'uploads'); // root loyihadan absolute path
    if (!fs.existsSync(uploadsPath)) {
      fs.mkdirSync(uploadsPath, { recursive: true }); // papka bo‘lmasa yaratadi
    }
    app.useStaticAssets(uploadsPath, {
      prefix: '/api/v1/uploads',
    });

    // ================= GLOBAL PREFIX & SWAGGER =================
    const api = 'api/v1';
    app.setGlobalPrefix(api);
    const config_swagger = new DocumentBuilder()
      .setTitle('EduHub API')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          in: 'header',
        },
        'Authorization',
      )
      .build();
    const documentFactory = () =>
      SwaggerModule.createDocument(app, config_swagger);
    SwaggerModule.setup(api, app, documentFactory);

    app.use(
      cors({
        origin: '*',
        credentials: true,
      }),
    );

    // ================= START SERVER =================
    await app.listen(config.PORT ?? 3000, () => {
      console.log(`Server running on port ${config.PORT}`);
      console.log(`http://localhost:${config.PORT}/api/v1`);
    });
  }
}
