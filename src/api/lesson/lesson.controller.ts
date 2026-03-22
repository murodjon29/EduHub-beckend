import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Query,
  Put,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
  ApiParam,
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

  // ─── CREATE ───────────────────────────────────────────────────────────────
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
        statusCode: 201,
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
        statusCode: 404,
        message: 'Group not found',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden – insufficient role',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
      },
    },
  })
  async create(@Body() dto: CreateLessonDto): Promise<any> {
    return this.lessonService.create(dto);
  }

  // ─── GET ALL ──────────────────────────────────────────────────────────────
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.TEACHER, Role.LEARNING_CENTER)
  @Get()
  @ApiOperation({ summary: 'Get all lessons' })
  @ApiResponse({
    status: 200,
    description: 'List of all lessons',
    schema: {
      example: {
        statusCode: 200,
        message: 'Lessons fetched successfully',
        data: [
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
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: { example: { statusCode: 401, message: 'Unauthorized' } },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden – insufficient role',
    schema: { example: { statusCode: 403, message: 'Forbidden resource' } },
  })
  async findAll(): Promise<any> {
    return this.lessonService.findAll();
  }

  // ─── GET BY DATE RANGE ────────────────────────────────────────────────────
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.TEACHER, Role.LEARNING_CENTER)
  @Get('range')
  @ApiOperation({ summary: 'Get lessons by date range' })
  @ApiQuery({
    name: 'startDate',
    required: true,
    example: '2026-02-01',
    description: 'Start date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    example: '2026-02-28',
    description: 'End date (YYYY-MM-DD)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of lessons within the given date range',
    schema: {
      example: {
        statusCode: 200,
        message: 'Lessons fetched successfully',
        data: [
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
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid date format',
    schema: {
      example: {
        statusCode: 400,
        message: 'Invalid date format. Use YYYY-MM-DD',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: { example: { statusCode: 401, message: 'Unauthorized' } },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden – insufficient role',
    schema: { example: { statusCode: 403, message: 'Forbidden resource' } },
  })
  async findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<any> {
    return this.lessonService.findByDateRange(startDate, endDate);
  }

  // ─── GET ONE ──────────────────────────────────────────────────────────────
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.TEACHER, Role.LEARNING_CENTER)
  @Get(':id')
  @ApiOperation({ summary: 'Get lesson by ID' })
  @ApiParam({ name: 'id', example: 10, description: 'Lesson ID' })
  @ApiResponse({
    status: 200,
    description: 'Single lesson',
    schema: {
      example: {
        statusCode: 200,
        message: 'Lesson found successfully',
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
    description: 'Lesson not found',
    schema: {
      example: { statusCode: 404, message: 'Lesson not found' },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: { example: { statusCode: 401, message: 'Unauthorized' } },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden – insufficient role',
    schema: { example: { statusCode: 403, message: 'Forbidden resource' } },
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.lessonService.findOne(id);
  }

  // ─── UPDATE ───────────────────────────────────────────────────────────────
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.TEACHER, Role.LEARNING_CENTER)
  @Put(':id')
  @ApiOperation({ summary: 'Update lesson by ID' })
  @ApiParam({ name: 'id', example: 10, description: 'Lesson ID' })
  @ApiBody({
    description: 'Lesson update payload',
    schema: {
      example: {
        name: 'Matematika 2-dars',
        description: 'Geometriya asoslari',
        groupId: 1,
        teacherId: 2,
        lessonDate: '2026-02-20',
        startTime: '14:00:00',
        endTime: '16:00:00',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Lesson updated successfully',
    schema: {
      example: {
        statusCode: 200,
        message: 'Lesson updated successfully',
        data: {
          id: 10,
          name: 'Matematika 2-dars',
          description: 'Geometriya asoslari',
          lessonDate: '2026-02-20',
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
    description: 'Lesson, Group or Teacher not found',
    schema: {
      example: { statusCode: 404, message: 'Lesson not found' },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: { example: { statusCode: 401, message: 'Unauthorized' } },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden – insufficient role',
    schema: { example: { statusCode: 403, message: 'Forbidden resource' } },
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateLessonDto,
  ): Promise<any> {
    return this.lessonService.update(id, dto);
  }

  // ─── DELETE ───────────────────────────────────────────────────────────────
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.TEACHER, Role.LEARNING_CENTER)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete lesson by ID' })
  @ApiParam({ name: 'id', example: 10, description: 'Lesson ID' })
  @ApiResponse({
    status: 200,
    description: 'Lesson deleted successfully',
    schema: {
      example: {
        statusCode: 200,
        message: 'Lesson deleted successfully',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Lesson not found',
    schema: {
      example: { statusCode: 404, message: 'Lesson not found' },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: { example: { statusCode: 401, message: 'Unauthorized' } },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden – insufficient role',
    schema: { example: { statusCode: 403, message: 'Forbidden resource' } },
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    return this.lessonService.remove(id);
  }
}