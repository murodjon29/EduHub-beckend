import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LearningCenter } from '../../core/entities/learning_center.entity';
import { FileModule } from '../file/file.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BcryptManage } from '../../infrastructure/lib/bcrypt';

@Module({
  imports: [
    TypeOrmModule.forFeature([LearningCenter]),

    // JWT modulini secret bilan sozlash
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      global: true,
      useFactory: (configService: ConfigService) => {
        // expiresIn ni to'g'ri formatda olish
        const expiresIn =
          configService.get<string>('ACCESS_TOKEN_TIME') || '24h';

        return {
          secret: configService.get<string>('ACCESS_TOKEN_KEY'),
          signOptions: {
            expiresIn: expiresIn as any, // TypeScript xatosini oldini olish
          },
        };
      },
    }),

    FileModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, BcryptManage],
})
export class AuthModule {}
