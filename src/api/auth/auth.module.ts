import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LearningCenter } from '../../core/entities/learning_center.entity';
import { FileModule } from '../file/file.module';
import { JwtModule } from '@nestjs/jwt';
import { BcryptManage } from '../../infrastructure/lib/bcrypt';

@Module({
  imports: [
    TypeOrmModule.forFeature([LearningCenter]),
  JwtModule.register({ global: true }), 
  FileModule,],
  controllers: [AuthController],
  providers: [AuthService, BcryptManage],
})
export class AuthModule { }
