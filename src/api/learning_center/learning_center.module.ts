import { Module } from '@nestjs/common';
import { LearningCenterService } from './learning_center.service';
import { LearningCenterController } from './learning_center.controller';

@Module({
  controllers: [LearningCenterController],
  providers: [LearningCenterService],
})
export class LearningCenterModule {}
