import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from '../../core/entities/group.entity';
import { Teacher } from '../../core/entities/teacher.entity';
import { LearningCenter } from '../../core/entities/learning_center.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Group, Teacher, LearningCenter])],
  controllers: [GroupController],
  providers: [GroupService],
})
export class GroupModule {}
