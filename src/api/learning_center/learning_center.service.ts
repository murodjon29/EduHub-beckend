import { Injectable } from '@nestjs/common';
import { CreateLearningCenterDto } from './dto/create-learning_center.dto';
import { UpdateLearningCenterDto } from './dto/update-learning_center.dto';

@Injectable()
export class LearningCenterService {
  create(createLearningCenterDto: CreateLearningCenterDto) {
    return 'This action adds a new learningCenter';
  }

  findAll() {
    return `This action returns all learningCenter`;
  }

  findOne(id: number) {
    return `This action returns a #${id} learningCenter`;
  }

  update(id: number, updateLearningCenterDto: UpdateLearningCenterDto) {
    return `This action updates a #${id} learningCenter`;
  }

  remove(id: number) {
    return `This action removes a #${id} learningCenter`;
  }
}
