import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LessonService } from './lesson.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { Lesson } from '../../core/entities/lesson.entity';

@ApiTags('Lessons')
@ApiBearerAuth("Authorization")
@Controller('lessons')
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @Post()
  @ApiOperation({ summary: 'Create new lesson' })
  @ApiResponse({
    status: 201,
    description: 'Lesson successfully created',
  })
  @ApiResponse({
    status: 404,
    description: 'Group or Teacher not found',
  })
  async create(@Body() dto: CreateLessonDto): Promise<Lesson> {
    return this.lessonService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all lessons' })
  @ApiResponse({
    status: 200,
    description: 'List of lessons',
  })
  async findAll(): Promise<Lesson[]> {
    return this.lessonService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lesson by ID' })
  @ApiResponse({
    status: 200,
    description: 'Single lesson',
  })
  @ApiResponse({
    status: 404,
    description: 'Lesson not found',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Lesson> {
    return this.lessonService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete lesson' })
  @ApiResponse({
    status: 200,
    description: 'Lesson deleted successfully',
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    return this.lessonService.remove(id);
  }
}