import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { HttpException, HttpStatus, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as fs from 'fs';
import { AllExceptionsFilter } from '../infrastructure/lib';
import { config } from '../config';

export default class Application {
  public static async main(): Promise<void> {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    // ================= GLOBAL FILTER =================
    app.useGlobalFilters(new AllExceptionsFilter());

    // ================= COOKIE =================
    app.use(cookieParser());

    // ================= CORS (FAqat BITTA JOYDA) =================
    app.enableCors({
      origin: [
        'http://localhost:5173',      // local frontend
        'https://app.novdaunion.uz',  // production frontend
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    // ================= VALIDATION PIPE =================
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
    const uploadsPath = join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsPath)) {
      fs.mkdirSync(uploadsPath, { recursive: true });
    }

    app.useStaticAssets(uploadsPath, {
      prefix: '/api/v1/uploads',
    });

    // ================= PREFIX & SWAGGER =================
    const api = 'api/v1';
    app.setGlobalPrefix(api);

    const swaggerConfig = new DocumentBuilder()
      .setTitle('EduHub REST API')
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

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(api, app, document);

    // ================= START SERVER =================
    await app.listen(config.PORT ?? 3000);

    console.log(`Server running on port ${config.PORT ?? 3000}`);
  }
}