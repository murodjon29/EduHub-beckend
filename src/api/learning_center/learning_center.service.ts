import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLearningCenterDto } from './dto/create-learning_center.dto';
import { UpdateLearningCenterDto } from './dto/update-learning_center.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { LearningCenter } from '../../core/entities/learning_center.entity';
import { Repository } from 'typeorm';
import { FileService } from '../file/file.service';

@Injectable()
export class LearningCenterService {
  constructor(
    @InjectRepository(LearningCenter) 
    private readonly learningCenterRepository: Repository<LearningCenter>,
    private readonly fileService: FileService
  ) {}

  async deleteProfileImage(lerningCenterId: number) {
    const lerningCenter = await this.learningCenterRepository.findOne({
      where: { id: lerningCenterId },
    });
    if(!lerningCenter){ throw new NotFoundException('User not found') }
    if(lerningCenter.image){
      await this.fileService.deleteFile(lerningCenter.image);
      lerningCenter.image = "";
      await this.learningCenterRepository.save(lerningCenter);
    }
  }
}
