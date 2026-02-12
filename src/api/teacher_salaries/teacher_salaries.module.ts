import { Module } from '@nestjs/common';
import { TeacherSalariesService } from './teacher_salaries.service';
import { TeacherSalariesController } from './teacher_salaries.controller';

@Module({
  controllers: [TeacherSalariesController],
  providers: [TeacherSalariesService],
})
export class TeacherSalariesModule {}
