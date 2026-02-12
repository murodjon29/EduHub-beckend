import { Module } from '@nestjs/common';
import { GroupStudentsService } from './group_students.service';
import { GroupStudentsController } from './group_students.controller';

@Module({
  controllers: [GroupStudentsController],
  providers: [GroupStudentsService],
})
export class GroupStudentsModule {}
