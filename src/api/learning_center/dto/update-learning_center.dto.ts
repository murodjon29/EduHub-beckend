import { PartialType } from '@nestjs/swagger';
import { CreateLearningCenterDto } from './create-learning_center.dto';

export class UpdateLearningCenterDto extends PartialType(
  CreateLearningCenterDto,
) {}
