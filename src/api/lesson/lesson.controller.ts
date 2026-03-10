import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { LessonService } from './lesson.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { Lesson } from '../../core/entities/lesson.entity';
import { Role } from '../../common/enum';
import { RolesGuard } from '../../common/guard/roles.guard';
import { JwtGuard } from '../../common/guard/jwt-auth.guard';
import { Roles } from '../../common/decorator/roles.decorator';

@ApiTags('Lessons')
@ApiBearerAuth('Authorization')
@Controller('lessons')
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.TEACHER, Role.LEARNING_CENTER)
  @Post()
  @ApiOperation({ summary: 'Create new lesson' })
  @ApiBody({
    description: 'Lesson creation payload',
    schema: {
      example: {
        name: 'Matematika 1-dars',
        description: 'Algebra asoslari',
        groupId: 1,
        teacherId: 2,
        lessonDate: '2026-02-17',
        startTime: '14:00:00',
        endTime: '16:00:00',
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Lesson successfully created',
    schema: {
      example: {
        success: true,
        message: 'Lesson created successfully',
        data: {
          id: 10,
          name: 'Matematika 1-dars',
          description: 'Algebra asoslari',
          lessonDate: '2026-02-17',
          startTime: '14:00:00',
          endTime: '16:00:00',
          group: { id: 1, name: '1-A Guruh' },
          teacher: { id: 2, firstName: 'Ali', lastName: 'Valiyev' },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Group or Teacher not found',
    schema: {
      example: {
        success: false,
        message: 'Group not found',
      },
    },
  })
  async create(@Body() dto: CreateLessonDto): Promise<any> {
    return this.lessonService.create(dto);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.TEACHER, Role.LEARNING_CENTER)
  @Get()
  @ApiOperation({ summary: 'Get all lessons' })
  @ApiResponse({
    status: 200,
    description: 'List of lessons',
    schema: {
      example: [
        {
          id: 10,
          name: 'Matematika 1-dars',
          description: 'Algebra asoslari',
          lessonDate: '2026-02-17',
          startTime: '14:00:00',
          endTime: '16:00:00',
          group: { id: 1, name: '1-A Guruh' },
          teacher: { id: 2, firstName: 'Ali', lastName: 'Valiyev' },
        },
        {
          id: 11,
          name: 'Fizika 1-dars',
          description: 'Kinematika asoslari',
          lessonDate: '2026-02-18',
          startTime: '10:00:00',
          endTime: '12:00:00',
          group: { id: 2, name: '1-B Guruh' },
          teacher: { id: 3, firstName: 'Umar', lastName: 'Qodirov' },
        },
      ],
    },
  })
  async findAll(): Promise<Lesson[]> {
    return this.lessonService.findAll();
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.TEACHER, Role.LEARNING_CENTER)
  @Get(':id')
  @ApiOperation({ summary: 'Get lesson by ID' })
  @ApiResponse({
    status: 200,
    description: 'Single lesson',
    schema: {
      example: {
        id: 10,
        name: 'Matematika 1-dars',
        description: 'Algebra asoslari',
        lessonDate: '2026-02-17',
        startTime: '14:00:00',
        endTime: '16:00:00',
        group: { id: 1, name: '1-A Guruh' },
        teacher: { id: 2, firstName: 'Ali', lastName: 'Valiyev' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Lesson not found',
    schema: {
      example: {
        success: false,
        message: 'Lesson not found',
      },
    },
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.lessonService.findOne(id);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.TEACHER, Role.LEARNING_CENTER)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete lesson' })
  @ApiResponse({
    status: 200,
    description: 'Lesson deleted successfully',
    schema: {
      example: {
        success: true,
        message: 'Lesson deleted successfully',
      },
    },
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    return this.lessonService.remove(id);
  }
}
