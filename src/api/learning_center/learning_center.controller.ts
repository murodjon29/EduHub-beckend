import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { LearningCenterService } from './learning_center.service';
import { CreateLearningCenterDto } from './dto/create-learning_center.dto';
import { UpdateLearningCenterDto } from './dto/update-learning_center.dto';

@Controller('learning-center')
export class LearningCenterController {
  constructor(private readonly learningCenterService: LearningCenterService) {}

  @Post()
  create(@Body() createLearningCenterDto: CreateLearningCenterDto) {
    return this.learningCenterService.create(createLearningCenterDto);
  }

  @Get()
  findAll() {
    return this.learningCenterService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.learningCenterService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLearningCenterDto: UpdateLearningCenterDto,
  ) {
    return this.learningCenterService.update(+id, updateLearningCenterDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.learningCenterService.remove(+id);
  }
}
