import { Module } from '@nestjs/common';
import { LearningCenterService } from './learning_center.service';
import { LearningCenterController } from './learning_center.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LearningCenter } from '../../core/entities/learning_center.entity';
import { FileModule } from '../file/file.module';
import { Student } from '../../core/entities/student.entity';
import { Teacher } from '../../core/entities/teacher.entity';
import { Lesson } from '../../core/entities/lesson.entity';
import { StudentPayment } from '../../core/entities/student-payment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LearningCenter,
      Student,
      Teacher,
      StudentPayment,
      Lesson,
    ]),
    FileModule,
  ],
  controllers: [LearningCenterController],
  providers: [LearningCenterService],
})
export class LearningCenterModule {}
