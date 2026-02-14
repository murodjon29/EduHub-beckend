import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { Student } from '../../core/entities/student.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LearningCenter } from '../../core/entities/learning_center.entity';
import { GroupStudent } from '../../core/entities/group_student.entity';
import { Group } from '../../core/entities/group.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student, LearningCenter, GroupStudent, Group]),
  ],
  controllers: [StudentsController],
  providers: [StudentsService],
})
export class StudentsModule {}
