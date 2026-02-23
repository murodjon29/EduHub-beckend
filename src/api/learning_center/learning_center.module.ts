import { Module } from '@nestjs/common';
import { LearningCenterService } from './learning_center.service';
import { LearningCenterController } from './learning_center.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LearningCenter } from '../../core/entities/learning_center.entity';
import { FileModule } from '../file/file.module';

@Module({
  imports: [TypeOrmModule.forFeature([LearningCenter]), FileModule],
  controllers: [LearningCenterController],
  providers: [LearningCenterService],
})
export class LearningCenterModule {}
