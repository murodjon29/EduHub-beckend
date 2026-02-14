import { Module } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { TeachersController } from './teachers.controller';
import { Teacher } from '../../core/entities/teacher.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BcryptManage } from '../../infrastructure/lib/bcrypt';

@Module({
  imports: [TypeOrmModule.forFeature([Teacher])],
  controllers: [TeachersController],
  providers: [TeachersService, BcryptManage],
})
export class TeachersModule {}
