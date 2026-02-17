import { Module } from '@nestjs/common';
import { LessonService } from './lesson.service';
import { LessonController } from './lesson.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lesson } from '../../core/entities/lesson.entity';
import { Group } from '../../core/entities/group.entity';
import { Teacher } from '../../core/entities/teacher.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lesson, Group, Teacher])],
  controllers: [LessonController],
  providers: [LessonService],
})
export class LessonModule {}
