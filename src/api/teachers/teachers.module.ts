import { Module } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { TeachersController } from './teachers.controller';
import { Teacher } from '../../core/entities/teacher.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BcryptManage } from '../../infrastructure/lib/bcrypt';
import { Group } from '../../core/entities/group.entity';
import { GroupStudent } from '../../core/entities/group_student.entity';
import { Lesson } from '../../core/entities/lesson.entity';
import { Attendance } from '../../core/entities/attendance.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Teacher, Group, GroupStudent, Lesson, Attendance]),
  ],
  controllers: [TeachersController],
  providers: [TeachersService, BcryptManage],
})
export class TeachersModule {}
