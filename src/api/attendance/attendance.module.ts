import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendance } from '../../core/entities/attendance.entity';
import { Teacher } from '../../core/entities/teacher.entity';
import { Student } from '../../core/entities/student.entity';
import { Group } from '../../core/entities/group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Attendance, Group, Student, Teacher])],
  controllers: [AttendanceController],
  providers: [AttendanceService],
})
export class AttendanceModule {}
